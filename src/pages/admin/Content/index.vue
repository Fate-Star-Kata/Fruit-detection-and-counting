<template>
  <div class="content-management-container">
    <!-- 统计卡片 -->
    <el-card shadow="never" class="stats-card">
      <template #header>
        <div class="stats-header">
          <span class="stats-title">数据统计</span>
          <el-button type="primary" :icon="Plus" @click="showCreateDialog = true">
            发布通知
          </el-button>
        </div>
      </template>
      <el-row :gutter="16" class="stats-row">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="总通知数" :value="stats.total">
              <template #prefix>
                <el-icon style="color: var(--el-color-primary)">
                  <Bell />
                </el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="今日发布" :value="stats.today">
              <template #prefix>
                <el-icon style="color: var(--el-color-success)">
                  <Calendar />
                </el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="本月发布" :value="stats.this_month">
              <template #prefix>
                <el-icon style="color: var(--el-color-warning)">
                  <TrendCharts />
                </el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 筛选和搜索 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" class="search-form">
        <el-form-item label="搜索">
          <el-input v-model="searchParams.query" placeholder="搜索通知标题或内容..." :prefix-icon="Search" clearable
            style="width: 300px" @input="handleSearch" />
        </el-form-item>

        <el-form-item label="可见性">
          <el-select v-model="searchParams.is_public" placeholder="全部" clearable style="width: 120px"
            @change="handleFilterChange">
            <el-option label="公开" :value="1" />
            <el-option label="私有" :value="0" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="getNotificationList">
            搜索
          </el-button>
          <el-button @click="resetSearch">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 通知列表 -->
    <el-card shadow="never" class="list-card">
      <template #header>
        <div class="list-header">
          <span class="list-title">通知列表</span>
          <el-space>
            <el-button :icon="Refresh" @click="refreshData" :loading="loading" size="small">
              刷新
            </el-button>

          </el-space>
        </div>
      </template>

      <!-- 加载状态 -->
      <div v-if="loading" v-loading="loading" class="loading-container">
        <el-empty description="正在加载通知..." />
      </div>

      <!-- 空状态 -->
      <div v-else-if="notificationList.length === 0" class="empty-container">
        <el-empty description="暂无通知数据">
          <template #image>
            <el-icon size="60" color="var(--el-color-info)">
              <DocumentRemove />
            </el-icon>
          </template>
          <el-button type="primary" @click="showCreateDialog = true">
            发布第一条通知
          </el-button>
        </el-empty>
      </div>

      <!-- 通知列表 -->
      <div v-else class="notifications-container">
        <NotificationItem v-for="(item, index) in notificationList" :key="item.id" :data="item" :index="index"
          @reload="getNotificationList" @edit="handleEdit" @delete="handleDeleteSuccess" />
      </div>
    </el-card>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination v-model:current-page="searchParams.page" v-model:page-size="searchParams.page_size" :total="total"
        :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" background />
    </div>

    <!-- 创建/编辑通知对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingNotification ? '编辑通知' : '发布通知'"
      width="650px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      class="notification-dialog"
      align-center
    >
      <template #header="{ titleId, titleClass }">
        <div class="dialog-header">
          <div class="dialog-icon">
            <el-icon size="24">
              <Edit v-if="editingNotification" />
              <Plus v-else />
            </el-icon>
          </div>
          <h3 :id="titleId" :class="titleClass" class="dialog-title">
            {{ editingNotification ? '编辑通知' : '发布通知' }}
          </h3>
        </div>
      </template>

      <div class="dialog-content">
        <el-form
          ref="notificationFormRef"
          :model="notificationForm"
          :rules="formRules"
          label-width="100px"
          label-position="left"
          size="default"
          class="notification-form"
        >
          <div class="form-section">
            <h4 class="section-title">基本信息</h4>
            <el-form-item label="通知标题" prop="title" class="form-item">
              <el-input
                v-model="notificationForm.title"
                placeholder="请输入通知标题"
                maxlength="100"
                show-word-limit
                clearable
                class="form-input"
              />
            </el-form-item>

            <el-form-item label="通知内容" prop="content" class="form-item">
              <el-input
                v-model="notificationForm.content"
                type="textarea"
                :rows="6"
                placeholder="请输入通知内容"
                maxlength="1000"
                show-word-limit
                resize="vertical"
                class="form-textarea"
              />
            </el-form-item>
          </div>

          <div class="form-section">
            <h4 class="section-title">通知设置</h4>
            <div class="switch-group">
              <el-form-item label="是否启用" class="switch-item">
                <el-switch
                  v-model="notificationForm.is_active"
                  active-text="启用"
                  inactive-text="未启用"
                  active-color="var(--el-color-success)"
                  inactive-color="var(--el-color-info)"
                  size="default"
                />
              </el-form-item>

              <el-form-item label="通知所有人" class="switch-item">
                <el-switch
                  v-model="notificationForm.notify_all"
                  active-text="是"
                  inactive-text="否"
                  active-color="var(--el-color-primary)"
                  inactive-color="var(--el-color-info)"
                  size="default"
                />
              </el-form-item>

              <el-form-item label="邮件通知" class="switch-item">
                <el-switch
                  v-model="notificationForm.email_notification"
                  active-text="发送"
                  inactive-text="不发送"
                  active-color="var(--el-color-warning)"
                  inactive-color="var(--el-color-info)"
                  size="default"
                />
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button
            size="large"
            @click="showCreateDialog = false"
            class="cancel-btn"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            size="large"
            :loading="submitting"
            @click="handleSubmit"
            class="submit-btn"
          >
            <el-icon v-if="!submitting" class="btn-icon">
              <Edit v-if="editingNotification" />
              <Plus v-else />
            </el-icon>
            {{ editingNotification ? '更新通知' : '发布通知' }}
          </el-button>
        </div>
      </template>
    </el-dialog>


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
  Edit
} from '@element-plus/icons-vue'
import { notificationApi } from '@/api/admin/notification'
import NotificationItem from '@/components/pages/admin/Content/NotificationItem.vue'
import type {
  NotificationItem as NotificationItemType,
  NotificationListReq,
  CreateNotificationReq,
  NotificationStats
} from '@/types/factory'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const markingAllAsRead = ref(false)
const showCreateDialog = ref(false)
const editingNotification = ref<NotificationItemType | null>(null)
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

const getStats = async () => {
  try {
    const response = await notificationApi.getNotificationStats()
    if (response.code === 200) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const handleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    searchParams.page = 1
    getNotificationList()
  }, 500)
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
  notificationForm.is_active = true
  notificationForm.notify_all = false
  notificationForm.email_notification = false
  editingNotification.value = null
  notificationFormRef.value?.resetFields()
}

const resetSearch = () => {
  searchParams.page = 1
  searchParams.page_size = 10
  searchParams.query = ''
  searchParams.is_active = true
  searchParams.is_public = undefined
  getNotificationList()
}

const handleSubmit = async () => {
  if (!notificationFormRef.value) return

  try {
    await notificationFormRef.value.validate()
    submitting.value = true

    const response = editingNotification.value
      ? await notificationApi.updateNotification({
        id: editingNotification.value.id,
        ...notificationForm
      })
      : await notificationApi.createNotification(notificationForm)

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
    notificationForm.title = notification.title
    notificationForm.content = notification.content
    notificationForm.is_active = notification.is_active ?? true
    notificationForm.notify_all = notification.notify_all ?? false
    notificationForm.email_notification = notification.email_notification ?? false
    showCreateDialog.value = true
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

// 生命周期
onMounted(() => {
  getNotificationList()
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

.notifications-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
