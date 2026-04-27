import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建角色
   */
  async create(dto: CreateRoleDto) {
    // 校验 name 或 code 是否已存在
    const existing = await this.prisma.role.findFirst({
      where: {
        OR: [{ name: dto.name }, { code: dto.code }],
      },
    });

    if (existing) {
      throw new ConflictException('角色名称或编码已存在');
    }

    return this.prisma.role.create({
      data: dto,
    });
  }

  /**
   * 获取角色列表
   */
  async findAll() {
    return this.prisma.role.findMany({
      orderBy: { sort: 'asc' },
      include: {
        _count: {
          select: { users: true }, // 顺便统计该角色下有多少个用户
        },
      },
    });
  }

  /**
   * 获取单个角色详情（包含关联的菜单 ID）
   */
  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        menus: { select: { id: true } }, // 只返回菜单 ID，方便前端回显树形勾选框
      },
    });

    if (!role) throw new BadRequestException('角色不存在');
    
    // 抹平数据结构，将 menus 转换为 menuIds 数组给前端
    return {
      ...role,
      menuIds: role.menus.map((m) => m.id),
    };
  }

  /**
   * 更新角色基础信息
   */
  async update(id: string, dto: UpdateRoleDto) {
    // 如果修改了 name 或 code，需防重校验
    if (dto.name || dto.code) {
      const existing = await this.prisma.role.findFirst({
        where: {
          OR: [{ name: dto.name }, { code: dto.code }],
          NOT: { id }, // 排除自己
        },
      });
      if (existing) throw new ConflictException('角色名称或编码已存在');
    }

    return this.prisma.role.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除角色
   */
  async remove(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!role) throw new BadRequestException('角色不存在');
    
    // ⚠️ 核心防御：如果还有用户绑定了这个角色，绝对不能删
    if (role._count.users > 0) {
      throw new BadRequestException('该角色下仍有绑定的用户，无法删除！请先移除用户角色。');
    }
    
    // 保护系统核心角色
    if (role.code === 'SUPER_ADMIN') {
      throw new BadRequestException('系统超级管理员角色禁止删除');
    }

    return this.prisma.role.delete({
      where: { id },
    });
  }

  /**
   * 🔴 为角色分配菜单和权限 (覆盖式更新)
   */
  async assignMenus(roleId: string, menuIds: string[]) {
    // Prisma 的隐式多对多关系中，使用 set 可以自动清空旧关系并建立新关系
    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        menus: {
          set: menuIds.map((id) => ({ id })),
        },
      },
    });
  }
}
