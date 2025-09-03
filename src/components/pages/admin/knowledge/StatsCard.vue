<template>
  <el-card shadow="never" class="stats-card">
    <template #header>
      <div class="stats-header">
        <span class="stats-title">知识库数据</span>
        <el-space>
          <el-button type="primary" :icon="Plus" @click="$emit('create')">
            新建文章
          </el-button>
          <el-button :icon="Refresh" @click="$emit('refresh')" :loading="loading">
            刷新
          </el-button>
        </el-space>
      </div>
    </template>
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="12" :sm="6" :md="4">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="总文章数" :value="stats.basic_stats.total_articles || 0" />
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="4">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="已发布" :value="stats.basic_stats.published_articles || 0" />
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="4">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="草稿" :value="stats.basic_stats.draft_articles || 0" />
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="4">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="已归档" :value="stats.basic_stats.archived_articles || 0" />
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="4">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="精选" :value="stats.basic_stats.featured_articles || 0" />
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import { Plus, Refresh } from '@element-plus/icons-vue'
import type { AdminArticleStatisticsResponse } from '@/types/factory'

// Props
defineProps<{
  stats: AdminArticleStatisticsResponse['data']
  loading: boolean
}>()

// Emits
defineEmits<{
  create: []
  refresh: []
}>()
</script>

<style scoped>
.stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stats-title {
  font-size: 16px;
  font-weight: 600;
}

.stats-row {
  margin-top: 4px;
}

.stat-card {
  text-align: center;
}
</style>