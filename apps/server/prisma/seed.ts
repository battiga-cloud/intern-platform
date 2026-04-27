import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// 为了保证 seed 脚本 100% 独立运行不报错，这里直接在文件内定义一份枚举
// 你也可以选择 import { RoleCode } from '@muxi/shared'
// 系统角色必须硬编码：核心角色（SUPER_ADMIN, SCHOOL_ADMIN, USER 等）必须在后端的 enum 和前端的常量中定死，
// 并通过 Prisma 的 seed.ts 自动写入数据库。
enum RoleCode {
  SUPER_ADMIN = 'SUPER_ADMIN',
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  ENTERPRISE_ADMIN = 'ENTERPRISE_ADMIN',
  USER = 'USER',
}

async function main() {
  console.log('🌱 开始执行数据库初始化 (Seeding)...');

  // ==========================================
  // 1. 初始化系统核心角色
  // ==========================================
  const systemRoles = [
    { code: RoleCode.SUPER_ADMIN, name: '超级管理员', description: '系统最高权限，可管理所有机构' },
    { code: RoleCode.PLATFORM_ADMIN, name: '平台管理员', description: '平台运营人员' },
    { code: RoleCode.SCHOOL_ADMIN, name: '学校管理员', description: '管理单一学校/机构的资产与师生' },
    { code: RoleCode.ENTERPRISE_ADMIN, name: '企业管理员', description: '管理入驻企业及岗位' },
    { code: RoleCode.USER, name: '普通用户', description: '基础角色' },
  ];

  for (const role of systemRoles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: { name: role.name, description: role.description }, // 存在则更新名称和描述
      create: role, // 不存在则创建
    });
  }
  console.log('✅ 系统核心角色同步完成');

  // ==========================================
  // 2. 初始化平台超级管理员账号 (账号: 10000000000, 密码: admin123)
  // ==========================================
  const superAdminAccount = '10000000000';
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { account: superAdminAccount },
    update: {
      // 每次运行 seed，确保超管角色没有被意外取消
      roles: { connect: { code: RoleCode.SUPER_ADMIN } } 
    }, 
    create: {
      account: superAdminAccount,
      phone: superAdminAccount, // 兼容双字段
      name: '系统超级管理员',
      password: hashedAdminPassword,
      roles: {
        connect: { code: RoleCode.SUPER_ADMIN }
      }
    }
  });
  console.log(`✅ 超管账号初始化完成。登录账号: ${superAdminAccount}, 密码: admin123`);

  // ==========================================
  // 3. (可选) 初始化一个演示学校，方便刚启动项目时有数据可测
  // ==========================================
  const demoSchoolName = '东莞理工学院';
  let demoSchool = await prisma.school.findUnique({ where: { name: demoSchoolName } });
  
  if (!demoSchool) {
    demoSchool = await prisma.school.create({
      data: { 
        name: demoSchoolName,
        status: 'ACTIVE'
      }
    });
    console.log(`✅ 演示学校【${demoSchoolName}】创建完成`);
  }

  console.log('🎉 数据库初始化全部完成！');
}

main()
  .catch((e) => {
    console.error('❌ 初始化数据失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });