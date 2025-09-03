<template>
  <div class="pagination-container">
    <el-pagination 
      v-model:current-page="currentPageModel" 
      v-model:page-size="pageSizeModel" 
      :total="total"
      :page-sizes="[10, 20, 50, 100]" 
      layout="total, sizes, prev, pager, next, jumper" 
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange" 
      background 
      :disabled="loading"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface Props {
  currentPage: number
  pageSize: number
  total: number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Emits
interface Emits {
  sizeChange: [size: number]
  currentChange: [page: number]
}

const emit = defineEmits<Emits>()

// 计算属性
const currentPageModel = computed({
  get: () => props.currentPage,
  set: (value: number) => {
    emit('currentChange', value)
  }
})

const pageSizeModel = computed({
  get: () => props.pageSize,
  set: (value: number) => {
    emit('sizeChange', value)
  }
})

// 方法
const handleSizeChange = (size: number) => {
  emit('sizeChange', size)
}

const handleCurrentChange = (page: number) => {
  emit('currentChange', page)
}
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 16px 0;
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-light);
}

:deep(.el-pagination) {
  --el-pagination-font-size: 14px;
  --el-pagination-bg-color: var(--el-bg-color);
  --el-pagination-text-color: var(--el-text-color-primary);
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: var(--el-color-primary);
  color: var(--el-color-white);
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled):hover) {
  color: var(--el-color-primary);
}

:deep(.el-pagination__total) {
  color: var(--el-text-color-regular);
  font-weight: 400;
}

:deep(.el-pagination__sizes .el-select .el-select__wrapper) {
  background-color: var(--el-bg-color);
  border-color: var(--el-border-color);
}

:deep(.el-pagination__jump) {
  color: var(--el-text-color-regular);
}

:deep(.el-pagination__jump .el-input__wrapper) {
  background-color: var(--el-bg-color);
  border-color: var(--el-border-color);
}
</style>