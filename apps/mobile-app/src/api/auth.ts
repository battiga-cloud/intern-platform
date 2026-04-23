import type { ApiResponse } from '@/api/core/instance'
import alovaInstance from '@/api/core/instance'

/**
 * 用户登录接口 (手机号+密码)
 * POST /auth/login
 */
export function loginApi(data: API.LoginParams) {
  return alovaInstance.Post<ApiResponse<API.AuthResult>>('/auth/login', data)
};

/**
 * 散客/普通用户自行注册接口
 * POST /auth/register
 */
export function registerApi(data: API.RegisterParams) {
  return alovaInstance.Post<ApiResponse<API.AuthResult>>('/auth/register', data)
};
