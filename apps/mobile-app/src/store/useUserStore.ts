import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUserStore = defineStore("user", () => {
  const authInfo = ref<API.AuthResult>();
  // 1. 用户基础信息
  const userInfo = ref<API.UserBasic>();
  // 2. 当前激活的组织/班级 ID (如果是散客，则为 null)
  const activeClassId = ref<string | null>(null);

  // 3. 计算属性：获取当前用户加入的所有班级列表
  const myClasses = computed(() => {
    if (!authInfo.value || !authInfo.value?.memberships) return [];
    return authInfo.value?.memberships
      .filter((m: any) => m.status === "ACTIVE")
      .map((m: any) => m.class);
  });

  // 4. 计算属性：获取当前正在浏览的班级详情
  const currentClassInfo = computed(() => {
    if (!activeClassId.value) return null;
    return (
      myClasses.value.find((c: any) => c.id === activeClassId.value) || null
    );
  });

  // Action: 登录/刷新后设置用户信息
  const setUserInfo = (data: API.AuthResult) => {
    console.log("setUserInfo in store", data);
    userInfo.value = data?.user;
    authInfo.value = data;
    console.log("setUserInfo", data);
    // 如果没有激活的班级，且用户有班级，默认激活第一个
    if (!activeClassId.value && myClasses.value.length > 0) {
      activeClassId.value = myClasses.value[0].id;
    }
  };

  // Action: 切换工作区 (切换班级)
  const switchClass = (classId: string | null) => {
    activeClassId.value = classId;
    // 切换后，这里可以触发全局事件，让首页重新拉取对应班级的打卡任务
    uni.$emit("workspace-changed", classId);
  };

  // Action: 退出登录
  const logout = () => {
    userInfo.value = undefined;
    authInfo.value = undefined;
    activeClassId.value = null;
    uni.removeStorageSync("access_token");
    uni.reLaunch({ url: "/pages/login/index" });
  };

  return {
    userInfo,
    activeClassId,
    myClasses,
    currentClassInfo,
    setUserInfo,
    switchClass,
    logout,
  };
});
