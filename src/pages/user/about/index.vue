<template>
  <div class="min-h-screen bg-base-100 text-base-content p-6">
    <!-- 页面标题 -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-2">模型信息与统计</h1>
      <p class="text-lg opacity-70">查看YOLO模型详细信息和检测统计数据</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- 主要内容 -->
    <div v-else class="max-w-7xl mx-auto space-y-8">
      <!-- 模型基础信息卡片 -->
      <div class="card bg-base-200 shadow-lg">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            模型基础信息
          </h2>
          <div v-if="modelInfo" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="stat bg-base-100 rounded-lg">
              <div class="stat-title">模型状态</div>
              <div class="stat-value text-lg overflow-hidden" :class="modelInfo.model_loaded ? 'text-success' : 'text-error'">
                {{ modelInfo.model_loaded ? '已加载' : '未加载' }}
              </div>
            </div>
            <div class="stat bg-base-100 rounded-lg">
              <div class="stat-title">置信度阈值</div>
              <div class="stat-value text-lg overflow-hidden">{{ modelInfo.confidence_threshold }}</div>
            </div>
            <div class="stat bg-base-100 rounded-lg">
              <div class="stat-title">IoU阈值</div>
              <div class="stat-value text-lg overflow-hidden">{{ modelInfo.iou_threshold }}</div>
            </div>
            <div class="stat bg-base-100 rounded-lg">
              <div class="stat-title">支持水果类型</div>
              <div class="stat-value text-lg overflow-hidden">{{ modelInfo.supported_fruits?.length || 0 }}</div>
            </div>
            <div class="stat bg-base-100 rounded-lg">
              <div class="stat-title">模型路径</div>
              <div class="stat-desc text-sm break-all overflow-hidden">{{ modelInfo.model_path }}</div>
            </div>
            <div class="stat bg-base-100 rounded-lg">
              <div class="stat-title">最后更新</div>
              <div class="stat-desc text-sm">{{ formatDate(modelInfo.settings_updated) }}</div>
            </div>
          </div>
          
          <!-- 支持的水果类型 -->
          <div v-if="modelInfo?.supported_fruits" class="mt-6">
            <h3 class="text-lg font-semibold mb-3">支持的水果类型</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="fruit in modelInfo.supported_fruits" :key="fruit" 
                    class="badge badge-primary badge-lg">{{ fruit }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 模型设置信息 -->
      <div class="card bg-base-200 shadow-lg">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            当前模型设置
          </h2>
          <div v-if="modelSettings" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-semibold">置信度阈值</span>
                </label>
                <div class="flex items-center space-x-4">
                  <input type="range" min="0" max="1" step="0.01" 
                         :value="modelSettings.confidence_threshold" 
                         class="range range-primary" disabled />
                  <span class="badge badge-outline">{{ modelSettings.confidence_threshold }}</span>
                </div>
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-semibold">IoU阈值</span>
                </label>
                <div class="flex items-center space-x-4">
                  <input type="range" min="0" max="1" step="0.01" 
                         :value="modelSettings.iou_threshold" 
                         class="range range-secondary" disabled />
                  <span class="badge badge-outline">{{ modelSettings.iou_threshold }}</span>
                </div>
              </div>
            </div>
            <div class="space-y-4">
              <div class="stat bg-base-100 rounded-lg">
                <div class="stat-title">模型文件路径</div>
                <div class="stat-desc break-all">{{ modelSettings.model_path }}</div>
              </div>
              <div class="stat bg-base-100 rounded-lg">
                <div class="stat-title">设置更新时间</div>
                <div class="stat-desc">{{ formatDate(modelSettings.updated_time) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 模型性能统计 -->
      <div class="card bg-base-200 shadow-lg">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            模型性能统计
          </h2>
          
          <!-- 总体统计 -->
          <div v-if="modelPerformance" class="mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div class="stat bg-primary text-primary-content rounded-lg">
                <div class="stat-title text-primary-content/70">总检测次数</div>
                <div class="stat-value">{{ modelPerformance.total_detections_all_time.toLocaleString() }}</div>
              </div>
              <div class="stat bg-secondary text-secondary-content rounded-lg">
                <div class="stat-title text-secondary-content/70">24小时检测次数</div>
                <div class="stat-value">{{ modelPerformance.total_detections_24h.toLocaleString() }}</div>
              </div>
            </div>
            
            <!-- 整体性能表格 -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-3">整体性能统计</h3>
              <div class="overflow-x-auto">
                <table class="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>水果类型</th>
                      <th>总检测次数</th>
                      <th>平均置信度</th>
                      <th>最后更新</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in modelPerformance.overall_performance" :key="item.fruit_name">
                      <td>
                        <span class="badge badge-primary">{{ item.fruit_name }}</span>
                      </td>
                      <td>{{ item.total_detections.toLocaleString() }}</td>
                      <td>
                        <div class="flex items-center space-x-2">
                          <progress class="progress progress-primary w-20" 
                                    :value="item.avg_confidence * 100" max="100"></progress>
                          <span class="text-sm">{{ (item.avg_confidence * 100).toFixed(1) }}%</span>
                        </div>
                      </td>
                      <td class="text-sm">{{ formatDate(item.last_updated) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <!-- 24小时统计表格 -->
            <div>
              <h3 class="text-lg font-semibold mb-3">24小时统计</h3>
              <div class="overflow-x-auto">
                <table class="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>水果类型</th>
                      <th>24小时检测次数</th>
                      <th>24小时平均置信度</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in modelPerformance.recent_24h_stats" :key="item.fruit_name">
                      <td>
                        <span class="badge badge-secondary">{{ item.fruit_name }}</span>
                      </td>
                      <td>{{ item.count_24h.toLocaleString() }}</td>
                      <td>
                        <div class="flex items-center space-x-2">
                          <progress class="progress progress-secondary w-20" 
                                    :value="item.avg_confidence_24h * 100" max="100"></progress>
                          <span class="text-sm">{{ (item.avg_confidence_24h * 100).toFixed(1) }}%</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  getModelInfo, 
  getModelSettings, 
  getModelPerformance
} from '@/api'
import type {
  ModelInfoData,
  ModelSettings,
  ModelPerformanceData
} from '@/types/apis/PagesApi_T'

// 响应式数据
const loading = ref(true)
const modelInfo = ref<ModelInfoData | null>(null)
const modelSettings = ref<ModelSettings | null>(null)
const modelPerformance = ref<ModelPerformanceData | null>(null)

// 加载所有数据
const loadAllData = async () => {
  loading.value = true
  try {
    const [infoRes, settingsRes, performanceRes] = await Promise.all([
      getModelInfo(),
      getModelSettings(),
      getModelPerformance()
    ])
    
    modelInfo.value = infoRes.data
    modelSettings.value = settingsRes.data
    modelPerformance.value = performanceRes.data
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}



// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '未知'
  try {
    return new Date(dateString).toLocaleString('zh-CN')
  } catch {
    return dateString
  }
}



// 组件挂载时加载数据
onMounted(() => {
  loadAllData()
})
</script>

<style scoped>
.stat {
  @apply p-4;
}

.table th {
  @apply bg-base-200;
}

.progress {
  @apply h-2;
}
</style>
