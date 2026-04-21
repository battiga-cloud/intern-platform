import { IsNotEmpty, MinLength, IsString, Matches } from 'class-validator';

// 简易的中国大陆手机号正则表达式
const phoneReg = /^1[3-9]\d{9}$/;

export class RegisterDto {
  @Matches(phoneReg, { message: '请输入正确的11位手机号' })
  phone: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '姓名不能为空' })
  name: string;
}

export class LoginDto {
  @Matches(phoneReg, { message: '请输入正确的11位手机号' })
  phone: string;

  @IsNotEmpty({ message: '密码不能为空' })
  password: string;
}

export class UpdatePasswordDto {
  @IsNotEmpty({ message: '旧密码不能为空' })
  oldPassword: string;

  @IsNotEmpty({ message: '新密码不能为空' })
  newPassword: string;
}
