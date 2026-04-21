// apps/mobile-app/src/api/auth.ts
import http from '@/utils/request';

// ========================
// TypeScript 类型定义
// ========================

// 登录请求参数
export interface LoginParams {
  phone: string;
  password?: string; // 如果未来支持验证码登录，密码可以是可选的
}

// 注册请求参数
export interface RegisterParams {
  phone: string;
  password: string;
  name: string;
}

// 登录/注册成功后的返回体结构
export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    phone: string;
    name: string;
    status: string;
    // 注册时是没有班级的，但登录时可能带有默认班级
    classId?: string | null; 
  };
}

// ========================
// API 方法导出
// ========================

/**
 * 用户登录接口 (手机号+密码)
 * POST /auth/login
 */
export const loginApi = (data: LoginParams) => {
  return http.post<AuthResult>('/auth/login', data);
};

/**
 * 散客/普通用户自行注册接口
 * POST /auth/register
 */
export const registerApi = (data: RegisterParams) => {
  return http.post<AuthResult>('/auth/register', data);
};