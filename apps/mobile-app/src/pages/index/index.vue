<template>
  <view class="container">
    <view class="search-box">
      <text class="placeholder">搜索企业名称、岗位关键词</text>
    </view>

    <view class="nav-grid">
      <view class="nav-item" v-for="item in navList" :key="item.id">
        <view class="icon-circle"></view>
        <text>{{ item.name }}</text>
      </view>
    </view>

    <view class="section">
      <text class="section-title">平台严选推荐</text>
      <view class="job-card" v-for="job in recommendJobs" :key="job.id">
        <view class="job-header">
          <text class="job-title">{{ job.title }}</text>
          <text class="job-salary">{{ job.salary }}</text>
        </view>
        <view class="job-tags">
          <text class="tag">平台考察</text>
          <text class="tag">包食宿</text>
        </view>
        <text class="company-name">{{ job.company }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const navList = ref([
  { id: 1, name: '名企直推' },
  { id: 2, name: '技能培训' },
  { id: 3, name: '学历提升' },
  { id: 4, name: '附近工厂' }
])

const recommendJobs = ref([
  { id: 101, title: '电子厂装配实习生', salary: '4500-5500/月', company: '某某科技(深圳)有限公司' },
  { id: 102, title: '数控机床学徒', salary: '5000-7000/月', company: '某某精密制造厂' }
])
</script>

<style scoped>
.container { padding: 20rpx; background-color: #f8f8f8; min-height: 100vh; }
.search-box { background: #fff; padding: 20rpx; border-radius: 40rpx; text-align: center; color: #999; margin-bottom: 30rpx; }
.nav-grid { display: flex; justify-content: space-around; margin-bottom: 40rpx; }
.nav-item { display: flex; flex-direction: column; align-items: center; font-size: 24rpx; }
.icon-circle { width: 80rpx; height: 80rpx; background: #e0e0e0; border-radius: 50%; margin-bottom: 10rpx; }
.section-title { font-size: 32rpx; font-weight: bold; margin-bottom: 20rpx; display: block; }
.job-card { background: #fff; padding: 30rpx; border-radius: 16rpx; margin-bottom: 20rpx; }
.job-header { display: flex; justify-content: space-between; margin-bottom: 10rpx; }
.job-title { font-weight: bold; font-size: 30rpx; }
.job-salary { color: #ff5a5f; font-weight: bold; }
.job-tags { margin-bottom: 10rpx; }
.tag { background: #e6f7ff; color: #007aff; font-size: 20rpx; padding: 4rpx 12rpx; border-radius: 4rpx; margin-right: 10rpx; }
.company-name { font-size: 24rpx; color: #666; }
</style>