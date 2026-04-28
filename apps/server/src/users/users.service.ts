import { Injectable, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma, User, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { CreateSingleUserDto, ImportUsersDto } from './dto/user-rest.dto';
import { RoleCode } from '@muxi/shared';

// 🔴  定义一个包含了 roles 关系的新类型
type UserWithRoles = Prisma.UserGetPayload<{
  include: { roles: true }
}>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * 🛡️ 核心辅助方法：生成数据隔离条件
   * @param currentUser 当前发请求的登录用户
   */
  private buildIsolationWhere(currentUser: UserWithRoles) {
    // 现在的 TS 会完美识别 currentUser.roles，不仅不报错，敲代码时还会有自动补全！
    if (currentUser.roles?.some(r => r.code === RoleCode.SCHOOL_ADMIN)) {
      return {
        classMemberships: {
          some: {
            class: { schoolId: currentUser.manageSchoolId },
            status: 'ACTIVE'
          }
        }
      };
    }
    return {};
  }

  /**
   * 🛡️ 公共权限校验器：拦截越权拉人
   */
  private async validateClassPermission(classId: string, currentUser: any) {
    const targetClass = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!targetClass) throw new BadRequestException('指定的班级/部门不存在');

    // 判断是否为超管或平台管理员
    const isPlatformAdmin = currentUser.roles?.some(r =>
      [RoleCode.SUPER_ADMIN, RoleCode.PLATFORM_ADMIN].includes(r.code)
    );

    // 如果不是平台管理员，则严格校验其管理范围
    if (!isPlatformAdmin) {
      // 假设企业和学校共用 manageSchoolId 字段，或这里加上 enterpriseId 的判断
      if (targetClass.schoolId !== currentUser.manageSchoolId) {
        throw new ForbiddenException('越权操作：您只能将用户添加到您所管理的机构中');
      }
    }
    return targetClass;
  }

  /**
   * B 端创建用户 (包含越权防御)
   * 超管给学校建“校长账号”；或者企业建“HR账号”。
   */
  async create(dto: CreateUserDto, currentUser: UserWithRoles) {
    // 1. 越权防御：学校管理员只能创建本校的用户
    if (currentUser.manageSchoolId) {
      dto.manageSchoolId = currentUser.manageSchoolId;
      dto.enterpriseId = null; // 绝对不允许跨界关联企业
    } else if (currentUser.enterpriseId) {
      dto.enterpriseId = currentUser.enterpriseId;
      dto.manageSchoolId = null;
    }

    // 2. 账号防重校验
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { account: dto.account },
          dto.phone ? { phone: dto.phone } : undefined,
        ].filter(Boolean) as any,
      },
    });
    if (existing) throw new ConflictException('用户名或手机号已存在');

    // 3. 处理密码 (如果没有传密码，默认设为 123456)
    const rawPassword = dto.password || '123456';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    return this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
      select: { id: true, account: true, name: true } // 不返回敏感的密码信息
    });
  }

  /**
     * 单个新增用户 (兼容 C 端注册)
     */
  async createSingleUser(dto: CreateSingleUserDto, currentUser: any) {
    // 1. 严格权限校验
    await this.validateClassPermission(dto.classId, currentUser);

    // 2. 核心融合逻辑：根据手机号查找
    let user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });

    if (!user) {
      // 场景 A：纯新用户，没注册过小程序
      const defaultPassword = await bcrypt.hash('abc12345', 10);
      const studentRole = await this.prisma.role.findUnique({ where: { code: RoleCode.USER } });

      user = await this.prisma.user.create({
        data: {
          phone: dto.phone,
          account: dto.phone,
          name: dto.name,
          idCard: dto.idCard,
          password: defaultPassword,
          roles: studentRole ? { connect: { id: studentRole.id } } : undefined,
        }
      });
    } else {
      // 场景 B：C端已注册，或者已经是其他机构的人。
      // 可选：更新他的真实姓名或身份证
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          name: dto.name || user.name,
          idCard: dto.idCard || user.idCard
        }
      });
    }

    // 3. 建立机构关系 (无论新老用户，都将关系 Upsert 到 ClassMember)
    await this.prisma.classMember.upsert({
      where: { classId_userId: { classId: dto.classId, userId: user.id } },
      update: { status: 'ACTIVE' }, // 如果以前退出了，现在重新激活
      create: { classId: dto.classId, userId: user.id, status: 'ACTIVE', role: 'STUDENT' }
    });

    return user;
  }


  /**
   * 分页获取用户列表 (带有条件搜索与数据隔离)
   */
  async findAll(query: UserQueryDto, currentUser: UserWithRoles) {
    const { page = 1, pageSize = 10, keyword } = query;
    const skip = (page - 1) * pageSize;

    const baseWhere = this.buildIsolationWhere(currentUser);

    // 合并搜索条件
    const whereCondition: any = {
      ...baseWhere,
      ...(keyword && {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { phone: { contains: keyword } },
        ]
      })
    };

    const [total, records] = await this.prisma.$transaction([
      this.prisma.user.count({ where: whereCondition }),
      this.prisma.user.findMany({
        where: whereCondition,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          roles: { select: { id: true, name: true } },
          manageSchool: { select: { name: true } },
          enterprise: { select: { name: true } },
        },
      }),
    ]);

    // 过滤掉密码字段
    const safeRecords = records.map(({ password, ...rest }) => rest);

    return {
      records: safeRecords,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取详情
   */
  async findOne(id: string, currentUser: UserWithRoles) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        ...this.buildIsolationWhere(currentUser), // 越权防御：不能查看别家机构的人
      },
      include: {
        roles: { select: { id: true } },
      },
    });

    if (!user) throw new BadRequestException('用户不存在或您无权访问');

    const { password, ...safeUser } = user;
    return {
      ...safeUser,
      roleIds: user.roles.map(r => r.id), // 抹平结构供前端回显
    };
  }

  /**
   * 更新用户
   */
  async update(id: string, dto: UpdateUserDto, currentUser: UserWithRoles) {
    // 确保该用户属于当前机构
    await this.findOne(id, currentUser);

    // 如果前端试图修改密码，做哈希处理
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    // 越权防御：无视前端传来的机构 ID，强制锁死为本机构 (如果不是超管)
    if (currentUser.manageSchoolId) dto.manageSchoolId = currentUser.manageSchoolId;
    if (currentUser.enterpriseId) dto.enterpriseId = currentUser.enterpriseId;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    const { password, ...safeUser } = updatedUser;
    return safeUser;
  }

  /**
   * 删除用户
   */
  async remove(id: string, currentUser: UserWithRoles) {
    await this.findOne(id, currentUser); // 鉴权

    // 自我保护
    if (id === currentUser.id) {
      throw new BadRequestException('不能删除当前登录的账号');
    }

    return this.prisma.user.delete({ where: { id } });
  }

  /**
   * 分配角色
   */
  async assignRoles(id: string, roleIds: string[], currentUser: UserWithRoles) {
    await this.findOne(id, currentUser); // 鉴权

    return this.prisma.user.update({
      where: { id },
      data: {
        roles: {
          set: roleIds.map(roleId => ({ id: roleId })),
        },
      },
    });
  }


  /**
   * 批量导入用户 (底层复用 createSingleUser 的逻辑)
   */
  async importUsers(dto: ImportUsersDto, currentUser: UserWithRoles) {
    // 批量导入的入口同样要锁死权限
    await this.validateClassPermission(dto.classId, currentUser);

    let successCount = 0;
    const errors = [];

    // 循环执行 Upsert 逻辑
    for (const item of dto.users) {
      try {
        await this.createSingleUser({
          phone: item.phone,
          name: item.name,
          idCard: item.idCard,
          classId: dto.classId
        }, currentUser);
        successCount++;
      } catch (err: any) {
        errors.push(`手机号 ${item.phone} 导入失败: ${err.message}`);
      }
    }

    return {
      message: `导入处理完成。成功：${successCount}，失败：${errors.length}`,
      errors
    };
  }

  /**
   * 重置密码
   */
  async resetPassword(id: string) {
    const hashedPassword = await bcrypt.hash('abc12345', 10);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
    return { message: '密码已重置为 abc12345' };
  }

  /**
   * 更改状态 (启停账号)
   */
  async updateStatus(id: string, status: string) {
    // 禁止禁用超级管理员等保护逻辑可在此处添加
    return this.prisma.user.update({
      where: { id },
      data: { status: status as any },
    });
  }
}