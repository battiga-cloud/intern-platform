declare namespace API {
  interface LoginParams {
    phone: string
    password?: string // 如果未来支持验证码登录，密码可以是可选的
  }
  // 登录参数
  interface RegisterParams {
    phone: string
    password: string
    name: string
  }

  interface UserBasic {
    id: string
    phone: string
    name?: string
    status?: string
    avatar?: string
    // 注册时是没有班级的，但登录时可能带有默认班级
    classId?: string | null
  }

  interface AuthResult {
    accessToken: string
    refreshToken: string
    user: UserBasic
  };
}
