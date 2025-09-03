<template>
  <div class="pagination-container">
    <!-- 加载状态蒙层 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        <span>数据更新中...</span>
      </div>
    </div>

    <el-pagination 
      v-model:current-page="currentPageModel" 
      v-model:page-size="pageSizeModel"
      :total="total" 
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper" 
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange" 
      background 
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Loading } from '@element-plus/icons-vue'

interface Props {
  currentPage: number
  pageSize: number
  total: number
  loading?: boolean
}

interface Emits {
  sizeChange: [size: number]
  currentChange: [page: number]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

// 当前页码的计算属性
const currentPageModel = computed({
  get: () => props.currentPage,
  set: (value) => emit('currentChange', value)
})

// 每页大小的计算属性
const pageSizeModel = computed({
  get: () => props.pageSize,
  set: (value) => emit('sizeChange', value)
})

// 页大小变化处理
function handleSizeChange(size: number) {
  emit('sizeChange', size)
}

// 当前页变化处理
function handleCurrentChange(page: number) {
  emit('currentChange', page)
}
</script>

<style scoped>
.pagination-container {
  position: relative;
  padding: 16px 0;
  display: flex;
  justify-content: center;
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
</style>