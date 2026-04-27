import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService], // 导出给其他模块（比如 Users 模块分配角色时可能会查询角色）
})
export class RolesModule {}