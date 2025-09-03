<template>
  <el-card shadow="never" class="search-card">
    <!-- 加载状态蒙层 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        <span>数据更新中...</span>
      </div>
    </div>

    <el-form :inline="true" class="search-form">
      <el-form-item label="搜索">
        <el-input 
          v-model="searchForm.search" 
          placeholder="描述 / 用户名 / 模块" 
          :prefix-icon="Search" 
          clearable
          style="width: 260px" 
          @keyup.enter.native="handleSearch" 
        />
      </el-form-item>

      <el-form-item label="操作类型">
        <el-select 
          v-model="searchForm.action_type" 
          placeholder="全部" 
          clearable 
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option 
            v-for="(opt, idx) in actionTypeOptions" 
            :key="idx" 
            :label="opt[1]" 
            :value="opt[0]" 
          />
        </el-select>
      </el-form-item>

      <el-form-item label="模块">
        <el-select 
          v-model="searchForm.module" 
          placeholder="全部" 
          clearable 
          filterable 
          style="width: 200px"
          @change="handleSearch"
        >
          <el-option 
            v-for="m in moduleOptions" 
            :key="m" 
            :label="m" 
            :value="m" 
          />
        </el-select>
      </el-form-item>

      <el-form-item label="用户ID">
        <el-input 
          v-model="searchForm.user_id" 
          placeholder="可填用户ID" 
          clearable 
          style="width: 140px"
          @keyup.enter.native="handleSearch" 
        />
      </el-form-item>

      <el-form-item label="日期范围">
        <el-date-picker 
          v-model="dateRange" 
          type="daterange" 
          range-separator="至" 
          start-placeholder="开始日期"
          end-placeholder="结束日期" 
          value-format="YYYY-MM-DD" 
          style="width: 280px" 
          @change="onDateRangeChange" 
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>

      <el-form-item style="margin-left: auto">
        <el-button :icon="Refresh" @click="handleRefresh" :loading="loading">刷新</el-button>
        <el-button 
          type="danger" 
          :icon="Delete" 
          :disabled="selectedIds.length === 0"
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
        <el-popover 
          v-model:visible="popoverVisible" 
          placement="bottom" 
          trigger="manual" 
          :width="'auto'"
          popper-class="clear-log-popover" 
          :hide-after="0" 
          :persistent="true" 
          :teleported="true"
        >
          <template #reference>
            <el-button 
              class="clear-log-trigger" 
              type="warning" 
              :icon="Delete" 
              @click="togglePopover"
            >
              清空日志
            </el-button>
          </template>
          <div class="clear-panel" @click.stop>
            <el-radio-group v-model="clearForm.mode" class="mb-3">
              <el-radio label="days">按天数</el-radio>
              <el-radio label="range">按日期范围</el-radio>
            </el-radio-group>

            <!-- 按天数模式 -->
            <div v-if="clearForm.mode === 'days'" class="days-mode">
              <div class="mb-2">
                <label class="text-sm text-gray-600 mb-1 block">清空天数：</label>
                <div class="flex items-center gap-2">
                  <el-input-number 
                    v-model="clearForm.days" 
                    :min="0" 
                    :max="365" 
                    :step="1" 
                    size="default"
                    class="flex-1" 
                  />
                  <span class="text-sm text-gray-500">天内的日志</span>
                </div>
                <div class="mt-1 text-xs text-gray-400">
                  设为0则清空所有日志，结束日期为昨天
                </div>
              </div>

              <!-- 快捷天数设置 -->
              <div class="mb-2">
                <label class="text-sm text-gray-600 mb-1 block">快捷设置：</label>
                <div class="flex flex-wrap gap-1">
                  <el-button size="small" @click.stop="clearForm.days = 1">昨天1天</el-button>
                  <el-button size="small" @click.stop="clearForm.days = 7">近7天</el-button>
                  <el-button size="small" @click.stop="clearForm.days = 30">近30天</el-button>
                  <el-button size="small" @click.stop="clearForm.days = 90">近90天</el-button>
                </div>
              </div>
            </div>

            <!-- 按日期范围模式 -->
            <div v-else class="range-mode">
              <!-- 快捷选择按钮 -->
              <div class="mb-3">
                <label class="text-sm text-gray-600 mb-1 block">快捷选择：</label>
                <div class="flex flex-wrap gap-1">
                  <el-button size="small" @click.stop="setQuickRange('yesterday')">昨天</el-button>
                  <el-button size="small" @click.stop="setQuickRange('last7days')">近7天</el-button>
                  <el-button size="small" @click.stop="setQuickRange('last30days')">近30天</el-button>
                  <el-button size="small" @click.stop="setQuickRange('thisMonth')">本月</el-button>
                  <el-button size="small" @click.stop="setQuickRange('lastMonth')">上月</el-button>
                </div>
              </div>

              <!-- 日期选择器 -->
              <div class="date-selectors">
                <div class="mb-2">
                  <label class="text-sm text-gray-600 mb-1 block">开始日期：</label>
                  <input 
                    v-model="clearForm.startDate" 
                    type="date" 
                    class="input input-bordered w-full"
                    :max="getMaxDate()" 
                    @change="onDateChange" 
                    @click.stop 
                  />
                </div>

                <div class="mb-2">
                  <label class="text-sm text-gray-600 mb-1 block">结束日期：</label>
                  <input 
                    v-model="clearForm.endDate" 
                    type="date" 
                    class="input input-bordered w-full"
                    :min="clearForm.startDate || undefined" 
                    :max="getMaxDate()" 
                    @change="onDateChange" 
                    @click.stop 
                  />
                </div>
              </div>
            </div>

            <div class="mt-4 flex justify-end gap-2">
              <el-button size="small" @click.stop="closePopover">取消</el-button>
              <el-button size="small" @click.stop="doClear(false)">预览参数</el-button>
              <el-button size="small" type="warning" @click.stop="doClear(true)">确认清空</el-button>
            </div>
          </div>
        </el-popover>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Delete, Loading } from '@element-plus/icons-vue'
import type { OperationLogsListRequest } from '@/types/factory'

interface Props {
  searchParams: OperationLogsListRequest
  actionTypeOptions: [string, string][]
  moduleOptions: string[]
  selectedIds: number[]
  loading?: boolean
}

interface Emits {
  search: []
  reset: []
  refresh: []
  batchDelete: []
  clear: [params: any]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

// 本地搜索表单数据
const searchForm = reactive<OperationLogsListRequest>({
  search: '',
  page: 1,
  page_size: 20,
  action_type: undefined,
  module: undefined,
  user_id: undefined,
  start_date: undefined,
  end_date: undefined
})

const dateRange = ref<string[] | null>(null)
const popoverVisible = ref(false)

const clearForm = reactive({
  mode: 'days' as 'days' | 'range',
  days: 0,
  range: [] as string[] | [],
  startDate: '',
  endDate: ''
})

// 监听父组件传入的搜索参数变化
watch(() => props.searchParams, (newParams) => {
  Object.assign(searchForm, newParams)
  // 同步日期范围
  if (newParams.start_date && newParams.end_date) {
    dateRange.value = [newParams.start_date, newParams.end_date]
  } else {
    dateRange.value = null
  }
}, { immediate: true, deep: true })

// 获取最大日期（昨天）
function getMaxDate() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

// 日期变化处理
function onDateChange() {
  // 同步更新 range 数组（保持兼容性）
  if (clearForm.startDate && clearForm.endDate) {
    clearForm.range = [clearForm.startDate, clearForm.endDate]
  } else {
    clearForm.range = []
  }
}

// 手动关闭 Popover
function closePopover() {
  popoverVisible.value = false
}

// 切换 Popover 显示状态
function togglePopover() {
  popoverVisible.value = !popoverVisible.value
}

// 快捷日期设置
function setQuickRange(type: string) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  switch (type) {
    case 'yesterday':
      clearForm.startDate = yesterday.toISOString().split('T')[0]
      clearForm.endDate = yesterday.toISOString().split('T')[0]
      break
    case 'last7days':
      const start7 = new Date(yesterday)
      start7.setDate(yesterday.getDate() - 6)
      clearForm.startDate = start7.toISOString().split('T')[0]
      clearForm.endDate = yesterday.toISOString().split('T')[0]
      break
    case 'last30days':
      const start30 = new Date(yesterday)
      start30.setDate(yesterday.getDate() - 29)
      clearForm.startDate = start30.toISOString().split('T')[0]
      clearForm.endDate = yesterday.toISOString().split('T')[0]
      break
    case 'thisMonth':
      const startMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      // 如果本月还没结束，结束日期设为昨天
      const actualEnd = endMonth.getTime() < yesterday.getTime() ? endMonth : yesterday
      clearForm.startDate = startMonth.toISOString().split('T')[0]
      clearForm.endDate = actualEnd.toISOString().split('T')[0]
      break
    case 'lastMonth':
      const startLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const endLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      clearForm.startDate = startLastMonth.toISOString().split('T')[0]
      clearForm.endDate = endLastMonth.toISOString().split('T')[0]
      break
  }

  // 同步更新 range 数组
  onDateChange()
}

// 日期范围变化处理
function onDateRangeChange() {
  if (dateRange.value && dateRange.value.length === 2) {
    searchForm.start_date = dateRange.value[0]
    searchForm.end_date = dateRange.value[1]
  } else {
    searchForm.start_date = undefined
    searchForm.end_date = undefined
  }
}

// 搜索处理
function handleSearch() {
  // 将本地表单数据同步到父组件
  Object.assign(props.searchParams, searchForm)
  emit('search')
}

// 重置处理
function handleReset() {
  searchForm.search = ''
  searchForm.action_type = undefined
  searchForm.module = undefined
  searchForm.user_id = undefined
  dateRange.value = null
  searchForm.start_date = undefined
  searchForm.end_date = undefined
  searchForm.page = 1
  
  // 同步到父组件
  Object.assign(props.searchParams, searchForm)
  emit('reset')
}

// 刷新处理
function handleRefresh() {
  emit('refresh')
}

// 批量删除处理
function handleBatchDelete() {
  emit('batchDelete')
}

// 清空日志处理
function doClear(confirmDo: boolean) {
  const params: any = {}

  if (clearForm.mode === 'days') {
    // 计算起始时间和结束时间
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    // 结束时间为昨天
    const endDate = yesterday.toISOString().split('T')[0]

    // 起始时间为昨天往前推 days 天
    const startDate = new Date(yesterday)
    startDate.setDate(yesterday.getDate() - clearForm.days)
    const startDateStr = startDate.toISOString().split('T')[0]

    params.days = clearForm.days
    params.start_date = startDateStr
    params.end_date = endDate
  } else if (clearForm.mode === 'range') {
    // 使用新的独立日期字段
    if (!clearForm.startDate || !clearForm.endDate) {
      ElMessage.warning('请选择完整的日期范围')
      return
    }
    params.start_date = clearForm.startDate
    params.end_date = clearForm.endDate
  }

  if (!confirmDo) {
    ElMessage.info(`将以参数 ${JSON.stringify(params)} 发起清理`)
    return
  }

  emit('clear', params)
  closePopover()
}
</script>

<style scoped>
.search-card {
  position: relative;
  margin-bottom: 16px;
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

.search-form {
  margin: 0;
}

.clear-panel {
  min-width: 300px;
  padding: 16px;
}

.days-mode,
.range-mode {
  margin-bottom: 16px;
}

.date-selectors .input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.date-selectors .input:focus {
  border-color: #409eff;
  outline: none;
}

.mb-1 {
  margin-bottom: 4px;
}

.mb-2 {
  margin-bottom: 8px;
}

.mb-3 {
  margin-bottom: 12px;
}

.mt-1 {
  margin-top: 4px;
}

.mt-4 {
  margin-top: 16px;
}

.text-sm {
  font-size: 14px;
}

.text-xs {
  font-size: 12px;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}

.block {
  display: block;
}

.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.flex-wrap {
  flex-wrap: wrap;
}

.items-center {
  align-items: center;
}

.justify-end {
  justify-content: flex-end;
}

.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}

.w-full {
  width: 100%;
}
</style>