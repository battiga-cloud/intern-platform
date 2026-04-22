import http from "@/utils/request";

/**
 * 提交每日签到
 */
export const checkIn = (data: API.CheckInParams) => {
  return http.post<API.CheckInResult>("/attendance/check-in", data);
};
