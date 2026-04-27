import { 
  IsNotEmpty, IsString, IsOptional, IsInt, IsBoolean, IsEnum 
} from 'class-validator';
import { MenuType } from '@prisma/client'; // 引入 Prisma 生成的枚举
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({ description: '菜单名称' })
  @IsNotEmpty({ message: '菜单名称不能为空' })
  @IsString()
  title: string;

  @ApiProperty({ description: '菜单类型' })
  @IsEnum(MenuType, { message: '菜单类型不合法' })
  type: MenuType; // DIRECTORY (目录), MENU (菜单), BUTTON (按钮/权限)

  @ApiProperty({ description: '父级菜单 ID' })
  @IsOptional()
  @IsString()
  parentId?: string; // 父级菜单 ID

  @ApiProperty({ description: '路由地址' })
  @IsOptional()
  @IsString()
  path?: string; // 路由地址，例如 /system/user

  @ApiProperty({ description: '前端组件路径' })
  @IsOptional()
  @IsString()
  component?: string; // 前端组件路径，例如 layout.base 或 views/system/user/index

  @ApiProperty({ description: '权限标识' })
  @IsOptional()
  @IsString()
  permission?: string; // 权限标识，例如 sys:user:add（通常供 BUTTON 类型使用）

  @ApiProperty({ description: '图标标识' })
  @IsOptional()
  @IsString()
  icon?: string; // 图标标识

  @ApiProperty({ description: '排序' })
  @IsOptional()
  @IsInt()
  sort?: number; // 排序

  @ApiProperty({ description: '是否在侧边栏隐藏' })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean; // 是否在侧边栏隐藏（某些详情页需要配置为 true）
}