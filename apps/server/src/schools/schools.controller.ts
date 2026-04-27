import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto, UpdateSchoolDto, SchoolQueryDto } from './dto/school.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResponseMessage } from '../common/decorators/response.decorator';

@UseGuards(JwtAuthGuard)
@Controller('system/schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Post()
  @ResponseMessage('学校创建成功')
  create(@Body() createSchoolDto: CreateSchoolDto) {
    return this.schoolsService.create(createSchoolDto);
  }

  @Get()
  findAll(@Query() query: SchoolQueryDto) {
    return this.schoolsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schoolsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('学校信息更新成功')
  update(@Param('id') id: string, @Body() updateSchoolDto: UpdateSchoolDto) {
    return this.schoolsService.update(id, updateSchoolDto);
  }

  @Patch(':id/status')
  @ResponseMessage('学校状态更新成功')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.schoolsService.updateStatus(id, status);
  }

  @Delete(':id')
  @ResponseMessage('学校删除成功')
  remove(@Param('id') id: string) {
    return this.schoolsService.remove(id);
  }
}
