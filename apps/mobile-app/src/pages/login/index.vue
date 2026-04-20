<template>
  <view class="bg-white px-8 pt-20 font-sans">
    
    <view class="mb-12">
      <text class="block text-3xl font-bold text-gray-800 mb-2">欢迎回来</text>
      <text class="block text-sm text-gray-400">请登录以继续您的实习记录</text>
    </view>

    <view class="flex flex-col gap-6 mb-10">
      <view class="bg-gray-50 rounded-lg px-4 py-1 border border-gray-100">
        <wd-input 
          v-model="formData.account" 
          placeholder="请输入账号 (学号/手机号)" 
          clearable 
          no-border
          custom-class="bg-transparent"
        />
      </view>

      <view class="bg-gray-50 rounded-lg px-4 py-1 border border-gray-100">
        <wd-input 
          v-model="formData.password" 
          type="password" 
          placeholder="请输入密码" 
          show-password 
          clearable 
          no-border
          custom-class="bg-transparent"
        />
      </view>
    </view>

    <wd-button 
      type="primary" 
      block 
      size="large" 
      :loading="isSubmitting"
      @click="handleLogin"
      custom-class="rounded-full font-bold tracking-widest shadow-md shadow-blue-200"
    >
      登 录
    </wd-button>

    <view class="mt-8 text-center">
      <text class="text-xs text-gray-400">遇到问题？请联系学校指导老师</text>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { doLogin } from '@/api/auth';

// 表单数据
const formData = reactive({
  account: '',
  password: ''
});

// 提交状态
const isSubmitting = ref(false);

const handleLogin = async () => {
  // 1. 基础前端校验
  if (!formData.account.trim() || !formData.password.trim()) {
    uni.showToast({ title: '账号和密码不能为空', icon: 'none' });
    return;
  }

  try {
    isSubmitting.value = true;
    
    // 2. 发起登录请求
    const res = await doLogin(formData);
    
    // 3. 存储登录凭证
    // 将 token 存入本地缓存，request.ts 会自动读取
    uni.setStorageSync('access_token', res.data.access_token);
    uni.setStorageSync('userInfo', res.data.userInfo);

    uni.showToast({ title: '登录成功', icon: 'success' });

    // 4. 跳转回首页 (因为首页是 TabBar 页面，必须用 switchTab)
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' });
    }, 1000);

  } catch (error) {
    // 错误处理已在 request.ts 中全局拦截，这里可以不做额外提示
    console.error('登录异常:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
