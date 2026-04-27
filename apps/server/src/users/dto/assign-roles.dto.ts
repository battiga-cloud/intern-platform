import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class AssignRolesDto {
  @ApiProperty({ description: '角色ID列表' })
  @IsArray()
  @IsString({ each: true })
  roleIds: string[];
}