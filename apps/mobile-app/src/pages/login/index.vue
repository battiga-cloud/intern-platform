<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { useRequest } from 'alova/client'
import { reactive, ref } from 'vue'
import { loginApi, wxLoginApi } from '@/api/auth'
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

onLoad((options: any) => {
  if (options.targetClassId) {
    targetClassId.value = options.targetClassId
  }
})

// === 公共的登录成功处理逻辑 ===
function handleLoginSuccess(data: API.AuthResult) {
  uni.setStorageSync('access_token', data.accessToken || '')
  uni.showToast({ title: '登录成功' })
  userStore.setUserInfo(data)

  setTimeout(() => {
    if (targetClassId.value) {
      uni.redirectTo({ url: `/pages/class/index?classId=${targetClassId.value}` })
    }
    else {
      uni.switchTab({ url: '/pages/index/index' })
    }
  }, 500)
}

// === 1. 传统账号密码登录 (H5/App/小程序兜底) ===
const { loading, send: submitLogin, onSuccess } = useRequest(() => loginApi(loginForm), {
  immediate: false,
})

onSuccess((event: any) => {
  const res = event.data as API.ApiResponse<API.AuthResult>
  if (res.code === 200)
    handleLoginSuccess(res.data!)
})

function handleLogin() {
  if (!/^1[3-9]\d{9}$/.test(loginForm.phone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  if (!loginForm.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  submitLogin()
}

// === 2. 微信小程序一键登录 ===
const { loading: wxLoading, send: submitWxLogin, onSuccess: onWxSuccess } = useRequest((code: string) => wxLoginApi({ code }), {
  immediate: false,
})

onWxSuccess((event: any) => {
  const res = event.data as API.ApiResponse<API.AuthResult>
  if (res.code === 200)
    handleLoginSuccess(res.data!)
})

function handleWxLogin(e: any) {
  console.log('handleWxLogin', e)
  const errMsg = e?.detail?.errMsg
  if (errMsg === 'getPhoneNumber:ok') {
    // 授权成功，将 code 发给后端换取手机号并完成登录/注册
    submitWxLogin(e.detail.code)
  }
  else if (errMsg === 'getPhoneNumber:fail no permission') {
    uni.showToast({ title: '无权限', icon: 'none' })
  }
  else if (errMsg === 'getPhoneNumber:fail auth deny') {
    uni.showToast({ title: '请先授权', icon: 'none' })
  }
  else {
    uni.showToast({ title: errMsg || '未知错误', icon: 'none' })
  }
}

// === 路由交互 ===
function goToRegister() {
  const query = targetClassId.value ? `?targetClassId=${targetClassId.value}` : ''
  uni.navigateTo({ url: `/pages/login/register${query}` })
}

function goBack() {
  uni.navigateBack({ delta: 1 })
}
</script>

<template>
  <view class="bg-white px-6">
    <view class="mt-[150rpx] inline-block rounded-full bg-blue-50 p-3 shadow-md transition-transform active:scale-95">
      <wd-icon name="arrow-left" size="24" @click="goBack" />
    </view>

    <view class="mb-8 mt-6">
      <text class="mb-2 block text-3xl text-gray-800 font-bold">
        欢迎登录
      </text>
      <text class="block text-sm text-gray-400">
        实习印记平台
      </text>
    </view>

    <view class="mb-8 flex justify-center">
      <view class="h-32 w-32 overflow-hidden border-4 border-white rounded-full bg-white shadow-sm">
        <image class="h-full w-full" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" mode="aspectFill" />
      </view>
    </view>

    <!-- #ifdef MP-WEIXIN -->
    <view class="mb-8">
      <wd-button
        type="success" block size="large" open-type="getPhoneNumber" :loading="wxLoading"
        custom-class="rounded-full shadow-lg shadow-green-200" @getphonenumber="handleWxLogin"
      >
        <wd-icon name="wechat" size="20" class="mr-2" /> 微信一键快捷登录
      </wd-button>
    </view>
    <!-- #endif -->

    <!-- <view class="mb-8 flex items-center justify-center">
      <view class="h-px flex-1 bg-gray-100" />
      <text class="mx-4 text-xs text-gray-400 tracking-wider">
        或使用账号密码
      </text>
      <view class="h-px flex-1 bg-gray-100" />
    </view> -->

    <!-- #ifdef H5 -->
    <view class="mb-10 flex flex-col gap-6">
      <wd-input
        v-model="loginForm.phone" placeholder="请输入 11 位手机号" type="number" prefix-icon="mobile" :maxlength="11"
        clearable
      />
      <wd-input v-model="loginForm.password" placeholder="请输入登录密码" prefix-icon="lock" show-password clearable />
    </view>

    <wd-button
      type="primary" block size="large" :loading="loading"
      custom-class="rounded-full shadow-lg shadow-blue-200" @click="handleLogin"
    >
      登 录
    </wd-button>

    <view class="mt-6 flex justify-between px-2">
      <text class="text-sm text-gray-400 active:opacity-50">
        忘记密码
      </text>
      <text class="text-sm text-blue-500 font-medium active:opacity-50" @click="goToRegister">
        没有账号？去注册
      </text>
    </view>
    <!-- #endif -->
  </view>
</template>
