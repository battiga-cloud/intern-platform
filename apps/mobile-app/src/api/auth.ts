// src/api/auth.ts
import http from '@/utils/request';

// 登录参数类型
export interface LoginParams {
  account: string;
  password: string;
}

// 登录返回结果类型
export interface LoginResult {
  access_token: string;
  userInfo: {
    id: string;
    name: string;
  };
}

/**
 * 账号密码登录
 */
export const doLogin = (data: LoginParams) => {
  return http.post<LoginResult>('/auth/login', data);
};
