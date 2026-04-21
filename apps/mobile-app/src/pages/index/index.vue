<template>
  <view class="min-h-screen bg-gray-50 font-sans pb-10">
  周日休息忘签周日休息忘签周日休息忘签周日休息忘签
    <view
      class="mb-20rpx p-30rpx bg-white rounded-lg border border-gray-100 flex items-center justify-between"
    >
      <view>
        <text class="block text-base font-bold text-gray-800 mb-1">企业生存指南</text>
        <text class="block text-xs text-gray-400">厂区地图 / 作息时间 / 食堂位置</text>
      </view>
      <wd-button size="small" plain type="primary">点击查阅</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { doSignIn } from '@/api/attendance';

const moodText = ref('');
const blindBoxMessage = ref('');



// 模拟 2026年4月 的核心日历数据 (仅截取部分做演示)
const calendarDays = ref([
  { date: '2026-04-16', dayNum: 16, status: 'signed', signTime: '08:20', location: '厂区大门', mood: '学会了看游标卡尺！', blindBox: '经验+1', isToday: false },
  { date: '2026-04-17', dayNum: 17, status: 'signed', signTime: '08:15', location: '第一车间', mood: '周末快到了，开心。', blindBox: '今日宜吃肉', isToday: false },
  { date: '2026-04-18', dayNum: 18, status: 'missed', isToday: false }, // 周六休息忘签
  { date: '2026-04-19', dayNum: 19, status: 'missed', isToday: false }, // 周日休息忘签
  { date: '2026-04-20', dayNum: 20, status: 'unsigned', isToday: true }, // 今天，还没签到
  { date: '2026-04-21', dayNum: 21, status: 'future', isToday: false },
  { date: '2026-04-22', dayNum: 22, status: 'future', isToday: false },
])

// 默认选中今天
const selectedDate = ref('2026-04-20')

// 获取当前选中日期的详细数据
const currentDayData = computed(() => {
  return calendarDays.value.find(day => day.date === selectedDate.value) || {}
})

// 点击日历切换日期
const selectDate = (day: any) => {
  selectedDate.value = day.date
}

const handleSignIn = async () => {
  try {
    // 直接调用封装好的 API，无需再手写 uni.request 和 header 配置
    // 如果 token 过期，底层会自动拦截、报错并跳转登录页，下方代码不会执行
    const res = await doSignIn({
      location: '某某精密制造厂第一车间',
      mood: moodText.value
    });
    
    // 因为底层有泛型支持，编辑器这里会有很好的代码提示
    blindBoxMessage.value = res.data.blindBox;
    
    uni.showToast({ title: '签到成功！', icon: 'success' });
    
    // ... 更新页面的签到状态展示逻辑
    
  } catch (error) {
    // 错误已经被底层统一拦截处理过 Toast 了
    // 这里只需处理页面特定的 UI 重置逻辑即可
    console.error('签到失败:', error);
  }
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
