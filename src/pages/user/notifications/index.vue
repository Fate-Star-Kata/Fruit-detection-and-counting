<template>
  <div class="notifications-page" :class="{ compact: compact }" ref="rootRef">
    <div class="page-header">
      <h2>我的通知</h2>
      <div class="header-actions">
        <el-button v-if="unreadCount > 0" type="primary" size="small" @click="markAllRead" :loading="markingAllRead">
          全部标记已读
        </el-button>
        <el-badge :value="unreadCount" :hidden="unreadCount === 0">
          <el-button size="small" @click="refreshList">
            <el-icon>
              <Refresh />
            </el-icon>
            刷新
          </el-button>
        </el-badge>
      </div>
    </div>

    <div class="filter-bar">
      <el-radio-group v-model="filterStatus" @change="handleFilterChange">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="unread">未读</el-radio-button>
        <el-radio-button label="read">已读</el-radio-button>
      </el-radio-group>
    </div>

    <div class="notifications-list" v-loading="loading">
      <div v-if="notifications.length === 0" class="empty-state">
        <el-empty description="暂无通知" />
      </div>

      <div v-else>
        <div v-for="notification in notifications" :key="notification.id" class="notification-item"
          :class="{ 'unread': !notification.is_read }" :data-id="notification.id"
          @click="handleNotificationClick(notification)">
          <div class="notification-content">
            <div class="notification-header">
              <h4 class="notification-title">{{ notification.title }}</h4>
              <div class="notification-meta">
                <span class="notification-time">{{ formatTime(notification.created_at) }}</span>
                <el-tag v-if="!notification.is_read" type="danger" size="small">未读</el-tag>
              </div>
            </div>
            <p class="notification-text">{{ notification.content }}</p>
          </div>
          <div class="notification-actions">
            <el-button v-if="!notification.is_read" type="primary" size="small"
              @click.stop="markAsRead([notification.id])" :loading="markingRead.includes(notification.id)">
              标记已读
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination-wrapper" v-if="total > 0">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]"
        :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>

    <!-- 通知详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" :title="selectedNotification?.title" width="600px"
      @close="handleDetailClose">
      <div class="notification-detail">
        <div class="detail-meta">
          <span>发布时间：{{ formatTime(selectedNotification?.created_at || '') }}</span>
          <el-tag v-if="selectedNotification && !selectedNotification.is_read" type="danger" size="small">未读</el-tag>
        </div>
        <div class="detail-content" v-html="selectedNotification?.content"></div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button v-if="selectedNotification && !selectedNotification.is_read" type="primary"
            @click="markAsRead([selectedNotification.id])" :loading="markingRead.includes(selectedNotification.id)">
            标记已读
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import {
  getNotificationList,
  markNotificationRead,
  markAllNotificationRead,
  type NotificationItem,
  type NotificationListParams
} from '@/api/user/notification'

// 新增：用于侧边栏/抽屉的紧凑展示控制（默认在抽屉中使用）
const props = defineProps<{ inDrawer?: boolean }>()
const compact = computed(() => props.inDrawer !== false)

// 响应式数据
const loading = ref(false)
const notifications = ref<NotificationItem[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const unreadCount = ref(0)
const filterStatus = ref<'all' | 'unread' | 'read'>('all')
const markingRead = ref<number[]>([])
const markingAllRead = ref(false)
const rootRef = ref<HTMLElement | null>(null)

// 详情弹窗
const detailDialogVisible = ref(false)
const selectedNotification = ref<NotificationItem | null>(null)

// 获取通知列表
const fetchNotifications = async () => {
  try {
    loading.value = true
    const params: NotificationListParams = {
      page: currentPage.value,
      page_size: pageSize.value
    }

    if (filterStatus.value !== 'all') {
      params.is_read = filterStatus.value === 'read'
    }

    const response = await getNotificationList(params)
    if (response.code === 200) {
      notifications.value = response.data.notifications
      total.value = response.data.total
      unreadCount.value = response.data.unread_count
    } else {
      ElMessage.error(response.msg || '获取通知列表失败')
    }
  } catch (error) {
    console.error('获取通知列表失败:', error)
    ElMessage.error('获取通知列表失败')
  } finally {
    loading.value = false
  }
}

// 标记已读
const markAsRead = async (notificationIds: number[]) => {
  try {
    markingRead.value.push(...notificationIds)
    const response = await markNotificationRead({ notification_ids: notificationIds })
    if (response.code === 200) {
      // 更新本地状态
      notifications.value.forEach(notification => {
        if (notificationIds.includes(notification.id)) {
          notification.is_read = true
        }
      })

      // 更新选中的通知状态
      if (selectedNotification.value && notificationIds.includes(selectedNotification.value.id)) {
        selectedNotification.value.is_read = true
      }

      // 更新未读数量
      unreadCount.value = Math.max(0, unreadCount.value - notificationIds.length)

      ElMessage.success('标记成功')
    } else {
      ElMessage.error(response.msg || '标记失败')
    }
  } catch (error) {
    console.error('标记已读失败:', error)
    ElMessage.error('标记失败')
  } finally {
    markingRead.value = markingRead.value.filter(id => !notificationIds.includes(id))
  }
}

// 标记全部已读
const markAllRead = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要将所有 ${unreadCount.value} 条未读通知标记为已读吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    markingAllRead.value = true
    const response = await markAllNotificationRead()
    if (response.code === 200) {
      // 更新本地状态
      notifications.value.forEach(notification => {
        notification.is_read = true
      })
      unreadCount.value = 0
      ElMessage.success(response.msg || '全部标记成功')
    } else {
      ElMessage.error(response.msg || '标记失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('标记全部已读失败:', error)
      ElMessage.error('标记失败')
    }
  } finally {
    markingAllRead.value = false
  }
}

// 处理通知点击
const handleNotificationClick = async (notification: NotificationItem) => {
  selectedNotification.value = notification
  detailDialogVisible.value = true

  // 如果是未读通知，自动标记为已读
  if (!notification.is_read) {
    await markAsRead([notification.id])
  }
}

// 处理详情弹窗关闭
const handleDetailClose = () => {
  selectedNotification.value = null
}

// 处理筛选变化
const handleFilterChange = () => {
  currentPage.value = 1
  fetchNotifications()
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchNotifications()
}

// 处理页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchNotifications()
}

// 刷新列表
const refreshList = () => {
  fetchNotifications()
}

// 格式化时间
const formatTime = (timeStr: string) => {
  if (!timeStr) return ''

  const time = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - time.getTime()

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < 2 * day) {
    return '昨天'
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`
  } else {
    return time.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchNotifications()
})

// 计算某元素是否在容器可视区域内（与容器视口相交即视为可见）
function isElementVisible(el: HTMLElement, container?: HTMLElement | null) {
  const rect = el.getBoundingClientRect()
  if (container) {
    const cRect = container.getBoundingClientRect()
    return rect.bottom > cRect.top && rect.top < cRect.bottom
  }
  // fallback: 使用窗口视口
  const vh = window.innerHeight || document.documentElement.clientHeight
  return rect.bottom > 0 && rect.top < vh
}

// 标记容器视口内的未读通知为已读
async function markVisibleUnreadAsRead(container?: HTMLElement) {
  try {
    const root = rootRef.value
    if (!root) return
    const nodeList = root.querySelectorAll('.notification-item')
    const idsToMark: number[] = []
    nodeList.forEach((el) => {
      const idStr = (el as HTMLElement).getAttribute('data-id')
      const id = idStr ? Number(idStr) : NaN
      if (!Number.isFinite(id)) return
      const n = notifications.value.find(n => n.id === id)
      if (!n || n.is_read) return
      if (isElementVisible(el as HTMLElement, container)) {
        idsToMark.push(id)
      }
    })
    if (idsToMark.length > 0) {
      await markAsRead(idsToMark)
    }
  } catch (err) {
    console.error('markVisibleUnreadAsRead error:', err)
  }
}

// 对外暴露方法，供外层抽屉关闭时调用
// 也暴露刷新列表方法，便于外层在打开时主动刷新
// eslint-disable-next-line no-undef
defineExpose({ markVisibleUnreadAsRead, refreshList })
</script>

<style scoped>
.notifications-page {
  padding: 20px;
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.page-header h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-bar {
  margin-bottom: 12px;
}

.notifications-list {
  min-height: 320px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 240px;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  margin-bottom: 10px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.notification-item.unread {
  border-left: 4px solid #409eff;
  background: #f0f9ff;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.notification-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.notification-text {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-actions {
  margin-left: 12px;
  flex-shrink: 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
  /* 防止出现横向滚动条 */
  overflow-x: hidden;
}

.notification-detail {
  padding: 10px 0;
}

.detail-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
  color: #909399;
}

.detail-content {
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 紧凑模式（抽屉内） */
.notifications-page.compact {
  padding: 12px;
  /* 侧边栏内强制不出现横向滚动条 */
  overflow-x: hidden;
}

.notifications-page.compact .page-header {
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: none;
}

.notifications-page.compact .page-header h2 {
  font-size: 18px;
}

.notifications-page.compact .filter-bar {
  margin-bottom: 10px;
}

.notifications-page.compact .notifications-list {
  min-height: 0;
}

.notifications-page.compact .empty-state {
  height: 180px;
}

.notifications-page.compact .notification-item {
  padding: 10px 12px;
  margin-bottom: 8px;
}

.notifications-page.compact .notification-title {
  font-size: 14px;
}

.notifications-page.compact .notification-text {
  font-size: 13px;
  -webkit-line-clamp: 2;
}

.notifications-page.compact .pagination-wrapper {
  margin-top: 12px;
  padding-top: 8px;
  /* 防止分页过宽导致溢出 */
  overflow-x: hidden;
}

/* 允许分页在窄宽度下换行，避免横向溢出 */
.notifications-page.compact .pagination-wrapper :deep(.el-pagination) {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  overflow-x: hidden;
  max-width: 100%;
}

/* 控制分页内部各块在窄宽度下更紧凑 */
.notifications-page.compact :deep(.el-pagination .el-pagination__sizes),
.notifications-page.compact :deep(.el-pagination .el-pagination__jump) {
  margin-left: 0;
  margin-right: 0;
}

/* 确保分页组件内部元素不会导致横向溢出 */
.notifications-page.compact :deep(.el-pagination > *) {
  flex-shrink: 1;
  min-width: 0;
}

/* 分页按钮在紧凑模式下的样式调整 */
.notifications-page.compact :deep(.el-pagination .btn-prev),
.notifications-page.compact :deep(.el-pagination .btn-next),
.notifications-page.compact :deep(.el-pagination .el-pager li) {
  min-width: 28px;
  height: 28px;
  font-size: 12px;
}

/* 页面大小选择器在紧凑模式下的调整 */
.notifications-page.compact :deep(.el-pagination .el-pagination__sizes .el-select) {
  width: auto;
  min-width: 80px;
}

/* 跳转输入框在紧凑模式下的调整 */
.notifications-page.compact :deep(.el-pagination .el-pagination__jump .el-input) {
  width: 50px;
}
</style>
