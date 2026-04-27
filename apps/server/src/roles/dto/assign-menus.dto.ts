import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class AssignMenusDto {
  @ApiProperty({ description: '要分配给该角色的所有菜单/权限点 ID' })
  @IsArray()
  @IsString({ each: true })
  menuIds: string[]; // 要分配给该角色的所有菜单/权限点 ID
}