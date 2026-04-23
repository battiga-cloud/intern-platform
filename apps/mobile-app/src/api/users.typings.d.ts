declare namespace API {
  interface ApiResponse<T = any> {
    code: number
    msg?: string
    message?: string
    data?: T
    time?: string
  }
  // 加入班级请求参数
  interface JoinClassParams {
    classId: string
  }
  // 登录参数
  interface UserProfileResult {
    id: string
    name: string
    phone: string
    status: string
    memberships: Array<{
      id: string
      role: string
      status: string
      classId: string
      class: {
        id: string
        name: string
        // ... 班级的其他信息，如指导老师等
      }
    }>
  }
}
