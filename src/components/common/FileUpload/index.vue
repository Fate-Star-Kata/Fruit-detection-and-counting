<template>
  <div class="file-upload-container">
    <el-upload ref="uploadRef" class="upload-demo" :drag="drag" :action="action" :accept="accept" :disabled="disabled"
      :auto-upload="autoUpload" :show-file-list="true" :multiple="multiple" :before-upload="handleBeforeUpload"
      v-model:file-list="fileList">
      <div class="upload-content">
        <div class="upload-icon">
          <el-icon class="el-icon--upload">
            <upload-filled />
          </el-icon>
        </div>
        <div class="upload-text">
          <div class="el-upload__text">
            拖拽文件到此处或<em>点击上传</em>
          </div>
          <div class="el-upload__tip">
            支持格式: {{ acceptText }}
          </div>
        </div>
      </div>
    </el-upload>

    <!-- 上传进度显示 -->
    <div class="upload-progress-section" v-if="uploadProgress.size > 0">
      <div class="progress-title">上传进度</div>
      <div class="progress-list">
        <div v-for="[fileId, progress] in uploadProgress" :key="fileId" class="progress-item">
          <div class="progress-info">
            <div class="file-name">{{ progress.name }}</div>
            <div class="progress-status">
              <span class="progress-text">{{ progress.progress }}%</span>
              <el-icon v-if="progress.status === 'success'" class="status-icon success">
                <Check />
              </el-icon>
              <el-icon v-else-if="progress.status === 'error'" class="status-icon error">
                <Close />
              </el-icon>
            </div>
          </div>
          <el-progress :percentage="progress.progress"
            :status="progress.status === 'success' ? 'success' : progress.status === 'error' ? 'exception' : undefined"
            :stroke-width="6" :show-text="false" />
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="upload-actions">
      <el-button type="primary" @click="submitUpload" :loading="isUploading"
        :disabled="fileList.length === 0 || disabled">
        {{ isUploading ? '上传中...' : '开始上传' }}
      </el-button>
      <el-button @click="clearFiles" :disabled="isUploading" v-if="fileList.length > 0">
        清空文件
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Check, Close } from '@element-plus/icons-vue'
import type { UploadUserFile, ElUpload } from 'element-plus'
import serverConfig from '@/configs'
import { uploadFile } from '@/api/common/file'
import type { AxiosProgressEvent } from 'axios'

// 文件上传进度接口
interface FileProgress {
  id: string
  name: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  file: UploadUserFile
}

// 定义属性
interface Props {
  disabled?: boolean
  accept?: string
  action?: string
  autoUpload?: boolean
  drag?: boolean
  multiple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  accept: '',
  action: serverConfig.FileUploadUrl,
  autoUpload: false,
  drag: true,
  multiple: true
})

// 定义事件
interface Emits {
  (e: 'success', response: any, file: UploadUserFile): void
  (e: 'error', error: any, file: UploadUserFile): void
  (e: 'change', fileList: UploadUserFile[]): void
  (e: 'progress', progress: FileProgress): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const uploadRef = ref<InstanceType<typeof ElUpload>>()
const fileList = ref<UploadUserFile[]>([])
const isUploading = ref(false)
const uploadProgress = ref<Map<string, FileProgress>>(new Map())

// 计算属性
const acceptText = computed(() => {
  if (!props.accept) return '图片、文档、视频等所有格式'
  return props.accept.split(',').map(type => type.trim().replace('.', '')).join(', ')
})

// 方法
const handleBeforeUpload = (rawFile: File) => {
  // 阻止自动上传，只添加到文件列表
  return false
}

// 监听文件列表变化，触发 change 事件
watch(fileList, (newFileList) => {
  console.log('fileList', newFileList);

  emit('change', newFileList)
}, { deep: true })

const submitUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择文件')
    return
  }

  if (isUploading.value) return

  isUploading.value = true

  try {
    // 手动触发每个文件的上传
    for (const file of fileList.value) {
      if (file.raw && file.status !== 'success') {
        await uploadSingleFile(file)
      }
    }
    ElMessage.success('所有文件上传成功')
  } catch (error) {
    ElMessage.error('文件上传失败')
    console.error('Upload error:', error)
  } finally {
    isUploading.value = false
  }
}

const uploadSingleFile = (file: UploadUserFile): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!(file.raw instanceof File)) {
      reject(new Error('文件数据不存在'))
      return
    }

    const fileId = String(file.uid) || Date.now().toString()

    // 初始化进度信息
    const progressInfo: FileProgress = {
      id: fileId,
      name: file.name || '',
      progress: 0,
      status: 'uploading',
      file: file
    }
    uploadProgress.value.set(fileId, progressInfo)

    // 进度回调函数
    const onProgress = (progressEvent: AxiosProgressEvent) => {
      if (progressEvent.lengthComputable && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
        const currentProgress = uploadProgress.value.get(fileId)
        if (currentProgress) {
          currentProgress.progress = progress
          const updatedProgress = { ...currentProgress }
          uploadProgress.value.set(fileId, updatedProgress)
          emit('progress', updatedProgress)
        }
      }
    }

    uploadFile(file.raw, props.action, onProgress)
      .then(data => {
        file.status = 'success'
        const currentProgress = uploadProgress.value.get(fileId)
        if (currentProgress) {
          currentProgress.status = 'success'
          currentProgress.progress = 100
          uploadProgress.value.set(fileId, { ...currentProgress })
        }
        emit('success', data, file)
        resolve()
      })
      .catch(error => {
        file.status = 'fail'
        const currentProgress = uploadProgress.value.get(fileId)
        if (currentProgress) {
          currentProgress.status = 'error'
          uploadProgress.value.set(fileId, { ...currentProgress })
        }
        emit('error', error, file)
        reject(error)
      })
  })
}


const clearFiles = () => {
  fileList.value = []
  uploadProgress.value.clear()
  uploadRef.value?.clearFiles()
  emit('change', [])
}
</script>

<style scoped>
.file-upload-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.upload-demo {
  width: 100%;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.upload-icon {
  font-size: 48px;
  color: #8c939d;
  margin-bottom: 16px;
}

.upload-text {
  text-align: center;
}

.el-upload__text {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.el-upload__text em {
  color: #409eff;
  font-style: normal;
}

.el-upload__tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.upload-progress-section {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.progress-title {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 12px;
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-item {
  background: white;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.file-name {
  font-size: 13px;
  color: #495057;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 12px;
}

.progress-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.progress-text {
  font-size: 12px;
  color: #6c757d;
  font-weight: 600;
  min-width: 35px;
  text-align: right;
}

.status-icon {
  font-size: 14px;
}

.status-icon.success {
  color: #28a745;
}

.status-icon.error {
  color: #dc3545;
}

.upload-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

/* 自定义 el-upload 拖拽区域样式 */
:deep(.el-upload-dragger) {
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  background-color: #fafafa;
  text-align: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  padding: 40px 20px;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-upload-dragger:hover) {
  border-color: #409eff;
  background-color: #f5f7fa;
}

:deep(.el-upload-dragger.is-dragover) {
  border-color: #409eff;
  background-color: #ecf5ff;
  transform: scale(1.02);
}

/* 文件列表样式 */
:deep(.el-upload-list) {
  margin-top: 16px;
}

:deep(.el-upload-list__item) {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 8px;
  padding: 8px 12px;
  transition: all 0.3s ease;
}

:deep(.el-upload-list__item:hover) {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

:deep(.el-upload-list__item-name) {
  color: #606266;
  font-size: 14px;
}

:deep(.el-upload-list__item-status-label) {
  color: #67c23a;
}

:deep(.el-upload-list__item .el-icon--close) {
  color: #c0c4cc;
  transition: color 0.3s ease;
}

:deep(.el-upload-list__item .el-icon--close:hover) {
  color: #f56c6c;
}

/* 响应式设计 */
@media (max-width: 640px) {
  :deep(.el-upload-dragger) {
    padding: 30px 15px;
    min-height: 150px;
  }

  .upload-actions {
    flex-direction: column;
  }

  .upload-actions .el-button {
    width: 100%;
  }
}
</style>