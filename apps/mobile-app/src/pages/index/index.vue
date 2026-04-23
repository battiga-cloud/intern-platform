<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

definePage({
  name: 'index',
  layout: 'tabbar',
  style: {
    navigationBarTitleText: '首页',
    navigationStyle: 'custom',
  },
})

// ================= 类型定义 =================
interface DayItem {
  date: number // 日期数字
  fullDate: string // YYYY-MM-DD
  isCurrentMonth: boolean // 是否是本月
  status: 'work' | 'rest' | 'leave' | null // 签到状态
}

// ================= 状态数据 =================
const currentDate = new Date()
const currentYear = ref(currentDate.getFullYear())
const currentMonthNum = ref(currentDate.getMonth()) // 0-11
const selectedDate = ref<string>('') // 当前选中的日期 YYYY-MM-DD
const attendanceRecord = ref<Record<string, 'work' | 'rest' | 'leave'>>({}) // 模拟后端的打卡记录字典

// ================= 计算属性 =================
const currentMonth = computed(() => {
  return `${currentYear.value}年${currentMonthNum.value + 1}月`
})

// 生成当前月份的日历网格数据
const calendarDays = computed(() => {
  const days: DayItem[] = []
  const year = currentYear.value
  const month = currentMonthNum.value

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  // 1. 填充上个月的尾部几天
  const startingDayOfWeek = firstDayOfMonth.getDay() // 0 是星期日
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i
    days.push({
      date: d,
      fullDate: formatDate(new Date(year, month - 1, d)),
      isCurrentMonth: false,
      status: null,
    })
  }

  // 2. 填充本月
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const fullDate = formatDate(new Date(year, month, i))
    days.push({
      date: i,
      fullDate,
      isCurrentMonth: true,
      status: attendanceRecord.value[fullDate] || null, // 匹配字典中的状态
    })
  }

  // 3. 填充下个月的开头几天，凑齐 42 个格子 (6行)
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: i,
      fullDate: formatDate(new Date(year, month + 1, i)),
      isCurrentMonth: false,
      status: null,
    })
  }

  return days
})

// 获取当前选中日期的对象数据
const selectedDateObj = computed(() => {
  if (!selectedDate.value)
    return null
  return calendarDays.value.find(d => d.fullDate === selectedDate.value)
})

// 格式化选中日期文本显示
const selectedDateText = computed(() => {
  if (!selectedDate.value)
    return ''
  const d = new Date(selectedDate.value)
  const today = new Date()
  if (isToday(selectedDate.value))
    return '今天'
  return `${d.getMonth() + 1}月${d.getDate()}日`
})

// ================= 方法 =================

// 格式化日期为 YYYY-MM-DD
function formatDate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 判断是否是今天
function isToday(dateString: string) {
  return dateString === formatDate(new Date())
}

// 点击日期块
function handleDateClick(item: DayItem) {
  if (!item.isCurrentMonth)
    return // 暂不支持跨月点击，可以自己扩展
  selectedDate.value = item.fullDate
}

// 更新状态 (模拟发送请求)
function updateStatus(status: 'work' | 'rest' | 'leave' | null) {
  if (!selectedDate.value)
    return

  // TODO: 这里替换为调用后端的 API，例如 `checkInApi({ date: selectedDate.value, type: status })`
  uni.showLoading({ title: '记录中...' })

  setTimeout(() => {
    // 模拟接口成功返回，更新本地字典
    if (status) {
      attendanceRecord.value[selectedDate.value] = status
    }
    else {
      delete attendanceRecord.value[selectedDate.value] // 撤销记录
    }

    uni.hideLoading()
    uni.showToast({ title: '已保存', icon: 'success' })
  }, 500)
}

// ================= 生命周期 =================
onMounted(() => {
  // 页面加载时默认选中今天
  selectedDate.value = formatDate(new Date())

  // 模拟从后端拉取本月的已有记录
  // TODO: 替换为实际的 API 请求获取当月打卡数据
  attendanceRecord.value = {
    '2026-04-20': 'work',
    '2026-04-21': 'work',
    '2026-04-22': 'leave',
  }
})
</script>

<template>
  <view class="min-h-screen bg-gray-50 pb-20">
    <wd-navbar title="首页" placeholder safeareainsettop fixed />

    <view class="from-blue-500 to-indigo-500 bg-gradient-to-r p-6 pt-12 text-white">
      <view class="mb-2 text-2xl font-bold">
        {{ currentMonth }} 实习记录
      </view>
      <view class="text-sm opacity-80">
        轻松记录，享受实习
      </view>
    </view>

    <view class="relative z-10 mx-4 mt-[-20px] rounded-xl bg-white p-4 shadow-sm">
      <view class="mb-4 flex justify-between text-sm text-gray-500">
        <text
          v-for="day in ['日', '一', '二', '三', '四', '五', '六']"
          :key="day"
          class="flex-1 text-center"
        >
          {{ day }}
        </text>
      </view>

      <view class="flex flex-wrap">
        <view
          v-for="(dateItem, index) in calendarDays"
          :key="index"
          class="relative mb-2 h-12 w-[14.28%] flex flex-col items-center justify-center"
          @click="handleDateClick(dateItem)"
        >
          <text
            class="text-base"
            :class="{
              'text-gray-300': !dateItem.isCurrentMonth,
              'text-gray-800': dateItem.isCurrentMonth,
              'font-bold text-blue-500': isToday(dateItem.fullDate),
              'bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center':
                selectedDate === dateItem.fullDate,
            }"
          >
            {{ dateItem.date }}
          </text>

          <view
            v-if="dateItem.status && dateItem.isCurrentMonth"
            class="absolute bottom-1 h-1.5 w-1.5 rounded-full"
            :class="{
              'bg-green-500': dateItem.status === 'work',
              'bg-gray-400': dateItem.status === 'rest',
              'bg-orange-500': dateItem.status === 'leave',
            }"
          />
        </view>
      </view>
    </view>

    <view
      v-if="selectedDateObj"
      class="mx-4 mt-6 animate-fade-in rounded-xl bg-white p-5 shadow-sm"
    >
      <view class="mb-4 flex items-center justify-between">
        <text class="text-lg text-gray-800 font-bold">
          {{ selectedDateText }}
        </text>
        <text class="text-sm text-gray-500">
          实习记录
        </text>
      </view>

      <view class="mb-6 flex justify-around">
        <view
          class="w-[30%] flex flex-col items-center border-2 rounded-lg p-3 transition-all"
          :class="
            selectedDateObj.status === 'work'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-100 bg-gray-50'
          "
          @click="updateStatus('work')"
        >
          <wd-icon
            name="check-circle-o"
            size="24"
            :color="selectedDateObj.status === 'work' ? '#10B981' : '#9CA3AF'"
          />
          <text
            class="mt-2 text-sm"
            :class="
              selectedDateObj.status === 'work'
                ? 'text-green-600 font-bold'
                : 'text-gray-500'
            "
          >
            上班
          </text>
        </view>

        <view
          class="w-[30%] flex flex-col items-center border-2 rounded-lg p-3 transition-all"
          :class="
            selectedDateObj.status === 'rest'
              ? 'border-gray-500 bg-gray-100'
              : 'border-gray-100 bg-gray-50'
          "
          @click="updateStatus('rest')"
        >
          <wd-icon
            name="coffee-o"
            size="24"
            :color="selectedDateObj.status === 'rest' ? '#6B7280' : '#9CA3AF'"
          />
          <text
            class="mt-2 text-sm"
            :class="
              selectedDateObj.status === 'rest'
                ? 'text-gray-700 font-bold'
                : 'text-gray-500'
            "
          >
            休息
          </text>
        </view>

        <view
          class="w-[30%] flex flex-col items-center border-2 rounded-lg p-3 transition-all"
          :class="
            selectedDateObj.status === 'leave'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-100 bg-gray-50'
          "
          @click="updateStatus('leave')"
        >
          <wd-icon
            name="warn-o"
            size="24"
            :color="selectedDateObj.status === 'leave' ? '#F97316' : '#9CA3AF'"
          />
          <text
            class="mt-2 text-sm"
            :class="
              selectedDateObj.status === 'leave'
                ? 'text-orange-600 font-bold'
                : 'text-gray-500'
            "
          >
            请假
          </text>
        </view>
      </view>

      <view v-if="selectedDateObj.status" class="text-center">
        <text class="text-sm text-blue-500" @click="updateStatus(null)">
          撤销今日记录
        </text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
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
</style>
