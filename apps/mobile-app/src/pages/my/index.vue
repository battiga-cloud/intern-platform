<template>
  <view class="container">
    <view v-if="userInfo?.id" class="header" @click="handleProfile">
      <view class="avatar"></view>
      <view class="info">
        <text class="name">张同学</text>
        <text class="school">某某职业技术学院 - 机电专业</text>
      </view>
    </view>
    <!-- 登录 -->
    <view v-else class="header" @click="handleLoginClick">
      <view class="avatar"></view>
      <view class="info">
        <text class="name">登录/注册</text>
      </view>
    </view>
    

    <view class="menu-list">
      <view class="menu-item">我的投递记录 <text class="arrow">></text></view>
      <view class="menu-item">我的动态 <text class="arrow">></text></view>
      <view class="menu-item">专属运营顾问 <text class="arrow">></text></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from "@/store/useUserStore";
import { computed } from "vue";

// 逻辑待完善

const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo)

async function getUserInfo() {
  // await userStore.getUserInfo();
}

function handleProfile() {
  uni.navigateTo({ url: '/pages-user/settings' })
}

async function handleLoginClick() {
  uni.navigateTo({
    url: "/pages/login/index",
  });
}
</script>

<style scoped>
.container {
  background: #f8f8f8;
}
.header {
  display: flex;
  align-items: center;
  padding: 60rpx 40rpx;
  background: #fff;
  margin-bottom: 20rpx;
}
.avatar {
  width: 120rpx;
  height: 120rpx;
  background: #ccc;
  border-radius: 50%;
  margin-right: 30rpx;
}
.name {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 10rpx;
}
.school {
  font-size: 24rpx;
  color: #666;
}
.menu-list {
  background: #fff;
}
.menu-item {
  padding: 30rpx 40rpx;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  color: #333;
}
.arrow {
  color: #ccc;
}
</style>
