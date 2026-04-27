import { request } from '../request';

/**
 * 获取学员/用户列表
 */
export function fetchUserList(params?: any) {
  return request<any>({
    url: '/system/users',
    method: 'get',
    params
  });
}

/**
 * 批量导入学员
 */
export function importUsers(data: { classId: string; users: any[] }) {
  return request<any>({
    url: '/system/users/import',
    method: 'post',
    data
  });
}

/**
 * 修改用户状态 (启停)
 */
export function updateUserStatus(id: string, status: 'ACTIVE' | 'INACTIVE') {
  return request<any>({
    url: `/system/users/${id}/status`,
    method: 'patch',
    data: { status }
  });
}

/**
 * 重置用户密码
 */
export function resetUserPassword(id: string) {
  return request<any>({
    url: `/system/users/${id}/reset-password`,
    method: 'patch'
  });
}

/**
 * 更新用户基本资料 (编辑)
 */
export function updateUser(id: string, data: any) {
  return request<any>({
    url: `/system/users/${id}`,
    method: 'patch',
    data
  });
}

// ================= 学校管理 =================
export function fetchSchoolList(params?: any) {
  return request<any>({ url: '/system/schools', method: 'get', params });
}
export function createSchool(data: any) {
  return request<any>({ url: '/system/schools', method: 'post', data });
}
export function updateSchool(id: string, data: any) {
  return request<any>({ url: `/system/schools/${id}`, method: 'patch', data });
}
export function updateSchoolStatus(id: string, status: string) {
  return request<any>({ url: `/system/schools/${id}/status`, method: 'patch', data: { status } });
}
export function deleteSchool(id: string) {
  return request<any>({ url: `/system/schools/${id}`, method: 'delete' });
}

// ================= 班级管理 =================
export function fetchClassList(params?: any) {
  return request<any>({ url: '/system/classes', method: 'get', params });
}
export function createClass(data: any) {
  return request<any>({ url: '/system/classes', method: 'post', data });
}
export function updateClass(id: string, data: any) {
  return request<any>({ url: `/system/classes/${id}`, method: 'patch', data });
}
export function deleteClass(id: string) {
  return request<any>({ url: `/system/classes/${id}`, method: 'delete' });
}
