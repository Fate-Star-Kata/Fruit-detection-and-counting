<template>
  <!-- 右键菜单 -->
  <div 
    v-show="visible" 
    class="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-40"
    :style="{ left: x + 'px', top: y + 'px' }" 
    @click.stop 
    @contextmenu.prevent
  >
    <!-- 文件右键菜单 -->
    <div v-if="type === 'file'">
      <div 
        class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors" 
        @click="handleViewDetail"
      >
        <el-icon>
          <View />
        </el-icon>
        <span>查看详情</span>
      </div>
      <div 
        class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors" 
        @click="handleDelete"
      >
        <el-icon>
          <Delete />
        </el-icon>
        <span>删除</span>
      </div>
      <div 
        class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors" 
        @click="handleCopyAddress"
      >
        <el-icon>
          <CopyDocument />
        </el-icon>
        <span>复制地址</span>
      </div>
    </div>

    <!-- 空白区域右键菜单 -->
    <div v-if="type === 'area'">
      <div 
        class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors" 
        @click="handleRefresh"
      >
        <el-icon>
          <Refresh />
        </el-icon>
        <span>刷新</span>
      </div>
      <div 
        class="relative flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors" 
        @mouseenter="showSortSubmenu = true" 
        @mouseleave="showSortSubmenu = false"
      >
        <div class="flex items-center gap-3">
          <el-icon>
            <Sort />
          </el-icon>
          <span>排序方式</span>
        </div>
        <el-icon class="text-gray-400">
          <ArrowRight />
        </el-icon>

        <!-- 排序子菜单 -->
        <div 
          v-show="showSortSubmenu" 
          class="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-32"
        >
          <div 
            class="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors" 
            @click="handleSort('name')"
          >
            <span>按名称</span>
            <el-icon v-if="sortBy === 'name'" class="text-blue-500">
              <Check />
            </el-icon>
          </div>
          <div 
            class="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors" 
            @click="handleSort('size')"
          >
            <span>按大小</span>
            <el-icon v-if="sortBy === 'size'" class="text-blue-500">
              <Check />
            </el-icon>
          </div>
          <div 
            class="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors" 
            @click="handleSort('time')"
          >
            <span>按时间</span>
            <el-icon v-if="sortBy === 'time'" class="text-blue-500">
              <Check />
            </el-icon>
          </div>
          <div 
            class="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors" 
            @click="handleSort('type')"
          >
            <span>按类型</span>
            <el-icon v-if="sortBy === 'type'" class="text-blue-500">
              <Check />
            </el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 遮罩层，用于关闭右键菜单 -->
  <div v-show="visible" class="fixed inset-0 z-40" @click="handleHide"></div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  View,
  Delete,
  CopyDocument,
  Refresh,
  Sort,
  ArrowRight,
  Check
} from '@element-plus/icons-vue'
import type { FileItem } from '@/types/factory'

// Props
interface Props {
  visible: boolean
  x: number
  y: number
  type: 'file' | 'area'
  file: FileItem | null
  sortBy: string
}

const props = defineProps<Props>()

// Emits
interface Emits {
  hide: []
  viewDetail: [file: FileItem]
  delete: [file: FileItem]
  copyAddress: [file: FileItem]
  refresh: []
  sort: [sortBy: string]
}

const emit = defineEmits<Emits>()

// 响应式数据
const showSortSubmenu = ref(false)

// 方法
const handleHide = () => {
  showSortSubmenu.value = false
  emit('hide')
}

const handleViewDetail = () => {
  if (props.file) {
    emit('viewDetail', props.file)
  }
  handleHide()
}

const handleDelete = () => {
  if (props.file) {
    emit('delete', props.file)
  }
  handleHide()
}

const handleCopyAddress = () => {
  if (props.file) {
    emit('copyAddress', props.file)
  }
  handleHide()
}

const handleRefresh = () => {
  emit('refresh')
  handleHide()
}

const handleSort = (sortBy: string) => {
  emit('sort', sortBy)
  handleHide()
}
</script>

<style scoped>
/* 组件特定样式 */
</style>