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

/**
 * 微信小程序一键授权手机号登录/注册
 * 前端传入 button 上的 e.detail.code，后端去微信服务器换取手机号
 */
export function wxLoginApi(data: { code: string }) {
  // 注意：这里请替换成你后端实际定义的微信登录接口路径
  return alovaInstance.Post<API.ApiResponse<API.AuthResult>>('/auth/wechat-login', data)
}
