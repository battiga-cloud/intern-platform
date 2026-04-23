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

// 记录打卡详细信息的字典 (Key: YYYY-MM-DD)
interface AttendanceRecord {
  status: 'UNSIGNED' | 'WORK' | 'REST' | 'LEAVE'
  quote?: string
  isSaved?: boolean
}

// 基础状态
const weekHeaders = ['日', '一', '二', '三', '四', '五', '六']
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)

// 交互状态
const selectedDate = ref('') // e.g., '2026-04-15'
const activeWeekIndex = ref(-1)

// 模拟后端拉取的打卡记录字典 (Key: YYYY-MM-DD, Value: 状态)
const attendanceRecords = ref<Record<string, AttendanceRecord>>({})

// 生成日历二维数组核心逻辑
const calendarWeeks = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value

  // 获取当月第一天是星期几 (0-6)
  const firstDay = new Date(year, month - 1, 1).getDay()
  // 获取当月总天数
  const daysInMonth = new Date(year, month, 0).getDate()

  const weeks = []
  let currentWeek = []

  // 填充月初的空白天数
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push({ date: null })
  }

  // 填充当月真实日期
  const todayStr = new Date().toISOString().split('T')[0]
  for (let i = 1; i <= daysInMonth; i++) {
    // 补齐两位数
    const monthStr = month < 10 ? `0${month}` : month
    const dayStr = i < 10 ? `0${i}` : i
    const fullDate = `${year}-${monthStr}-${dayStr}`

    currentWeek.push({
      date: i,
      fullDate,
      isToday: fullDate === todayStr,
      status: attendanceRecords.value[fullDate] || 'UNSIGNED',
    })

    // 满 7 天换行
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  // 填充月末的空白天数
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: null })
    }
    weeks.push(currentWeek)
  }

  return weeks
})

// 计算当前选中日期的状态，供操作面板使用
const selectedDayRecord = computed(() => {
  if (!selectedDate.value)
    return { status: 'UNSIGNED' }

  // 从二维数组中反查当前状态 (保证双向绑定视图一致性)
  for (const week of calendarWeeks.value) {
    const day = week.find(d => d.fullDate === selectedDate.value)
    if (day)
      return day
  }
  return { status: 'UNSIGNED' }
})

const formatSelectedDateLabel = computed(() => {
  if (!selectedDate.value)
    return ''
  const [_, m, d] = selectedDate.value.split('-')
  return `${Number(m)}月${Number(d)}日 状态：`
})

// 切换月份
function changeMonth(delta: number) {
  let newMonth = currentMonth.value + delta
  let newYear = currentYear.value

  if (newMonth > 12) {
    newMonth = 1
    newYear++
  }
  else if (newMonth < 1) {
    newMonth = 12
    newYear--
  }

  currentYear.value = newYear
  currentMonth.value = newMonth
  // 切换月份时收起面板
  activeWeekIndex.value = -1
  selectedDate.value = ''
}

// 点击日期
function handleSelectDate(day: any, weekIndex: number) {
  if (!day.date)
    return // 点击空白处无效

  // 如果重复点击已选中的日期，则收起面板
  if (selectedDate.value === day.fullDate) {
    activeWeekIndex.value = -1
    selectedDate.value = ''
  }
  else {
    selectedDate.value = day.fullDate
    activeWeekIndex.value = weekIndex // 控制在该行下方展开
  }
};

// 更新状态 (在此处调用后端接口)
function updateStatus(status: 'WORK' | 'REST' | 'LEAVE') {
  if (!selectedDate.value)
    return

  // 乐观更新 UI 时，保留原有的 quote 状态，仅更新 status
  const currentRecord = attendanceRecords.value[selectedDate.value] || {}
  attendanceRecords.value[selectedDate.value] = {
    ...currentRecord,
    status,
  }

  uni.showToast({ title: '已更新', icon: 'none' })
};

// 样式辅助函数
function getStatusColorClass(status: string) {
  switch (status) {
    case 'WORK': return 'bg-[#10b981] text-white' // 活力绿 (emerald-500)
    case 'REST': return 'bg-[#f59e0b] text-white' // 阳光黄 (amber-500)
    case 'LEAVE': return 'bg-[#ef4444] text-white' // 醒目红 (red-500)
    default: return 'bg-gray-50 border-2 border-gray-100 text-gray-500' // 未签到 (更扁平)
  }
};

onMounted(() => {
  // 模拟初始化数据，比如本月 1-3 号的数据
  // const prefix = `${currentYear.value}-0${currentMonth.value}`
  attendanceRecords.value = {
    // [`${prefix}-01`]: { status: 'WORK', quote: '今天也是元气满满的一天！', isSaved: true },
    // [`${prefix}-02`]: { status: 'WORK', quote: '需求好多，写不完根本写不完...', isSaved: true },
    // [`${prefix}-03`]: { status: 'REST' }, // 休息，未填写心情
  }
})

// ==========================================
// 心情模块 (今日碎碎念) 状态与逻辑
// ==========================================

// 模拟从后端获取到的随机语录池 (实际开发中可通过接口拉取)
const randomQuotesPool = [
  '只要我敲键盘够快，烦恼就追不上我。',
  '今天也是为老板换新车努力的一天！',
  '打工不仅能致富，还能交到好朋友（假的）。',
  '咖啡哪有上班苦。',
  '我爱工作，工作使我快乐（试图催眠）。',
  '实习的意义在于，提前感受社会的毒打。',
  '不干活，就没饭吃，加油打工人！',
]

// 当前正在编辑的语录内容
const currentEditingQuote = ref('')

watch(
  () => selectedDayRecord.value,
  (newRecord) => {
    if (newRecord && newRecord.status !== 'UNSIGNED') {
      // 如果该日期已有保存的语录，直接展示
      if (newRecord.isSaved && newRecord.quote) {
        currentEditingQuote.value = newRecord.quote
      }
      else {
        // 如果未保存，自动生成一条随机语录填入输入框
        changeRandomQuote()
      }
    }
  },
  { deep: true, immediate: true },
)

/**
 * 随机更换一条语录
 */
function changeRandomQuote() {
  // 为了避免连续两次随机到同样的句子，加个小逻辑
  let newQuote = ''
  do {
    const randomIndex = Math.floor(Math.random() * randomQuotesPool.length)
    newQuote = randomQuotesPool[randomIndex]
  } while (newQuote === currentEditingQuote.value && randomQuotesPool.length > 1)

  currentEditingQuote.value = newQuote
};

/**
 * 点击“修改”按钮，使模块退回到编辑状态
 */
function editQuote() {
  if (!selectedDate.value)
    return
  // 乐观更新 UI：将 isSaved 置为 false
  attendanceRecords.value[selectedDate.value].isSaved = false
  // 注意：这里我们保留 currentEditingQuote.value 不变，让用户在原内容上修改
};

/**
 * 点击“记录此刻”保存心情
 */
async function saveQuote() {
  if (!selectedDate.value)
    return
  if (!currentEditingQuote.value.trim()) {
    uni.showToast({ title: '写点什么再记录吧~', icon: 'none' })
    return
  }

  // 1. 本地乐观更新 UI
  // 此时确保 attendanceRecords 中有该日期的对象，如果没有则创建一个基础对象
  if (!attendanceRecords.value[selectedDate.value]) {
    attendanceRecords.value[selectedDate.value] = { status: 'WORK' } // Fallback
  }

  // 更新该日期的数据
  attendanceRecords.value[selectedDate.value] = {
    ...attendanceRecords.value[selectedDate.value], // 保留 status
    quote: currentEditingQuote.value,
    isSaved: true,
  }

  // 2. 模拟调用后端接口 (替换为你的真实 API)
  try {
    uni.showLoading({ title: '保存中' })
    /* await submitAttendanceApi({
      date: selectedDate.value,
      status: attendanceRecords.value[selectedDate.value].status,
      quote: currentEditingQuote.value,
      isQuoteSaved: true
    });
    */

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    uni.hideLoading()
    uni.showToast({ title: '记录成功', icon: 'success' })
  }
  catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '保存失败，请重试', icon: 'none' })
    // 如果失败，应该回退 isSaved 状态，这里略过复杂错误处理
  }
};
</script>

<template>
  <view class="bg-gray-50 pb-10">
    <wd-navbar title="实习圈" placeholder safe-area-inset-top fixed />

    <view class="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-sm">
      <view class="mb-6 flex items-center justify-between px-2">
        <view class="flex items-center">
          <wd-icon name="calendar" size="20" color="#4D80F0" class="mr-2" />
          <text class="text-lg text-gray-800 font-bold">
            {{ currentYear }}年{{ currentMonth }}月
          </text>
        </view>
        <view class="flex gap-6">
          <wd-icon name="arrow-left" size="18" color="#666" @click="changeMonth(-1)" />
          <wd-icon name="arrow-right" size="18" color="#666" @click="changeMonth(1)" />
        </view>
      </view>

      <view class="grid grid-cols-7 mb-4 text-center">
        <text v-for="day in weekHeaders" :key="day" class="text-xs text-gray-400 font-medium">
          {{ day }}
        </text>
      </view>

      <view class="relative">
        <block v-for="(week, weekIndex) in calendarWeeks" :key="weekIndex">
          <view class="grid grid-cols-7 mb-2 gap-y-4">
            <view
              v-for="(day, dayIndex) in week" :key="dayIndex"
              class="relative h-10 flex flex-col items-center justify-center" @click="handleSelectDate(day, weekIndex)"
            >
              <template v-if="day.date">
                <view
                  class="h-8 w-8 flex items-center justify-center rounded-full transition-all duration-200" :class="[
                    getStatusColorClass(day.status),
                    selectedDate === day.fullDate ? 'ring-4 ring-blue-100 scale-105' : '', // 修改这里
                  ]"
                >
                  <text class="text-sm font-medium" :class="day.status === 'UNSIGNED' ? 'text-gray-600' : 'text-white'">
                    {{ day.date }}
                  </text>
                </view>
                <view v-if="day.isToday" class="absolute bottom-[-6px] h-1 w-1 rounded-full bg-blue-500" />
              </template>
            </view>
          </view>

          <view
            v-if="activeWeekIndex === weekIndex"
            class="mx-1 mb-4 animate-fade-in rounded-xl bg-gray-50 p-4 shadow-inner transition-all"
          >
            <view class="flex items-center justify-between">
              <text class="text-sm text-gray-500">
                {{ formatSelectedDateLabel }}
              </text>
              <view class="flex gap-3">
                <wd-tag
                  :plain="selectedDayRecord.status !== 'WORK'"
                  :type="selectedDayRecord.status === 'WORK' ? 'success' : 'default'" round
                  @click="updateStatus('WORK')"
                >
                  上班
                </wd-tag>
                <wd-tag
                  :plain="selectedDayRecord.status !== 'REST'"
                  :color="selectedDayRecord.status === 'REST' ? '#f59e0b' : ''" round @click="updateStatus('REST')"
                >
                  休息
                </wd-tag>
                <wd-tag
                  :plain="selectedDayRecord.status !== 'LEAVE'"
                  :type="selectedDayRecord.status === 'LEAVE' ? 'danger' : 'default'" round
                  @click="updateStatus('LEAVE')"
                >
                  请假
                </wd-tag>
              </view>
            </view>
            <view
              v-if="activeWeekIndex === weekIndex && selectedDayRecord.status !== 'UNSIGNED'"
              class="mt-2 animate-fade-in border border-blue-50 rounded-xl bg-white p-4 shadow-sm transition-all"
            >
              <view v-if="selectedDayRecord.isSaved" class="relative rounded-lg bg-blue-50 p-3">
                <text class="absolute left-2 top-1 text-4xl text-blue-200 leading-none font-serif">
                  "
                </text>
                <text class="relative z-10 ml-4 mt-2 block text-sm text-gray-700">
                  {{ selectedDayRecord.quote }}
                </text>
                <view class="mt-2 flex justify-end">
                  <view class="flex items-center text-xs text-blue-500" @click="editQuote">
                    <wd-icon name="edit" size="14" class="mr-1" />修改
                  </view>
                </view>
              </view>

              <view v-else class="relative">
                <view class="mb-3 flex items-center justify-between">
                  <text class="text-xs text-gray-400">
                    今日碎碎念
                  </text>
                  <text class="flex items-center text-xs text-blue-500" @click="changeRandomQuote">
                    <wd-icon name="refresh" size="14" class="mr-1" />换一句
                  </text>
                </view>

                <wd-textarea
                  v-model="currentEditingQuote" placeholder="写下今天的实习心情..." :maxlength="100" show-word-limit
                  custom-class="bg-gray-100 rounded-lg border-0 p-2 text-sm mt-2"
                />

                <view class="mt-3 flex justify-end">
                  <wd-button size="small" type="primary" custom-class="rounded-full" @click="saveQuote">
                    记录此刻
                  </wd-button>
                </view>
              </view>
            </view>
          </view>
        </block>
      </view>

      <view class="mt-6 flex items-center justify-center gap-6 border-t border-gray-100 pt-4">
        <view class="flex items-center">
          <view class="mr-1.5 h-3 w-3 rounded-full bg-[#10b981]" />
          <text class="text-xs text-gray-500">
            上班
          </text>
        </view>
        <view class="flex items-center">
          <view class="mr-1.5 h-3 w-3 rounded-full bg-[#f59e0b]" />
          <text class="text-xs text-gray-500">
            休息
          </text>
        </view>
        <view class="flex items-center">
          <view class="mr-1.5 h-3 w-3 rounded-full bg-[#ef4444]" />
          <text class="text-xs text-gray-500">
            请假
          </text>
        </view>
        <view class="flex items-center">
          <view class="mr-1.5 h-3 w-3 border-2 border-gray-300 rounded-full bg-gray-100" />
          <text class="text-xs text-gray-500">
            未签到
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
page {
  --un-bg-opacity: 1;
  background-color: rgb(249 250 251 / var(--un-bg-opacity));
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
  transform-origin: top;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
    height: 0;
    padding-top: 0;
    padding-bottom: 0;
    margin-bottom: 0;
    overflow: hidden;
  }

  to {
    opacity: 1;
    transform: translateY(0);
    height: auto;
  }
}

// v-deep 选择器
:deep(.wd-textarea__inner) {
  height: 80px !important;
}
</style>
