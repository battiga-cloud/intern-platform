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
