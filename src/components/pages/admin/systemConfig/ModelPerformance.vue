<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Motion } from 'motion-v'
import { getAdminModelPerformance, resetModelPerformance } from '@/api'
import type { AdminModelPerformanceData, AdminModelPerformanceItem } from '@/types/apis/PagesApi_T'

// 动画配置
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

// 响应式数据
const loading = ref(false)
const resetting = ref(false)
const performanceData = ref<AdminModelPerformanceData | null>(null)

// 计算属性
const sortedPerformances = computed(() => {
  if (!performanceData.value?.performances) return []
  return [...performanceData.value.performances].sort((a, b) => b.total_detections - a.total_detections)
})

// 获取性能数据
const fetchPerformanceData = async () => {
  try {
    loading.value = true
    const response = await getAdminModelPerformance()
    if (response.code === 200) {
      performanceData.value = response.data
    } else {
      ElMessage.error(response.msg || '获取性能数据失败')
    }
  } catch (error) {
    console.error('获取性能数据失败:', error)
    ElMessage.error('获取性能数据失败')
  } finally {
    loading.value = false
  }
}

// 重置性能统计
const handleResetPerformance = async () => {
  try {
    await ElMessageBox.confirm(
      '此操作将清空所有模型性能统计数据，是否继续？',
      '确认重置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    resetting.value = true
    const response = await resetModelPerformance({ action: 'reset_all' })
    if (response.code === 200) {
      ElMessage.success('性能统计已重置')
      await fetchPerformanceData() // 重新获取数据
    } else {
      ElMessage.error(response.msg || '重置失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置性能统计失败:', error)
      ElMessage.error('重置失败')
    }
  } finally {
    resetting.value = false
  }
}

// 格式化置信度
const formatConfidence = (confidence: number) => {
  return `${(confidence * 100).toFixed(1)}%`
}

// 获取置信度等级
const getConfidenceLevel = (confidence: number) => {
  if (confidence >= 0.9) return { level: '优秀', type: 'success' }
  if (confidence >= 0.8) return { level: '良好', type: 'primary' }
  if (confidence >= 0.7) return { level: '一般', type: 'warning' }
  return { level: '较差', type: 'danger' }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchPerformanceData()
})
</script>

<template>
  <div class="model-performance">
    <!-- 总体统计卡片 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate" 
      :transition="{ ...cardVariants.transition, delay: 0.1 }">
      <el-card class="overview-card" v-loading="loading">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon">
              <TrendCharts />
            </el-icon>
            <span class="header-title">总体性能概览</span>
            <div class="header-actions">
              <el-button 
                size="small" 
                @click="fetchPerformanceData" 
                :loading="loading"
              >
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="handleResetPerformance" 
                :loading="resetting"
                :disabled="loading"
              >
                <el-icon><Delete /></el-icon>
                重置统计
              </el-button>
            </div>
          </div>
        </template>
        
        <div v-if="performanceData" class="overview-content">
          <el-row :gutter="24">
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ performanceData.total_detections }}</div>
                <div class="stat-label">总检测次数</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ formatConfidence(performanceData.overall_avg_confidence) }}</div>
                <div class="stat-label">平均置信度</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ performanceData.fruit_types_count }}</div>
                <div class="stat-label">水果种类数</div>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <div v-else-if="!loading" class="no-data">
          <el-empty description="暂无性能数据" />
        </div>
      </el-card>
    </Motion>

    <!-- 详细性能表格 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate" 
      :transition="{ ...cardVariants.transition, delay: 0.2 }">
      <el-card class="performance-table-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon">
              <DataAnalysis />
            </el-icon>
            <span class="header-title">各水果检测性能</span>
          </div>
        </template>
        
        <el-table 
          :data="sortedPerformances" 
          v-loading="loading"
          class="performance-table"
          empty-text="暂无数据"
        >
          <el-table-column prop="fruit_name" label="水果名称" min-width="120">
            <template #default="{ row }">
              <div class="fruit-name">
                <el-tag size="small">{{ row.fruit_name }}</el-tag>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="total_detections" label="检测次数" min-width="100" sortable>
            <template #default="{ row }">
              <div class="detection-count">
                <el-text type="primary" size="large">{{ row.total_detections }}</el-text>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="avg_confidence" label="平均置信度" min-width="120" sortable>
            <template #default="{ row }">
              <div class="confidence-info">
                <div class="confidence-value">{{ formatConfidence(row.avg_confidence) }}</div>
                <el-tag 
                  size="small" 
                  :type="getConfidenceLevel(row.avg_confidence).type"
                >
                  {{ getConfidenceLevel(row.avg_confidence).level }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="last_updated" label="最后更新" min-width="160">
            <template #default="{ row }">
              <div class="last-updated">
                <el-icon><Clock /></el-icon>
                <span>{{ row.last_updated }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="性能指标" min-width="200">
            <template #default="{ row }">
              <div class="performance-metrics">
                <div class="metric-item">
                  <span class="metric-label">检测占比:</span>
                  <span class="metric-value">
                    {{ performanceData ? ((row.total_detections / performanceData.total_detections) * 100).toFixed(1) : 0 }}%
                  </span>
                </div>
                <el-progress 
                  :percentage="performanceData ? (row.total_detections / performanceData.total_detections) * 100 : 0"
                  :stroke-width="6"
                  :show-text="false"
                  class="metric-progress"
                />
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </Motion>
  </div>
</template>

<style scoped lang="scss">
.model-performance {
  .overview-card,
  .performance-table-card {
    margin-bottom: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    
    :deep(.el-card__body) {
      padding: 24px;
    }
  }
  
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .header-icon {
      font-size: 18px;
      color: var(--el-color-primary);
      margin-right: 8px;
    }
    
    .header-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      flex: 1;
    }
    
    .header-actions {
      display: flex;
      gap: 8px;
    }
  }
  
  .overview-content {
    .stat-item {
      text-align: center;
      padding: 20px;
      border-radius: 8px;
      background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
      
      .stat-value {
        font-size: 32px;
        font-weight: 700;
        color: var(--el-color-primary);
        margin-bottom: 8px;
      }
      
      .stat-label {
        font-size: 14px;
        color: var(--el-text-color-regular);
        font-weight: 500;
      }
    }
  }
  
  .no-data {
    padding: 40px 0;
  }
  
  .performance-table {
    .fruit-name {
      display: flex;
      align-items: center;
    }
    
    .detection-count {
      text-align: center;
    }
    
    .confidence-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      .confidence-value {
        font-weight: 600;
        font-size: 16px;
      }
    }
    
    .last-updated {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: var(--el-text-color-regular);
    }
    
    .performance-metrics {
      .metric-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 13px;
        
        .metric-label {
          color: var(--el-text-color-regular);
        }
        
        .metric-value {
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }
      
      .metric-progress {
        :deep(.el-progress-bar__outer) {
          background-color: #f0f2f5;
        }
      }
    }
  }
}
</style>