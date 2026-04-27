import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { Sex, UserStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: '登录账号' })
  @IsNotEmpty({ message: '登录账号不能为空' })
  @IsString()
  userName: string;

  @ApiProperty({ description: '姓名' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: '密码' })
  @IsOptional()
  @IsString()
  password?: string; // 如果不传，后端会设置一个默认密码

  @ApiProperty({ enum: Sex, enumName: 'Sex', required: false, description: '性别' }) 
  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;

  @ApiProperty({ enum: UserStatus, enumName: 'UserStatus', required: false, description: '用户状态' }) 
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({ description: '学校ID' })
  @IsOptional()
  @IsString()
  manageSchoolId?: string;

  @ApiProperty({ description: '企业ID' })
  @IsOptional()
  @IsString()
  enterpriseId?: string;
}