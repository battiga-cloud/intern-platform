import { SetMetadata } from '@nestjs/common';
import { RoleCode } from '@muxi/shared';

// 定义一个常量 Key，用于在反射器中读取
export const ROLES_KEY = 'roles';

// 允许传入多个角色，例如 @Roles(RoleCode.SUPER_ADMIN, RoleCode.PLATFORM_ADMIN)
export const Roles = (...roles: RoleCode[]) => SetMetadata(ROLES_KEY, roles);