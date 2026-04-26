import {
  Controller,
  Post,
  Body,
  Patch,
  Get,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SignupInput, LoginInput, UpdatePasswordDto } from './dto/auth-rest.dto';
import { User } from '../common/decorators/user.decorator'; // 假设你已定义此装饰器
import { ResponseCode, ResponseMessage } from '../common/decorators/response.decorator';
import { WechatLoginInput } from './dto/wechat-login.input';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * [公开接口] 学员注册
   * POST /auth/register
   */
  @Post('register')
  @ResponseCode(201)
  @ResponseMessage('账号创建成功')
  async register(@Body() dto: SignupInput) {
    return this.authService.register(dto);
  }

  /**
   * [公开接口] 学员登录
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK) // 登录通常返回 200 而非 201
  @ResponseMessage('登录成功，欢迎回来！')
  async login(@Body() dto: LoginInput) {
    return this.authService.login(dto);
  }

  @Post('wechat-login')
  @ResponseMessage('登录成功')
  async wechatLogin(@Body() wechatLoginInput: WechatLoginInput) {
    return this.authService.wechatLogin(wechatLoginInput.code);
  }

  /**
   * [保护接口] 获取当前登录用户信息
   * GET /auth/me
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@User() user) {
    // 这里的 user 是通过 JwtStrategy 解析 Token 后注入的
    return user;
  }

  /**
   * [保护接口] 修改当前用户密码
   * PATCH /auth/password
   */
  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async updatePassword(
    @User('id') userId: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.authService.updatePassword(
      userId,
      dto
    );
  }

  /**
   * [公开接口] 刷新 Token
   * POST /auth/refresh-token
   */
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body('refreshToken') token: string) {
    return this.authService.refreshToken(token);
  }
}