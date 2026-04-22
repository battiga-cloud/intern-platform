declare namespace API {
  // 加入班级请求参数
  type JoinClassParams = {
    classId: string;
  }
  // 登录参数
  type UserProfileResult = {
    id: string;
    name: string;
    phone: string;
    status: string;
    memberships: Array<{
      id: string;
      role: string;
      status: string;
      classId: string;
      class: {
        id: string;
        name: string;
        // ... 班级的其他信息，如指导老师等
      };
    }>;
  }
}
