<template>
  <el-card shadow="never" class="stats-card">
    <template #header>
      <div class="stats-header">
        <span class="stats-title">数据统计</span>
        <el-button type="primary" :icon="Plus" @click="handleCreateNotice">
          发布通知
        </el-button>
      </div>
    </template>
    
    <div v-loading="loading" class="stats-content">
      <el-row :gutter="16" class="stats-row" v-if="showStats">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="总通知数" :value="stats.total">
              <template #prefix>
                <el-icon style="color: var(--el-color-primary)">
                  <Bell />
                </el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="今日发布" :value="stats.today">
              <template #prefix>
                <el-icon style="color: var(--el-color-success)">
                  <Calendar />
                </el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="本周发布" :value="stats.this_week">
              <template #prefix>
                <el-icon style="color: var(--el-color-info)">
                  <TrendCharts />
                </el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="本月发布" :value="stats.this_month">
              <template #prefix>
                <el-icon style="color: var(--el-color-warning)">
                  <TrendCharts />
                </el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
      </el-row>
      
      <div v-if="!showStats" class="stats-placeholder">
        <el-text type="info">统计数据已隐藏</el-text>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Bell, Calendar, TrendCharts } from '@element-plus/icons-vue'
import type { NotificationStats } from '@/types/factory'

// Props
interface Props {
  stats: NotificationStats
  loading?: boolean
  showStats?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showStats: true
})

// Emits
interface Emits {
  createNotice: []
}

const emit = defineEmits<Emits>()

// 计算属性
const statsData = computed(() => props.stats)

// 方法
const handleCreateNotice = () => {
  emit('createNotice')
}
</script>

<style scoped>
.stats-card {
  margin-bottom: 16px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.stats-content {
  min-height: 120px;
}

.stats-row {
  margin: 0;
}

.stat-card {
  border: 1px solid var(--el-border-color-light);
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.stats-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
}

:deep(.el-statistic__content) {
  font-size: 24px;
  font-weight: 600;
}

:deep(.el-statistic__title) {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
}
</style>