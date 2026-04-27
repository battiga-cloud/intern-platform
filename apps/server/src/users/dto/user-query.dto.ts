import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserQueryDto {
  @ApiProperty({ description: '登录账号' })
  @IsOptional()
  @IsString()
  userName?: string;

  @ApiProperty({ description: '姓名' })
  @IsOptional()
  @IsString()
  name?: string;

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