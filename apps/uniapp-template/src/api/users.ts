import http from '@/utils/request';

/**
 * 扫码/主动加入班级
 * POST /users/join-class
 * @description 调用此接口前，前端 request.ts 拦截器会自动在 Header 中带上 accessToken
 */
export const joinClassApi = (data: API.JoinClassParams) => {
  // 返回值结构根据后端具体返回的格式而定，通常是一个操作成功的提示
  return http.post<{ message: string; data: any }>('/users/join-class', data);
};

/**
 * 获取当前登录用户的完整生态资料
 * GET /users/me
 * @description 登录成功后，前端通常会调用一次此接口，将 memberships 存入 Pinia
 */
export const getUserProfileApi = () => {
  return http.get<API.UserProfileResult>('/users/me');
};

/**
 * 更新个人资料
 * PATCH /users/profile
 */
export const updateProfileApi = (data: { name?: string; phone?: string; avatar?: string }) => {
  return http.patch('/users/profile', data);
};
