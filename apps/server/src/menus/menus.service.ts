import { 
  Injectable, BadRequestException, ConflictException 
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenusService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建菜单
   */
  async create(dto: CreateMenuDto) {
    // 如果传了 parentId，校验父级是否存在
    if (dto.parentId) {
      const parent = await this.prisma.menu.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) throw new BadRequestException('指定的父级菜单不存在');
    }

    return this.prisma.menu.create({ data: dto });
  }

  /**
   * 🔴 获取全量菜单并组装成树形结构 (前端菜单渲染/角色分配权限时使用)
   */
  async findTree() {
    // 1. 一次性查出所有菜单，按 sort 升序排序
    const allMenus = await this.prisma.menu.findMany({
      orderBy: { sort: 'asc' },
    });

    // 2. 将扁平数组转换为树形结构
    return this.buildTree(allMenus, null);
  }

  /**
   * 获取单条菜单详情
   */
  async findOne(id: string) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu) throw new BadRequestException('菜单不存在');
    return menu;
  }

  /**
   * 更新菜单
   */
  async update(id: string, dto: UpdateMenuDto) {
    // 🔴 死循环防御：父节点不能是自己
    if (dto.parentId === id) {
      throw new BadRequestException('父级菜单不能设置为自己');
    }

    // 🔴 高级防御：父节点不能是自己的子孙节点
    if (dto.parentId) {
      const isDescendant = await this.checkIsDescendant(id, dto.parentId);
      if (isDescendant) {
        throw new BadRequestException('父级菜单不能设置为当前菜单的子节点');
      }
    }

    return this.prisma.menu.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除菜单
   */
  async remove(id: string) {
    // 🔴 防误删防御：检查是否有子菜单
    const childrenCount = await this.prisma.menu.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      throw new BadRequestException('该菜单下还有子菜单，请先删除子菜单');
    }

    return this.prisma.menu.delete({ where: { id } });
  }

  // ================= 内部辅助方法 =================

  /**
   * 递归组装树形数据
   */
  private buildTree(menus: any[], parentId: string | null): any[] {
    return menus
      .filter((menu) => menu.parentId === parentId)
      .map((menu) => {
        const children = this.buildTree(menus, menu.id);
        return {
          ...menu,
          children: children.length > 0 ? children : undefined, // 兼容前端组件，无子节点时不返回空数组
        };
      });
  }

  /**
   * 递归检查 targetId 是否是 sourceId 的子孙节点
   * 用于防止菜单结构死循环 (比如 A 的父节点改成 B，但 B 本来就是 A 的儿子)
   */
  private async checkIsDescendant(sourceId: string, targetId: string): Promise<boolean> {
    const children = await this.prisma.menu.findMany({
      where: { parentId: sourceId },
      select: { id: true },
    });

    for (const child of children) {
      if (child.id === targetId) return true;
      const isFound = await this.checkIsDescendant(child.id, targetId);
      if (isFound) return true;
    }
    return false;
  }
}