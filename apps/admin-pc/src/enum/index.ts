export enum SetupStoreId {
  App = 'app-store',
  Theme = 'theme-store',
  Auth = 'auth-store',
  Route = 'route-store',
  Tab = 'tab-store'
}

export enum RoleCodeEnum {
  SUPER_ADMIN = 'SUPER_ADMIN',           // 超级管理员（开发人员）
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',     // 平台管理员（运营人员）
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',         // 学校管理员
  ENTERPRISE_ADMIN = 'ENTERPRISE_ADMIN', // 企业管理员
  USER = 'USER',                         // 用户
}
