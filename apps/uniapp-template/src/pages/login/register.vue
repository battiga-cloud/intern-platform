<template>
  <view class="min-h-screen bg-white px-6 pt-16">
    <view class="mb-10">
      <text class="block text-3xl font-bold text-gray-800 mb-2">创建账号</text>
      <text class="block text-sm text-gray-400">加入实习宇宙，开启职场第一步</text>
    </view>

    <view class="flex flex-col gap-4 mb-10">
      <wd-input 
        v-model="form.name" 
        label="真实姓名" 
        placeholder="用于学校/企业实名核验" 
        prefix-icon="user"
        clearable 
      />

      <wd-input 
        v-model="form.phone" 
        label="手机号" 
        placeholder="请输入11位手机号" 
        type="number"
        maxlength="11"
        prefix-icon="mobile"
        clearable 
      />

      <wd-input 
        v-model="form.password" 
        label="设置密码" 
        placeholder="请输入至少6位密码" 
        prefix-icon="lock"
        show-password 
      />

      <wd-input 
        v-model="confirmPassword" 
        label="确认密码" 
        placeholder="请再次输入密码" 
        prefix-icon="lock"
        show-password 
      />
    </view>

    <wd-button 
      type="primary" 
      block 
      size="large" 
      :loading="loading"
      @click="handleRegister"
      custom-class="rounded-full shadow-lg shadow-blue-200"
    >
      注册并登录
    </wd-button>

    <view class="mt-8 text-center">
      <view class="text-xs text-gray-400 mb-4">
        注册即代表您同意 <text class="text-blue-500">《用户服务协议》</text> 和 <text class="text-blue-500">《隐私政策》</text>
      </view>
      <view class="text-sm text-gray-600" @click="goToLogin">
        已有账号？<text class="text-blue-500 font-bold">立即登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { registerApi } from '@/api/auth';
import { useUserStore } from '@/store/useUserStore';

const userStore = useUserStore();
const loading = ref(false);
const confirmPassword = ref('');
const targetClassId = ref(''); // 记录扫码带过来的班级ID

const form = reactive({
  phone: '',
  password: '',
  name: ''
});

onLoad((options: any) => {
  // 如果是从班级落地页跳转过来的，会带上 targetClassId
  if (options.targetClassId) {
    targetClassId.value = options.targetClassId;
  }
});

const handleRegister = async () => {
  // 1. 基础前端校验
  if (!form.name.trim()) return uni.showToast({ title: '请输入姓名', icon: 'none' });
  if (!/^1[3-9]\d{9}$/.test(form.phone)) return uni.showToast({ title: '手机号格式错误', icon: 'none' });
  if (form.password.length < 6) return uni.showToast({ title: '密码不能少于6位', icon: 'none' });
  if (form.password !== confirmPassword.value) return uni.showToast({ title: '两次密码输入不一致', icon: 'none' });

  try {
    loading.value = true;
    
    // 2. 调用注册接口
    const res = await registerApi(form);
    
    // 3. 存储 Token 和用户信息
    uni.setStorageSync('access_token', res.data?.accessToken);
    userStore.setUserInfo(res.data?.user);

    uni.showToast({ title: '注册成功', icon: 'success' });

    // 4. 逻辑分发：判断是否需要跳回班级页执行绑定
    setTimeout(() => {
      if (targetClassId.value) {
        // 重定向回班级页，触发无感绑定逻辑
        uni.redirectTo({ url: `/pages/class/index?classId=${targetClassId.value}` });
      } else {
        // 散客注册，直接去首页
        uni.switchTab({ url: '/pages/index/index' });
      }
    }, 1000);

  } catch (err) {
    // 错误处理已由 request.ts 全局拦截（例如手机号已存在）
  } finally {
    loading.value = false;
  }
};

const goToLogin = () => {
  // 返回登录页时也要带上参数，防止意图丢失
  const query = targetClassId.value ? `?targetClassId=${targetClassId.value}` : '';
  uni.redirectTo({ url: `/pages/login/index${query}` });
};
</script>
