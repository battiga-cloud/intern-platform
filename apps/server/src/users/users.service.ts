import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma, User, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { ImportUsersDto } from './dto/user-rest.dto';
import { RoleCode } from '../common/enums/role.enum';

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
   * 创建用户 (包含越权防御)
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
          { userName: dto.userName },
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
      select: { id: true, userName: true, name: true } // 不返回敏感的密码信息
    });
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


  async importUsers(dto: ImportUsersDto) {
    const { classId, users } = dto;
    const defaultPassword = await bcrypt.hash('abc12345', 10);

    // 获取默认学生角色
    const studentRole = await this.prisma.role.findUnique({ where: { code: 'STUDENT' } });

    let successCount = 0;
    const errors = [];

    // ⚠️ 在生产环境中，建议使用 prisma.$transaction 或分批处理大量数据
    for (const item of users) {
      try {
        // A. 查找或创建用户 (Upsert 逻辑)
        let user = await this.prisma.user.findUnique({ where: { phone: item.phone } });

        if (!user) {
          // 不存在：创建新用户
          user = await this.prisma.user.create({
            data: {
              phone: item.phone,
              userName: `stu_${item.phone}`,
              name: item.name,
              idCard: item.idCard,
              password: defaultPassword, // 默认密码
              roles: studentRole ? { connect: { id: studentRole.id } } : undefined,
            }
          });
        } else {
          // 已存在：可选更新其姓名和身份证
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
              name: item.name || user.name,
              idCard: item.idCard || user.idCard
            }
          });
        }

        // B. 绑定机构/班级关联 (如果已在班级中，更新状态为 ACTIVE)
        await this.prisma.classMember.upsert({
          where: {
            classId_userId: { classId, userId: user.id }
          },
          update: { status: UserStatus.ACTIVE }, // 恢复激活状态
          create: {
            classId,
            userId: user.id,
            role: 'STUDENT',
            status: UserStatus.ACTIVE,
          }
        });

        successCount++;
      } catch (err: any) {
        errors.push(`手机号 ${item.phone} 处理失败: ${err.message}`);
      }
    }

    return {
      message: `导入完成，成功 ${successCount} 条，失败 ${errors.length} 条`,
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