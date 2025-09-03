<template>
  <div class="system-monitor-container p-4 h-screen overflow-hidden bg-base-200">
    <div class="mb-3">
      <h1 class="text-2xl font-bold mb-1">系统监控大屏</h1>
      <p class="text-sm opacity-70">实时监控系统资源使用情况</p>
    </div>

    <!-- 监控信息网格布局 -->
    <div class="grid grid-cols-4 gap-3 h-[calc(100vh-120px)]">
      <!-- CPU监控 -->
      <div class="card bg-base-100 shadow">
        <div class="card-body p-3">
          <h3 class="card-title text-sm mb-2">CPU监控</h3>
          <div class="space-y-2">
            <div class="text-xs opacity-70">
              <div class="flex justify-between mb-1">
                <span>核心数: {{ cpuInfo.cpu_count || 0 }}</span>
                <span>{{ cpuInfo.cpu_freq?.current || 0 }} MHz</span>
              </div>
            </div>
            <div v-if="cpuInfo.cpu_percent?.length" class="space-y-1">
              <div v-for="(percent, index) in cpuInfo.cpu_percent.slice(0, 4)" :key="index" class="flex items-center">
                <span class="text-xs w-8">{{ index + 1 }}</span>
                <progress class="progress progress-primary flex-1 mx-1 h-2" :value="percent" max="100"></progress>
                <span class="text-xs w-8">{{ percent }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 内存监控 -->
      <div class="card bg-base-100 shadow">
        <div class="card-body p-3">
          <h3 class="card-title text-sm mb-2">内存监控</h3>
          <div class="space-y-2">
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span>使用率</span>
                <span>{{ memoryInfo.memory?.percent || 0 }}%</span>
              </div>
              <progress class="progress progress-success h-2" :value="memoryInfo.memory?.percent || 0"
                max="100"></progress>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p class="opacity-70">总内存</p>
                <p class="font-semibold">{{ formatBytes(memoryInfo.memory?.total || 0) }}</p>
              </div>
              <div>
                <p class="opacity-70">已使用</p>
                <p class="font-semibold">{{ formatBytes(memoryInfo.memory?.used || 0) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 磁盘监控 -->
      <div class="card bg-base-100 shadow">
        <div class="card-body p-3">
          <h3 class="card-title text-sm mb-2">磁盘监控</h3>
          <div class="space-y-2">
            <div v-for="disk in diskInfo.disk_info.slice(0, 2)" :key="disk.device"
              class="pb-2 border-b last:border-b-0">
              <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-medium">{{ disk.device }}</span>
                <span class="text-xs">{{ disk.percent }}%</span>
              </div>
              <progress class="progress progress-warning h-2 mb-1" :value="disk.percent" max="100"></progress>
              <div class="text-xs opacity-70 flex justify-between">
                <span>{{ formatBytes(disk.used) }}</span>
                <span>{{ formatBytes(disk.total) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 系统警告 -->
      <div class="card bg-base-100 shadow">
        <div class="card-body p-3">
          <h3 class="card-title text-sm mb-2">系统状态</h3>
          <div v-if="systemOverview.alerts?.length" class="space-y-1">
            <div v-for="(alert, index) in systemOverview.alerts.slice(0, 3)" :key="index" class="p-2 rounded text-xs"
              :class="{
                'bg-warning/20 border border-warning': alert.type === 'warning',
                'bg-error/20 border border-error': alert.type === 'error',
                'bg-info/20 border border-info': alert.type === 'info'
              }">
              <p class="font-medium">{{ alert.message }}</p>
            </div>
          </div>
          <div v-else class="text-xs opacity-50 text-center py-4">系统运行正常</div>
        </div>
      </div>

      <!-- 进程监控 -->
      <div class="card bg-base-100 shadow col-span-4">
        <div class="card-body p-3">
          <div class="flex justify-between items-center mb-2">
            <h3 class="card-title text-sm">进程监控 (总数: {{ processInfo.total_processes || 0 }})</h3>
            <div class="flex space-x-2">
              <select v-model="processSortBy" @change="fetchProcessInfo" class="select select-bordered select-xs">
                <option value="cpu_percent">按CPU排序</option>
                <option value="memory_percent">按内存排序</option>
              </select>
              <select v-model="processLimit" @change="fetchProcessInfo" class="select select-bordered select-xs">
                <option value="10">显示10个</option>
                <option value="15">显示15个</option>
              </select>
            </div>
          </div>
          <div class="overflow-hidden">
            <table class="table table-xs">
              <thead>
                <tr>
                  <th>PID</th>
                  <th>进程名</th>
                  <th>CPU%</th>
                  <th>内存%</th>
                  <th>内存使用</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="process in processInfo.processes" :key="process.pid">
                  <td>{{ process.pid }}</td>
                  <td class="truncate max-w-32">{{ process.name }}</td>
                  <td>
                    <div class="badge badge-xs" :class="{
                      'badge-error': process.cpu_percent > 50,
                      'badge-warning': process.cpu_percent > 20 && process.cpu_percent <= 50,
                      'badge-success': process.cpu_percent <= 20
                    }">
                      {{ process.cpu_percent }}%
                    </div>
                  </td>
                  <td>
                    <div class="badge badge-xs" :class="{
                      'badge-error': process.memory_percent > 10,
                      'badge-warning': process.memory_percent > 5 && process.memory_percent <= 10,
                      'badge-success': process.memory_percent <= 5
                    }">
                      {{ process.memory_percent }}%
                    </div>
                  </td>
                  <td>{{ formatBytes(process.memory_info?.rss || 0) }}</td>
                  <td>
                    <div class="badge badge-xs" :class="{
                      'badge-success': process.status === 'running',
                      'badge-warning': process.status === 'sleeping',
                      'badge-error': process.status === 'stopped'
                    }">
                      {{ process.status }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div
      class="absolute bottom-2 left-4 right-4 flex justify-between items-center bg-base-100 shadow rounded px-3 py-1">
      <div class="text-xs opacity-70">最后更新: {{ lastUpdateTime || 'N/A' }}</div>
      <div class="flex space-x-2 items-center">
        <button @click="refreshAllData" :disabled="loading" class="btn btn-primary btn-xs">
          <span v-if="loading" class="loading loading-spinner loading-xs mr-1"></span>
          {{ loading ? '刷新中...' : '刷新' }}
        </button>
        <label class="flex items-center text-xs">
          <input type="checkbox" v-model="autoRefresh" @change="toggleAutoRefresh" class="checkbox checkbox-xs mr-1" />
          <span>自动刷新 ({{ refreshInterval / 1000 }}s)</span>
        </label>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { monitorApi } from '@/api/system_file'

// 响应式数据
const loading = ref(false)
const lastUpdateTime = ref('')
const autoRefresh = ref(true)
const refreshInterval = ref(5000) // 5秒刷新间隔
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

// 工具函数
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

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