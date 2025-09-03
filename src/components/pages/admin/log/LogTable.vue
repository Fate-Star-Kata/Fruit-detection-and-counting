<template>
  <div class="log-table-container">
    <!-- 加载状态蒙层 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        <span>数据加载中...</span>
      </div>
    </div>

    <div class="table-container">
      <el-table :data="logList" border stripe style="width: 100%" :loading="loading"
        @selection-change="onSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="user.username" label="用户" min-width="120">
          <template #default="{ row }">
            <div class="flex items-center gap-1">
              <el-icon>
                <User />
              </el-icon>
              <span>{{ row.user?.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="action_type_display" label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.action_type_display }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" min-width="140" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" min-width="220" show-overflow-tooltip />
        <el-table-column prop="ip_address" label="IP" width="130" align="center" />
        <el-table-column prop="response_status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.response_status === 200 ? 'success' : 'danger'" size="small">
              {{ row.response_status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="时间" width="160" align="center">
          <template #default="{ row }">
            <div class="time-cell">
              <el-icon class="mr-1">
                <Clock />
              </el-icon>
              <span>{{ formatDate(row.created_at) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" :icon="View" @click="handleDetail(row.id)">详情</el-button>
              <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(row.id)"></el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { View, Delete, Clock, User, Loading } from '@element-plus/icons-vue'
import type { OperationLogItem } from '@/types/factory'

interface Props {
  logList: OperationLogItem[]
  loading?: boolean
}

interface Emits {
  selectionChange: [selectedIds: number[]]
  detail: [id: number]
  delete: [id: number]
}

withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

// 格式化日期
function formatDate(dt?: string) {
  if (!dt) return '-'
  return dt.replace('T', ' ')
}

// 选择变化处理
function onSelectionChange(rows: OperationLogItem[]) {
  const selectedIds = rows.map(r => r.id)
  emit('selectionChange', selectedIds)
}

// 查看详情处理
function handleDetail(id: number) {
  emit('detail', id)
}

// 删除处理
function handleDelete(id: number) {
  emit('delete', id)
}
</script>

<style scoped>
.log-table-container {
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 4px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #409eff;
  font-size: 14px;
}

.time-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.mr-1 {
  margin-right: 4px;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.gap-1 {
  gap: 4px;
}
</style>

