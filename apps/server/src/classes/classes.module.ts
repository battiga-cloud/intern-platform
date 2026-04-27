import { Module } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';

@Module({
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService], // 导出给未来如果需要发通知、统计等模块使用
})
export class ClassesModule {}