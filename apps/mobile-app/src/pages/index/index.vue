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

// --- 预设的心情碎碎念语料库 ---
const moodQuotes = [
  '今天也是努力搬砖的一天 🧱',
  '天气不错，心情也跟着放晴了 ☀️',
  '又是元气满满的开工日 🚀',
  '摸鱼是不可能摸鱼的，这辈子都不可能 🐟',
  '咖啡续命，开始战斗 ☕️',
  '今天的目标：早点下班回家！🏠',
  '实习生活，苦中带甜 🍬',
  '学习新技能，成就感+1 🌟',
  '又是被大佬带飞的一天 ✈️',
  '只要我敲键盘够快，烦恼就追不上我。',
  '今天也是为老板换新车努力的一天！',
  '打工不仅能致富，还能交到好朋友（假的）。',
  '咖啡哪有上班苦。',
  '我爱工作，工作使我快乐（试图催眠）。',
  '实习的意义在于，提前感受社会的毒打。',
  '不干活，就没饭吃，加油打工人！',
]

const { showNotify } = useNotify()
const weekHeaders = ['日', '一', '二', '三', '四', '五', '六']

interface AttendanceRecord {
  status: 'UNSIGNED' | 'WORK' | 'REST' | 'LEAVE'
  quote?: string
  isSaved?: boolean
  workHours?: string
}

// --- 基础状态 ---
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const selectedDate = ref(new Date().toISOString().split('T')[0])
const attendanceRecords = ref<Record<string, AttendanceRecord>>({})

// --- 交互状态 ---
const moodInput = ref('')
const enableWorkHours = ref(true)
const showHoursPicker = ref(false)
const currentHours = ref<string[]>(['8.0'])
const hoursColumns = ref<Array<{ label: string, value: string }>>(
  // 8.0, 8.5, 9.0, ...；从 4.0 开始，12.0 结束
  Array.from({ length: 24 }, (_, i) => ((i + 1) * 0.5)).filter(item => item >= 0.5 && item <= 12).map(item => ({
    label: item.toFixed(1),
    value: item.toFixed(1),
  })),
)

// --- 新增：当月打卡统计逻辑 ---
const monthlyStats = computed(() => {
  const stats = { work: 0, rest: 0, leave: 0 }
  const monthPrefix = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}`

  Object.keys(attendanceRecords.value).forEach((date) => {
    if (date.startsWith(monthPrefix)) {
      const record = attendanceRecords.value[date]
      if (record.status === 'WORK')
        stats.work++
      if (record.status === 'REST')
        stats.rest++
      if (record.status === 'LEAVE')
        stats.leave++
    }
  })
  return stats
})

// --- 日历生成逻辑 ---
const calendarWeeks = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()

  const weeks = []
  let currentWeek = []

  for (let i = 0; i < firstDay; i++) {
    currentWeek.push({ day: null })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    currentWeek.push({
      day: d,
      date: dateString,
      record: attendanceRecords.value[dateString] || { status: 'UNSIGNED' },
    })
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ day: null })
    }
    weeks.push(currentWeek)
  }
  return weeks
})

// 计算当前选中日期所在的周索引 (0-5)，用于在这一周下方插入打卡卡片
const selectedWeekIndex = computed(() => {
  return calendarWeeks.value.findIndex(week =>
    week.some(day => day?.date === selectedDate.value),
  )
})

const currentRecord = computed(() => {
  return attendanceRecords.value[selectedDate.value] || { status: 'UNSIGNED' }
})

// --- 动作方法 ---
function changeMonth(step: number) {
  let newMonth = currentMonth.value + step
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
}

function selectDay(date: string) {
  selectedDate.value = date
  const record = attendanceRecords.value[date]

  if (record && record.isSaved) {
    // 1. 如果已有记录，带入已有数据
    moodInput.value = record.quote || ''
    if (record.workHours) {
      enableWorkHours.value = true
      currentHours.value = [record.workHours]
    }
    else {
      enableWorkHours.value = false
    }
  }
  else {
    // 2. 如果是新记录，默认填充随机碎碎念
    moodInput.value = getRandomQuote()
    enableWorkHours.value = false
    currentHours.value = ['8.0']
  }
}

function refreshQuote() {
  moodInput.value = getRandomQuote()
}

function handleCheckIn(type: 'WORK' | 'REST' | 'LEAVE') {
  if (type === 'WORK' && enableWorkHours.value) {
    showHoursPicker.value = true
    return
  }
  saveRecord(type)
}

function onConfirmHours({ value }: { value: string[] }) {
  currentHours.value = value
  showHoursPicker.value = false
  saveRecord('WORK', value[0])
}

function getRandomQuote() {
  return moodQuotes[Math.floor(Math.random() * moodQuotes.length)]
}

function resetRecord() {
  const record = attendanceRecords.value[selectedDate.value]
  if (record) {
    moodInput.value = record.quote || ''
    if (record.workHours) {
      enableWorkHours.value = true
      currentHours.value = [record.workHours]
    }
    // 设为未签到态，进入编辑视图
    record.status = 'UNSIGNED'
  }
}

function saveRecord(type: 'WORK' | 'REST' | 'LEAVE', hours?: string) {
  attendanceRecords.value[selectedDate.value] = {
    status: type,
    isSaved: true,
    workHours: hours,
    quote: moodInput.value,
  }

  // 触发特效
  playCheckInAnimation(type)

  // 3. 增加基于时间彩蛋的 Notify 文案
  const hour = new Date().getHours()
  let customMsg = ''

  if (type === 'WORK') {
    if (hour < 8)
      customMsg = '🌅 哇塞，传说中的早起鸟就是你！元气满满！'
    else if (hour > 20)
      customMsg = '🌃 这么晚还在卷？辛苦啦，记得早点休息！'
    else customMsg = '🎉 签到成功！新的一天也要继续发光发热鸭～'
  }

  const feedback = {
    WORK: { type: 'success', msg: customMsg },
    REST: { type: 'primary', msg: '☕️ 滴！休息卡！今天你是自己的老大～' },
    LEAVE: { type: 'warning', msg: '🌿 不论去哪，照顾好自己最重要哦～' },
  }

  const fb = feedback[type]
  showNotify({ type: fb.type as any, message: fb.msg, duration: 3500 })

  moodInput.value = ''
}

// --- 动画粒子状态 ---
const particles = ref<Array<{ id: number, icon: string, x: number, y: number, delay: number, scale: number }>>([])
let particleId = 0

// 播放打卡特效 (震动 + 喷射动画)
function playCheckInAnimation(type: 'WORK' | 'REST' | 'LEAVE') {
  // 1. 触发手机物理短震动 (极其提升手感)
  uni.vibrateShort({ success: () => console.log('vibrate success') })

  // 2. 定义不同状态专属的喷射元素池
  const iconPool = {
    WORK: ['💼', '💪', '🔥', '✨', '💰', '🚀'],
    REST: ['☕️', '🎮', '🛋️', '✨', '💤', '🎧'],
    LEAVE: ['🌿', '✈️', '🏝️', '✨', '❤️', '🌈'],
  }
  const currentIcons = iconPool[type]

  // 生成 15 个随机粒子
  for (let i = 0; i < 15; i++) {
    const id = particleId++

    // 随机扩散范围 (X轴扩散，Y轴主要向上喷射)
    const x = (Math.random() - 0.5) * 280
    const y = (Math.random() - 0.5) * 200 - 150
    const delay = Math.random() * 0.15 // 错落有致的延迟
    const scale = 0.6 + Math.random() * 0.8 // 随机大小
    const icon = currentIcons[Math.floor(Math.random() * currentIcons.length)]

    particles.value.push({ id, icon, x, y, delay, scale })

    // 动画时长约 1.2s，结束后自动销毁 DOM 释放内存
    setTimeout(() => {
      particles.value = particles.value.filter(p => p.id !== id)
    }, 1500)
  }
}

onMounted(() => {
  // 模拟初始化数据，比如本月 1-6 号的数据
  const prefix = `${currentYear.value}-0${currentMonth.value}`
  attendanceRecords.value = {
    [`${prefix}-01`]: { status: 'WORK', quote: '今天也是元气满满的一天！', isSaved: true },
    [`${prefix}-02`]: { status: 'WORK', quote: '需求好多，写不完根本写不完...', isSaved: true },
    [`${prefix}-03`]: { status: 'REST' }, // 休息，未填写心情
    [`${prefix}-04`]: { status: 'LEAVE' }, // 请假，未填写心情
    [`${prefix}-05`]: { status: 'WORK', quote: '今天也是元气满满的一天！', isSaved: true },
    [`${prefix}-06`]: { status: 'LEAVE', quote: '需求好多，写不完根本写不完...' },
    [`${prefix}-08`]: { status: 'WORK', quote: '今天也是元气满满的一天！', isSaved: true },
    [`${prefix}-09`]: { status: 'WORK', quote: '今天也是元气满满的一天！', isSaved: true },
  }
})
</script>

<template>
  <view class="from-[#f0f7ff] to-[#f8f9fa] bg-gradient-to-b px-4 pb-10">
    <wd-navbar title="实习圈" placeholder safe-area-inset-top fixed />

    <view class="mt-4 flex gap-3">
      <view class="flex flex-1 flex-col items-center border border-blue-50 rounded-2xl bg-white py-3 shadow-sm">
        <text class="mb-1 text-[12px] text-blue-500/60 font-bold">
          本月上班
        </text>
        <view class="flex items-baseline">
          <text class="text-2xl text-blue-500 font-black leading-none">
            {{ monthlyStats.work }}
          </text>
          <text class="ml-1 text-[10px] text-blue-500/40">
            天
          </text>
        </view>
      </view>

      <view class="flex flex-1 flex-col items-center border border-green-50 rounded-2xl bg-white py-3 shadow-sm">
        <text class="mb-1 text-[12px] text-green-500/60 font-bold">
          本月休息
        </text>
        <view class="flex items-baseline">
          <text class="text-2xl text-green-500 font-black leading-none">
            {{ monthlyStats.rest }}
          </text>
          <text class="ml-1 text-[10px] text-green-500/40">
            天
          </text>
        </view>
      </view>

      <view class="flex flex-1 flex-col items-center border border-orange-50 rounded-2xl bg-white py-3 shadow-sm">
        <text class="mb-1 text-[12px] text-orange-500/60 font-bold">
          本月请假
        </text>
        <view class="flex items-baseline">
          <text class="text-2xl text-orange-500 font-black leading-none">
            {{ monthlyStats.leave }}
          </text>
          <text class="ml-1 text-[10px] text-orange-500/40">
            天
          </text>
        </view>
      </view>
    </view>

    <view class="mt-3 rounded-2xl bg-white p-4 shadow-sm">
      <view class="mb-5 flex items-center justify-between px-2 pt-2">
        <text class="text-xl text-gray-800 font-black tracking-tight">
          {{ currentYear }}年{{ currentMonth }}月
        </text>
        <view class="flex gap-3">
          <view class="rounded-xl bg-gray-50 p-2 transition-colors active:bg-gray-100" @click="changeMonth(-1)">
            <wd-icon name="arrow-left" size="18px" color="#666" />
          </view>
          <view class="rounded-xl bg-gray-50 p-2 transition-colors active:bg-gray-100" @click="changeMonth(1)">
            <wd-icon name="arrow-right" size="18px" color="#666" />
          </view>
        </view>
      </view>

      <view class="mb-4 flex">
        <view
          v-for="item in weekHeaders" :key="item"
          class="flex-1 text-center text-[10px] text-gray-400 font-bold tracking-widest uppercase"
        >
          {{ item }}
        </view>
      </view>

      <template v-for="(week, wIndex) in calendarWeeks" :key="wIndex">
        <view class="mb-1 flex">
          <view
            v-for="(dayObj, dIndex) in week" :key="dIndex" class="relative flex flex-1 flex-col items-center py-2"
            @click="dayObj.day && selectDay(dayObj.date!)"
          >
            <view
              v-if="dayObj.day"
              class="h-10 w-10 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-200"
              :class="[
                selectedDate === dayObj.date ? 'bg-[#4D80F0] text-white shadow-md shadow-blue-200 scale-105' : 'text-gray-700 active:bg-gray-50',
                dayObj.date === new Date().toISOString().split('T')[0] && selectedDate !== dayObj.date ? 'text-blue-500 font-bold' : '',
              ]"
            >
              {{ dayObj.day === new Date().getDate() ? '今' : dayObj.day }}
            </view>
            <view
              v-if="dayObj.day && dayObj.record.status !== 'UNSIGNED'" class="mt-1 h-1 w-1 rounded-full"
              :class="[dayObj.record.status === 'WORK' ? 'bg-blue-500' : dayObj.record.status === 'REST' ? 'bg-green-500' : 'bg-orange-400']"
            />
          </view>
        </view>

        <view v-if="wIndex === selectedWeekIndex" class="mx-1 overflow-hidden transition-all duration-300">
          <view class="border border-blue-50/50 rounded-2xl bg-gray-50/80 p-4">
            <template v-if="currentRecord.status === 'UNSIGNED'">
              <view class="relative mb-3">
                <wd-textarea
                  v-model="moodInput" no-border placeholder="此刻的心情..." :maxlength="100"
                  custom-class="bg-gray-100 rounded-lg border-0 text-sm indent-6" prefix-icon="refresh" auto-height
                />
                <view
                  class="absolute left-2 top-[22px] z-10 p-1 transition-transform duration-300 -translate-y-1/2 active:rotate-180"
                  @click="refreshQuote"
                >
                  <wd-icon name="refresh" size="18px" color="#4D80F0" />
                </view>
              </view>
              <view class="mb-4 flex items-center justify-between px-1">
                <view class="flex items-center">
                  <wd-switch v-model="enableWorkHours" size="16px" active-color="#4D80F0" />
                  <text class="ml-2 text-xs text-gray-500">
                    记录工时
                  </text>
                </view>
                <text v-if="enableWorkHours" class="text-[10px] text-blue-400 font-medium">
                  默认 8.0h
                </text>
              </view>
              <view class="flex gap-2">
                <wd-button
                  type="primary" block class="flex-1 shadow-blue-100 shadow-sm !h-10 !rounded-xl !text-xs"
                  @click="handleCheckIn('WORK')"
                >
                  💼 上班
                </wd-button>
                <wd-button
                  type="success" block class="flex-1 !h-10 !rounded-xl !text-xs"
                  @click="handleCheckIn('REST')"
                >
                  ☕️ 休息
                </wd-button>
                <wd-button
                  type="warning" block class="flex-1 !h-10 !rounded-xl !text-xs"
                  @click="handleCheckIn('LEAVE')"
                >
                  🌿 请假
                </wd-button>
              </view>
            </template>

            <template v-else>
              <view
                class="relative flex flex-col items-center border border-blue-50/50 rounded-xl bg-white py-4 shadow-sm"
              >
                <view class="absolute right-3 top-2 p-1 transition-opacity active:opacity-50" @click="resetRecord">
                  <wd-icon name="edit" size="14px" color="#ccc" />
                </view>

                <view class="mb-1 text-4xl">
                  {{ currentRecord.status === 'WORK' ? '💼' : currentRecord.status === 'REST' ? '☕️' : '🌿' }}
                </view>

                <text class="text-sm text-gray-700 font-bold">
                  {{ currentRecord.status === 'WORK' ? '已上班' : currentRecord.status === 'REST' ? '休息中' : '已请假' }}
                </text>

                <text v-if="currentRecord.quote" class="mt-1 px-4 text-center text-xs text-gray-400 italic">
                  “ {{ currentRecord.quote }} ”
                </text>

                <view
                  v-if="currentRecord.status === 'WORK' && currentRecord.workHours"
                  class="mt-3 flex items-center rounded-full bg-blue-50/50 px-3 py-1"
                >
                  <text class="text-[10px] text-gray-500">
                    工时：{{ currentRecord.workHours }}h
                  </text>
                </view>
              </view>
            </template>
          </view>
        </view>
      </template>

      <view class="mt-4 flex justify-center gap-4 border-t border-gray-50">
        <view class="flex items-center">
          <view class="mr-1 h-1.5 w-1.5 rounded-full bg-blue-500" /><text class="text-[10px] text-gray-400">
            上班
          </text>
        </view>
        <view class="flex items-center">
          <view class="mr-1 h-1.5 w-1.5 rounded-full bg-green-500" /><text class="text-[10px] text-gray-400">
            休息
          </text>
        </view>
        <view class="flex items-center">
          <view class="mr-1 h-1.5 w-1.5 rounded-full bg-orange-400" /><text class="text-[10px] text-gray-400">
            请假
          </text>
        </view>
      </view>
    </view>

    <wd-picker
      v-model:visible="showHoursPicker" v-model="currentHours" :columns="hoursColumns" title="选择工时"
      confirm-button-text="提交" @confirm="onConfirmHours"
    />

    <wd-notify id="wd-notify" />

    <view class="particle-container">
      <view
        v-for="p in particles" :key="p.id" class="particle" :style="{
          '--x': `${p.x}px`,
          '--y': `${p.y}px`,
          '--delay': `${p.delay}s`,
          '--scale': p.scale,
        }"
      >
        {{ p.icon }}
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
/* 深度穿透修改 Wot Design 按钮与输入框，增强 UI 活泼感 */
:deep(.wd-button) {
  border: none !important;
  font-weight: 700 !important;
}

:deep(.wd-input__prefix) {
  margin-right: 4px !important;
}

// 心情输入框高度调整
:deep(.wd-textarea__inner) {
  // height: 60px !important;
}

/* --- 爆点粒子特效 --- */
.particle-container {
  position: fixed;
  top: 60%; /* 从屏幕中下方喷射 */
  left: 50%;
  pointer-events: none; /* 不阻挡用户点击 */
  z-index: 9999;
}

.particle {
  position: absolute;
  font-size: 36px;
  opacity: 0;
  transform: translate(-50%, -50%) scale(0);
  /* 使用贝塞尔曲线模拟重力：先快猛喷射，然后减速上浮 */
  animation: explode 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  animation-delay: var(--delay);
}

@keyframes explode {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  15% {
    opacity: 1;
    /* 喷射到顶点 */
    transform: translate(calc(-50% + var(--x) * 0.8), calc(-50% + var(--y))) scale(var(--scale));
  }
  100% {
    opacity: 0;
    /* 缓慢向两侧飘落并淡出 */
    transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y) - 60px)) scale(calc(var(--scale) * 0.9));
  }
}
</style>
