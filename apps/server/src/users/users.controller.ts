import { 
  Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { ResponseMessage } from '../common/decorators/response.decorator';

@UseGuards(JwtAuthGuard)
@Controller('system/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessage('用户创建成功')
  create(@Body() dto: CreateUserDto, @User() currentUser: any) {
    return this.usersService.create(dto, currentUser);
  }

  @Get()
  findAll(@Query() query: UserQueryDto, @User() currentUser: any) {
    return this.usersService.findAll(query, currentUser);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User() currentUser: any) {
    return this.usersService.findOne(id, currentUser);
  }

  @Patch(':id')
  @ResponseMessage('用户更新成功')
  update(
    @Param('id') id: string, 
    @Body() dto: UpdateUserDto, 
    @User() currentUser: any
  ) {
    return this.usersService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @ResponseMessage('用户删除成功')
  remove(@Param('id') id: string, @User() currentUser: any) {
    return this.usersService.remove(id, currentUser);
  }

  @Patch(':id/roles')
  @ResponseMessage('角色分配成功')
  assignRoles(
    @Param('id') id: string,
    @Body() dto: AssignRolesDto,
    @User() currentUser: any
  ) {
    return this.usersService.assignRoles(id, dto.roleIds, currentUser);
  }
}