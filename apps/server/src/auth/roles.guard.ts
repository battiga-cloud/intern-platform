import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleCode } from '@muxi/shared';
import { ROLES_KEY } from '../common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取接口上通过 @Roles 装饰器设置的允许角色列表
    const requiredRoles = this.reflector.getAllAndOverride<RoleCode[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果接口没有设置 @Roles，说明是公开或仅需登录的接口，直接放行
    if (!requiredRoles) {
      return true;
    }

    // 获取当前请求的用户信息 (假设 JwtAuthGuard 已处理好登录态)
    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.roles) {
      throw new ForbiddenException('用户信息缺失，无法进行权限验证');
    }

    // 权限比对：判断用户的角色数组中是否包含要求的任意一个角色
    // 注意：数据库查出的 user.roles 通常是对象数组 [{code: '...'}, ...]
    const userRoleCodes = user.roles.map((r: any) => r.code);
    const hasRole = requiredRoles.some((role) => userRoleCodes.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('您的权限不足，无法操作此模块');
    }

    return true;
  }
}