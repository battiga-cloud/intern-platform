<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '@/store/useUserStore'

definePage({
  name: 'mine',
  layout: 'tabbar',
  style: {
    navigationBarTitleText: '我的',
    navigationStyle: 'custom',
  },
})

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const showService = ref(false)

function handleProfile() {
  uni.navigateTo({ url: '/pages-user/settings' })
}

function handleLoginClick() {
  uni.navigateTo({
    url: '/pages/login/index',
  })
}

function handleToggleClass() {
  uni.navigateTo({ url: '/pages-class/index' })
}
</script>

<template>
  <view class="bg-gray-50 pb-10">
    <view class="relative from-blue-50 to-gray-50 bg-gradient-to-b px-4 pb-4 pt-20">
      <view v-if="userInfo?.id" class="flex items-center justify-between" @click="handleProfile">
        <view class="flex items-center px-2" @click="handleProfile">
          <view class="h-16 w-16 overflow-hidden border-4 border-white rounded-full bg-white shadow-sm">
            <image
              class="h-full w-full" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              mode="aspectFill"
            />
          </view>
          <view class="ml-4">
            <view class="flex items-center">
              <view class="mr-2 text-xl text-gray-800 font-bold">
                张三
              </view>
              <wd-tag type="primary" plain size="small" round>
                实习生
              </wd-tag>
            </view>
            <text class="mt-1 text-sm text-gray-500">
              手机号：138****8888
            </text>
          </view>
        </view>
        <wd-icon name="arrow-right" size="18px" color="#999" class="mr-2" />
      </view>

      <view v-else class="flex items-center" @click="handleLoginClick">
        <view class="h-16 w-16 overflow-hidden border-4 border-white rounded-full bg-white shadow-sm">
          <image class="h-full w-full" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" mode="aspectFill" />
        </view>
        <view class="ml-4">
          <text class="text-xl text-gray-800 font-bold">
            登录/注册
          </text>
        </view>
      </view>

      <view class="grid grid-cols-3 mt-5 gap-4 rounded-2xl bg-white p-4 pt-2 shadow-sm">
        <view class="flex flex-col items-center border-r border-gray-50">
          <text class="text-2xl text-emerald-500 font-black">
            28
          </text>
          <text class="mt-1 text-xs text-gray-400">
            实习天数
          </text>
        </view>
        <view class="flex flex-col items-center border-r border-gray-50">
          <text class="text-2xl text-amber-500 font-black">
            15
          </text>
          <text class="mt-1 text-xs text-gray-400">
            本月打卡
          </text>
        </view>
        <view class="flex flex-col items-center">
          <text class="text-2xl text-blue-500 font-black">
            12
          </text>
          <text class="mt-1 text-xs text-gray-400">
            碎碎念
          </text>
        </view>
      </view>
    </view>

    <view class="mx-4 mt-2">
      <view
        class="flex items-center justify-between border-l-4 border-blue-500 rounded-xl bg-white py-4 pl-2 pr-6 shadow-sm"
        @click="handleToggleClass"
      >
        <view class="flex items-center">
          <wd-icon name="app" size="22px" color="#4D80F0" class="mr-3" />
          <view>
            <view class="text-sm text-gray-800 font-medium">
              机电工程学院-26届3班
            </view>
            <view class="mt-0.5 text-xs text-gray-400">
              当前激活组织
            </view>
          </view>
        </view>
        <wd-tag type="primary" mark variant="plain" plain>
          切换
        </wd-tag>
      </view>
    </view>

    <view class="mx-4 mt-4">
      <wd-cell-group border rounded>
        <wd-cell title="实习手册" is-link to="/pages-user/manual">
          <template #icon>
            <wd-icon name="edit-outline" size="18px" color="#10b981" class="mr-2" />
          </template>
        </wd-cell>
        <wd-cell title="证书申请" is-link to="/pages-user/certificate">
          <template #icon>
            <wd-icon name="certified" size="18px" color="#f59e0b" class="mr-2" />
          </template>
        </wd-cell>
        <wd-cell title="我的专属客服" is-link @click="showService = true">
          <template #icon>
            <wd-icon name="chat" size="18px" color="#4D80F0" class="mr-2" />
          </template>
        </wd-cell>
        <!-- <wd-cell title="系统设置" is-link to="/pages-user/settings">
          <template #icon>
            <wd-icon name="setting" size="18px" color="#666" class="mr-2" />
          </template>
        </wd-cell> -->
      </wd-cell-group>
    </view>

    <wd-popup v-model="showService" custom-class="w-[75vw] rounded-2xl p-5 flex flex-col items-center">
      <view class="mb-4 text-lg text-gray-800 font-bold">
        专属客服老师
      </view>
      <image
        src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=InternshipUniverseSupport"
        class="h-48 w-48 rounded-lg bg-gray-100"
      />
      <text class="mt-4 text-sm text-gray-500">
        长按识别二维码，添加客服老师
      </text>
      <wd-button custom-class="mt-4 mb-4" round block @click="showService = false">
        关闭
      </wd-button>
    </wd-popup>
  </view>
</template>

<style lang="scss" scoped>
:deep(.wd-cell-group) {
  background-color: transparent !important;
}

:deep(.wd-cell) {
  padding: 16px !important;
}

// 扁平化按钮样式微调
:deep(.wd-button--error.is-plain) {
  background-color: #fff !important;
  border-color: #fee2e2 !important;
  color: #ef4444 !important;
}
</style>
