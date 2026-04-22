<template>
  <view class="container">
    <view class="tabs">
      <text class="tab active">最新动态</text>
      <text class="tab">热门吐槽</text>
      <text class="tab">同城避雷</text>
    </view>

    <view class="post-card" v-for="post in posts" :key="post.id">
      <view class="user-info">
        <view class="avatar"></view>
        <view>
          <text class="username">{{ post.author }}</text>
          <text class="time">{{ post.time }}</text>
        </view>
      </view>
      <text class="content">{{ post.content }}</text>
      <view class="actions">
        <text>点赞 {{ post.likes }}</text>
        <text>评论 {{ post.comments }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const posts = ref([
  { id: 1, author: '迷茫的机电人', time: '10分钟前', content: '今天刚分配到车间，有没有同厂的兄弟交流一下？食堂饭菜还可以。', likes: 12, comments: 3 },
  { id: 2, author: '实习生小李', time: '1小时前', content: '#实习日记 今天学会了用游标卡尺，师傅人挺好的。', likes: 45, comments: 10 }
])
</script>

<style scoped>
.container { background: #f8f8f8; min-height: 100vh; }
.tabs { display: flex; background: #fff; padding: 20rpx; justify-content: space-around; margin-bottom: 20rpx; }
.tab.active { font-weight: bold; color: #007aff; border-bottom: 4rpx solid #007aff; padding-bottom: 10rpx; }
.post-card { background: #fff; padding: 30rpx; margin-bottom: 20rpx; }
.user-info { display: flex; align-items: center; margin-bottom: 20rpx; }
.avatar { width: 60rpx; height: 60rpx; background: #ccc; border-radius: 50%; margin-right: 20rpx; }
.username { font-size: 28rpx; font-weight: bold; display: block; }
.time { font-size: 22rpx; color: #999; }
.content { font-size: 28rpx; line-height: 1.5; margin-bottom: 20rpx; display: block; }
.actions { display: flex; justify-content: flex-end; gap: 30rpx; color: #666; font-size: 24rpx; }
</style>