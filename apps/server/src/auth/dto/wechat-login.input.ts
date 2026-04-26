import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WechatLoginInput {
  @ApiProperty({ description: '微信小程序授权获取的 code' })
  @IsNotEmpty({ message: 'code 不能为空' })
  @IsString()
  code: string;
}