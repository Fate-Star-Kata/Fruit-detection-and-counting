<template>
  <div class="bg-white rounded-lg shadow-md p-3 relative overflow-hidden">
    <!-- 加载蒙层 -->
    <div v-if="loading" class="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
        <span class="text-xs text-gray-600">数据更新中...</span>
      </div>
    </div>

    <div class="flex justify-between items-center mb-2">
      <h3 class="text-sm font-semibold text-gray-800">进程监控 (总数: {{ processInfo.total_processes || 0 }})</h3>
      <div class="flex space-x-2">
        <select :value="processSortBy" @change="$emit('update-sort', $event.target.value)"
          class="text-xs border border-gray-300 rounded px-1 py-0.5">
          <option value="cpu_percent">按CPU排序</option>
          <option value="memory_percent">按内存排序</option>
        </select>
        <select :value="processLimit" @change="$emit('update-limit', $event.target.value)"
          class="text-xs border border-gray-300 rounded px-1 py-0.5">
          <option value="10">显示10个</option>
          <option value="15">显示15个</option>
        </select>
      </div>
    </div>
    <div class="overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="bg-gray-50">
            <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">PID</th>
            <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">进程名</th>
            <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">CPU%</th>
            <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">内存%</th>
            <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">内存使用</th>
            <th class="px-2 py-1 text-left text-xs font-medium text-gray-500">状态</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr v-for="process in processInfo.processes" :key="process.pid" class="hover:bg-gray-50">
            <td class="px-2 py-1 text-xs text-gray-900">{{ process.pid }}</td>
            <td class="px-2 py-1 text-xs text-gray-900 truncate max-w-32">{{ process.name }}</td>
            <td class="px-2 py-1 text-xs">
              <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium" :class="{
                'bg-red-100 text-red-800': process.cpu_percent > 50,
                'bg-yellow-100 text-yellow-800': process.cpu_percent > 20 && process.cpu_percent <= 50,
                'bg-green-100 text-green-800': process.cpu_percent <= 20
              }">
                {{ process.cpu_percent }}%
              </span>
            </td>
            <td class="px-2 py-1 text-xs">
              <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium" :class="{
                'bg-red-100 text-red-800': process.memory_percent > 10,
                'bg-yellow-100 text-yellow-800': process.memory_percent > 5 && process.memory_percent <= 10,
                'bg-green-100 text-green-800': process.memory_percent <= 5
              }">
                {{ process.memory_percent.toFixed(2) }}%
              </span>
            </td>
            <td class="px-2 py-1 text-xs text-gray-900">{{ formatBytes(process.memory_info?.rss || 0) }}</td>
            <td class="px-2 py-1 text-xs">
              <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium" :class="{
                'bg-green-100 text-green-800': process.status === 'running',
                'bg-yellow-100 text-yellow-800': process.status === 'sleeping',
                'bg-red-100 text-red-800': process.status === 'stopped'
              }">
                {{ process.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
// 定义props接收父组件传递的进程数据
defineProps({
  processInfo: {
    type: Object,
    default: () => ({ processes: [] })
  },
  processSortBy: {
    type: String,
    default: 'cpu_percent'
  },
  processLimit: {
    type: String,
    default: '10'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// 定义事件
defineEmits(['update-sort', 'update-limit'])

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
/* 进程监控组件样式 */
</style>