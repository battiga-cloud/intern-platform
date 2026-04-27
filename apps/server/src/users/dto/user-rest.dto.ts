import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class JoinClassDto {
  @ApiProperty({ description: '班级ID' })
  @IsString({ message: '班级ID格式错误' })
  @IsNotEmpty({ message: '班级ID不能为空' })
  classId: string;
}

// 如果你未来需要修改用户资料（比如修改昵称、头像），也可以写在这里
export class UpdateProfileDto {
  @ApiProperty({ description: '姓名' })
  @IsString()
  @IsNotEmpty()
  name?: string;
  
  // avatar?: string;
}


export class ImportUserItemDto {
  @ApiProperty({ description: '手机号' })
   @IsNotEmpty({ message: '手机号不能为空' })
  @IsString()
  phone: string;

  @ApiProperty({ description: '姓名' })
  @IsNotEmpty({ message: '姓名不能为空' })
  @IsString()
  name: string;

  @ApiProperty({ description: '身份证号' })
  @IsString()
  idCard?: string; // 可选
}

export class ImportUsersDto {
  @IsNotEmpty({ message: '目标班级/机构 ID 不能为空' })
  @IsString()
  classId: string;

  // 🟢 推荐改成这样，让 Swagger 能完美识别这个数组里面的结构
  @ApiProperty({ description: '用户列表', type: () => [ImportUserItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportUserItemDto)
  users: ImportUserItemDto[]; // 前端解析 Excel 后传来的 JSON 数组
}

export class UpdateStatusDto {
  // 🔴 必须显式声明 enum 和 enumName，阻断 Swagger 的无限递归
  @ApiProperty({ enum: UserStatus, enumName: 'UserStatus', description: '账号状态' })
  @IsEnum(UserStatus)
  status: UserStatus;
}
