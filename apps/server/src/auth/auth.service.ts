import { PrismaService } from 'nestjs-prisma';
import { User } from '@prisma/client';
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import axios from 'axios';
import { PasswordService } from './password.service';
import { Token } from './models/token.model';
import { SecurityConfig } from '../common/configs/config.interface';
import { SignupInput, LoginInput, UpdatePasswordDto } from './dto/auth-rest.dto';

@Injectable()
export class AuthService {
  private readonly appId = process.env.WX_MINI_APP_ID;
  private readonly appSecret = process.env.WX_MINI_APP_SECRET;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 注册逻辑 (支持手机号与用户名)
   */
  async register(dto: SignupInput) {
    // 假设前端统一传入 account 字段
    const { account, password, name } = dto;
    
    // 1. 判断输入是否为 11 位手机号
    const isPhone = /^1[3-9]\d{9}$/.test(account);

    // 2. 防重校验：判断手机号或用户名是否被占用
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: account },
          { userName: account },
        ],
      },
    });

    if (existingUser) {
      throw new BadRequestException('该手机号或账号已被注册');
    }

    // 3. 密码加密
    const hashedPassword = await this.passwordService.hashPassword(password);

    // 4. 落库：分离 userName 与 phone
    return this.prisma.user.create({
      data: {
        userName: account, // 必定存入 userName 以保证必填和唯一
        phone: isPhone ? account : null, // 仅在是手机号时存入
        password: hashedPassword,
        name: name || (isPhone ? `用户_${account.slice(-4)}` : account), // 真实姓名兜底
      },
    });
  }

  /**
   * 登录逻辑 (双字段检索)
   */
  async login(dto: LoginInput) {
    const { account, password } = dto;

    // 1. 任意命中 phone 或 userName 均可
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: account },
          { userName: account },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('该账号或手机号未注册');
    }

    // 2. 校验密码
    const isPasswordValid = await this.passwordService.validatePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('密码错误');
    }

    return this.generateToken({ userId: user.id });
  }

  /**
   * 微信小程序一键登录/注册
   */
  async wechatLogin(code: string) {
    try {
      // 1. 换取 accessToken
      const tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`;
      const tokenRes = await axios.get(tokenUrl);
      const accessToken = tokenRes.data.access_token;

      if (!accessToken) throw new BadRequestException('获取微信凭证失败');

      // 2. 换取用户手机号
      const phoneUrl = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`;
      const phoneRes = await axios.post(phoneUrl, { code });

      if (phoneRes.data.errcode !== 0) {
        throw new BadRequestException(`微信授权失败: ${phoneRes.data.errmsg}`);
      }

      const phoneNumber = phoneRes.data.phone_info.phoneNumber;

      // 3. 查找或静默注册
      let user = await this.prisma.user.findUnique({
        where: { phone: phoneNumber },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            phone: phoneNumber,
            userName: `wx_${phoneNumber}`, // 小程序注册用户分配一个默认的 userName
            password: '', // 小程序注册暂无密码，可通过 H5 找回密码功能设置
            name: `微信用户_${phoneNumber.slice(-4)}`,
          },
        });
      }

      return this.generateToken({ userId: user.id });
    } catch (e: any) {
      throw new BadRequestException(e.message || '微信登录异常');
    }
  }

  /**
   * 预留给 JwtStrategy 等使用的校验函数
   * 同样应用多字段 OR 校验
   */
  async validateUser(account: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: account }, { userName: account }],
      },
    });

    if (user && (await compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * 修改密码
   */
  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('用户不存在');

    // 验证旧密码
    const isOldValid = await this.passwordService.validatePassword(dto.oldPassword, user.password);
    if (!isOldValid) throw new BadRequestException('原密码错误');

    // 更新新密码
    const hashedPassword = await this.passwordService.hashPassword(dto.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: '密码修改成功' };
  }

  getUserFromToken(token: string): Promise<User> {
    const id = this.jwtService.decode(token)['userId'];
    return this.prisma.user.findUnique({ where: { id } });
  }

  private generateToken(payload: { userId: string }): Token {
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
      return this.generateToken({ userId });
    } catch (e) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }
  }

  async validateUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true } // 如果前端需要角色信息，记得在这里 include
    });
  }
}
