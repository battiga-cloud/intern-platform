<script setup lang="ts">
import { ref } from 'vue'

definePage({
  name: 'square',
  layout: 'tabbar',
  style: {
    navigationBarTitleText: '广场',
  },
})

const posts = ref([
  {
    id: 1,
    name: '张同学',
    time: '10分钟前',
    company: '某某精密制造厂',
    location: '第一车间打卡点',
    mood: '今天学会了机床的基本操作，带我的师傅人挺好的。',
    image: true,
    sign: '遇到难题先思考再问师傅，职场经验值 +1！',
    likes: 12,
    isLiked: false,
  },
  {
    id: 2,
    name: '匿名实习生',
    time: '45分钟前',
    company: '某某电子科技',
    location: '员工宿舍楼下',
    mood: '早起打卡，希望今天的饭菜能好吃点。',
    image: false,
    sign: '每一个熟练的技工，都曾像你现在一样认真记录。',
    likes: 5,
    isLiked: true,
  },
  {
    id: 3,
    name: '王同学',
    time: '2小时前',
    company: '某某软件科技',
    location: '员工宿舍楼下',
    mood: '今天学习了新的前端框架，很有趣。',
    image: false,
    sign: '每一个熟练的前端开发，都曾像你现在一样认真记录。',
    likes: 3,
    isLiked: false,
  },
])

function toggleLike(post: any) {
  if (post.isLiked) {
    post.likes--
    post.isLiked = false
  }
  else {
    post.likes++
    post.isLiked = true
  }
}
</script>

<template>
  <view class="relative bg-white font-sans">
    <wd-navbar title="实习圈" placeholder safeareainsettop fixed />
    <view
      class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-30rpx py-20rpx"
    >
      <text class="text-lg text-gray-800 font-bold">
        实习圈
      </text>
      <view class="flex rounded bg-gray-100 p-1">
        <text class="rounded bg-white px-3 py-1 text-xs text-gray-800 shadow-sm">
          全平台
        </text>
        <text class="px-3 py-1 text-xs text-gray-500">
          本校
        </text>
      </view>
    </view>

    <view class="px-4 py-2">
      <view
        v-for="post in posts"
        :key="post.id"
        class="flex gap-3 border-b border-gray-50 py-5"
      >
        <view
          class="h-10 w-10 flex shrink-0 items-center justify-center border border-gray-300 rounded-full bg-gray-200"
        >
          <text class="text-xs text-gray-500">
            {{ post.name.charAt(0) }}
          </text>
        </view>

        <view class="flex-1">
          <view class="mb-1 flex items-start justify-between">
            <view>
              <text class="block text-sm text-gray-800 font-bold">
                {{ post.name }}
              </text>
              <text class="block text-xs text-gray-400">
                {{ post.time }}
              </text>
            </view>
          </view>

          <view class="mb-2 inline-block rounded bg-gray-50 p-2">
            <text class="text-xs text-gray-500 font-mono">
              📍 {{ post.company }} | {{ post.location }}
            </text>
          </view>

          <text
            v-if="post.mood"
            class="mb-3 block text-sm text-gray-700 leading-relaxed"
          >
            {{ post.mood }}
          </text>
          <view
            v-if="post.image"
            class="mb-3 h-32 w-3/4 flex items-center justify-center border border-gray-200 rounded bg-gray-100"
          >
            <text class="text-xs text-gray-400">
              📷 现场照片占位
            </text>
          </view>

          <view v-if="post.sign" class="mb-3 border-l-2 border-blue-400 pl-2">
            <text class="text-xs text-gray-500 italic">
              "{{ post.sign }}"
            </text>
          </view>

          <view
            class="flex items-center justify-end gap-1 text-gray-400"
            @click="toggleLike(post)"
          >
            <text class="text-sm" :class="post.isLiked ? 'text-red-500' : ''">
              ♥
            </text>
            <text class="text-xs">
              {{ post.likes }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <view class="py-6 text-center">
      <text class="text-xs text-gray-300">
        - 已经到底啦 -
      </text>
    </view>
  </view>
</template>
