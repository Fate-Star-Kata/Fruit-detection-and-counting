<template>
  <div class="bg-white rounded-lg shadow-md p-3 relative overflow-hidden">
    <!-- 加载蒙层 -->
    <div v-if="loading" class="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
        <span class="text-xs text-gray-600">数据更新中...</span>
      </div>
    </div>
    
    <h3 class="text-sm font-semibold text-gray-800 mb-2">内存监控</h3>
    <div class="space-y-2">
      <div>
        <div class="flex justify-between text-xs text-gray-600 mb-1">
          <span>使用率</span>
          <span>{{ memoryInfo.memory?.percent || 0 }}%</span>
        </div>
        <div class="bg-gray-200 rounded-full h-2">
          <div class="bg-green-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: (memoryInfo.memory?.percent || 0) + '%' }"></div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p class="text-gray-600">总内存</p>
          <p class="font-semibold">{{ formatBytes(memoryInfo.memory?.total || 0) }}</p>
        </div>
        <div>
          <p class="text-gray-600">已使用</p>
          <p class="font-semibold">{{ formatBytes(memoryInfo.memory?.used || 0) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 定义props接收父组件传递的内存数据
defineProps({
  memoryInfo: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// 工具函数：格式化字节
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
/* 内存监控组件样式 */
</style>