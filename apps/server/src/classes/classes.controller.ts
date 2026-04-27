import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto, UpdateClassDto, ClassQueryDto } from './dto/class.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { ResponseMessage } from '../common/decorators/response.decorator';

@UseGuards(JwtAuthGuard)
@Controller('system/classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @ResponseMessage('班级创建成功')
  create(@Body() dto: CreateClassDto, @User() currentUser: any) {
    return this.classesService.create(dto, currentUser);
  }

  @Get()
  findAll(@Query() query: ClassQueryDto, @User() currentUser: any) {
    return this.classesService.findAll(query, currentUser);
  }

  @Patch(':id')
  @ResponseMessage('班级信息更新成功')
  update(@Param('id') id: string, @Body() dto: UpdateClassDto, @User() currentUser: any) {
    return this.classesService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @ResponseMessage('班级删除成功')
  remove(@Param('id') id: string, @User() currentUser: any) {
    return this.classesService.remove(id, currentUser);
  }
}