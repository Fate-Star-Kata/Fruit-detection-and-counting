<template>
  <div class="bg-white rounded-lg shadow-md p-3 relative overflow-hidden">
    <!-- 加载蒙层 -->
    <div v-if="loading" class="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
        <span class="text-xs text-gray-600">数据更新中...</span>
      </div>
    </div>
    
    <h3 class="text-sm font-semibold text-gray-800 mb-2">CPU监控</h3>
    <div class="space-y-2">
      <div class="text-xs text-gray-600">
        <div class="flex justify-between mb-1">
          <span>核心数: {{ cpuInfo.cpu_count || 0 }}</span>
          <span>{{ cpuInfo.cpu_freq?.current || 0 }} MHz</span>
        </div>
      </div>
      <div v-if="cpuInfo.cpu_percent && cpuInfo.cpu_percent.length">
        <div class="space-y-1">
          <div v-for="(percent, index) in cpuInfo.cpu_percent.slice(0, 4)" :key="index" class="flex items-center">
            <span class="text-xs text-gray-500 w-8">{{ index + 1 }}</span>
            <div class="flex-1 bg-gray-200 rounded-full h-1.5 mx-1">
              <div class="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                :style="{ width: percent + '%' }"></div>
            </div>
            <span class="text-xs text-gray-600 w-8">{{ percent }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 定义props接收父组件传递的CPU数据
defineProps({
  cpuInfo: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
/* CPU监控组件样式 */
</style>