<script setup lang="ts">
import { computed, ref } from 'vue'

definePage({
  name: 'certificate',
  style: {
    navigationBarTitleText: '证书申请',
    navigationStyle: 'custom',
  },
})

// 模拟数据
const stats = ref({
  days: 28, // 当前已实习28天
  quotes: 12, // 已写12篇碎碎念
})

const hasApplied = ref(false) // 是否已提交申请

// 是否具备申请资格
const isEligible = computed(() => {
  return stats.value.days >= 30 && stats.value.quotes >= 20
})

function handleBack() {
  uni.navigateBack()
}

/**
 * 提交申请逻辑
 */
async function handleApply() {
  if (!isEligible.value)
    return

  try {
    uni.showLoading({ title: '提交申请中' })
    // 模拟接口调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    uni.hideLoading()

    hasApplied.value = true
    uni.showToast({ title: '申请已提交', icon: 'success' })
  }
  catch (e) {
    uni.hideLoading()
    uni.showToast({ title: '提交失败', icon: 'none' })
  }
}
</script>

<template>
  <view class="bg-gray-50 pb-10">
    <wd-navbar title="证书申请" left-arrow safe-area-inset-top placeholder fixed @click-left="handleBack" />

    <view class="px-4 pt-5">
      <view class="mb-4 rounded-2xl bg-white p-5 shadow-sm">
        <view class="mb-4 flex items-center justify-between">
          <text class="text-gray-800 font-bold">
            申请资格
          </text>
          <wd-tag :type="isEligible ? 'success' : 'warning'" plain>
            {{ isEligible ? '已达成' : '未达标' }}
          </wd-tag>
        </view>

        <view class="space-y-4">
          <view>
            <view class="mb-1 flex justify-between text-xs text-gray-500">
              <text>实习天数 ({{ stats.days }}/30天)</text>
              <text>{{ Math.floor((stats.days / 30) * 100) }}%</text>
            </view>
            <wd-progress :percentage="Math.min((stats.days / 30) * 100, 100)" color="#10b981" hide-text />
          </view>
          <view>
            <view class="mb-1 flex justify-between text-xs text-gray-500">
              <text>心情碎碎念 ({{ stats.quotes }}/20篇)</text>
              <text>{{ Math.floor((stats.quotes / 20) * 100) }}%</text>
            </view>
            <wd-progress :percentage="Math.min((stats.quotes / 20) * 100, 100)" color="#4D80F0" hide-text />
          </view>
        </view>
      </view>

      <view class="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">
        <view class="flex items-center border-b border-gray-50 p-4">
          <wd-icon name="list" size="18px" color="#4D80F0" class="mr-2" />
          <text class="text-sm text-gray-800 font-bold">
            证书信息核对
          </text>
        </view>
        <wd-cell-group border>
          <wd-cell title="学生姓名" value="张三" />
          <wd-cell title="实习单位" value="广州某某科技有限公司" />
          <wd-cell title="实习岗位" value="前端开发实习生" />
          <wd-cell title="实习周期" :title-width="80" value="2026.03.01 - 2026.04.30" />
        </wd-cell-group>

        <view class="mx-4 my-4 flex items-start rounded-lg bg-orange-50 p-3">
          <wd-icon name="info-circle" color="#fb923c" size="16px" class="mr-2 mt-0.5" />
          <text class="text-[10px] text-[#fb923c] leading-relaxed">
            温馨提示：以上信息将同步至电子证书。如发现信息有误，请联系班级管理员老师修改，确认无误后方可申请。
          </text>
        </view>
      </view>

      <view v-if="!hasApplied" class="px-2">
        <wd-button
          block size="large" :disabled="!isEligible" custom-class="rounded-full shadow-lg"
          :style="{ backgroundColor: isEligible ? '#4D80F0' : '#ccc' }" @click="handleApply"
        >
          立即申请实习证书
        </wd-button>
        <text class="mt-3 block text-center text-[10px] text-gray-400">
          申请后预计在 1-3 个工作日内完成审核
        </text>
      </view>

      <view v-else class="flex flex-col animate-fade-in items-center pt-10">
        <view class="mb-4 h-20 w-20 flex items-center justify-center rounded-full bg-emerald-50">
          <wd-icon name="check-bold" color="#10b981" size="40px" />
        </view>
        <text class="text-lg text-gray-800 font-bold">
          申请审核中
        </text>
        <text class="mt-2 text-sm text-gray-500">
          你的证书申请已提交，请耐心等待老师审核
        </text>

        <wd-button plain custom-class="mt-10 w-40" @click="handleBack">
          返回首页
        </wd-button>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
/* 扁平化进度条样式微调 */
:deep(.wd-progress) {
  height: 8px !important;
  border-radius: 4px !important;
}

:deep(.wd-cell) {
  padding: 12px 16px !important;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
