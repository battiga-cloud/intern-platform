// apps/mobile-app/src/api/users.ts
import http from '@/utils/request';

// ========================
// TypeScript 类型定义
// ========================

// 加入班级请求参数
export interface JoinClassParams {
  classId: string;
}

// 个人完整资料返回体 (包含加入的多维组织)
export interface UserProfileResult {
  id: string;
  name: string;
  phone: string;
  status: string;
  memberships: Array<{
    id: string;
    role: string;
    status: string;
    classId: string;
    class: {
      id: string;
      name: string;
      // ... 班级的其他信息，如指导老师等
    };
  }>;
}

// ========================
// API 方法导出
// ========================

/**
 * 扫码/主动加入班级
 * POST /users/join-class
 * @description 调用此接口前，前端 request.ts 拦截器会自动在 Header 中带上 accessToken
 */
export const joinClassApi = (data: JoinClassParams) => {
  // 返回值结构根据后端具体返回的格式而定，通常是一个操作成功的提示
  return http.post<{ message: string; data: any }>('/users/join-class', data);
};

/**
 * 获取当前登录用户的完整生态资料
 * GET /users/me
 * @description 登录成功后，前端通常会调用一次此接口，将 memberships 存入 Pinia
 */
export const getUserProfileApi = () => {
  return http.get<UserProfileResult>('/users/me');
};