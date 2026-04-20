// src/api/attendance.ts
import http from '@/utils/request';

// 定义接口请求和返回的数据类型
export interface SignInParams {
  location: string;
  mood?: string;
}

export interface SignResult {
  blindBox: string;
  signTime: string;
}

/**
 * 提交每日签到
 */
export const doSignIn = (data: SignInParams) => {
  return http.post<SignResult>('/attendance/sign-in', data);
};