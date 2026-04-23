<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
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
const loading = ref(false)
const targetClassId = ref('') // 用于存储扫码带过来的班级参数

const form = reactive({ phone: '', password: '' })

// 页面加载时，捕获从“班级页”拦截过来的参数
onLoad((options: any) => {
  if (options.targetClassId) {
    targetClassId.value = options.targetClassId
  }
})

async function handleLogin() {
  if (!/^1[3-9]\d{9}$/.test(form.phone) || !form.password) {
    uni.showToast({ title: '请输入正确的账号密码', icon: 'none' })
    return
  }

  try {
    loading.value = true
    const res = await loginApi(form)
    console.log('loginApi----', res)

    uni.setStorageSync('access_token', res.accessToken)
    userStore.setUserInfo(res) // 触发全局状态更新
    uni.showToast({ title: '登录成功', icon: 'success' })

    setTimeout(() => {
      if (targetClassId.value) {
        uni.redirectTo({ url: `/pages/class/index?classId=${targetClassId.value}` })
      }
      else {
        uni.switchTab({ url: '/pages/index/index' })
      }
    }, 500)
  }
  catch (err) {
    // 拦截器处理报错
  }
  finally {
    loading.value = false
  }
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
  <view class="min-h-screen bg-white px-8 pt-20">
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
        v-model="form.phone"
        label="手机号"
        placeholder="请输入11位手机号"
        type="number"
        :maxlength="11"
        clearable
      />
      <wd-input
        v-model="form.password"
        label="密码"
        placeholder="请输入登录密码"
        prefix-icon="lock"
        show-password
        clearable
      />
    </view>

    <wd-button type="primary" block size="large" :loading="loading" @click="handleLogin">
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
