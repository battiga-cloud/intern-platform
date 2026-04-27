import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'nestjs-prisma';
import { User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      // 1. 从请求头的 Authorization: Bearer <token> 中提取 JWT
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. 是否忽略过期时间 (生产环境必须为 false)
      ignoreExpiration: false,
      // 3. 验证签名的密钥，与生成 Token 时保持一致
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  /**
   * 验证回调方法
   * 当 Token 验证通过后，Passport 会自动调用此方法
   * @param payload 解码后的 JWT 载荷，包含我们在 AuthService 中签发的 userId
   */
  async validate(payload: { userId: string }): Promise<Partial<User>> {
    // 拿着 Payload 里的 userId 去数据库查询完整信息
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      // 🔴 不仅要把 roles 查出来，还要把管理属性查出来
      include: {
        roles: true,
      },
    });

    // 如果用户在数据库中不存在（可能已被删除），则抛出未授权异常
    if (!user) {
      throw new UnauthorizedException('凭证已失效，请重新登录');
    }

    const { password, ...result } = user;
    
    // ⚠️ 关键点：这里 return 的 result，会被 NestJS 自动塞进 request.user 里。
    // 这就是为什么我们在 Controller 里写 @User() 就能拿到当前登录用户信息的原因！
    return result; 
  }
}