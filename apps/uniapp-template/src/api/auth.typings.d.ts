declare namespace API {
  type LoginParams = {
    phone: string;
    password?: string; // 如果未来支持验证码登录，密码可以是可选的
  }
  // 登录参数
  type RegisterParams = {
    phone: string;
    password: string;
    name: string;
  };

  type UserBasic = {
    id: string;
    phone: string;
    name: string;
    status: string;
    // 注册时是没有班级的，但登录时可能带有默认班级
    classId?: string | null; 
  }

  type AuthResult = {
    accessToken: string;
    refreshToken: string;
    user: UserBasic;
  };
}
