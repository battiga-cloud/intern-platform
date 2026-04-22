<template>
  <view class="bg-white font-sans relative">
    <view
      class="sticky top-0 px-30rpx py-20rpx z-10 bg-white border-b border-gray-100 flex justify-between items-center"
    >
      <text class="font-bold text-lg text-gray-800">实习圈</text>
      <view class="flex bg-gray-100 p-1 rounded">
        <text class="text-xs px-3 py-1 bg-white rounded shadow-sm text-gray-800"
          >全平台</text
        >
        <text class="text-xs px-3 py-1 text-gray-500">本校</text>
      </view>
    </view>

    <view class="px-4 py-2">
      <view
        v-for="post in posts"
        :key="post.id"
        class="py-5 border-b border-gray-50 flex gap-3"
      >
        <view
          class="w-10 h-10 rounded-full bg-gray-200 shrink-0 border border-gray-300 flex items-center justify-center"
        >
          <text class="text-gray-500 text-xs">{{ post.name.charAt(0) }}</text>
        </view>

        <view class="flex-1">
          <view class="flex justify-between items-start mb-1">
            <view>
              <text class="block text-sm font-bold text-gray-800">{{ post.name }}</text>
              <text class="block text-xs text-gray-400">{{ post.time }}</text>
            </view>
          </view>

          <view class="bg-gray-50 rounded p-2 mb-2 inline-block">
            <text class="text-xs text-gray-500 font-mono"
              >📍 {{ post.company }} | {{ post.location }}</text
            >
          </view>

          <text
            v-if="post.mood"
            class="block text-sm text-gray-700 leading-relaxed mb-3"
            >{{ post.mood }}</text
          >
          <view
            v-if="post.image"
            class="w-3/4 h-32 bg-gray-100 rounded border border-gray-200 mb-3 flex items-center justify-center"
          >
            <text class="text-gray-400 text-xs">📷 现场照片占位</text>
          </view>

          <view v-if="post.sign" class="border-l-2 border-blue-400 pl-2 mb-3">
            <text class="text-xs text-gray-500 italic">"{{ post.sign }}"</text>
          </view>

          <view
            class="flex justify-end items-center gap-1 text-gray-400"
            @click="toggleLike(post)"
          >
            <text class="text-sm" :class="post.isLiked ? 'text-red-500' : ''">♥</text>
            <text class="text-xs">{{ post.likes }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="py-6 text-center">
      <text class="text-xs text-gray-300">- 已经到底啦 -</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";

const posts = ref([
  {
    id: 1,
    name: "张同学",
    time: "10分钟前",
    company: "某某精密制造厂",
    location: "第一车间打卡点",
    mood: "今天学会了机床的基本操作，带我的师傅人挺好的。",
    image: true,
    sign: "遇到难题先思考再问师傅，职场经验值 +1！",
    likes: 12,
    isLiked: false,
  },
  {
    id: 2,
    name: "匿名实习生",
    time: "45分钟前",
    company: "某某电子科技",
    location: "员工宿舍楼下",
    mood: "早起打卡，希望今天的饭菜能好吃点。",
    image: false,
    sign: "每一个熟练的技工，都曾像你现在一样认真记录。",
    likes: 5,
    isLiked: true,
  },
  {
    id: 3,
    name: "王同学",
    time: "2小时前",
    company: "某某软件科技",
    location: "员工宿舍楼下",
    mood: "今天学习了新的前端框架，很有趣。",
    image: false,
    sign: "每一个熟练的前端开发，都曾像你现在一样认真记录。",
    likes: 3,
    isLiked: false,
  },
]);

const toggleLike = (post: any) => {
  if (post.isLiked) {
    post.likes--;
    post.isLiked = false;
  } else {
    post.likes++;
    post.isLiked = true;
  }
};
</script>
