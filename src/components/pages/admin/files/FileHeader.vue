<template>
  <div class="bg-white p-5 rounded-xl shadow-lg mb-5">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center space-x-4">
        <h2 class="text-2xl font-bold text-gray-800">文件管理</h2>
        <el-tag type="info" size="small">{{ fileStats.total }} 个文件</el-tag>
      </div>
      <div class="flex items-center space-x-3">
        <el-select 
          v-model="filters.fileType" 
          placeholder="文件类型" 
          clearable 
          size="default" 
          style="width: 120px"
          @change="handleFilterChange"
        >
          <el-option label="图片" value="image" />
          <el-option label="文档" value="document" />
          <el-option label="视频" value="media" />
          <el-option label="音频" value="audio" />
        </el-select>
        <el-button type="primary" @click="handleUpload" :icon="Upload">
          上传文件
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Upload } from '@element-plus/icons-vue'

// Props
interface Props {
  fileStats: {
    total: number
  }
}

const props = defineProps<Props>()

// Emits
interface Emits {
  filterChange: [fileType: string]
  upload: []
}

const emit = defineEmits<Emits>()

// 响应式数据
const filters = reactive({
  fileType: ''
})

// 方法
const handleFilterChange = () => {
  emit('filterChange', filters.fileType)
}

const handleUpload = () => {
  emit('upload')
}
</script>

<style scoped>
/* 组件特定样式 */
</style>