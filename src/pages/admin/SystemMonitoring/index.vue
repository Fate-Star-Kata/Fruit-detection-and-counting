<template>
  <div class="system-monitor-container p-4 bg-gray-50 h-screen overflow-hidden">
    <div class="mb-3">
      <h1 class="text-2xl font-bold text-gray-800 mb-1">系统监控大屏</h1>
      <p class="text-sm text-gray-600">实时监控系统资源使用情况</p>
    </div>

    <!-- 监控信息网格布局 -->
    <div class="grid grid-cols-4 gap-3 h-[calc(100vh-120px)]">
      <!-- CPU监控组件 -->
      <CpuMonitor :cpu-info="cpuInfo" :loading="loading" />

      <!-- 内存监控组件 -->
      <MemoryMonitor :memory-info="memoryInfo" :loading="loading" />

      <!-- 磁盘监控组件 -->
      <DiskMonitor :disk-info="diskInfo" :loading="loading" />

      <!-- 系统状态组件 -->
      <SystemStatus :system-overview="systemOverview" :loading="loading" />

      <!-- 进程监控组件 -->
      <ProcessMonitor :process-info="processInfo" :process-sort-by="processSortBy" :process-limit="processLimit"
        :loading="loading" @update-sort="updateProcessSort" @update-limit="updateProcessLimit" class="col-span-4" />
    </div>

    <!-- 底部状态栏 -->
    <div
      class="absolute bottom-2 left-4 right-4 flex justify-between items-center bg-white rounded-lg shadow-md px-3 py-1">
      <div class="text-xs text-gray-600">
        最后更新: {{ lastUpdateTime || 'N/A' }}
      </div>
      <div class="flex space-x-2 items-center">
        <button @click="refreshAllData" :disabled="loading"
          class="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
          <svg v-if="loading" class="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          {{ loading ? '刷新中...' : '刷新' }}
        </button>
        <label class="flex items-center text-xs">
          <input type="checkbox" v-model="autoRefresh" @change="toggleAutoRefresh" class="mr-1">
          <span class="text-xs text-gray-600">自动刷新 ({{ refreshInterval / 1000 }}s)</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { monitorApi } from '@/api/system_file'

// 导入子组件
import CpuMonitor from '@/components/pages/admin/SystemMonitoring/CpuMonitor.vue'
import MemoryMonitor from '@/components/pages/admin/SystemMonitoring/MemoryMonitor.vue'
import DiskMonitor from '@/components/pages/admin/SystemMonitoring/DiskMonitor.vue'
import SystemStatus from '@/components/pages/admin/SystemMonitoring/SystemStatus.vue'
import ProcessMonitor from '@/components/pages/admin/SystemMonitoring/ProcessMonitor.vue'

// 响应式数据
const loading = ref(false)
const lastUpdateTime = ref('')
const autoRefresh = ref(true)
const refreshInterval = ref(30000) // 30秒刷新间隔
let refreshTimer = null

// 监控数据
const systemOverview = ref({})
const cpuInfo = ref({})
const memoryInfo = ref({})
const diskInfo = ref({ disk_info: [] })
const networkInfo = ref({ network_info: {} })
const processInfo = ref({ processes: [], total_processes: 0 })
const gpuInfo = ref({ gpu_available: false, gpu_info: [], message: '' })

// 进程监控参数
const processSortBy = ref('cpu_percent')
const processLimit = ref('10')

// API调用函数
const fetchSystemOverview = async () => {
  try {
    const response = await monitorApi.getSystemOverview()
    console.log('系统概览API响应:', response)
    if (response.code === 200 && response.data) {
      systemOverview.value = response.data
      console.log('系统概览数据:', systemOverview.value)
    }
  } catch (error) {
    console.error('获取系统概览失败:', error)
  }
}

const fetchCpuInfo = async () => {
  try {
    const response = await monitorApi.getCpuMonitor()
    console.log('CPU监控API响应:', response)
    if (response.code === 200 && response.data) {
      cpuInfo.value = response.data
      console.log('CPU数据:', cpuInfo.value)
    }
  } catch (error) {
    console.error('获取CPU信息失败:', error)
  }
}

const fetchMemoryInfo = async () => {
  try {
    const response = await monitorApi.getMemoryMonitor()
    console.log('内存监控API响应:', response)
    if (response.code === 200 && response.data) {
      memoryInfo.value = response.data
      console.log('内存数据:', memoryInfo.value)
    }
  } catch (error) {
    console.error('获取内存信息失败:', error)
  }
}

const fetchDiskInfo = async () => {
  try {
    const response = await monitorApi.getDiskMonitor()
    if (response.code === 200 && response.data) {
      diskInfo.value = response.data
    }
  } catch (error) {
    console.error('获取磁盘信息失败:', error)
  }
}

const fetchNetworkInfo = async () => {
  try {
    const response = await monitorApi.getNetworkMonitor()
    if (response.code === 200 && response.data) {
      networkInfo.value = response.data
    }
  } catch (error) {
    console.error('获取网络信息失败:', error)
  }
}

const fetchProcessInfo = async () => {
  try {
    const response = await monitorApi.getProcessMonitor({
      limit: parseInt(processLimit.value),
      sort_by: processSortBy.value
    })
    if (response.code === 200 && response.data) {
      processInfo.value = response.data
    }
  } catch (error) {
    console.error('获取进程信息失败:', error)
  }
}

const fetchGpuInfo = async () => {
  try {
    const response = await monitorApi.getGpuMonitor()
    if (response.code === 200 && response.data) {
      gpuInfo.value = response.data
    }
  } catch (error) {
    console.error('获取GPU信息失败:', error)
  }
}

// 刷新所有数据
const refreshAllData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchSystemOverview(),
      fetchCpuInfo(),
      fetchMemoryInfo(),
      fetchDiskInfo(),
      fetchNetworkInfo(),
      fetchProcessInfo(),
      fetchGpuInfo()
    ])
    lastUpdateTime.value = new Date().toLocaleString()
  } catch (error) {
    console.error('刷新数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 自动刷新控制
const toggleAutoRefresh = () => {
  if (autoRefresh.value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

const startAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  refreshTimer = setInterval(() => {
    refreshAllData()
  }, refreshInterval.value)
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 进程监控事件处理
const updateProcessSort = (sortBy) => {
  processSortBy.value = sortBy
  fetchProcessInfo()
}

const updateProcessLimit = (limit) => {
  processLimit.value = limit
  fetchProcessInfo()
}

// 生命周期
onMounted(() => {
  refreshAllData()
  if (autoRefresh.value) {
    startAutoRefresh()
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.system-monitor-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>