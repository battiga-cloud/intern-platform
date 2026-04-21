import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { PrismaModule } from 'nestjs-prisma';

@Module({
  // 导入这个模块运行所依赖的其他模块（比如数据库）
  imports: [PrismaModule], 
  // 注册控制器，处理路由请求
  controllers: [AttendanceController],
  // 注册服务，处理核心业务逻辑
  providers: [AttendanceService],
  // 如果其他模块需要用到 AttendanceService，可以在这里 exports
  exports: [AttendanceService], 
})
export class AttendanceModule {}
