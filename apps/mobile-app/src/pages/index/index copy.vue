<template>
  <view class="min-h-screen bg-[#f8f9fa] font-sans pb-10">
    
    <view class="bg-white px-5 pt-6 pb-4 flex justify-between items-center">
      <view class="flex items-center gap-3">
        <view class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">
          张
        </view>
        <view>
          <text class="block text-base font-bold text-gray-800">早安，张同学</text>
          <text class="block text-xs text-gray-400">某某制造厂 (机电三班)</text>
        </view>
      </view>
      <text class="text-2xl">🌱</text>
    </view>

    <view class="bg-white mx-4 mt-4 rounded-2xl p-4 shadow-sm border border-gray-50">
      
      <view class="flex justify-between items-center mb-6 px-2">
        <view class="flex items-center gap-2">
          <text class="text-lg font-bold text-gray-800">2026年 4月</text>
        </view>
        <view class="flex gap-4 text-gray-400">
          <text class="text-xl active:text-gray-600">◀</text>
          <text class="text-xl active:text-gray-600">▶</text>
        </view>
      </view>

      <view class="grid grid-cols-7 text-center mb-4">
        <text v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day" class="text-xs text-gray-400">
          {{ day }}
        </text>
      </view>

      <view class="grid grid-cols-7 gap-y-4 text-center">
        <view v-for="i in 3" :key="'empty-'+i"></view>
        
        <view 
          v-for="day in calendarDays" 
          :key="day.date" 
          class="flex flex-col items-center justify-center relative"
          @click="selectDate(day)"
        >
          <view 
            class="w-8 h-8 flex items-center justify-center rounded-xl text-sm transition-all"
            :class="[
              selectedDate === day.date ? 'bg-[#10b981] text-white font-bold shadow-md shadow-green-200' : 'text-gray-700',
              day.isToday && selectedDate !== day.date ? 'border border-[#10b981] text-[#10b981]' : ''
            ]"
          >
            {{ day.dayNum }}
          </view>
          
          <text v-if="day.isToday && selectedDate !== day.date" class="text-[9px] text-[#10b981] absolute -bottom-3">今天</text>
          <view v-else-if="day.status === 'signed' && selectedDate !== day.date" class="w-1 h-1 rounded-full bg-[#10b981] absolute -bottom-2"></view>
          <view v-else-if="day.status === 'missed' && selectedDate !== day.date" class="w-1 h-1 rounded-full bg-red-300 absolute -bottom-2"></view>
        </view>
      </view>
    </view>


    <view class="mx-4 mt-4">
      
      <view v-if="currentDayData.isToday && currentDayData.status !== 'signed'" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 flex flex-col items-center animate-fade-in">
        <text class="text-sm text-gray-500 mb-6">今日还未签到，开启新的一天吧！</text>
        
        <view class="w-32 h-32 rounded-full bg-gradient-to-b from-[#34d399] to-[#059669] flex flex-col items-center justify-center shadow-lg shadow-green-200 mb-6 active:scale-95 transition-transform" @click="handleSignIn">
          <text class="text-white text-xl font-bold tracking-widest mb-1">签到</text>
          <text class="text-green-100 text-xs">08:15:22</text>
        </view>
        
        <view class="w-full flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2 mb-4">
          <view class="flex items-center gap-1 text-xs text-gray-500">
            <text>📍</text>
            <text class="truncate w-40">某某精密制造厂第一车间</text>
          </view>
          <text class="text-[#10b981] text-xs">重新定位</text>
        </view>

        <wd-input v-model="moodText" placeholder="记录此刻心情，触发今日盲盒..." border custom-class="bg-gray-50 text-sm w-full" />
      </view>


      <view v-else-if="currentDayData.status === 'signed'" class="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 animate-fade-in">
        <view class="flex justify-between items-center mb-4 pb-3 border-b border-gray-50">
          <view class="flex items-center gap-2">
            <view class="w-2 h-4 bg-[#10b981] rounded-sm"></view>
            <text class="text-base font-bold text-gray-800">签到成功</text>
          </view>
          <text class="text-sm font-bold text-gray-800">{{ currentDayData.signTime }}</text>
        </view>
        
        <view class="flex flex-col gap-3">
          <view class="flex items-start gap-2 text-sm text-gray-600">
            <text>📍</text>
            <text>{{ currentDayData.location }}</text>
          </view>
          <view v-if="currentDayData.mood" class="bg-green-50 rounded-lg p-3 text-sm text-green-800 border border-green-100">
            "{{ currentDayData.mood }}"
          </view>
          <view v-if="currentDayData.blindBox" class="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <text>🎁 盲盒签语：</text>
            <text class="font-bold text-gray-700">{{ currentDayData.blindBox }}</text>
          </view>
        </view>
      </view>


      <view v-else-if="currentDayData.status === 'missed'" class="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 flex items-center gap-3 animate-fade-in opacity-80">
        <view class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-400 text-lg">!</view>
        <view>
          <text class="block text-sm font-bold text-gray-800">当日未签到</text>
          <text class="block text-xs text-gray-400">没有留下当天的记录哦</text>
        </view>
      </view>


      <view v-else class="text-center py-10 animate-fade-in">
        <text class="text-xs text-gray-400">还没到这一天哦，耐心等待吧~</text>
      </view>

    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const moodText = ref('')

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

// 模拟签到动作
const handleSignIn = () => {
  uni.showLoading({ title: '签到中...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ title: '签到成功！', icon: 'success' })
    // 更新本地状态
    const today = calendarDays.value.find(d => d.isToday)
    if (today) {
      today.status = 'signed'
      today.signTime = '08:15'
      today.location = '某某精密制造厂第一车间'
      today.mood = moodText.value || '开启元气满满的一天！'
      today.blindBox = '签到成就 +1，获得神秘碎片。'
    }
  }, 600)
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(3px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>