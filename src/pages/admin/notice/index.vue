<template>
  <div class="content-management-container h-full flex flex-col">
    <!-- 统计卡片组件 -->
    <NoticeStatsCard :stats="stats" :loading="loading" @create="handleCreate" />

    <!-- 搜索组件 -->
    <NoticeSearchForm :query="searchParams.query" :is-public="searchParams.is_public" :loading="loading"
      @search="handleSearchSubmit" @reset="handleSearchReset" />

    <!-- 通知表格组件 -->
    <NoticeTable :data="notificationList" :loading="loading" @refresh="refreshData" @edit="handleEdit"
      @resend="handleResend" @resend-all="handleResendAll" @delete="handleDelete" />

    <!-- 分页组件 -->
    <NoticePagination :current-page="searchParams.page || 1" :page-size="searchParams.page_size || 10" :total="total"
      :loading="loading" @size-change="handleSizeChange" @current-change="handleCurrentChange" />

    <!-- 创建/编辑通知对话框组件 -->
    <NoticeFormDialog v-model:visible="showCreateDialog" :editing-data="editingNotification || null"
      :is-edit="!!editingNotification" :loading="submitting" :user-options="userOptions"
      :user-search-loading="userSearchLoading" @submit="handleSubmit"
      @cancel="() => { showCreateDialog = false; resetForm(); }" @search-users="searchUsers"
      @load-all-users="loadAllUsers" />

    <!-- 重发通知对话框组件 -->
    <NoticeResendDialog v-model:visible="showResendDialog" :notice-data="{ id: resendForm.notification_id }"
      :loading="submitting" :user-options="userOptions" :user-search-loading="userSearchLoading"
      @submit="handleResendSubmit" @cancel="() => { showResendDialog = false; }" @search-users="searchUsers"
      @load-all-users="loadAllUsers" />

    <!-- 重发给特定用户对话框组件 -->
    <NoticeResendDialog v-model:visible="showSendToUserDialog" :notice-data="{ id: sendToUserForm.notification_id }"
      :loading="submitting" :specific-users-only="true" :user-options="userOptions"
      :user-search-loading="userSearchLoading" @submit="handleSendToUsersSubmit"
      @cancel="() => { showSendToUserDialog = false; }" @search-users="searchUsers" @load-all-users="loadAllUsers" />

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Plus,
  Refresh,
  Search,
  Bell,
  Calendar,
  TrendCharts,
  DocumentRemove,
  Edit,
  Delete,
  Clock,
  CircleCheckFilled,
  CircleCloseFilled,
  UserFilled
} from '@element-plus/icons-vue'
import { notificationApi } from '@/api/admin/notification'
import type {
  NotificationItem as NotificationItemType,
  NotificationListReq,
  CreateNotificationReq,
  NotificationStats
} from '@/types/factory'

// 导入组件
import NoticeStatsCard from '@/components/pages/admin/notice/NoticeStatsCard.vue'
import NoticeSearchForm from '@/components/pages/admin/notice/NoticeSearchForm.vue'
import NoticeTable from '@/components/pages/admin/notice/NoticeTable.vue'
import NoticePagination from '@/components/pages/admin/notice/NoticePagination.vue'
import NoticeFormDialog from '@/components/pages/admin/notice/NoticeFormDialog.vue'
import NoticeResendDialog from '@/components/pages/admin/notice/NoticeResendDialog.vue'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const markingAllAsRead = ref(false)
const showCreateDialog = ref(false)
const editingNotification = ref<NotificationItemType | null>(null)
const editingNotice = ref<NotificationItemType | null>(null)
const resendingNotice = ref<NotificationItemType | null>(null)
const notificationFormRef = ref<FormInstance>()

// 搜索参数
const searchParams = reactive<NotificationListReq>({
  query: '',
  page: 1,
  page_size: 10,
  is_active: undefined,
  is_public: undefined,
})

// 通知列表数据
const notificationList = ref<NotificationItemType[]>([])
const total = ref(0)


// 统计数据
const stats = ref<NotificationStats>({
  total: 0,
  today: 0,
  this_week: 0,
  this_month: 0,
})

// 表单数据
const notificationForm = reactive<CreateNotificationReq>({
  title: '',
  content: '',
  is_public: true,
  is_active: true,
  notify_all: false,
  email_notification: false,
  recipient_user_ids: [],
})

// 用户搜索相关
const userSearchLoading = ref(false)
const userOptions = ref<Array<{ id: number; username: string }>>([])

// 重发（所有/指定）对话框
const showResendDialog = ref(false)
const resendForm = reactive({
  notification_id: 0,
  notify_all: false,
  recipient_user_ids: [] as number[],
  email_notification: false
})

// 重发给指定用户（快捷）
const showSendToUserDialog = ref(false)
const sendToUserForm = reactive({
  notification_id: 0,
  recipient_user_ids: [] as number[],
  email_notification: false
})

// 表单验证规则
const formRules: FormRules = {
  title: [
    { required: true, message: '请输入通知标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入通知内容', trigger: 'blur' },
    { min: 5, max: 500, message: '内容长度在 5 到 500 个字符', trigger: 'blur' }
  ],
  recipient_user_ids: [
    {
      validator: (rule: any, value: any, callback: any) => {
        // 移除必须选择用户的验证，允许不指定用户发送
        callback()
      },
      trigger: 'change'
    }
  ]
}

// @ts-ignore 搜索防抖
let searchTimer: NodeJS.Timeout | null = null

// 方法
const getNotificationList = async () => {
  loading.value = true
  try {
    const response = await notificationApi.getUserNotificationList(searchParams)
    if (response.code === 200) {
      notificationList.value = response.data.notifications
      total.value = response.data.total
    } else {
      ElMessage.error(response.msg || '获取通知列表失败')
    }
  } catch (error) {
    console.error('获取通知列表失败:', error)
    ElMessage.error('获取通知列表失败，请重试')
  } finally {
    loading.value = false
  }
}

// 统计数据直接基于当前通知列表计算
const getStats = () => {
  setDefaultStats()
}

// 设置默认统计数据
const setDefaultStats = () => {
  // 基于当前通知列表计算统计数据
  const total = notificationList.value.length
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  
  // 计算本周开始日期
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]
  
  // 计算本月开始日期
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthStartStr = monthStart.toISOString().split('T')[0]
  
  // 统计今日、本周、本月的通知数量
  let todayCount = 0
  let weekCount = 0
  let monthCount = 0
  
  notificationList.value.forEach(notification => {
    const createDate = notification.created_at?.split(' ')[0] || ''
    if (createDate === todayStr) todayCount++
    if (createDate >= weekStartStr) weekCount++
    if (createDate >= monthStartStr) monthCount++
  })
  
  stats.value = {
    total,
    today: todayCount,
    this_week: weekCount,
    this_month: monthCount
  }
}

const handleCreate = () => {
  resetForm()
  showCreateDialog.value = true
}

const handleSearchSubmit = async (params: { query: string; is_public: 0 | 1 | undefined }) => {
  searchParams.query = params.query
  searchParams.is_public = params.is_public
  searchParams.page = 1
  await getNotificationList()
  getStats()
}

const handleSearchReset = () => {
  searchParams.query = ''
  searchParams.is_public = undefined
  searchParams.page = 1
  getNotificationList()
}

const handleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    searchParams.page = 1
    getNotificationList()
  }, 300)
}

const handleFilterChange = () => {
  searchParams.page = 1
  getNotificationList()
}

const handleSizeChange = (size: number) => {
  searchParams.page_size = size
  searchParams.page = 1
  getNotificationList()
}

const handleCurrentChange = (page: number) => {
  searchParams.page = page
  getNotificationList()
}

const refreshData = () => {
  getNotificationList()
  getStats()
}

const resetForm = () => {
  notificationForm.title = ''
  notificationForm.content = ''
  notificationForm.is_public = true
  notificationForm.is_active = true
  notificationForm.notify_all = false
  notificationForm.email_notification = false
  notificationForm.recipient_user_ids = []
  editingNotification.value = null
  editingNotice.value = null
  notificationFormRef.value?.resetFields()
  userOptions.value = []
}

// 表单取消处理
const handleFormCancel = () => {
  showCreateDialog.value = false
  resetForm()
}

// 重发对话框取消处理
const handleResendCancel = () => {
  showResendDialog.value = false
}

// 处理通知所有人开关变化
const handleNotifyAllChange = (value: boolean) => {
  if (value) {
    notificationForm.recipient_user_ids = []
    userOptions.value = []
  }
  // 触发表单验证，确保用户选择字段的验证状态更新
  setTimeout(() => {
    notificationFormRef.value?.validateField('recipient_user_ids')
  }, 100)
}

// 加载所有用户（点击选择器时触发）
const loadAllUsers = async () => {
  // 如果已经有用户选项，不重复加载
  if (userOptions.value.length > 0) return

  userSearchLoading.value = true
  try {
    const { getUsersAPI } = await import('@/api/admin/users')
    const response = await getUsersAPI({
      query: '', // 空查询获取所有用户
      page: 1,
      page_size: 100 // 加载更多用户
    })

    if (response.data && response.data.users) {
      userOptions.value = response.data.users.map(user => ({
        id: user.id!,
        username: user.username
      }))
    }
  } catch (error) {
    console.error('加载用户失败:', error)
    ElMessage.error('加载用户失败')
  } finally {
    userSearchLoading.value = false
  }
}

// 搜索用户
const searchUsers = async (query: string) => {
  if (!query) {
    // 如果没有搜索词，加载所有用户
    await loadAllUsers()
    return
  }

  userSearchLoading.value = true
  try {
    // 调用用户搜索API
    const { getUsersAPI } = await import('@/api/admin/users')
    const response = await getUsersAPI({
      query,
      page: 1,
      page_size: 50 // 获取更多用户供选择
    })

    if (response.data && response.data.users) {
      userOptions.value = response.data.users.map(user => ({
        id: user.id!,
        username: user.username
      }))
    } else {
      userOptions.value = []
    }
  } catch (error) {
    console.error('搜索用户失败:', error)
    ElMessage.error('搜索用户失败')
    userOptions.value = []
  } finally {
    userSearchLoading.value = false
  }
}

// 处理表单提交（来自组件）
const submitForm = async (data: CreateNotificationReq) => {
  submitting.value = true
  try {
    const response = editingNotification.value
      ? await notificationApi.updateNotification({
        id: editingNotification.value.id,
        ...data
      })
      : await notificationApi.createNotification(data)

    if (response.code === 200) {
      ElMessage.success(response.msg || `${editingNotification.value ? '更新' : '发布'}成功`)
      showCreateDialog.value = false
      resetForm()
      refreshData()
    } else {
      ElMessage.error(response.msg || `${editingNotification.value ? '更新' : '发布'}失败`)
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

const handleSubmit = async () => {
  if (!notificationFormRef.value) return

  try {
    // 先进行表单验证
    await notificationFormRef.value.validate()

    // 移除必须选择用户的验证，允许不指定用户发送

    submitting.value = true

    // 构建提交数据，根据notify_all决定是否包含recipient_user_ids
    const submitData = {
      title: notificationForm.title,
      content: notificationForm.content,
      is_public: notificationForm.notify_all, // is_public的值等于notify_all的值
      is_active: notificationForm.is_active,
      notify_all: notificationForm.notify_all,
      email_notification: false,
      // 只有当notify_all为false时才传递recipient_user_ids
      ...(notificationForm.notify_all ? {} : { recipient_user_ids: notificationForm.recipient_user_ids })
    }

    const response = editingNotification.value
      ? await notificationApi.updateNotification({
        id: editingNotification.value.id,
        ...submitData
      })
      : await notificationApi.createNotification(submitData as CreateNotificationReq)

    if (response.code === 200) {
      ElMessage.success(response.msg || `${editingNotification.value ? '更新' : '发布'}成功`)
      showCreateDialog.value = false
      resetForm()
      refreshData()
    } else {
      ElMessage.error(response.msg || `${editingNotification.value ? '更新' : '发布'}失败`)
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

const handleEdit = (id: string | number) => {
  const notification = notificationList.value.find(item => item.id === id)
  if (notification) {
    editingNotification.value = notification
    editingNotice.value = notification
    notificationForm.title = notification.title
    notificationForm.content = notification.content
    notificationForm.is_active = notification.is_active ?? true
    notificationForm.notify_all = notification.notify_all ?? false
    notificationForm.email_notification = notification.email_notification ?? false
    notificationForm.recipient_user_ids = notification.recipient_user_ids || []
    showCreateDialog.value = true
  }
}

// 重发（所有/指定）
const handleResend = async (id: string | number) => {
  const notification = notificationList.value.find(item => item.id === id)
  if (notification) {
    resendingNotice.value = notification
  }

  resendForm.notification_id = Number(id)
  // 默认改为选择用户重发
  resendForm.notify_all = false
  resendForm.recipient_user_ids = []
  resendForm.email_notification = false

  // 预加载用户选项（便于切换到“指定用户”时立即可选）
  try {
    const { getUsersAPI } = await import('@/api/admin/users')
    const response = await getUsersAPI({
      query: '',
      page: 1,
      page_size: 100
    })
    if (response.data && response.data.users) {
      userOptions.value = response.data.users.map(user => ({ id: user.id!, username: user.username }))
    }
  } catch (error) {
    // 忽略预加载失败
  }

  showResendDialog.value = true
}

// 全部重发（快捷）
const handleResendAll = async (id: string | number) => {
  try {
    await ElMessageBox.confirm('确定将该通知重发给所有用户吗？', '确认操作', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await notificationApi.resendNotification({
      notification_id: Number(id),
      notify_all: true,
      email_notification: true
    })

    if (response.code === 200) {
      const count = response.data?.recipient_count
      ElMessage.success(response.msg || `已重发给所有用户${typeof count === 'number' ? `（共 ${count} 位）` : ''}`)
      refreshData()
    } else {
      ElMessage.error(response.msg || '重发失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('全部重发失败:', error)
      ElMessage.error('全部重发失败，请重试')
    }
  }
}

// 处理重发提交（来自组件）
const submitResend = async (data: any) => {
  submitting.value = true
  try {
    const response = await notificationApi.resendNotification({
      notification_id: resendingNotice.value?.id || data.notification_id,
      ...data
    })

    if (response.code === 200) {
      const count = response.data?.recipient_count
      ElMessage.success(response.msg || `重发成功${typeof count === 'number' ? `，共 ${count} 位用户` : ''}`)
      showResendDialog.value = false
      resendingNotice.value = null
      refreshData()
    } else {
      ElMessage.error(response.msg || '重发失败')
    }
  } catch (error) {
    console.error('重发失败:', error)
    ElMessage.error('重发失败，请重试')
  } finally {
    submitting.value = false
  }
}

const handleResendSubmit = async () => {
  if (!resendForm.notify_all && resendForm.recipient_user_ids.length === 0) {
    ElMessage.warning('请选择要通知的用户或切换为发送给所有用户')
    return
  }

  try {
    const payload: any = {
      notification_id: resendForm.notification_id,
      notify_all: resendForm.notify_all,
      email_notification: resendForm.email_notification
    }
    if (!resendForm.notify_all) {
      payload.recipient_user_ids = resendForm.recipient_user_ids
    }

    const response = await notificationApi.resendNotification(payload)
    if (response.code === 200) {
      const count = response.data?.recipient_count
      ElMessage.success(response.msg || `重发成功${typeof count === 'number' ? `，共 ${count} 位用户` : ''}`)
      showResendDialog.value = false
      resendForm.notification_id = 0
      resendForm.recipient_user_ids = []
      resendForm.notify_all = false
      resendForm.email_notification = false
      userOptions.value = []
      refreshData()
    } else {
      ElMessage.error(response.msg || '重发失败')
    }
  } catch (error) {
    console.error('重发失败:', error)
    ElMessage.error('重发失败，请重试')
  }
}

// 发送通知给特定用户（快捷重发）
const handleSendToUsers = async (id: string | number) => {
  sendToUserForm.notification_id = Number(id)
  sendToUserForm.recipient_user_ids = []
  sendToUserForm.email_notification = false

  // 加载所有用户列表
  try {
    const { getUsersAPI } = await import('@/api/admin/users')
    const response = await getUsersAPI({
      query: '',
      page: 1,
      page_size: 100 // 获取更多用户
    })

    if (response.data && response.data.users) {
      userOptions.value = response.data.users.map(user => ({
        id: user.id!,
        username: user.username
      }))
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  }

  showSendToUserDialog.value = true
}

// 提交发送给特定用户（快捷重发）
const handleSendToUsersSubmit = async () => {
  if (sendToUserForm.recipient_user_ids.length === 0) {
    ElMessage.warning('请选择要通知的用户')
    return
  }

  try {
    const response = await notificationApi.resendNotification({
      notification_id: sendToUserForm.notification_id,
      notify_all: false,
      recipient_user_ids: sendToUserForm.recipient_user_ids,
      email_notification: sendToUserForm.email_notification
    })

    if (response.code === 200) {
      const count = response.data?.recipient_count
      ElMessage.success(response.msg || `重发成功${typeof count === 'number' ? `，共 ${count} 位用户` : ''}`)
      showSendToUserDialog.value = false
      sendToUserForm.notification_id = 0
      sendToUserForm.recipient_user_ids = []
      sendToUserForm.email_notification = false
      userOptions.value = []
      // 刷新通知列表
      refreshData()
    } else {
      ElMessage.error(response.msg || '重发失败')
    }
  } catch (error) {
    console.error('发送通知失败:', error)
    ElMessage.error('重发失败，请重试')
  }
}

const handleDelete = async (id: string | number) => {
  try {
    await ElMessageBox.confirm(
      '确认删除此通知吗？删除后无法恢复。',
      '确认操作',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await notificationApi.deleteNotification(id)
    if (response.code === 200) {
      ElMessage.success(response.msg || '删除成功')
      handleDeleteSuccess(id)
      getStats()
    } else {
      ElMessage.error(response.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除通知失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  }
}

const handleDeleteSuccess = (id: string | number) => {
  // 从列表中移除已删除的项
  const index = notificationList.value.findIndex(item => item.id === id)
  if (index > -1) {
    notificationList.value.splice(index, 1)
    total.value--
  }
  refreshData()
}

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

// 生命周期
onMounted(async () => {
  // 先获取通知列表，再获取统计数据
  await getNotificationList()
  getStats()
})
</script>

<style scoped>
.content-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.stats-card {
  margin-bottom: 20px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-title {
  font-size: 16px;
  font-weight: 600;
}

.stats-grid {
  margin-top: 16px;
}

.stat-card {
  text-align: center;
}

.stat-card .el-statistic {
  --el-statistic-content-font-size: 28px;
}

.filters-card {
  margin-bottom: 20px;
}

.list-card {
  margin-top: 2em;
  margin-bottom: 20px;
  min-height: 0;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-title {
  font-size: 16px;
  font-weight: 600;
}

.loading-container,
.empty-container {
  padding: 40px 0;
}

.table-container {
  margin-top: 16px;
  overflow: auto;
  min-height: 0;
  max-height: 500px;
}

.notification-table {
  border-radius: 8px;
  overflow: hidden;
}

.title-cell {
  display: flex;
  align-items: center;
}

.title-text {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.content-cell {
  display: flex;
  align-items: center;
}

.content-text {
  color: var(--el-text-color-regular);
  line-height: 1.4;
}

.status-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

.time-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.time-icon {
  font-size: 14px;
  color: var(--el-text-color-placeholder);
}

.time-text {
  font-weight: 500;
}

.action-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
}

.action-button-group {
  display: flex;
  flex-wrap: nowrap;
}

.action-button-group .el-button {
  min-width: auto;
  padding: 5px 8px;
}

.mr-1 {
  margin-right: 4px;
}

.text-gray-400 {
  color: #9ca3af;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.notification-detail {
  margin: 16px 0;
}

.detail-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.content-card {
  margin-top: 8px;
}

.content-text {
  line-height: 1.6;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
  word-break: break-word;
}

/* 弹窗样式美化 */
.notification-dialog {
  --el-dialog-border-radius: 12px;
  --el-dialog-box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.notification-dialog .el-dialog__header {
  padding: 0;
  border-bottom: none;
}

.dialog-header {
  display: flex;
  align-items: center;
  background: var(--el-bg-color);
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid var(--el-border-color-light);
}

.dialog-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--el-color-primary-light-9);
  border: 2px solid var(--el-color-primary);
  border-radius: 10px;
  margin-right: 12px;
}

.dialog-icon .el-icon {
  color: var(--el-color-primary);
}

.dialog-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.2;
}

.dialog-content {
  padding: 0;
  background: var(--el-bg-color);
}

.notification-form {
  max-height: 60vh;
  overflow-y: auto;
  padding: 24px;
}

.form-section {
  margin-bottom: 24px;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  transition: none;
}

.form-section:hover {
  box-shadow: none;
  transform: none;
}

.section-title {
  font-size: large;
  margin: 0 0 16px 0;
  font-weight: 600;
  color: var(--el-text-color-regular);
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-title::before {
  display: none;
}

.form-item {
  margin-bottom: 20px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-input,
.form-textarea {
  border-radius: 6px;
  transition: all 0.3s ease;
}

.form-input:focus-within,
.form-textarea:focus-within {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.switch-group {
  display: grid;
  gap: 12px;
}

.switch-item {
  margin-bottom: 0;
  padding: 12px 16px;
  background: var(--el-fill-color-extra-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.switch-item:hover {
  background: var(--el-fill-color-light);
  border-color: var(--el-border-color-light);
}

.switch-item .el-form-item__label {
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 24px;
  background: var(--el-bg-color);
  border-radius: 0 0 12px 12px;
  border-top: 1px solid var(--el-border-color-light);
}

.cancel-btn {
  min-width: 100px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.submit-btn {
  min-width: 120px;
  border-radius: 8px;
  font-weight: 500;
  background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-dark-2) 100%);
  border: none;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}

.btn-icon {
  margin-right: 6px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-management {
    padding: 16px;
  }

  .stats-grid .el-col {
    margin-bottom: 16px;
  }

  .notification-dialog {
    width: 95% !important;
    margin: 0 auto;
  }

  .dialog-header {
    padding: 20px 16px 16px;
  }

  .dialog-content {
    padding: 16px;
  }

  .form-section {
    padding: 16px;
    margin-bottom: 20px;
  }

  .dialog-footer {
    padding: 16px;
    flex-direction: column;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .dialog-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .dialog-icon {
    margin-right: 0;
  }
}
</style>
