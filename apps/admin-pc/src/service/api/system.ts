import { request } from '../request'; // 请确保这里的相对路径指向你项目中封装好的 axios/alova request 实例

// ==========================================
// 🏫 1. 学校/机构管理 (Schools)
// ==========================================

/** 获取学校列表 */
export function fetchSchoolList(params?: any) {
  return request<any>({
    url: '/system/schools',
    method: 'get',
    params
  });
}

/** 新增学校 */
export function createSchool(data: any) {
  return request<any>({
    url: '/system/schools',
    method: 'post',
    data
  });
}

/** 更新学校信息 */
export function updateSchool(id: string, data: any) {
  return request<any>({
    url: `/system/schools/${id}`,
    method: 'patch',
    data
  });
}

/** 更新学校状态 */
export function updateSchoolStatus(id: string, status: 'ACTIVE' | 'INACTIVE') {
  return request<any>({
    url: `/system/schools/${id}/status`,
    method: 'patch',
    data: { status }
  });
}

/** 删除学校 */
export function deleteSchool(id: string) {
  return request<any>({
    url: `/system/schools/${id}`,
    method: 'delete'
  });
}

// ==========================================
// 📚 2. 班级/部门管理 (Classes)
// ==========================================

/** 获取班级列表 (可传 schoolId 过滤) */
export function fetchClassList(params?: any) {
  return request<any>({
    url: '/system/classes',
    method: 'get',
    params
  });
}

/** 新增班级 */
export function createClass(data: { name: string; schoolId?: string; grade?: string }) {
  return request<any>({
    url: '/system/classes',
    method: 'post',
    data
  });
}

/** 更新班级 */
export function updateClass(id: string, data: any) {
  return request<any>({
    url: `/system/classes/${id}`,
    method: 'patch',
    data
  });
}

/** 删除班级 */
export function deleteClass(id: string) {
  return request<any>({
    url: `/system/classes/${id}`,
    method: 'delete'
  });
}

// ==========================================
// 👤 3. 用户/学员管理 (Users)
// ==========================================

/** * 获取用户列表
 * (包含普通分页和 keyword/account/classId/schoolId 检索)
 */
export function fetchUserList(params?: any) {
  return request<any>({
    url: '/system/users',
    method: 'get',
    params
  });
}

/**
 * 录入单个学员 (C 端纳新融合接口)
 * 如果系统内已有该手机号，会自动绑定到指定班级而不报错
 */
export function createSingleUser(data: { phone: string; name: string; idCard?: string; classId: string }) {
  return request<any>({
    url: '/system/users/single',
    method: 'post',
    data
  });
}

/**
 * B 端开通管理员账号 (原始 create 接口)
 * 严格校验手机号/账号防重
 */
export function createAdminUser(data: any) {
  return request<any>({
    url: '/system/users',
    method: 'post',
    data
  });
}

/** * 批量导入学员
 */
export function importUsers(data: { classId: string; users: any[] }) {
  return request<any>({
    url: '/system/users/import',
    method: 'post',
    data
  });
}

/** * 更新用户基本资料 (支持转班/机构转移)
 */
export function updateUser(id: string, data: any) {
  return request<any>({
    url: `/system/users/${id}`,
    method: 'patch',
    data
  });
}

/** * 更新用户状态 (启停账号)
 */
export function updateUserStatus(id: string, status: 'ACTIVE' | 'INACTIVE') {
  return request<any>({
    url: `/system/users/${id}/status`,
    method: 'patch',
    data: { status }
  });
}

/** * 重置用户密码为默认值
 */
export function resetUserPassword(id: string) {
  return request<any>({
    url: `/system/users/${id}/reset-password`,
    method: 'patch'
  });
}

/** * 删除用户
 */
export function deleteUser(id: string) {
  return request<any>({
    url: `/system/users/${id}`,
    method: 'delete'
  });
}

/**
 * 为用户分配系统角色
 */
export function assignUserRoles(id: string, roleIds: string[]) {
  return request<any>({
    url: `/system/users/${id}/roles`,
    method: 'patch',
    data: { roleIds }
  });
}
