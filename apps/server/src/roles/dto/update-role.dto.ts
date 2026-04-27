import { PartialType } from '@nestjs/swagger'; // 如果没装 swagger，可以用 @nestjs/mapped-types
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}