<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { useRequest } from 'alova/client'
import { reactive, ref } from 'vue'
import { loginApi } from '@/api/auth'
import { useUserStore } from '@/store/useUserStore'

definePage({
  name: 'login',
  style: {
    navigationBarTitleText: '登录',
    navigationStyle: 'custom',
  },
})

const userStore = useUserStore()
const targetClassId = ref('') // 用于存储扫码带过来的班级参数
const loginForm = reactive({ phone: '', password: '' })

// 页面加载时，捕获从“班级页”拦截过来的参数
onLoad((options: any) => {
  if (options.targetClassId) {
    targetClassId.value = options.targetClassId
  }
})

// immediate: false 代表不立即发起请求，适用于表单提交场景
const { loading, send: submitLogin, onSuccess } = useRequest(() => loginApi(loginForm), {
  immediate: false,
})

onSuccess((event: any) => {
  const res = event.data as API.ApiResponse<API.AuthResult>
  if (res.code === 200) {
    uni.setStorageSync('access_token', res.data?.accessToken || '')
    uni.showToast({ title: '登录成功' })
    userStore.setUserInfo(res.data!) // 触发全局状态更新

    setTimeout(() => {
      if (targetClassId.value) {
        uni.redirectTo({ url: `/pages/class/index?classId=${targetClassId.value}` })
      }
      else {
        uni.switchTab({ url: '/pages/index/index' })
      }
    }, 800)
  }
})

function handleLogin() {
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(loginForm.phone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  if (!loginForm.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  submitLogin()
}

function goToRegister() {
  // 跳转注册页时，把班级参数也带过去，保证注册完也能跳回班级页
  const query = targetClassId.value ? `?targetClassId=${targetClassId.value}` : ''
  uni.navigateTo({ url: `/pages/login/register${query}` })
}

function goBack() {
  uni.navigateBack({ delta: 1 })
}
</script>

<template>
  <view class="min-h-screen bg-white px-6 pt-16">
    <view class="inline-block rounded-full bg-blue-50 p-3 shadow-md">
      <wd-icon name="arrow-left" size="24" @click="goBack" />
    </view>

    <view class="mb-12 mt-10">
      <text class="mb-2 block text-3xl text-gray-800 font-bold">
        欢迎登录
      </text>
      <text class="block text-sm text-gray-400">
        实习宇宙平台
      </text>
    </view>

    <view class="mb-10 flex flex-col gap-6">
      <wd-input
        v-model="loginForm.phone" placeholder="请输入 11 位手机号" type="number" prefix-icon="mobile" :maxlength="11"
        clearable
      />
      <wd-input v-model="loginForm.password" placeholder="请输入登录密码" prefix-icon="lock" show-password clearable />
    </view>

    <wd-button type="primary" block size="large" :loading="loading.value" @click="handleLogin">
      登 录
    </wd-button>

    <view class="mt-6 flex justify-between px-2">
      <text class="text-sm text-gray-400">
        忘记密码
      </text>
      <text class="text-sm text-blue-500" @click="goToRegister">
        去注册账号
      </text>
    </view>
  </view>
</template>
