import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateSchoolDto {
  @ApiProperty({ description: '学校名称' })
  @IsNotEmpty({ message: '学校名称不能为空' })
  @IsString()
  name: string;

  @ApiProperty({ description: '学校LOGO' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ description: '学校描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '学校地址' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: '学校联系人' })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiProperty({ description: '学校联系电话' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateSchoolDto extends PartialType(CreateSchoolDto) {}

export class SchoolQueryDto {
  @ApiProperty({ description: '搜索学校名称' })
  @IsOptional()
  @IsString()
  keyword?: string; // 搜索学校名称

  @ApiProperty({ description: '当前页码' })
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