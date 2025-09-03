<template>
  <el-dialog 
    v-model="visible" 
    :title="null" 
    width="700px" 
    :show-close="false"
    align-center
    @update:model-value="handleVisibleChange"
  >
    <div v-if="file" class="p-6">
      <!-- 弹窗头部 -->
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <el-icon :size="32" class="text-white">
              <component :is="getFileIcon(file.file_type)" />
            </el-icon>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-2" :title="file.file_name">{{ file.file_name }}</h3>
            <div class="flex items-center gap-3">
              <el-tag size="small" :type="getFileTypeColor(file.file_type)">
                {{ getFileTypeLabel(file.file_type) }}
              </el-tag>
              <span class="text-sm text-gray-500">{{ formatFileSize(file.file_size) }}</span>
            </div>
          </div>
        </div>
        <el-button type="info" :icon="Delete" circle size="large" @click="handleClose" />
      </div>

      <!-- 文件预览区域 -->
      <div class="mb-6">
        <!-- 图片预览 -->
        <div v-if="file.file_type === 'image'" class="bg-gray-50 rounded-xl p-4">
          <div class="flex justify-center">
            <el-image 
              :src="getFileUrl(file.file_path)"
              :preview-src-list="[getFileUrl(file.file_path)]" 
              fit="contain" 
              class="max-h-80 rounded-lg"
              :preview-teleported="true"
              :hide-on-click-modal="true"
              :z-index="9999"
              :lazy="true"
              @click.stop
            >
              <template #error>
                <div class="flex flex-col items-center justify-center h-40 text-gray-400">
                  <el-icon :size="48">
                    <Picture />
                  </el-icon>
                  <p class="mt-2">图片加载失败</p>
                </div>
              </template>
            </el-image>
          </div>
        </div>

        <!-- 视频预览 -->
        <div v-else-if="file.file_type === 'media'" class="bg-gray-50 rounded-xl p-4">
          <div class="flex justify-center">
            <video :src="getFileUrl(file.file_path)" controls preload="metadata" class="max-h-80 rounded-lg">
              您的浏览器不支持视频播放
            </video>
          </div>
        </div>

        <!-- 其他文件类型 -->
        <div v-else class="bg-gray-50 rounded-xl p-8">
          <div class="flex flex-col items-center justify-center text-gray-400">
            <el-icon :size="64" class="mb-4">
              <component :is="getFileIcon(file.file_type)" />
            </el-icon>
            <p class="text-lg font-medium mb-1">{{ getFileTypeLabel(file.file_type) }}文件</p>
            <p class="text-sm">此文件类型不支持预览</p>
          </div>
        </div>
      </div>

      <!-- 文件信息区域 -->
      <div class="mb-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 p-3 rounded-lg">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">文件名称</label>
            <div class="mt-1 text-sm text-gray-900">{{ file.file_name }}</div>
          </div>
          <div class="bg-gray-50 p-3 rounded-lg">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">文件大小</label>
            <div class="mt-1 text-sm text-gray-900">{{ formatFileSize(file.file_size) }}</div>
          </div>
          <div class="bg-gray-50 p-3 rounded-lg">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">文件类型</label>
            <div class="mt-1 text-sm text-gray-900">{{ file.file_type }}</div>
          </div>
          <div class="bg-gray-50 p-3 rounded-lg">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">MIME类型</label>
            <div class="mt-1 text-sm text-gray-900">{{ file.mime_type || '未知' }}</div>
          </div>
          <div class="bg-gray-50 p-3 rounded-lg col-span-2">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">上传时间</label>
            <div class="mt-1 text-sm text-gray-900">{{ formatTime(file.upload_time) }}</div>
          </div>
          <div class="bg-gray-50 p-3 rounded-lg col-span-2">
            <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">文件描述</label>
            <div class="mt-1 text-sm text-gray-900">{{ file.description || '无描述' }}</div>
          </div>
        </div>
      </div>

      <!-- 操作按钮区域 -->
      <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <el-button type="primary" :icon="View" @click="handleDownload">
          下载文件
        </el-button>
        <el-button type="danger" :icon="Delete" @click="handleDelete">
          删除文件
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  View, 
  Delete, 
  Document, 
  Picture, 
  VideoPlay, 
  Headset, 
  Files 
} from '@element-plus/icons-vue'
import type { FileItem } from '@/types/factory'

// Props
interface Props {
  modelValue: boolean
  file: FileItem | null
}

const props = defineProps<Props>()

// Emits
interface Emits {
  'update:modelValue': [value: boolean]
  download: [file: FileItem]
  delete: [file: FileItem]
}

const emit = defineEmits<Emits>()

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// 方法
const handleVisibleChange = (value: boolean) => {
  emit('update:modelValue', value)
}

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleDownload = () => {
  if (props.file) {
    emit('download', props.file)
  }
}

const handleDelete = () => {
  if (props.file) {
    emit('delete', props.file)
  }
}

const getFileIcon = (fileType: string) => {
  const iconMap: Record<string, any> = {
    image: Picture,
    document: Document,
    media: VideoPlay,
    audio: Headset,
    default: Files
  }
  return iconMap[fileType] || iconMap.default
}

const getFileTypeLabel = (fileType: string) => {
  const labelMap: Record<string, string> = {
    image: '图片',
    document: '文档',
    media: '视频',
    audio: '音频',
    default: '文件'
  }
  return labelMap[fileType] || labelMap.default
}

const getFileTypeColor = (fileType: string) => {
  const colorMap: Record<string, string> = {
    image: 'success',
    document: 'info',
    media: 'warning',
    audio: 'danger',
    default: ''
  }
  return colorMap[fileType] || colorMap.default
}

const formatFileSize = (size: number): string => {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

const formatTime = (time: string): string => {
  return new Date(time).toLocaleString('zh-CN')
}

const getFileUrl = (filePath: string): string => {
  return `${import.meta.env.VITE_SERVER_PATH}/${filePath}`
}
</script>

<style scoped>
/* 保留必要的组件样式覆盖 */
:deep(.el-dialog__body) {
  padding: 0 !important;
}
</style>