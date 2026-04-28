import { 
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards 
} from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 
import { ResponseMessage } from '../common/decorators/response.decorator';
import { RolesGuard } from '../auth/roles.guard'; 
import { Roles } from '../common/decorators/roles.decorator';
import { RoleCode } from '@muxi/shared';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('system/menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.PLATFORM_ADMIN) // 🔴 仅限超管和平台管理员
  @ResponseMessage('菜单创建成功')
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.create(createMenuDto);
  }

  /**
   * 返回树形菜单列表
   * Soybean Admin 前端菜单表格及权限树极其依赖此接口
   */
  @Get('tree')
  findTree() {
    return this.menusService.findTree();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menusService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleCode.SUPER_ADMIN) // 🔴 假设更新菜单这种敏感操作只给超管
  @ResponseMessage('菜单更新成功')
  update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menusService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @Roles(RoleCode.SUPER_ADMIN) // 🔴 假设删除菜单这种敏感操作只给超管
  @ResponseMessage('菜单删除成功')
  remove(@Param('id') id: string) {
    return this.menusService.remove(id);
  }
}