import { Module } from '@nestjs/common';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';

@Module({
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService], // 导出供后续动态路由解析或角色模块使用
})
export class MenusModule {}