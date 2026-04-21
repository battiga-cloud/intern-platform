import { PrismaService } from 'nestjs-prisma'; // 或你的 prisma 模块路径
import { Prisma, Role, User } from '@prisma/client';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { PasswordService } from './password.service';
import { Token } from './models/token.model';
import { SecurityConfig } from '../common/configs/config.interface';
import { RegisterDto, LoginDto } from './dto/auth-rest.dto'; // 引入我们上一步定义的 DTO

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 学员注册 (手机号)
   */
  async register(payload: RegisterDto) {
    const hashedPassword = await this.passwordService.hashPassword(
      payload.password,
    );

    try {
      const user = await this.prisma.user.create({
        data: {
          phone: payload.phone,
          password: hashedPassword,
          name: payload.name,
          role: Role.USER, // 默认分配用户角色
        },
      });

      // 注册成功后，直接颁发 Token (免去用户再次登录)
      const tokens = this.generateTokens({ userId: user.id });
      const { password, ...userInfo } = user;

      return {
        ...tokens,
        user: userInfo,
      };
    } catch (e) {
      // 捕获 Prisma 的唯一键冲突异常 (手机号重复)
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(`手机号 ${payload.phone} 已被注册`);
      }
      throw e; // 其他内部错误抛出给全局过滤器
    }
  }

  /**
   * 学员登录 (手机号)
   */
  async login(payload: LoginDto) {
    const user = await this.validateUser(payload.phone, payload.password);
    
    if (!user) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    const tokens = this.generateTokens({ userId: user.id });

    return {
      ...tokens,
      user,
    };
  }

  /**
   * 修改密码
   */
  async updatePassword(userId: string, oldPass: string, newPass: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 校验原密码
    const isMatch = await compare(oldPass, user.password);
    if (!isMatch) {
      throw new BadRequestException('原密码错误');
    }

    // 更新新密码
    const hashedPassword = await this.passwordService.hashPassword(newPass);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: '密码修改成功' };
  }

  /**
   * 校验手机号与密码
   */
  async validateUser(phone: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    
    // bcrypt.compare 天然防止时序攻击，且 user 为空时安全跳过
    if (user && await compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  getUserFromToken(token: string): Promise<User> {
    const id = this.jwtService.decode(token)['userId'];
    return this.prisma.user.findUnique({ where: { id } });
  }

  generateTokens(payload: { userId: string }): Token {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  private generateAccessToken(payload: { userId: string }): string {
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(payload: { userId: string }): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: securityConfig.refreshIn,
    });
  }

  refreshToken(token: string) {
    try {
      const { userId } = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      return this.generateTokens({ userId });
    } catch (e) {
      throw new UnauthorizedException('无效或已过期的刷新令牌 (Refresh Token)');
    }
  }
}