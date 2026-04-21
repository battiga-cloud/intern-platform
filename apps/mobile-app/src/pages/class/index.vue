<template>
  <view class="min-h-screen bg-gray-50 pb-20 p-4">
    <view class="bg-blue-500 rounded-xl p-6 text-white shadow-md mb-4 mt-2">
      <text class="block text-2xl font-bold mb-2">班级名称 (动态加载)</text>
      <text class="block text-sm opacity-80">指导教师：王老师</text>
    </view>

    <view class="bg-white rounded-xl p-4 mb-4 shadow-sm">
      <view class="border-b border-gray-100 pb-2 mb-3">
        <text class="font-bold text-gray-800">班级通知</text>
      </view>
      <text class="text-sm text-gray-500">
        欢迎加入实习班级！请各位同学每天按时通过首页进行打卡。
      </text>
    </view>

    <view class="bg-white rounded-xl p-4 shadow-sm">
      <view class="border-b border-gray-100 pb-2 mb-3">
        <text class="font-bold text-gray-800">班级待办</text>
      </view>
      <wd-cell title="填写安全责任书" is-link />
      <wd-cell title="提交第一周周志" is-link />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/useUserStore';
import { joinClassApi } from '@/api/users';

const userStore = useUserStore();
const classId = ref('');

onLoad(async (options) => {
  // 1. 获取微信扫码或分享链接带来的参数
  // 实际微信扫码可能会把参数放在 options.q 里面并经过 urlencode，这里先以标准 options 演示
  if (options.classId) {
    classId.value = options.classId;
    await checkAuthAndBind();
  } else {
    uni.showToast({ title: '班级参数错误', icon: 'none' });
  }
});

const checkAuthAndBind = async () => {
  const token = uni.getStorageSync('access_token');
  
  // 【核心拦截 1】：未登录，强制去通用登录页，并把 classId 作为“回城卷轴”带过去
  if (!token) {
    uni.showToast({ title: '请先登录/注册', icon: 'none' });
    setTimeout(() => {
      uni.redirectTo({ url: `/pages/login/index?targetClassId=${classId.value}` });
    }, 800);
    return;
  }

  // 【核心拦截 2】：已登录，静默请求加入班级
  try {
    // 调用后端的 upsert 接口，如果已经加入过，后端会自动忽略并返回成功
    await joinClassApi({ classId: classId.value });
    
    // 绑定成功后，将当前前端的全局激活工作区切换到这个班级
    userStore.switchClass(classId.value);
    
    // 这里可以进一步去拉取班级的真实名称、通知列表等...
    
  } catch (error) {
    console.error('班级绑定失败', error);
  }
};
</script>
