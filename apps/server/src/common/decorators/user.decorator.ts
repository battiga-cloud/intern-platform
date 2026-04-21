import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const UserEntityGql = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) =>
    GqlExecutionContext.create(ctx).getContext().req.user,
);

/**
 * 自定义装饰器 @User
 * 用于从 Request 对象中提取当前登录的用户信息
 * * 使用示例：
 * 1. 获取完整用户对象：@User() user: User
 * 2. 获取用户特定字段：@User('id') userId: string
 */
export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    // 获取当前 HTTP 请求对象
    const request = ctx.switchToHttp().getRequest();
    
    // 在经过 JwtAuthGuard 验证后，passport 会自动将用户信息挂载到 request.user 上
    const user = request.user;

    // 如果装饰器传了参数（如 'id'），则返回对应的属性；否则返回完整对象
    return data ? user?.[data] : user;
  },
);
