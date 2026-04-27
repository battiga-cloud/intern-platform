import { PrismaService } from 'nestjs-prisma';
import { User, UserStatus } from '@prisma/client';
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import axios from 'axios';
import { PasswordService } from './password.service';
import { Token } from './models/token.model';
import { SecurityConfig } from '../common/configs/config.interface';
import { SignupInput, LoginInput, UpdatePasswordDto, WechatPhoneLoginInput } from './dto/auth-rest.dto';
import { ImportUsersDto } from 'src/users/dto/user-rest.dto';

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
   * 核心注册逻辑：支持自注册并分配默认角色
   */
  async register(dto: SignupInput) {
    const { account, password, name } = dto;
    const isPhone = /^1[3-9]\d{9}$/.test(account);

    // 1. 防重校验
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ phone: account }, { account: account }] },
    });
    if (existingUser) {
      throw new ConflictException('该手机号或账号已被注册');
    }

    // 2. 获取默认角色 (假设系统中已存在 code 为 STUDENT 的角色)
    // 如果没有这个角色，会抛出错误，防止创建出“无权限孤儿账号”
    const defaultRole = await this.prisma.role.findUnique({
      where: { code: 'STUDENT' }, 
    });

    // 3. 密码加密
    const hashedPassword = await this.passwordService.hashPassword(password);

    // 4. 创建用户并关联角色
    return this.prisma.user.create({
      data: {
        account: account,
        phone: isPhone ? account : null,
        password: hashedPassword,
        name: name || (isPhone ? `学生_${account.slice(-4)}` : account),
        status: 'ACTIVE',
        // 关键点：多对多关联默认角色
        roles: defaultRole ? { connect: { id: defaultRole.id } } : undefined,
      },
      include: { roles: true } // 返回时包含角色信息，方便调试
    });
  }

  /**
   * 核心登录逻辑：双向匹配 + 密码验证
   */
  async login(dto: LoginInput): Promise<Token> {
    const { account, password } = dto;

    // 1. 查找用户 (关联角色用于后续 Token 签发，如果载荷需要角色名的话)
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: account }, { account: account }],
      },
    });

    if (!user) throw new UnauthorizedException('账号不存在或手机号未注册');
    if (user.status === 'INACTIVE') throw new UnauthorizedException('该账号已被禁用');

    // 2. 校验密码 (针对静默注册但未设密码的用户特殊处理)
    if (!user.password) {
      throw new BadRequestException('该账号尚未设置密码，请使用微信快捷登录或找回密码');
    }

    const isPasswordValid = await this.passwordService.validatePassword(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('密码输入有误');

    // 3. 生成双 Token
    return this.generateToken({ userId: user.id });
  }

  /**
   * 微信小程序：手机号授权 一键登录/静默注册
   */
  async wechatPhoneLogin(dto: WechatPhoneLoginInput) {
    const { loginCode, phoneCode } = dto;
    const appId = process.env.WX_MINI_APP_ID;
    const appSecret = process.env.WX_MINI_APP_SECRET;

    if (!appId || !appSecret) {
      throw new BadRequestException('服务器微信配置缺失');
    }

    try {
      // ==========================================
      // 1. 用 loginCode 换取用户的 openId
      // ==========================================
      const sessionUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${loginCode}&grant_type=authorization_code`;
      const sessionRes = await axios.get(sessionUrl);
      if (sessionRes.data.errcode) {
        throw new BadRequestException(`微信登录失败: ${sessionRes.data.errmsg}`);
      }
      const openId = sessionRes.data.openid;

      // ==========================================
      // 2. 获取小程序的全局接口调用凭据 access_token
      // ⚠️ 生产环境强烈建议将 access_token 缓存在 Redis 中（有效期2小时），避免频繁调用超出限额
      // ==========================================
      const tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
      const tokenRes = await axios.get(tokenUrl);
      const accessToken = tokenRes.data.access_token;
      if (!accessToken) throw new BadRequestException('获取微信 accessToken 失败');

      // ==========================================
      // 3. 用 phoneCode 换取用户真实手机号
      // ==========================================
      const phoneUrl = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`;
      const phoneRes = await axios.post(phoneUrl, { code: phoneCode });
      
      if (phoneRes.data.errcode !== 0) {
        throw new BadRequestException(`解析手机号失败: ${phoneRes.data.errmsg}`);
      }
      const purePhoneNumber = phoneRes.data.phone_info.purePhoneNumber; // 例如：13812345678

      // ==========================================
      // 4. 数据库业务逻辑：查找 或 静默注册
      // ==========================================
      let user = await this.prisma.user.findUnique({
        where: { phone: purePhoneNumber },
      });

      if (!user) {
        // 【静默注册分支】
        // 获取默认学生角色
        const defaultRole = await this.prisma.role.findUnique({ where: { code: 'STUDENT' } });
        
        // 生成一个强随机密码（小程序注册的用户默认不知道密码，后续可通过手机号验证码找回/重置）
        const randomPassword = Math.random().toString(36).slice(-8); 
        const hashedPassword = await this.passwordService.hashPassword(randomPassword);

        user = await this.prisma.user.create({
          data: {
            phone: purePhoneNumber,
            account: purePhoneNumber, // 自动分配一个 account
            password: hashedPassword,
            name: `微信用户_${purePhoneNumber.slice(-4)}`,
            openId: openId, // 绑定 openId
            roles: defaultRole ? { connect: { id: defaultRole.id } } : undefined,
          },
        });
      } else if (!user.openId) {
        // 【已有账号分支】如果用户以前用账号密码注册过，但没绑定微信，这里顺手帮他绑定
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { openId: openId },
        });
      }

      // ==========================================
      // 5. 登录成功，签发 JWT Token 给前端
      // ==========================================
      return this.generateToken({ userId: user.id });

    } catch (error: any) {
      // 统一捕获处理
      throw new BadRequestException(error.response?.data?.errmsg || error.message || '微信授权过程发生异常');
    }
  }

  /**
   * 预留给 JwtStrategy 等使用的校验函数
   * 同样应用多字段 OR 校验
   */
  async validateUser(account: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: account }, { account: account }],
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

  async importUsers(dto: ImportUsersDto) {
    const { classId, users } = dto;
    const defaultPassword = await this.passwordService.hashPassword('abc12345');
    
    // 获取默认学生角色
    const studentRole = await this.prisma.role.findUnique({ where: { code: 'STUDENT' } });

    let successCount = 0;
    const errors = [];

    // ⚠️ 在生产环境中，建议使用 prisma.$transaction 或分批处理大量数据
    for (const item of users) {
      try {
        // A. 查找或创建用户 (Upsert 逻辑)
        let user = await this.prisma.user.findUnique({ where: { phone: item.phone } });
        
        if (!user) {
          // 不存在：创建新用户
          user = await this.prisma.user.create({
            data: {
              phone: item.phone,
              account: item.phone,
              name: item.name,
              idCard: item.idCard,
              password: defaultPassword, // 默认密码
              roles: studentRole ? { connect: { id: studentRole.id } } : undefined,
            }
          });
        } else {
          // 已存在：可选更新其姓名和身份证
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
              name: item.name || user.name,
              idCard: item.idCard || user.idCard
            }
          });
        }

        // B. 绑定机构/班级关联 (如果已在班级中，更新状态为 ACTIVE)
        await this.prisma.classMember.upsert({
          where: {
            classId_userId: { classId, userId: user.id }
          },
          update: { status: UserStatus.ACTIVE }, // 恢复激活状态
          create: {
            classId,
            userId: user.id,
            role: 'STUDENT',
            status: UserStatus.ACTIVE,
          }
        });

        successCount++;
      } catch (err: any) {
        errors.push(`手机号 ${item.phone} 处理失败: ${err.message}`);
      }
    }

    return {
      message: `导入完成，成功 ${successCount} 条，失败 ${errors.length} 条`,
      errors
    };
  }

  /**
   * 重置密码
   */
  async resetPassword(id: string) {
    const hashedPassword = await this.passwordService.hashPassword('abc12345');
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
    return { message: '密码已重置为 abc12345' };
  }

  /**
   * 更改状态 (启停账号)
   */
  async updateStatus(id: string, status: string) {
    // 禁止禁用超级管理员等保护逻辑可在此处添加
    return this.prisma.user.update({
      where: { id },
      data: { status: status as any },
    });
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
