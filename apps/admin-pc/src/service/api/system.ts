import { request } from '../request'; // 请确保这里的相对路径指向你项目中封装好的 axios/alova request 实例

// ==========================================
// 🏫 1. 学校/机构管理 (Schools)
// ==========================================

/** 获取学校列表 */
export function fetchSchoolList(params?: Api.System.SchoolQueryDto) {
  return request<Api.Common.PaginatingQueryRecord<Api.System.School>>({
    url: '/system/schools',
    method: 'get',
    params
  });
}

/** 新增学校 */
export function createSchool(data: Api.System.CreateSchoolDto) {
  return request<Api.System.School>({
    url: '/system/schools',
    method: 'post',
    data
  });
}

/** 更新学校信息 */
export function updateSchool(id: string, data: Api.System.UpdateSchoolDto) {
  return request<Api.System.School>({
    url: `/system/schools/${id}`,
    method: 'patch',
    data
  });
}

// 获取某学校管理员的接口
export function fetchSchoolAdmins(schoolId: string) {
  return request<Api.System.User[]>({
    url: `/system/users`,
    method: 'get',
    params: { manageSchoolId: schoolId } // 后端需支持按此字段筛选
  });
}

/** 更新学校状态 */
export function updateSchoolStatus(id: string, status: Api.Common.CommonStatus) {
  return request<Api.System.School>({
    url: `/system/schools/${id}/status`,
    method: 'patch',
    data: { status }
  });
}

/** 删除学校 */
export function deleteSchool(id: string) {
  return request<boolean>({
    url: `/system/schools/${id}`,
    method: 'delete'
  });
}

// ==========================================
// 📚 2. 班级/部门管理 (Classes)
// ==========================================

/** 获取班级列表 (可传 schoolId 过滤) */
export function fetchClassList(params?: Api.System.ClassQueryDto) {
  return request<Api.Common.PaginatingQueryRecord<Api.System.Class>>({
    url: '/system/classes',
    method: 'get',
    params
  });
}

/** 新增班级 */
export function createClass(data: { name: string; schoolId?: string; grade?: string }) {
  return request<Api.System.Class>({
    url: '/system/classes',
    method: 'post',
    data
  });
}

/** 更新班级 */
export function updateClass(id: string, data: Partial<Api.System.Class>) {
  return request<Api.System.Class>({
    url: `/system/classes/${id}`,
    method: 'patch',
    data
  });
}

/** 删除班级 */
export function deleteClass(id: string) {
  return request<boolean>({
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
export function fetchUserList(params?: Api.System.UserQueryDto) {
  return request<Api.Common.PaginatingQueryRecord<Api.System.User>>({
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
  return request<Api.System.User>({
    url: '/system/users/single',
    method: 'post',
    data
  });
}

/**
 * B 端开通管理员账号 (原始 create 接口)
 * 严格校验手机号/账号防重
 */
export function createAdminUser(data: Api.System.SystemUserDto) {
  return request<Api.System.User>({
    url: '/system/users',
    method: 'post',
    data
  });
}

/** * 批量导入学员
 */
export function importUsers(data: { classId: string; users: Api.System.UserImportDto[] }) {
  return request<boolean>({
    url: '/system/users/import',
    method: 'post',
    data
  });
}

/** * 更新用户基本资料 (支持转班/机构转移)
 */
export function updateUser(id: string, data: Partial<Api.System.User>) {
  return request<Api.System.User>({
    url: `/system/users/${id}`,
    method: 'patch',
    data
  });
}

/** * 更新用户状态 (启停账号)
 */
export function updateUserStatus(id: string, status: Api.System.CommonStatus) {
  return request<Api.System.User>({
    url: `/system/users/${id}/status`,
    method: 'patch',
    data: { status }
  });
}

/** * 重置用户密码为默认值
 */
export function resetUserPassword(id: string) {
  return request<boolean>({
    url: `/system/users/${id}/reset-password`,
    method: 'patch'
  });
}

/** * 删除用户
 */
export function deleteUser(id: string) {
  return request<boolean>({
    url: `/system/users/${id}`,
    method: 'delete'
  });
}

/**
 * 为用户分配系统角色
 */
export function assignUserRoles(id: string, roleIds: string[]) {
  return request<boolean>({
    url: `/system/users/${id}/roles`,
    method: 'patch',
    data: { roleIds }
  });
}


// ==========================================
// 🛡️ 角色管理 (Roles)
// ==========================================

/**
 * 获取角色列表 (分页/全量)
 * 菜单管理弹窗中需要调用此接口获取角色选项
 */
export function fetchRoleList() {
  return request<Api.System.Role[]>({
    url: '/system/roles',
    method: 'get',
  });
}

export function updateRole(id: string, data: Partial<Api.System.Role>) {
  return request<Api.System.Role>({
    url: `/system/roles/${id}`,
    method: 'patch',
    data
  });
}

// ==========================================
// 🧭 菜单管理 (Menus)
// ==========================================

/**
 * 获取全量树形菜单列表
 * 用于前端系统管理-菜单管理页面的表格渲染，以及动态路由的构建
 */
export function fetchMenuTree() {
  return request<Api.System.Menu[]>({
    url: '/system/menus/tree',
    method: 'get'
  });
}

/**
 * 创建新菜单
 */
export function createMenu(data: Api.System.CreateMenuDto) {
  return request<Api.System.Menu>({
    url: '/system/menus',
    method: 'post',
    data
  });
}

/**
 * 获取单个菜单详情
 */
export function fetchMenuDetail(id: string) {
  return request<Api.System.Menu>({
    url: `/system/menus/${id}`,
    method: 'get'
  });
}

/**
 * 更新菜单
 */
export function updateMenu(id: string, data: Api.System.UpdateMenuDto) {
  return request<Api.System.Menu>({
    url: `/system/menus/${id}`,
    method: 'patch',
    data
  });
}

/**
 * 删除菜单
 */
export function deleteMenu(id: string) {
  return request<boolean>({
    url: `/system/menus/${id}`,
    method: 'delete'
  });
}
