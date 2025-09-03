<template>
  <div class="bg-white rounded-lg shadow-md p-3 relative overflow-hidden">
    <!-- 加载蒙层 -->
    <div v-if="loading" class="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
        <span class="text-xs text-gray-600">数据更新中...</span>
      </div>
    </div>
    
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-sm font-semibold text-gray-700">磁盘使用率</h3>
      <div class="text-xs text-gray-500">{{ diskInfo.disk_info?.length || 0 }} 个磁盘</div>
    </div>
    <div class="space-y-2">
      <div v-for="disk in diskInfo.disk_info.slice(0, 2)" :key="disk.device"
        class="border-b border-gray-100 pb-2 last:border-b-0">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs font-medium text-gray-800">{{ disk.device }}</span>
          <span class="text-xs text-gray-600">{{ disk.percent }}%</span>
        </div>
        <div class="bg-gray-200 rounded-full h-1.5 mb-1">
          <div class="bg-yellow-600 h-1.5 rounded-full transition-all duration-300"
            :style="{ width: disk.percent + '%' }"></div>
        </div>
        <div class="text-xs text-gray-600">
          <div class="flex justify-between">
            <span>{{ formatBytes(disk.used) }}</span>
            <span>{{ formatBytes(disk.total) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 定义props接收父组件传递的磁盘数据
const props = defineProps({
  diskInfo: {
    type: Object,
    default: () => ({ disk_info: [] })
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
/* 磁盘监控组件样式 */
</style>