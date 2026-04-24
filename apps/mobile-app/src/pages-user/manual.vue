<script setup lang="ts">
import { ref } from 'vue'

definePage({
  name: 'manual',
  style: {
    navigationBarTitleText: '实习手册',
    navigationStyle: 'custom',
  },
})

const activeStep = ref(1) // 默认处于“进场”阶段
const activeNames = ref(['1']) // 默认展开第一项

function handleBack() {
  uni.navigateBack()
}

function contactSupport() {
  uni.showModal({
    title: '联系支持',
    content: '是否拨打技术支持电话：400-XXX-XXXX',
    success: (res) => {
      if (res.confirm) {
        uni.makePhoneCall({ phoneNumber: '400xxxxxxx' })
      }
    },
  })
}
</script>

<template>
  <view class="min-h-screen bg-gray-50 pb-10">
    <wd-navbar title="实习手册" left-arrow safe-area-inset-top placeholder fixed @click-left="handleBack" />

    <view class="px-4 pt-5">
      <view class="relative mb-4 overflow-hidden rounded-2xl bg-[#4D80F0] p-6 shadow-blue-100 shadow-lg">
        <view class="relative z-10">
          <text class="block text-xl text-white font-bold">
            你好，星际实习生！
          </text>
          <text class="mt-2 block text-xs text-blue-100 leading-relaxed">
            这是你的职场生存指南，助你在实习宇宙中平稳飞行。
          </text>
        </view>
        <wd-icon name=" believe" size="80px" color="rgba(255,255,255,0.1)" custom-class="absolute -right-4 -bottom-4" />
      </view>

      <view class="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <view class="mb-4 flex items-center">
          <view class="mr-2 h-4 w-1 rounded-full bg-[#4D80F0]" />
          <text class="text-gray-800 font-bold">
            实习三部曲
          </text>
        </view>
        <wd-steps :active="activeStep" align-center>
          <wd-step title="准备" description="资料与协议" />
          <wd-step title="进场" description="打卡与记录" />
          <wd-step title="归航" description="鉴定与证书" />
        </wd-steps>
      </view>

      <view class="overflow-hidden rounded-2xl bg-white shadow-sm">
        <wd-collapse v-model="activeNames">
          <wd-collapse-item title="🚀 职场启航：如何开始？" name="1">
            <view class="p-2 text-sm text-gray-600 leading-relaxed">
              <view class="mb-2">
                <text class="text-[#4D80F0] font-bold">
                  ●
                </text> 确认协议：确保三方实习协议已在线签署或上传。
              </view>
              <view class="mb-2">
                <text class="text-[#4D80F0] font-bold">
                  ●
                </text> 首次打卡：进入首页日历，点击当前日期标记“上班”。
              </view>
              <view>
                <text class="text-[#4D80F0] font-bold">
                  ●
                </text> 心情记录：我们鼓励你记录真实感受，这是成长最宝贵的财富。
              </view>
            </view>
          </wd-collapse-item>

          <wd-collapse-item title="🛡️ 星际守则：安全与规范" name="2">
            <view class="p-2 text-sm text-gray-600 leading-relaxed">
              <view class="mb-3 flex items-start rounded-lg bg-green-50 p-3">
                <wd-icon name="check-circle" color="#10b981" size="18px" class="mr-2 mt-0.5" />
                <view>
                  <text class="block text-[#10b981] font-bold">
                    休息充电
                  </text>
                  <text class="text-xs">
                    当感到疲惫时，请勇敢切换为“休息”模式，调整状态。
                  </text>
                </view>
              </view>
              <view class="flex items-start rounded-lg bg-orange-50 p-3">
                <wd-icon name="warn-bold" color="#fb923c" size="18px" class="mr-2 mt-0.5" />
                <view>
                  <text class="block text-[#fb923c] font-bold">
                    异常求助
                  </text>
                  <text class="text-xs">
                    若实习内容与协议不符或面临安全威胁，请第一时间联系客服老师。
                  </text>
                </view>
              </view>
            </view>
          </wd-collapse-item>

          <wd-collapse-item title="❓ 常见问题 FAQ" name="3">
            <view class="p-2">
              <view class="mb-4">
                <text class="block text-sm text-gray-800 font-bold">
                  Q: 忘记打卡可以补签吗？
                </text>
                <text class="text-sm text-gray-500">
                  A: 当然可以！点击日历上的历史日期，即可随时补充你的实习状态。
                </text>
              </view>
              <view>
                <text class="block text-sm text-gray-800 font-bold">
                  Q: 碎碎念被谁看得到？
                </text>
                <text class="text-sm text-gray-500">
                  A: 仅你自己和你的班级管理老师可见，这是一个私密的成长空间。
                </text>
              </view>
            </view>
          </wd-collapse-item>
        </wd-collapse>
      </view>

      <view class="mt-8 flex flex-col items-center">
        <text class="text-xs text-gray-300">
          还没有解决问题？
        </text>
        <wd-button type="info" plain size="small" custom-class="mt-2 border-gray-200" @click="contactSupport">
          联系技术支持
        </wd-button>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
:deep(.wd-collapse) {
  border: none !important;
}

:deep(.wd-collapse-item__header) {
  padding: 16px !important;
  font-weight: bold;
  color: #333;
}

:deep(.wd-collapse-item__content) {
  background-color: #fafafa !important;
  padding: 0 16px 16px 16px !important;
}

/* 步骤条颜色微调 */
:deep(.wd-step--process .wd-step__title) {
  color: #4D80F0 !important;
}
:deep(.wd-step--process .wd-step__icon) {
  background-color: #4D80F0 !important;
}
</style>
