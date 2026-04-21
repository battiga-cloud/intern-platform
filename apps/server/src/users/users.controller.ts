import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch,
  UseGuards 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JoinClassDto, UpdateProfileDto } from './dto/user-rest.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // 引入我们之前写的门卫
import { User } from '../common/decorators/user.decorator'; // 引入自定义装饰器

@Controller('users')
@UseGuards(JwtAuthGuard) // 🔐 整个 users 模块的接口都必须携带 Token 才能访问
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 获取当前登录用户的完整资料（包含其加入的所有班级列表）
   * GET /users/me
   */
  @Get('me')
  async getProfile(@User('id') userId: string) {
    return this.usersService.getUserProfile(userId);
  }

  /**
   * 扫码/主动加入班级
   * POST /users/join-class
   */
  @Post('join-class')
  async joinClass(
    @User('id') userId: string, 
    @Body() dto: JoinClassDto
  ) {
    return this.usersService.joinClass(userId, dto.classId);
  }

  /**
   * [预留] 修改个人资料 (如姓名)
   * PATCH /users/profile
   */
  @Patch('profile')
  async updateProfile(
    @User('id') userId: string,
    @Body() dto: UpdateProfileDto
  ) {
    return this.usersService.updateUser(userId, dto);
  }
}