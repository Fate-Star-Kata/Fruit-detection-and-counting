<template>
  <el-card class="notification-item" shadow="hover">
    <!-- 卡片头部 -->
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <!-- 公开/私有状态 -->
          <el-tag :type="data.is_public ? 'success' : 'warning'" size="small">
            {{ data.is_public ? '公开' : '私有' }}
          </el-tag>

          <!-- 接收者数量 -->
          <el-tag v-if="data.recipient_count" type="info" size="small" class="ml-2">
            <el-icon class="mr-1">
              <UserFilled />
            </el-icon>
            {{ data.recipient_count }}人接收
          </el-tag>

          <!-- 是否启用 -->
          <el-tag :type="data.is_active ? 'success' : 'danger'" size="small" class="ml-2">
            <el-icon class="mr-1">
              <CircleCheckFilled v-if="data.is_active" />
              <CircleCloseFilled v-else />
            </el-icon>
            {{ data.is_active ? '已启用' : '已禁用' }}
          </el-tag>
        </div>

        <div class="header-right">
          <!-- 操作按钮 -->
          <el-button-group size="small">
            <el-button type="warning" @click="handleEdit">
              <el-icon>
                <Edit />
              </el-icon>
              编辑
            </el-button>
            <el-button type="danger" @click="handleDeleteClick">
              <el-icon>
                <Delete />
              </el-icon>
            </el-button>
          </el-button-group>
        </div>
      </div>
    </template>

    <!-- 卡片内容 -->
    <div class="card-content">
      <!-- 标题 -->
      <h3 class="notification-title">{{ data.title }}</h3>
      <!-- 内容 -->
      <p class="notification-content">{{ data.content }}</p>

      <!-- 底部信息 -->
      <div class="notification-footer">
        <div class="footer-info">
          <div class="info-item">
            <el-icon class="info-icon">
              <Clock />
            </el-icon>
            <span class="info-text">{{ formatDate(data.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </el-card>

  <!-- 确认对话框 -->
  <el-dialog v-model="showConfirmDialog" title="确认操作" width="420px" align-center class="confirm-dialog">
    <div class="dialog-content">
      <div class="warning-icon">
        <el-icon>
          <WarningFilled />
        </el-icon>
      </div>
      <div class="warning-text">
        <h4>{{ confirmMessage }}</h4>
        <p>此操作不可撤销，请谨慎操作。</p>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showConfirmDialog = false" class="cancel-btn">
          取消
        </el-button>
        <el-button type="primary" @click="handleConfirm" :loading="confirmLoading" class="confirm-btn">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Clock,
  Delete,
  Edit,
  CircleCloseFilled,
  CircleCheckFilled,
  Lock,
  UserFilled,
  WarningFilled,
} from '@element-plus/icons-vue'
import { notificationApi } from '@/api/admin/notification'
import type { NotificationItem } from '@/types/factory'

// Props
interface Props {
  data: NotificationItem
  index?: number
}

const props = withDefaults(defineProps<Props>(), {
  index: 0
})

// Emits
interface Emits {
  reload: []
  detail: [id: string | number]
  edit: [id: string | number]
  delete: [id: string | number]
}

const emit = defineEmits<Emits>()

// 响应式数据
const showConfirmDialog = ref(false)
const confirmLoading = ref(false)
const confirmMessage = ref('')
const currentAction = ref<'delete' | null>(null)

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes <= 0 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 方法
const handleEdit = () => {
  emit('edit', props.data.id)
}

const handleDeleteClick = () => {
  currentAction.value = 'delete'
  confirmMessage.value = '确认删除此通知吗？删除后无法恢复。'
  showConfirmDialog.value = true
}

const handleCommand = (command: string) => {
  switch (command) {
    case 'detail':
      emit('detail', props.data.id)
      break
    case 'delete':
      currentAction.value = 'delete'
      confirmMessage.value = '确认删除此通知吗？删除后无法恢复。'
      showConfirmDialog.value = true
      break
  }
}

const handleConfirm = async () => {
  if (!currentAction.value) return

  confirmLoading.value = true

  try {
    if (currentAction.value === 'delete') {
      await deleteNotification()
    }
  } finally {
    confirmLoading.value = false
    showConfirmDialog.value = false
    currentAction.value = null
  }
}

const deleteNotification = async () => {
  try {
    const response = await notificationApi.deleteNotification(props.data.id)

    if (response.code === 200) {
      ElMessage.success(response.msg || '删除成功')
      emit('delete', props.data.id)
    } else {
      ElMessage.error(response.msg || '删除失败')
    }
  } catch (error) {
    console.error('删除通知失败:', error)
    ElMessage.error('删除失败，请重试')
  }
}
</script>

<style scoped>
.notification-item {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.notification-content {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.notification-footer {
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-light);
}

.footer-info {
  display: flex;
  align-items: center;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.info-icon {
  font-size: 14px;
  color: var(--el-text-color-placeholder);
}

.info-text {
  font-weight: 500;
}

.ml-2 {
  margin-left: 8px;
}

.mr-1 {
  margin-right: 4px;
}

.dialog-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 0;
}

.warning-icon {
  color: var(--el-color-warning);
  font-size: 24px;
  flex-shrink: 0;
}

.warning-text h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.warning-text p {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
