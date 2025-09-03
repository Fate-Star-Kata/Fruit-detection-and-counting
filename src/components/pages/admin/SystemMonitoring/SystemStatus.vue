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
      <h3 class="text-sm font-semibold text-gray-700">系统状态</h3>
      <div class="text-xs" :class="{
        'text-green-600': systemOverview.status === 'healthy',
        'text-yellow-600': systemOverview.status === 'warning', 
        'text-red-600': systemOverview.status === 'critical'
      }">
        {{ getStatusText(systemOverview.status) }}
      </div>
    </div>
    <div v-if="systemOverview.alerts && systemOverview.alerts.length" class="space-y-1">
      <div v-for="(alert, index) in systemOverview.alerts.slice(0, 3)" :key="index"
        class="flex items-center p-2 rounded text-xs" :class="{
          'bg-yellow-50 border border-yellow-200': alert.type === 'warning',
          'bg-red-50 border border-red-200': alert.type === 'error',
          'bg-blue-50 border border-blue-200': alert.type === 'info'
        }">
        <div class="flex-1">
          <p class="font-medium" :class="{
            'text-yellow-800': alert.type === 'warning',
            'text-red-800': alert.type === 'error',
            'text-blue-800': alert.type === 'info'
          }">{{ alert.message }}</p>
        </div>
      </div>
    </div>
    <div v-else class="text-xs text-gray-500 text-center py-4">
      系统运行正常
    </div>
  </div>
</template>

<script setup>
// 定义props接收父组件传递的系统概览数据
const props = defineProps({
  systemOverview: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'healthy':
      return '正常'
    case 'warning':
      return '警告'
    case 'critical':
      return '严重'
    default:
      return '未知'
  }
}
</script>

<style scoped>
/* 系统状态组件样式 */
</style>