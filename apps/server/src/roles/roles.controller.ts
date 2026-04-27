import { 
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards 
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignMenusDto } from './dto/assign-menus.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // 假设你的守卫在这里
import { ResponseMessage } from '../common/decorators/response.decorator';

@UseGuards(JwtAuthGuard) // 保护该模块的所有路由
@Controller('system/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ResponseMessage('角色创建成功')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('角色更新成功')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ResponseMessage('角色删除成功')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }

  /**
   * 角色分配菜单权限
   */
  @Patch(':id/menus')
  @ResponseMessage('权限分配成功')
  assignMenus(
    @Param('id') id: string,
    @Body() dto: AssignMenusDto,
  ) {
    return this.rolesService.assignMenus(id, dto.menuIds);
  }
}