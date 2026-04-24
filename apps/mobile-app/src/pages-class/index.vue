<script setup lang="ts">
import { ref } from 'vue'

definePage({
  name: 'class',
  style: {
    navigationBarTitleText: '我的班级',
  },
})

const message = useMessage()

// 模拟班级数据 (实际应从 Pinia 或后端获取)
const classInfo = ref({
  id: 'class_001',
  name: '机电工程学院-26届3班',
  school: '广州南华工贸高级技工学校',
  teacher: '王老师',
  memberCount: 45,
  joinDate: '2026-03-01',
})

/**
 * 解绑逻辑
 */
async function handleUnbind() {
  try {
    await message.confirm({
      title: '退出班级',
      content: '解绑后你的历史打卡仍会保留，但将无法接收该班级的通知和获取证书，确定退出吗？',
      confirmButtonText: '确定解绑',
      cancelButtonText: '我再想想',
    })

    uni.showLoading({ title: '处理中' })

    // 模拟后端解绑 API
    await new Promise(resolve => setTimeout(resolve, 800))

    // 清除本地状态
    classInfo.value.id = ''

    uni.hideLoading()
    uni.showToast({ title: '已成功解绑', icon: 'success' })
  }
  catch (error) {
    // 用户点击取消
  }
}

function goHome() {
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<template>
  <view class="min-h-screen bg-gray-50 pb-10">
    <wd-navbar title="我的班级" safe-area-inset-top placeholder fixed />

    <view v-if="classInfo.id" class="animate-fade-in px-4 pt-4">
      <view class="relative mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">
        <view class="h-24 from-[#4D80F0] to-[#739dfa] bg-gradient-to-r p-6">
          <text class="text-lg text-white font-bold">
            星球组织
          </text>
        </view>

        <view class="relative z-10 px-6 pb-6 -mt-8">
          <view class="mb-4 flex items-center rounded-xl bg-white p-4 shadow-md">
            <view class="mr-4 h-12 w-12 flex items-center justify-center rounded-full bg-blue-50">
              <wd-icon name="home" size="24px" color="#4D80F0" />
            </view>
            <view>
              <view class="text-lg text-gray-800 font-bold">
                {{ classInfo.name }}
              </view>
              <text class="text-xs text-gray-400">
                {{ classInfo.school }}
              </text>
            </view>
          </view>

          <view class="pt-2 space-y-4">
            <view class="flex items-center justify-between text-sm">
              <text class="text-gray-400">
                辅导员
              </text>
              <text class="text-gray-700 font-medium">
                {{ classInfo.teacher }}
              </text>
            </view>
            <view class="flex items-center justify-between text-sm">
              <text class="text-gray-400">
                当前成员
              </text>
              <text class="text-gray-700 font-medium">
                {{ classInfo.memberCount }} 人
              </text>
            </view>
            <view class="flex items-center justify-between text-sm">
              <text class="text-gray-400">
                加入时间
              </text>
              <text class="text-gray-700 font-medium">
                {{ classInfo.joinDate }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <view class="mb-8 rounded-2xl bg-white p-4 shadow-sm">
        <view class="mb-4 flex items-center">
          <view class="mr-2 h-4 w-1 rounded-full bg-[#10b981]" />
          <text class="text-gray-800 font-bold">
            最新通知
          </text>
        </view>
        <view class="rounded-lg bg-gray-50 p-3">
          <text class="text-xs text-gray-600 leading-relaxed">
            📢 请各位同学在 4月30日 前完成本月的实习报告提交，逾期将影响证书申请。
          </text>
        </view>
      </view>

      <view class="px-4">
        <wd-button type="error" plain block custom-class="rounded-full" @click="handleUnbind">
          退出当前班级
        </wd-button>
        <text class="mt-4 block text-center text-[10px] text-gray-300">
          解绑后你将无法查看该班级的任务与统计数据
        </text>
      </view>
    </view>

    <view v-else class="flex flex-col animate-fade-in items-center justify-center px-10 pt-24">
      <view class="mb-8 h-48 w-48 flex items-center justify-center rounded-full bg-blue-50">
        <wd-icon name="search" size="80px" color="#4D80F0" />
      </view>

      <text class="text-lg text-gray-800 font-bold">
        暂无班级组织
      </text>
      <text class="mt-4 text-center text-sm text-gray-400 leading-relaxed">
        你目前尚未加入任何实习班级。为了确保你的实习数据能被有效统计：
      </text>

      <view class="mt-8 w-full border border-blue-50 rounded-2xl bg-white p-6 shadow-sm">
        <view class="mb-6 flex items-start">
          <view
            class="mr-3 mt-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-[#4D80F0] text-[10px] text-white"
          >
            1
          </view>
          <text class="text-xs text-gray-600">
            联系你的校内辅导员老师，获取专属班级邀请二维码。
          </text>
        </view>
        <view class="flex items-start">
          <view
            class="mr-3 mt-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-[#fb923c] text-[10px] text-white"
          >
            2
          </view>
          <view>
            <text class="block text-xs text-gray-600">
              若无法联系老师，请在“我的”页面添加“专属客服”协助处理。
            </text>
          </view>
        </view>
      </view>

      <wd-button custom-class="mt-10 w-48 rounded-full" @click="goHome">
        返回首页
      </wd-button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.wd-button--error.is-plain) {
  background-color: transparent !important;
  border-color: #fee2e2 !important;
  color: #ef4444 !important;
}
</style>
