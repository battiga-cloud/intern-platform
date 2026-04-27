import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 🛡️ 核心辅助方法：生成数据隔离条件
   * @param currentUser 当前发请求的登录用户
   */
  private buildIsolationWhere(currentUser: User) {
    const where: any = {};
    // 如果当前用户是学校管理员，强制加上 schoolId 过滤
    if (currentUser.schoolId) {
      where.schoolId = currentUser.schoolId;
    }
    // 如果当前用户是企业管理员，强制加上 enterpriseId 过滤
    if (currentUser.enterpriseId) {
      where.enterpriseId = currentUser.enterpriseId;
    }
    return where;
  }

  /**
   * 创建用户 (包含越权防御)
   */
  async create(dto: CreateUserDto, currentUser: User) {
    // 1. 越权防御：学校管理员只能创建本校的用户
    if (currentUser.schoolId) {
      dto.schoolId = currentUser.schoolId; 
      dto.enterpriseId = null; // 绝对不允许跨界关联企业
    } else if (currentUser.enterpriseId) {
      dto.enterpriseId = currentUser.enterpriseId;
      dto.schoolId = null;
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
  async findAll(query: UserQueryDto, currentUser: User) {
    const { page = 1, pageSize = 10, userName, name } = query;
    const skip = (page - 1) * pageSize;

    // 组合基础查询条件 + 数据隔离条件
    const whereCondition: any = {
      ...this.buildIsolationWhere(currentUser),
      ...(userName && { userName: { contains: userName, mode: 'insensitive' } }),
      ...(name && { name: { contains: name, mode: 'insensitive' } }),
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
          school: { select: { name: true } },
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
  async findOne(id: string, currentUser: User) {
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
  async update(id: string, dto: UpdateUserDto, currentUser: User) {
    // 确保该用户属于当前机构
    await this.findOne(id, currentUser); 

    // 如果前端试图修改密码，做哈希处理
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    // 越权防御：无视前端传来的机构 ID，强制锁死为本机构 (如果不是超管)
    if (currentUser.schoolId) dto.schoolId = currentUser.schoolId;
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
  async remove(id: string, currentUser: User) {
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
  async assignRoles(id: string, roleIds: string[], currentUser: User) {
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
}