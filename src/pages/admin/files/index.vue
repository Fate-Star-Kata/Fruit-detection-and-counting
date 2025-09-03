<template>
  <div class="h-full overflow-y-auto p-5 bg-gradient-to-br from-slate-50 to-blue-100 min-h-screen">
    <!-- 头部操作区 -->
    <FileHeader
      :file-stats="fileStats"
      :filters="filters"
      @update:filters="filters = $event"
      @upload="showUploadDialog = true"
    />

    <!-- 文件列表区域 -->
    <FileList
      ref="fileListRef"
      :loading="loading.list"
      :file-list="fileList"
      :pagination="pagination"
      :file-stats="fileStats"
      @file-click="handleFileClick"
      @file-context-menu="handleFileContextMenu"
      @area-context-menu="handleAreaContextMenu"
      @view-detail="viewFileDetail"
      @delete-file="deleteFile"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 上传弹窗 -->
    <FileUploadModal 
      v-model:visible="showUploadDialog" 
      :max-file-size="10 * 1024 * 1024"
      accepted-types=".jpg,.jpeg,.png,.doc,.docx,.rar,.zip,.7z,.pptx,.pdf,.mp3,.mp4,.avi" 
      :multiple="true"
      @upload="handleFileUpload" 
      @success="handleUploadSuccess" 
      @error="handleUploadError" 
    />

    <!-- 文件详情对话框 -->
    <FileDetailDialog
      v-model="showDetailDialog"
      :file="selectedFile"
      @download="downloadFile"
      @delete="deleteFileFromDetail"
    />

    <!-- 右键菜单 -->
    <FileContextMenu
      :visible="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :type="contextMenu.type"
      :file="contextMenu.file"
      :sort-by="sortBy"
      @hide="hideContextMenu"
      @view-detail="viewFileDetail"
      @delete="deleteFile"
      @copy-address="copyFileAddress"
      @refresh="refreshFileList"
      @sort="setSortBy"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { uploadFile } from '@/api/common/file'
import { getUploadUrl } from '@/api/admin/files'
import {
  Upload,
  View,
  Delete,
  Document,
  Picture,
  VideoPlay,
  Headset,
  Files,
  CopyDocument,
  Refresh,
  Sort,
  ArrowRight,
  Check
} from '@element-plus/icons-vue'

import { getUserFiles, getUserFileDetail, deleteUserFiles } from '@/api/admin/files'
import type { FileItem, } from '@/types/factory'
import FileUploadModal from '@/components/common/FileUploadModal/index.vue'
import FileHeader from '@/components/pages/admin/files/FileHeader.vue'
import FileList from '@/components/pages/admin/files/FileList.vue'
import FileDetailDialog from '@/components/pages/admin/files/FileDetailDialog.vue'
import FileContextMenu from '@/components/pages/admin/files/FileContextMenu.vue'

// 组件引用
const fileListRef = ref()

// 响应式数据
const loading = reactive({
  list: false,
  upload: false,
  detail: false
})

const pagination = reactive({
  page: 1,
  pageSize: 20
})

const filters = reactive({
  fileType: ''
})

const fileStats = reactive({
  total: 0
})

const fileList = ref<FileItem[]>([])
const selectedFile = ref<FileItem | null>(null)
const showUploadDialog = ref(false)
const showDetailDialog = ref(false)
const showSortSubmenu = ref(false)
const sortBy = ref('time')

// 右键菜单相关
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  type: '' as 'file' | 'area',
  file: null as FileItem | null
})

// 计算属性

// 方法
const loadFileList = async () => {
  loading.list = true
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.pageSize,
      ...(filters.fileType && { file_type: filters.fileType })
    }

    const response = await getUserFiles(params)
    let files = response.data.files

    // 应用排序
    if (sortBy.value) {
      files = files.sort((a, b) => {
        switch (sortBy.value) {
          case 'name':
            return a.file_name.localeCompare(b.file_name)
          case 'size':
            return a.file_size - b.file_size
          case 'time':
            return new Date(b.upload_time).getTime() - new Date(a.upload_time).getTime()
          case 'type':
            return a.file_type.localeCompare(b.file_type)
          default:
            return 0
        }
      })
    }

    fileList.value = files
    fileStats.total = response.data.total
  } catch (error) {
    ElMessage.error('获取文件列表失败')
  } finally {
    loading.list = false
  }
}

const handleFileClick = (file: FileItem) => {
  selectedFile.value = file
}

// 右键菜单相关方法
const handleFileContextMenu = (event: MouseEvent, file: FileItem) => {
  event.stopPropagation()

  // 先隐藏现有菜单，然后在新位置显示
  hideContextMenu()

  // 使用 nextTick 确保隐藏操作完成后再显示新菜单
  setTimeout(() => {
    contextMenu.visible = true
    contextMenu.x = event.clientX
    contextMenu.y = event.clientY
    contextMenu.type = 'file'
    contextMenu.file = file
    showSortSubmenu.value = false
  }, 10)
}

const handleAreaContextMenu = (event: MouseEvent) => {
  // 检查是否点击在文件项上
  const target = event.target as HTMLElement
  if (target.closest('.file-item')) {
    return
  }

  // 先隐藏现有菜单，然后在新位置显示
  hideContextMenu()

  // 使用 nextTick 确保隐藏操作完成后再显示新菜单
  setTimeout(() => {
    contextMenu.visible = true
    contextMenu.x = event.clientX
    contextMenu.y = event.clientY
    contextMenu.type = 'area'
    contextMenu.file = null
    showSortSubmenu.value = false
  }, 10)
}

const hideContextMenu = () => {
  contextMenu.visible = false
  showSortSubmenu.value = false
}

const copyFileAddress = async (file: FileItem) => {
  try {
    const fileUrl = getFileUrl(file.file_path)
    await navigator.clipboard.writeText(fileUrl)
    ElMessage.success('文件地址已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
  hideContextMenu()
}

const refreshFileList = () => {
  loadFileList()
  hideContextMenu()
}

const setSortBy = (sort: string) => {
  sortBy.value = sort
  // 这里可以添加排序逻辑
  loadFileList()
  hideContextMenu()
}

const viewFileDetail = async (file: FileItem) => {
  // 隐藏右键菜单
  hideContextMenu()

  loading.detail = true
  try {
    const response = await getUserFileDetail(file.id)
    selectedFile.value = response.data
    showDetailDialog.value = true
  } catch (error) {
    ElMessage.error('获取文件详情失败')
  } finally {
    loading.detail = false
  }
}

const deleteFile = async (file: FileItem) => {
  // 隐藏右键菜单
  hideContextMenu()

  try {
    await ElMessageBox.confirm(
      `确定要删除文件 "${file.file_name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteUserFiles({ file_ids: [file.id] })
    ElMessage.success('删除成功')
    await loadFileList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleFileUpload = async (files: File[]) => {
  loading.upload = true
  try {
    const uploadUrl = getUploadUrl()
    await Promise.all(files.map(file => uploadFile(file, uploadUrl)))
    ElMessage.success('上传成功')

    handleUploadSuccess()

    showUploadDialog.value = false
  } catch (error) {
    ElMessage.error('上传失败')
  } finally {
    loading.upload = false
  }
}

const handleUploadSuccess = (response?: any) => {
  setTimeout(async () => {
    await loadFileList()
  }, 2000)
  showUploadDialog.value = false
}

const handleUploadError = (error: Error) => {
  ElMessage.error('上传失败')
}



const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadFileList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadFileList()
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

const downloadFile = (file: FileItem) => {
  const url = getFileUrl(file.file_path)
  const link = document.createElement('a')
  link.href = url
  link.download = file.file_name
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const deleteFileFromDetail = async (file: FileItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文件 "${file.file_name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteUserFiles({ file_ids: [file.id] })
    ElMessage.success('删除成功')
    showDetailDialog.value = false
    await loadFileList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 监听筛选条件变化
watch(
  () => filters.fileType,
  () => {
    pagination.page = 1 // 重置到第一页
    loadFileList()
  }
)

// 全局右键事件处理函数
const handleGlobalContextMenu = (e: MouseEvent) => {
  // 只在文件管理页面阻止默认右键菜单
  const fileManagerContainer = document.querySelector('.file-manager-container')
  if (fileManagerContainer && fileManagerContainer.contains(e.target as Node)) {
    e.preventDefault()
  }
}

// 生命周期
onMounted(() => {
  loadFileList()

  // 阻止整个页面的默认右键菜单
  document.addEventListener('contextmenu', handleGlobalContextMenu)
})

onUnmounted(() => {
  // 清理事件监听器
  document.removeEventListener('contextmenu', handleGlobalContextMenu)
})
</script>

<style scoped>
/* 文件项过渡动画 */
.file-item-enter-active,
.file-item-leave-active {
  transition: all 0.3s ease;
}

.file-item-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.file-item-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* 保留必要的组件样式覆盖 */
:deep(.el-dialog__body) {
  padding: 0 !important;
}










</style>

