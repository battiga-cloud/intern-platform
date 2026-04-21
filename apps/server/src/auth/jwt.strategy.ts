import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// 注意：如果你的 PrismaService 路径不同，请修改这里的引入路径
import { PrismaService } from 'nestjs-prisma'; 

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    readonly configService: ConfigService,
    private readonly prisma: PrismaService, // 注入 Prisma 查库
  ) {
    super({
      // 1. 告诉 Passport 从请求头的 Authorization: Bearer <token> 中提取 token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. 必须校验 token 是否过期
      ignoreExpiration: false,
      // 3. 校验 token 的密钥
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  /**
   * 当 Token 的签名和有效期校验都通过后，NestJS 会自动调用 validate 方法
   * 参数 payload 就是我们登录时加密进去的 { userId: user.id }
   */
  async validate(payload: { userId: string }) {
    // 拿着解析出来的 userId 去数据库查这个用户
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });

    // 防止 token 没过期，但在数据库里用户已经被管理员删除了的极端情况
    if (!user) {
      throw new UnauthorizedException('该用户不存在或已被删除');
    }

    // 剔除密码，然后返回给 Passport
    const { password, ...result } = user;
    
    // ⚠️ 关键点：这里 return 的 result，会被 NestJS 自动塞进 request.user 里。
    // 这就是为什么我们在 Controller 里写 @User() 就能拿到当前登录用户信息的原因！
    return result; 
  }
}