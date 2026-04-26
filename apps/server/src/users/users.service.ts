import { PrismaService } from 'nestjs-prisma';
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PasswordService } from '../auth/password.service';
import { ChangePasswordInput } from './dto/change-password.input';
import { UpdateProfileDto } from './dto/user-rest.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
  ) {}

  /**
   * 更新用户资料
   */
  async updateUser(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: { id: true, name: true, phone: true } // 不返回 password
    });
  }

  async changePassword(
    userId: string,
    userPassword: string,
    changePassword: ChangePasswordInput,
  ) {
    const passwordValid = await this.passwordService.validatePassword(
      changePassword.oldPassword,
      userPassword,
    );

    if (!passwordValid) {
      throw new BadRequestException('Invalid password');
    }

    const hashedPassword = await this.passwordService.hashPassword(
      changePassword.newPassword,
    );

    return this.prisma.user.update({
      data: {
        password: hashedPassword,
      },
      where: { id: userId },
    });
  }

  /**
   * 获取用户个人信息及多维组织关系
   */
  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        classMemberships: true, // 对应 Schema 中的 classMemberships ClassMember[]
      }
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 剔除敏感信息后返回
    const { password, ...result } = user;
    return result;
  }

  /**
   * 用户主动加入班级 (Upsert 双向绑定)
   */
  async joinClass(userId: string, classId: string) {
    // 1. 校验班级是否存在
    const targetClass = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!targetClass) {
      throw new NotFoundException('您扫描的班级二维码无效或班级已解散');
    }

    // 2. 核心：在多对多中间表中写入关系
    const membership = await this.prisma.classMember.upsert({
      where: {
        classId_userId: { classId: classId, userId: userId },
      },
      create: {
        userId,
        classId,
        role: 'STUDENT',
      },
      update: {}, 
    });

    return { 
      message: `成功加入 ${targetClass.name}`, 
      data: membership 
    };
}
}
