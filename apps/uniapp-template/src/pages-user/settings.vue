<template>
  <view class="min-h-screen bg-gray-50 pb-10">
    <view class="p-4 bg-white pt-12">
      <text class="text-xl font-bold text-gray-800">个人设置</text>
    </view>

    <view class="bg-white flex flex-col items-center py-8 mb-3">
      <view class="relative" @click="handleUploadAvatar">
        <wd-img
          :src="form.avatar || '/static/logo.png'"
          round
          width="80"
          height="80"
          custom-class="border-4 border-white shadow-sm"
        />
        <view
          class="absolute bottom-0 right-0 bg-blue-500 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white"
        >
          <wd-icon name="camera" size="14" color="white"></wd-icon>
        </view>
      </view>
      <text class="mt-2 text-xs text-gray-400">点击更换头像</text>
    </view>

    <wd-cell-group border>
      <view class="bg-white px-4">
        <wd-input
          v-model="form.name"
          label="真实姓名"
          placeholder="请输入您的姓名"
          label-width="80px"
          align-right
          clearable
        />
        <wd-input
          v-model="form.phone"
          label="手机号码"
          placeholder="请输入手机号"
          type="number"
          maxlength="11"
          label-width="80px"
          align-right
          clearable
        />
      </view>
    </wd-cell-group>

    <view class="p-6">
      <wd-button
        type="primary"
        block
        size="large"
        :loading="saving"
        @click="handleSave"
        custom-class="rounded-lg shadow-md"
      >
        保 存 修 改
      </wd-button>

      <view class="mt-10">
        <wd-button
          plain
          type="error"
          block
          size="large"
          @click="handleLogout"
          custom-class="bg-white"
        >
          退 出 登 录
        </wd-button>
      </view>
    </view>

    <view class="text-center mt-4">
      <text class="text-xs text-gray-300">版本 v1.0.1</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useUserStore } from "@/store/useUserStore";
import { updateProfileApi } from "@/api/users";

const userStore = useUserStore();
const saving = ref(false);

// 初始化表单数据
const form = reactive({
  name: "",
  phone: "",
  avatar: "",
});

onMounted(() => {
  // 从 Store 同步当前数据
  if (userStore.userInfo) {
    form.name = userStore.userInfo?.name || "";
    form.phone = userStore.userInfo?.phone || "";
    form.avatar = userStore.userInfo?.avatar || "";
  }
});

// 处理头像上传
const handleUploadAvatar = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      // 实际开发中需调用上传接口，这里先模拟预览
      const tempPath = res.tempFilePaths[0];
      form.avatar = tempPath;
      uni.showToast({ title: "头像已选中（待集成上传接口）", icon: "none" });
    },
  });
};

// 保存资料
const handleSave = async () => {
  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    uni.showToast({ title: "手机号格式错误", icon: "none" });
    return;
  }

  try {
    saving.value = true;
    await updateProfileApi(form);

    // 更新本地 Store 中的数据
    userStore.setUserInfo({ ...userStore.userInfo, ...form });

    uni.showToast({ title: "资料更新成功", icon: "success" });

    setTimeout(() => {
      uni.navigateBack();
    }, 1000);
  } catch (err) {
    // 错误处理由 request.ts 统一拦截
  } finally {
    saving.value = false;
  }
};

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: "提示",
    content: "确定要退出当前账号吗？",
    success: (res) => {
      if (res.confirm) {
        userStore.logout();
      }
    },
  });
};
</script>

<style scoped>
/* 深度调整 wot-design 输入框边距，使其更贴合手机端习惯 */
:deep(.wd-input) {
  padding: 12px 0 !important;
}
</style>
