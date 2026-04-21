import { IsNotEmpty, IsString } from 'class-validator';

export class JoinClassDto {
  @IsString({ message: '班级ID格式错误' })
  @IsNotEmpty({ message: '班级ID不能为空' })
  classId: string;
}

// 如果你未来需要修改用户资料（比如修改昵称、头像），也可以写在这里
export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  name?: string;
  
  // avatar?: string;
}
