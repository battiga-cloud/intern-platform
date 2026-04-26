import { IsNotEmpty, MinLength, IsString, Matches, IsOptional, IsJWT } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupInput {
  // @Matches(phoneReg, { message: '请输入正确的11位手机号' })
  // phone: string;

  @ApiProperty({ description: '注册账号（支持手机号或自定义用户名）' })
  @IsNotEmpty({ message: '账号不能为空' })
  @IsString()
  account: string; // 统一接收前端传来的标识

  @ApiProperty({ description: '设置密码' })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码至少为6位' })
  password: string;

  @ApiProperty({ description: '用户真实姓名' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class LoginInput {
  @ApiProperty({ description: '手机号或用户名' })
  @IsNotEmpty({ message: '请输入手机号或账号' })
  @IsString()
  account: string; // 统一接收手机号或账号

  @ApiProperty({ description: '登录密码' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  @MinLength(6, { message: '密码至少为6位' })
  password: string;
}

export class UpdatePasswordDto {
  @ApiProperty({ description: '旧密码' })
  @IsNotEmpty({ message: '旧密码不能为空' })
  oldPassword: string;

  @ApiProperty({ description: '新密码' })
  @IsNotEmpty({ message: '新密码不能为空' })
  newPassword: string;
}

export class RefreshTokenInput {
  @ApiProperty({ description: '刷新令牌' })
  @IsNotEmpty({ message: '刷新令牌不能为空' })
  @IsJWT()
  refreshToken: string;
}
