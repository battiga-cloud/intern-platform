declare namespace Api {
  namespace System {
    // ==========================================
    // 🏫 学校 (School) 类型定义
    // ==========================================
    interface School {
      id: string;
      name: string;
      shortName?: string;
      logo?: string;
      description?: string;
      promoContent?: string;
      promoUrl?: string;
      address?: string;
      contactName?: string;
      phone?: string;
      status: Api.Common.CommonStatus;
      createdAt: string;
      updatedAt: string;
    }

    interface SchoolQueryDto {
      name?: string;
      status?: Api.Common.CommonStatus;
    }

    interface CreateSchoolDto {
      name: string;
      logo?: string;
      description?: string;
      address?: string;
      contactName?: string;
      phone?: string;
    }

    type UpdateSchoolDto = Partial<CreateSchoolDto>;

    // ==========================================
    // 📚 班级 (Class) 类型定义
    // ==========================================
    interface Class {
      id: string;
      schoolId: string;
      school?: School; // 联表查询时携带的学校信息
      name: string;    // 如 "机电3班"
      year?: number;   // 如 2026
      grade?: string;  // 如 "大一", "2024级"
      description?: string;
      status: Api.Common.CommonStatus;
      createdAt: string;
    }

    interface CreateClassDto {
      schoolId: string;
      name: string;
      year?: number;
      grade?: string;
      description?: string;
    }

    type UpdateClassDto = Partial<CreateClassDto>;

    // ==========================================
    // 👤 用户 & 学员 (User & ClassMember) 类型定义
    // ==========================================

    // 班级成员关系表 (用于展示学员所在的班级详情)
    interface ClassMember {
      id: string;
      userId: string;
      classId: string;
      role: 'STUDENT' | 'TEACHER';
      status: Api.Common.ClassMemberStatus;
      class?: Class; // 嵌套的班级详情
      createdAt: string;
    }

    interface User {
      id: string;
      account: string; // 唯一登录标识 (手机号/学号/自定义)
      phone?: string;  // 真实手机号
      name?: string;   // 真实姓名
      idCard?: string;
      avatar?: string;
      sex?: Api.Common.Sex;
      status: Api.Common.CommonStatus;

      // 关联信息
      roles: { id: string; code: string; name: string }[]; // 全局角色
      manageSchoolId?: string;
      manageSchool?: { name: string }; // 仅对校管有值
      enterpriseId?: string;
      enterprise?: { name: string };   // 仅对企管有值
      classMemberships?: ClassMember[]; // C端学员的班级关系

      createdAt: string;
    }

    // 查询条件 DTO
    interface UserQueryDto {
      page?: number;
      pageSize?: number;
      keyword?: string;  // 模糊匹配 name, phone, account
      schoolId?: string; // 按机构筛选
      classId?: string;  // 按班级筛选
    }

    // B 端开户 DTO (创建管理员)
    interface CreateAdminUserDto {
      account: string;
      name: string;
      phone?: string;
      password?: string;
      roleIds: string[];
      manageSchoolId?: string;
      enterpriseId?: string;
    }

    // C 端纳新 DTO (新增单个学员/拉入班级)
    interface CreateSingleUserDto {
      phone: string;  // C 端纳新强制要求手机号
      name: string;
      classId: string; // 必须指定去哪个班级
      idCard?: string;
    }

    // 批量导入学员 DTO
    interface ImportUsersDto {
      classId: string;
      users: { phone: string; name: string; idCard?: string }[];
    }

    // ==========================================
    // 📌 角色 (Role) 类型定义
    // ==========================================
    interface Role {
      id: string;
      name: string;
      code: string;
      description?: string;
      sort: number;
      createdAt: string;
    }

    // ==========================================
    // 📌 菜单 (Menu) 类型定义
    // ==========================================
    type MenuType = 'DIR' | 'MENU' | 'BUTTON'; // 与后端 MenuType 或前端单选框对应

    interface Menu {
      id: string;
      parentId: string | null;
      menuType: MenuType;
      title: string;
      name: string; // 路由名称
      path: string; // 路由地址
      component?: string;
      icon?: string;
      sort: number;
      isHidden: boolean;
      permission?: string;
      roles?: Role[]; // 该菜单绑定的角色列表
      children?: Menu[]; // 树形结构的子节点
      createdAt: string;
    }

    interface CreateMenuDto {
      parentId?: string | null;
      menuType: MenuType;
      title: string;
      name: string;
      path?: string;
      component?: string;
      icon?: string;
      sort?: number;
      isHidden?: boolean;
      permission?: string;
      roleIds?: string[]; // 绑定的角色ID数组
    }

    type UpdateMenuDto = Partial<CreateMenuDto>;
  }
}

