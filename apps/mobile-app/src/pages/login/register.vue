<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'
import { registerApi } from '@/api/auth'
import { useUserStore } from '@/store/useUserStore'

definePage({
  name: 'register',
  style: {
    navigationBarTitleText: '注册',
    navigationStyle: 'custom',
  },
})

const userStore = useUserStore()
const targetClassId = ref('') // 记录扫码带过来的班级ID
const form = reactive({
  phone: '',
  password: '',
  name: '',
})
const confirmPassword = ref('')

onLoad((options: any) => {
  // 如果是从班级落地页跳转过来的，会带上 targetClassId
  if (options.targetClassId) {
    targetClassId.value = options.targetClassId
  }
})

// immediate: false 代表不立即发起请求，适用于表单提交场景
const { loading, send: submitRegister, onSuccess } = useRequest(() => registerApi(form), {
  immediate: false,
})

onSuccess((event: any) => {
  const res = event.data as API.ApiResponse<API.AuthResult>
  if (res.code === 200) {
    uni.showToast({ title: '注册成功' })
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

function handleRegister() {
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(form.phone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  if (!form.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  if (form.password !== confirmPassword.value) {
    uni.showToast({ title: '两次输入密码不一致', icon: 'none' })
    return
  }
  submitRegister()
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
        创建账号
      </text>
      <text class="block text-sm text-gray-400">
        加入实习宇宙，开启职场第一步
      </text>
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
      type="primary" block size="large" :loading="loading.value"
      custom-class="rounded-full shadow-lg shadow-blue-200" @click="handleRegister"
    >
      注册并登录
    </wd-button>

    <view class="mt-8 text-center">
      <view class="mb-4 text-xs text-gray-400">
        注册即代表您同意 <text class="text-blue-500">
          《用户服务协议》
        </text> 和
        <text class="text-blue-500">
          《隐私政策》
        </text>
      </view>
      <view class="text-sm text-gray-600" @click="goBack">
        已有账号？<text class="text-blue-500 font-bold">
          立即登录
        </text>
      </view>
    </view>
  </view>
</template>
