import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * 默认情况下，继承 AuthGuard('jwt') 已经能完成 Token 提取和校验。
   * 重写 handleRequest 的目的是为了给前端返回更友好的、自定义的中文报错信息。
   */
  handleRequest(err: any, user: any, info: any) {
    // 1. 如果 Passport 校验过程中发生内部错误，或者没有解析出 user（比如未携带 Token 或 Token 过期）
    if (err || !user) {
      // info 参数通常包含 jsonwebtoken 库抛出的具体错误，比如 TokenExpiredError
      if (info && info.name === 'TokenExpiredError') {
        throw new UnauthorizedException('登录凭证已过期，请重新登录');
      }
      
      if (info && info.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('无效的访问令牌');
      }

      // 默认的未授权提示
      throw err || new UnauthorizedException('未授权的访问，请先登录');
    }

    // 2. 校验通过，返回 user 对象。
    // 这个 user 对象会被自动挂载到 request.user 上，随后就可以用我们写的 @User() 装饰器提取了
    return user;
  }
}
