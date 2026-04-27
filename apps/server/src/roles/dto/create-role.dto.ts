import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称' })
  @IsNotEmpty({ message: '角色名称不能为空' })
  @IsString()
  name: string; // 例如：学校管理员

  @ApiProperty({ description: '角色编码' })
  @IsNotEmpty({ message: '角色编码不能为空' })
  @IsString()
  code: string; // 例如：SCHOOL_ADMIN

  @ApiProperty({ description: '角色描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '角色排序' })
  @IsOptional()
  @IsInt()
  sort?: number;
}