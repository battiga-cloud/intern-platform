import type { ApiResponse } from '@/api/core/instance'
import alovaInstance from '@/api/core/instance'

/**
 * 提交每日签到
 */
export function checkIn(data: API.CheckInParams) {
  return alovaInstance.Post<ApiResponse<API.CheckInResult>>('/attendance/check-in', data)
};
