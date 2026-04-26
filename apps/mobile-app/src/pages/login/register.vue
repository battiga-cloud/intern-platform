<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { useRequest } from 'alova/client'
import { reactive, ref } from 'vue'
import { registerApi, wxLoginApi } from '@/api/auth'
import { useUserStore } from '@/store/useUserStore'

definePage({
  name: 'register',
  style: {
    navigationBarTitleText: '注册',
    navigationStyle: 'custom',
  },
})

const userStore = useUserStore()
const targetClassId = ref('')
const form = reactive({
  phone: '',
  password: '',
  name: '',
})
const confirmPassword = ref('')

onLoad((options: any) => {
  if (options.targetClassId) {
    targetClassId.value = options.targetClassId
  }
})

// === 公共的注册/登录成功处理逻辑 ===
function handleAuthSuccess(data: API.AuthResult) {
  uni.setStorageSync('access_token', data.accessToken || '')
  uni.showToast({ title: '注册成功' })
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

// === 1. 传统表单手动注册 ===
const { loading, send: submitRegister, onSuccess } = useRequest(() => registerApi(form), {
  immediate: false,
})

onSuccess((event: any) => {
  const res = event.data as API.ApiResponse<API.AuthResult>
  if (res.code === 200)
    handleAuthSuccess(res.data!)
})

function handleRegister() {
  if (!form.name) {
    uni.showToast({ title: '请输入姓名', icon: 'none' })
    return
  }
  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  if (!form.password || form.password.length < 6) {
    uni.showToast({ title: '密码至少为6位', icon: 'none' })
    return
  }
  if (form.password !== confirmPassword.value) {
    uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
    return
  }
  submitRegister()
}

// === 2. 微信小程序一键注册并登录 ===
const { loading: wxLoading, send: submitWxLogin, onSuccess: onWxSuccess } = useRequest((code: string) => wxLoginApi({ code }), {
  immediate: false,
})

onWxSuccess((event: any) => {
  const res = event.data as API.ApiResponse<API.AuthResult>
  if (res.code === 200)
    handleAuthSuccess(res.data!)
})

function handleWxLogin(e: any) {
  if (e.detail.errMsg === 'getPhoneNumber:ok') {
    submitWxLogin(e.detail.code)
  }
  else {
    uni.showToast({ title: '已取消授权', icon: 'none' })
  }
}

// === 路由交互 ===
function goToLogin() {
  uni.navigateBack({ delta: 1 })
}

function goBack() {
  uni.navigateBack({ delta: 1 })
}
</script>

<template>
  <view class="min-h-screen bg-white px-6 pt-16">
    <view class="inline-block rounded-full bg-blue-50 p-3 shadow-md transition-transform active:scale-95">
      <wd-icon name="arrow-left" size="24" @click="goBack" />
    </view>

    <view class="mb-12 mt-10">
      <text class="mb-2 block text-3xl text-gray-800 font-bold">
        创建账号
      </text>
      <text class="block text-sm text-gray-400">
        加入实习印记，开启职场第一步
      </text>
    </view>

    <view class="mb-8">
      <wd-button
        type="success" block size="large" open-type="getPhoneNumber" :loading="!!wxLoading"
        custom-class="rounded-full shadow-lg shadow-green-200" @getphonenumber="handleWxLogin"
      >
        <wd-icon name="wechat" size="20" class="mr-2" /> 微信一键授权注册
      </wd-button>
    </view>

    <view class="mb-8 flex items-center justify-center">
      <view class="h-px flex-1 bg-gray-100" />
      <text class="mx-4 text-xs text-gray-400 tracking-wider">
        或手动填写信息
      </text>
      <view class="h-px flex-1 bg-gray-100" />
    </view>
    <view class="mb-10 flex flex-col gap-4">
      <wd-input v-model="form.name" placeholder="有幸知道您的真实姓名吗" prefix-icon="user" clearable />
      <wd-input
        v-model="form.phone" label="手机号" placeholder="请输入 11 位手机号" type="number" :maxlength="11"
        prefix-icon="mobile" clearable
      />
      <wd-input v-model="form.password" label="设置密码" placeholder="请输入至少6位密码" prefix-icon="lock" show-password />
      <wd-input v-model="confirmPassword" label="确认密码" placeholder="请再次输入密码" prefix-icon="lock" show-password />
    </view>

    <wd-button
      type="primary" block size="large" :loading="!!loading"
      custom-class="rounded-full shadow-lg shadow-blue-200" @click="handleRegister"
    >
      注册并登录
    </wd-button>

    <view class="mt-6 flex justify-center px-2">
      <text class="text-sm text-gray-400">
        已有账号？
      </text>
      <text class="text-sm text-blue-500 font-medium active:opacity-50" @click="goToLogin">
        立即登录
      </text>
    </view>
  </view>
</template>
