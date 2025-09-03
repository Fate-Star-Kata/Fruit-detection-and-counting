<template>
  <el-card shadow="never" class="list-card flex-1 min-h-0 flex flex-col">
    <template #header>
      <div class="list-header">
        <span class="list-title">通知列表</span>
        <el-space>
          <el-button :icon="Refresh" @click="handleRefresh" :loading="loading" size="small">
            刷新
          </el-button>
        </el-space>
      </div>
    </template>

    <!-- 加载状态 -->
    <div v-if="loading" v-loading="loading" class="loading-container">
      <el-empty description="正在加载通知..." />
    </div>

    <!-- 空状态 -->
    <div v-else-if="data.length === 0" class="empty-container">
      <el-empty description="暂无通知数据">
        <template #image>
          <el-icon size="60" color="var(--el-color-info)">
            <DocumentRemove />
          </el-icon>
        </template>
        <el-button type="primary" @click="handleCreateNotice">
          发布第一条通知
        </el-button>
      </el-empty>
    </div>

    <!-- 通知列表 -->
    <div v-else class="table-container flex-1 min-h-0">
      <el-table 
        :data="data" 
        stripe 
        border 
        height="100%" 
        :loading="loading" 
        empty-text="暂无通知数据"
        class="notification-table"
      >
        <el-table-column prop="title" label="通知标题" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="title-cell">
              <span class="title-text">{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="content" label="通知内容" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="content-cell">
              <span class="content-text">{{ row.content }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="120" align="center">
          <template #default="{ row }">
            <div class="time-cell">
              <el-icon class="time-icon">
                <Clock />
              </el-icon>
              <span class="time-text">{{ formatDate(row.created_at) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-cell">
              <el-button-group size="small" class="action-button-group">
                <el-button type="warning" @click="handleEdit(row.id)" size="small">
                  <el-icon>
                    <Edit />
                  </el-icon>
                </el-button>
                <el-button type="primary" @click="handleResend(row.id)" size="small" title="选择用户重发">
                  <el-icon>
                    <UserFilled />
                  </el-icon>
                </el-button>
                <el-button type="success" @click="handleResendAll(row.id)" size="small" title="全部重发">
                  <el-icon>
                    <Bell />
                  </el-icon>
                </el-button>
                <el-button type="danger" @click="handleDelete(row.id)" size="small">
                  <el-icon>
                    <Delete />
                  </el-icon>
                </el-button>
              </el-button-group>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Refresh,
  DocumentRemove,
  Edit,
  Delete,
  Clock,
  UserFilled,
  Bell
} from '@element-plus/icons-vue'
import type { NotificationItem } from '@/types/factory'

// Props
interface Props {
  data: NotificationItem[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Emits
interface Emits {
  refresh: []
  createNotice: []
  edit: [id: number]
  resend: [id: number]
  resendAll: [id: number]
  delete: [id: number]
}

const emit = defineEmits<Emits>()

// 计算属性
const tableData = computed(() => props.data)

// 方法
const handleRefresh = () => {
  emit('refresh')
}

const handleCreateNotice = () => {
  emit('createNotice')
}

const handleEdit = (id: number) => {
  emit('edit', id)
}

const handleResend = (id: number) => {
  emit('resend', id)
}

const handleResendAll = (id: number) => {
  emit('resendAll', id)
}

const handleDelete = (id: number) => {
  emit('delete', id)
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
</script>

<style scoped>
.list-card {
  margin-bottom: 16px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.loading-container,
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.table-container {
  overflow: hidden;
}

.notification-table {
  height: 100%;
}

.title-cell {
  display: flex;
  align-items: center;
}

.title-text {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.content-cell {
  display: flex;
  align-items: center;
}

.content-text {
  color: var(--el-text-color-regular);
  line-height: 1.4;
}

.time-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.time-icon {
  color: var(--el-color-info);
  font-size: 14px;
}

.time-text {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.action-cell {
  display: flex;
  justify-content: center;
}

.action-button-group {
  display: flex;
  gap: 2px;
}

.action-button-group .el-button {
  padding: 4px 6px;
  min-width: 28px;
}

:deep(.el-table__body-wrapper) {
  overflow-y: auto;
}

:deep(.el-table__header-wrapper) {
  background-color: var(--el-fill-color-lighter);
}

:deep(.el-table th) {
  background-color: var(--el-fill-color-lighter);
  font-weight: 600;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: var(--el-fill-color-lighter);
}
</style>