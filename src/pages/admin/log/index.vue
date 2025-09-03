<template>
  <div class="admin-log-page h-full flex flex-col">
    <!-- 搜索和操作栏 -->
    <LogSearchForm
      :search-params="searchParams"
      :action-type-options="actionTypeOptions"
      :module-options="moduleOptions"
      :selected-ids="selectedIds"
      :loading="loading"
      @search="handleSearch"
      @reset="handleReset"
      @refresh="handleRefresh"
      @batch-delete="handleBatchDelete"
      @clear="handleClear"
    />

    <!-- 列表 -->
    <el-card shadow="never" class="list-card flex-1 min-h-0">
      <template #header>
        <div class="list-header">
          <span class="list-title">操作日志</span>
          <span class="list-sub">共 {{ pagination.total_count }} 条</span>
        </div>
      </template>

      <LogTable
        :log-list="list"
        :loading="loading"
        @selection-change="handleSelectionChange"
        @detail="handleDetail"
        @delete="handleDelete"
      />

      <LogPagination
      :currentPage="searchParams.page || 1"
      :pageSize="searchParams.page_size || 20"
      :total="pagination.total_count || 0"
      :loading="loading"
      @sizeChange="handleSizeChange"
      @currentChange="handleCurrentChange"
    />
    </el-card>

    <!-- 详情抽屉 -->
    <LogDetailDrawer
      v-model="detail.visible"
      :detail-data="detail.data"
      :loading="detail.loading"
      @close="detail.visible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { logsApi } from '@/api/admin/logs'
import LogSearchForm from '@/components/pages/admin/log/LogSearchForm.vue'
import LogTable from '@/components/pages/admin/log/LogTable.vue'
import LogPagination from '@/components/pages/admin/log/LogPagination.vue'
import LogDetailDrawer from '@/components/pages/admin/log/LogDetailDrawer.vue'
import type {
  OperationLogItem,
  OperationLogDetail,
  OperationLogsListRequest,
  OperationLogsPaginationInfo
} from '@/types/factory'

const loading = ref(false)
const list = ref<OperationLogItem[]>([])
const actionTypeOptions = ref<[string, string][]>([])
const moduleOptions = ref<string[]>([])
const pagination = reactive<OperationLogsPaginationInfo>({
  current_page: 1,
  total_pages: 1,
  total_count: 0,
  page_size: 20,
  has_next: false,
  has_previous: false
})

const searchParams = reactive<OperationLogsListRequest>({
  search: '',
  page: 1 as number,
  page_size: 20 as number,
  action_type: undefined,
  module: undefined,
  user_id: undefined,
  start_date: undefined,
  end_date: undefined
})

const selectedIds = ref<number[]>([])



const detail = reactive<{ visible: boolean; loading: boolean; data: OperationLogDetail | null }>({
  visible: false,
  loading: false,
  data: null
})





async function getList() {
  try {
    loading.value = true
    const { data } = await logsApi.getOperationLogs({ ...searchParams })
    list.value = data.logs || []
    Object.assign(pagination, data.pagination)
    // 过滤项（去重模块）
    actionTypeOptions.value = data.filters?.action_types || []
    const set = new Set<string>((data.filters?.modules || []).filter(Boolean))
    moduleOptions.value = Array.from(set)
  } catch (e: any) {
    ElMessage.error(e?.message || '获取日志失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  getList()
}

function handleReset() {
  getList()
}

function handleRefresh() {
  getList()
}

function handleSizeChange(size: number) {
  searchParams.page_size = size
  searchParams.page = 1
  getList()
}

function handleCurrentChange(page: number) {
  searchParams.page = page
  getList()
}

function handleSelectionChange(ids: number[]) {
  selectedIds.value = ids
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm('确定删除该条日志吗？', '提示', { type: 'warning' })
    const res = await logsApi.deleteOperationLog(id)
    ElMessage.success(res.data || '删除成功')
    getList()
  } catch (e) {
    if (String(e).includes('cancel')) return
  }
}

async function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的日志')
    return
  }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条日志吗？`, '提示', {
      type: 'warning'
    })
    const res = await logsApi.batchDeleteOperationLogs({ log_ids: selectedIds.value })
    ElMessage.success(res.data || '删除成功')
    selectedIds.value = []
    getList()
  } catch (e) {
    if (String(e).includes('cancel')) return
  }
}

async function handleClear(params: any) {
  try {
    let confirmText = '此操作不可恢复，确认清空指定范围内的日志吗？'
    if (params.days === 0) {
      confirmText = '此操作将清空所有日志，不可恢复，确认继续吗？'
    }
    await ElMessageBox.confirm(confirmText, '危险操作', {
      type: 'warning',
    })
    await logsApi.clearOperationLogs(params)
    ElMessage.success('清空完成')
    getList()
  } catch (e) {
    if (String(e).includes('cancel')) return
  }
}



async function handleDetail(id: number) {
  detail.visible = true
  detail.loading = true
  detail.data = null
  try {
    const { data } = await logsApi.getOperationLogDetail(id)
    detail.data = data
  } catch (e) {
    ElMessage.error('获取详情失败')
  } finally {
    detail.loading = false
  }
}

onMounted(() => {
  getList()
})

onUnmounted(() => {
  // 组件卸载时的清理工作
})
</script>

<style scoped>
.search-card {
  margin-bottom: 12px;
  flex-shrink: 0;
}

.list-card {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.table-container {
  flex: 1;
  min-height: 0;
  overflow: auto;
  max-height: 500px;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list-title {
  font-weight: 600;
}

.list-sub {
  color: var(--el-color-info);
  font-size: 12px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 12px 0;
  flex-shrink: 0;
}

.clear-panel {
  padding: 16px;
  min-width: 420px;
  max-width: 500px;
  width: auto;
  box-sizing: border-box;
}

.clear-panel .days-mode {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.clear-panel .range-mode {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.clear-panel .date-selectors {
  background: white;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  width: 100%;
  box-sizing: border-box;
}

.clear-panel .quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
  width: 100%;
  box-sizing: border-box;
}

.clear-panel .quick-buttons .el-button {
  font-size: 12px;
  padding: 4px 8px;
  flex: 0 0 auto;
  white-space: nowrap;
}

.clear-panel label {
  font-weight: 500;
  color: #606266;
}

.detail-content :deep(.el-descriptions__label) {
  width: 120px;
}

/* 全局样式 - 清空日志弹窗 */
:global(.clear-log-popover) {
  min-width: 420px !important;
  max-width: 500px !important;
  width: auto !important;
  z-index: 2000 !important;
}

/* 确保日期选择器下拉面板不会被其他元素遮挡 */
:global(.el-date-picker__popper) {
  z-index: 2100 !important;
}

/* 专门针对弹窗内日期选择器的样式 */
:global(.date-picker-in-popover) {
  z-index: 2200 !important;
}

/* 阻止日期选择器面板点击事件冒泡 */
:global(.date-picker-no-close) {
  z-index: 2200 !important;
}

:global(.date-picker-no-close .el-picker-panel) {
  z-index: 2300 !important;
}

:global(.date-picker-no-close .el-date-picker__header) {
  pointer-events: auto;
}

:global(.date-picker-no-close .el-date-picker__content) {
  pointer-events: auto;
}

/* 防止日期选择器面板触发 Popover 关闭 */
:global(.el-picker-panel) {
  pointer-events: auto !important;
}

:global(.el-date-picker) {
  pointer-events: auto !important;
}
</style>
