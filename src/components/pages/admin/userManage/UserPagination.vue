<template>
  <div class="user-pagination-wrapper relative">
    <!-- 加载蒙层 -->
    <div v-if="loading" class="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 rounded-lg">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
        <span class="text-xs text-gray-600">数据更新中...</span>
      </div>
    </div>

    <div class="pagination-container flex justify-between items-center mt-4">
      <!-- 总数信息 -->
      <div class="total-info text-sm text-gray-600">
        共 <span class="font-semibold text-blue-600">{{ total }}</span> 条记录
      </div>

      <!-- 分页组件 -->
      <el-pagination
        v-model:current-page="currentPageValue"
        v-model:page-size="pageSizeValue"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        :disabled="loading"
        layout="sizes, prev, pager, next, jumper"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="pagination"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  total: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['page-change', 'size-change'])

// 响应式数据
const currentPageValue = ref(props.currentPage)
const pageSizeValue = ref(props.pageSize)

// 监听props变化
watch(() => props.currentPage, (newVal) => {
  currentPageValue.value = newVal
})

watch(() => props.pageSize, (newVal) => {
  pageSizeValue.value = newVal
})

// 事件处理
const handleCurrentChange = (page: number) => {
  emit('page-change', page)
}

const handleSizeChange = (size: number) => {
  emit('size-change', size)
}
</script>

<style scoped lang="scss">
.user-pagination-wrapper {
  .pagination-container {
    padding: 16px 30px;
    border-top: 1px solid #e5e7eb;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 0 0 8px 8px;

    .total-info {
      display: flex;
      align-items: center;
      gap: 4px;

      .font-semibold {
        font-weight: 600;
      }
    }

    .pagination {
      :deep(.el-pagination__sizes) {
        .el-select {
          .el-input {
            transition: all 0.3s ease;

            &:hover {
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
          }
        }
      }

      :deep(.btn-prev),
      :deep(.btn-next),
      :deep(.el-pager li) {
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }

      :deep(.el-pagination__jump) {
        .el-input {
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
        }
      }
    }
  }
}
</style>
