import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateClassDto {
  @ApiProperty({ description: '班级名称' })
  @IsNotEmpty({ message: '班级名称不能为空' })
  @IsString()
  name: string;

  @ApiProperty({ description: '班级所属学校ID' })
  @IsOptional()
  @IsString()
  schoolId?: string; // 如果是学校管理员操作，后端会强制覆盖此字段

  @ApiProperty({ description: '班级描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '班级年级' })
  @IsOptional()
  @IsString()
  grade?: string; // 年级，如 '2022级'
}

export class UpdateClassDto extends PartialType(CreateClassDto) {}

export class ClassQueryDto {
  @ApiProperty({ description: '搜索班级名称' })
  @IsOptional()
  @IsString()
  keyword?: string; // 搜索班级名称

  @ApiProperty({ description: '班级所属学校ID' })
  @IsOptional()
  @IsString()
  schoolId?: string; // 根据学校筛选

  @ApiProperty({ description: '页码' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页数量' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;
}