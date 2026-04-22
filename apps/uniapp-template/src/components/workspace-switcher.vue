<template>
  <view class="flex items-center px-4 py-2 bg-white sticky top-0 z-50 shadow-sm" v-if="userStore.userInfo">
    <wd-img :src="userStore.userInfo.avatar || '/static/logo.png'" round width="36" height="36" />
    
    <view class="ml-3 flex-1 flex items-center" @click="showSheet = true">
      <view>
        <text class="text-sm font-bold text-gray-800 block">
          {{ userStore.currentClassInfo ? userStore.currentClassInfo.name : '个人探索模式' }}
        </text>
        <text class="text-xs text-gray-400">
          {{ userStore.userInfo.name }} · {{ userStore.currentClassInfo ? '实习生' : '自由人' }}
        </text>
      </view>
      <wd-icon name="arrow-down" size="16" class="ml-2 text-gray-400"></wd-icon>
    </view>
    
    <wd-icon name="scan" size="22" class="text-gray-600" @click="handleScan"></wd-icon>

    <wd-action-sheet 
      v-model="showSheet" 
      :actions="classOptions" 
      cancel-text="取消"
      @select="handleSelect" 
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '@/store/useUserStore';

const userStore = useUserStore();
const showSheet = ref(false);

// 构建供 ActionSheet 使用的选项列表
const classOptions = computed(() => {
  const options = userStore.myClasses?.map(c => ({
    name: c.name,
    id: c.id,
    color: userStore.activeClassId === c.id ? '#4D80F0' : '#333' // 选中的高亮
  }));
  
  // 增加一个“散客模式”选项
  options.push({
    name: '🌟 个人探索模式',
    id: null,
    color: userStore.activeClassId === null ? '#4D80F0' : '#333'
  });
  return options;
});

const handleSelect = (item: any) => {
  userStore.switchClass(item.id);
  uni.showToast({ title: `已切换至 ${item.name}`, icon: 'none' });
};

const handleScan = () => {
  // 扫码加入班级的逻辑...
  uni.showToast({ title: '调用扫码', icon: 'none' });
};
</script>
