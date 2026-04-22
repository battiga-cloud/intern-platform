import http from "@/utils/request";

/**
 * 用户登录接口 (手机号+密码)
 * POST /auth/login
 */
export const loginApi = (data: API.LoginParams) => {
  return http.post<API.AuthResult>("/auth/login", data);
};

/**
 * 散客/普通用户自行注册接口
 * POST /auth/register
 */
export const registerApi = (data: API.RegisterParams) => {
  return http.post<API.AuthResult>("/auth/register", data);
};
