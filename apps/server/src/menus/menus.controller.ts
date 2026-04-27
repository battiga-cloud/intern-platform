import { 
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards 
} from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 
import { ResponseMessage } from '../common/decorators/response.decorator';

@UseGuards(JwtAuthGuard)
@Controller('system/menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
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
  @ResponseMessage('菜单更新成功')
  update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menusService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @ResponseMessage('菜单删除成功')
  remove(@Param('id') id: string) {
    return this.menusService.remove(id);
  }
}