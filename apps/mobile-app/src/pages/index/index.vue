<template>
  <view class="min-h-screen bg-gray-50 font-sans pb-10">

   <view class="mb-20rpx p-30rpx bg-white rounded-lg border border-gray-100 flex items-center justify-between">
      <view>
        <text class="block text-base font-bold text-gray-800 mb-1">企业生存指南</text>
        <text class="block text-xs text-gray-400">厂区地图 / 作息时间 / 食堂位置</text>
      </view>
      <wd-button size="small" plain type="primary">点击查阅</wd-button>
    </view>

    <view class="mb-20rpx p-30rpx bg-white rounded-lg border border-gray-100">
      <text class="block text-sm font-bold text-gray-800 mb-3">🚀 新手破冰任务</text>
      <view class="flex items-center justify-between mb-3 border-b border-gray-50 pb-2">
        <text class="text-sm text-gray-600">1. 认领我的工位并拍照</text>
        <wd-tag type="success" plain>已达成</wd-tag>
      </view>
      <view class="flex items-center justify-between">
        <text class="text-sm text-gray-600">2. 找到一号食堂并定位</text>
        <wd-tag type="primary" plain>去完成</wd-tag>
      </view>
    </view>
    
    <view
      class="bg-white px-4 pt-6 pb-2 sticky top-0 z-10 shadow-sm flex justify-between items-center"
    >
      <view class="flex items-center gap-3">
        <view
          class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold"
        >
          张
        </view>
        <view>
          <text class="block text-sm font-bold text-gray-800">张同学</text>
          <text class="block text-xs text-gray-400">某某制造厂 (机电三班)</text>
        </view>
      </view>

      <view class="flex bg-gray-100 p-1 rounded-full">
        <view
          v-for="tab in ['日', '周', '月']"
          :key="tab"
          @click="currentTab = tab"
          class="px-4 py-1 rounded-full text-xs transition-colors"
          :class="
            currentTab === tab
              ? 'bg-white text-blue-600 font-bold shadow-sm'
              : 'text-gray-500'
          "
        >
          {{ tab }}
        </view>
      </view>
    </view>

    <view v-if="currentTab === '日'" class="p-4 animate-fade-in">
      <view class="mb-30rpx p-30rpx bg-white rounded-xl shadow-sm border border-gray-100">
        <view
          class="flex gap-4 text-[10px] text-gray-400 mb-4 pb-3 border-b border-gray-50"
        >
          <view class="flex items-center gap-1"
            ><view class="w-1.5 h-1.5 rounded-full bg-blue-500"></view>正常</view
          >
          <view class="flex items-center gap-1"
            ><view class="w-1.5 h-1.5 rounded-full bg-orange-400"></view>异常</view
          >
          <view class="flex items-center gap-1"
            ><view class="w-1.5 h-1.5 rounded-full bg-gray-300"></view>未打卡</view
          >
        </view>

        <view class="flex justify-between items-center text-center">
          <view
            v-for="day in weekCalendar"
            :key="day.date"
            class="flex flex-col items-center gap-1"
          >
            <text class="text-xs text-gray-400">{{ day.week }}</text>
            <view
              class="w-7 h-7 flex items-center justify-center rounded-full text-sm"
              :class="day.isToday ? 'bg-blue-500 text-white font-bold' : 'text-gray-700'"
            >
              {{ day.date }}
            </view>
            <view class="w-1 h-1 rounded-full mt-0.5" :class="day.statusColor"></view>
          </view>
        </view>
      </view>

      <view
        class="mb-30rpx p-30rpx bg-indigo-50 border border-indigo-100 rounded-xl flex justify-between items-center"
      >
        <view class="flex items-center gap-2">
          <text class="text-indigo-500">🎯</text>
          <text class="text-sm font-bold text-indigo-800">入职探索任务 (1/3)</text>
        </view>
        <text class="text-xs text-indigo-500 font-bold">去完成 ></text>
      </view>

      <view
        class="mb-30rpx p-30rpx bg-white rounded-xl flex flex-col items-center shadow-sm border border-gray-100"
      >
        <view
          class="w-32 h-32 rounded-full bg-gradient-to-b from-blue-400 to-blue-600 flex flex-col items-center justify-center shadow-lg shadow-blue-200 mb-20rpx active:scale-95 transition-transform"
          @click="handleCheckIn"
        >
          <text class="text-white text-xl font-bold tracking-widest mb-1">打卡</text>
          <text class="text-blue-100 text-xs">08:25:33</text>
        </view>

        <view class="flex items-center gap-1 text-xs text-gray-500 mb-4">
          <text>📍</text>
          <text>某某精密制造厂第一车间</text>
          <text class="text-blue-500 ml-2">微调</text>
        </view>

        <wd-input
          v-model="moodText"
          placeholder="写下此刻心情，触发今日盲盒..."
          border
          custom-class="bg-gray-50 text-sm"
        />
      </view>

      <view class="mb-30rpx p-30rpx bg-white rounded-xl shadow-sm border border-gray-100">
        <text class="block text-sm font-bold text-gray-800 mb-4">今日动态</text>

        <view class="relative pl-4 border-l-2 border-blue-100 pb-4">
          <view
            class="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white"
          ></view>
          <view class="flex items-center gap-2 mb-1">
            <text class="text-sm font-bold text-gray-800">上班打卡 08:25</text>
            <wd-tag type="primary" plain size="small">极速打卡</wd-tag>
          </view>
          <text class="block text-xs text-gray-500 mb-2">📍 厂区大门</text>
          <view class="bg-gray-50 rounded p-2 text-xs text-gray-600">
            😊 昨天睡得不错，今天活力满满！
          </view>
        </view>

        <view class="relative pl-4 border-l-2 border-transparent">
          <view
            class="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-gray-300 border-2 border-white"
          ></view>
          <text class="text-sm text-gray-400">下班打卡 暂无记录</text>
        </view>
      </view>
    </view>

    <view v-else class="animate-fade-in">
      <view class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <view class="flex justify-between items-center mb-20rpx">
          <text class="text-base font-bold text-gray-800">2026年 4月</text>
          <text class="text-xs text-gray-400">统计截至 04-20 15:50</text>
        </view>

        <view class="grid grid-cols-3 gap-y-6 text-center">
          <view class="flex flex-col gap-1">
            <text class="text-2xl font-bold text-gray-800">13</text>
            <text class="text-xs text-gray-500">出勤天数</text>
          </view>
          <view class="flex flex-col gap-1">
            <text class="text-2xl font-bold text-gray-800">1</text>
            <text class="text-xs text-gray-500">异常打卡</text>
          </view>
          <view class="flex flex-col gap-1">
            <text class="text-2xl font-bold text-gray-800">0</text>
            <text class="text-xs text-gray-500">请假天数</text>
          </view>

          <view class="flex flex-col gap-1">
            <text class="text-2xl font-bold text-blue-500">85</text>
            <text class="text-xs text-gray-500">心情指数</text>
          </view>
          <view class="flex flex-col gap-1">
            <text class="text-2xl font-bold text-orange-400">4</text>
            <text class="text-xs text-gray-500">点亮勋章</text>
          </view>
          <view class="flex flex-col gap-1">
            <text class="text-2xl font-bold text-indigo-500">12</text>
            <text class="text-xs text-gray-500">收集盲盒</text>
          </view>
        </view>
      </view>

      <view class="mt-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <text class="block text-sm font-bold text-gray-800 mb-3">异常记录 (1)</text>
        <view class="flex justify-between items-center py-2 border-b border-gray-50">
          <view>
            <text class="block text-sm text-gray-800">04-15 星期三</text>
            <text class="block text-xs text-orange-400">缺少下班打卡</text>
          </view>
          <wd-button size="small" plain type="warning">去补卡</wd-button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";

// 控制顶部 Tab 切换
const currentTab = ref("日");
const moodText = ref("");

// 模拟日历数据
const weekCalendar = ref([
  { week: "一", date: "13", statusColor: "bg-blue-500", isToday: false },
  { week: "二", date: "14", statusColor: "bg-blue-500", isToday: false },
  { week: "三", date: "15", statusColor: "bg-orange-400", isToday: false },
  { week: "四", date: "16", statusColor: "bg-blue-500", isToday: false },
  { week: "五", date: "17", statusColor: "bg-blue-500", isToday: false },
  { week: "六", date: "18", statusColor: "bg-transparent", isToday: false },
  { week: "日", date: "19", statusColor: "bg-transparent", isToday: false },
  { week: "一", date: "20", statusColor: "bg-transparent", isToday: true }, // 今日
]);

const handleCheckIn = () => {
  uni.showToast({ title: "打卡成功，获取盲盒中...", icon: "none" });
  // 这里可以触发之前的 showBlindBox 弹窗逻辑
};
</script>

<style scoped>
/* 简单的淡入动画，让 Tab 切换更平滑 */
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
