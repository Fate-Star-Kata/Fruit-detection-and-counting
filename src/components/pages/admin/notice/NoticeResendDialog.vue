<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="重发通知"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    destroy-on-close
    class="resend-dialog"
    align-center
    @close="handleClose"
  >
    <template #header="{ titleId, titleClass }">
      <div class="dialog-header">
        <div class="dialog-icon">
          <el-icon size="24">
            <Refresh />
          </el-icon>
        </div>
        <h3 :id="titleId" :class="titleClass" class="dialog-title">
          重发通知
        </h3>
      </div>
    </template>

    <div class="dialog-content">
      <div class="notice-info">
        <h4 class="info-title">通知信息</h4>
        <div class="info-item">
          <span class="label">标题：</span>
          <span class="value">{{ noticeData?.title || '未知' }}</span>
        </div>
        <div class="info-item">
          <span class="label">内容：</span>
          <span class="value content-text">{{ noticeData?.content || '未知' }}</span>
        </div>
        <div class="info-item">
          <span class="label">创建时间：</span>
          <span class="value">{{ formatDate(noticeData?.created_at) }}</span>
        </div>
      </div>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        label-position="left"
        size="default"
        class="resend-form"
      >
        <div class="form-section">
          <h4 class="section-title">重发设置</h4>

          <el-form-item label="重发类型" prop="resend_type" class="form-item">
            <el-radio-group v-model="formData.resend_type" @change="handleResendTypeChange">
              <el-radio value="all" size="default">
                <span class="radio-label">重发给所有人</span>
              </el-radio>
              <el-radio value="failed" size="default">
                <span class="radio-label">仅重发失败的</span>
              </el-radio>
              <el-radio value="custom" size="default">
                <span class="radio-label">指定用户</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 指定用户选择 -->
          <el-form-item
            v-if="formData.resend_type === 'custom'"
            label="选择用户"
            prop="recipient_user_ids"
            class="form-item"
          >
            <el-select
              v-model="formData.recipient_user_ids"
              multiple
              filterable
              remote
              reserve-keyword
              placeholder="请选择要重发的用户"
              :remote-method="searchUsers"
              :loading="userSearchLoading"
              class="form-select"
              @focus="loadAllUsers"
              collapse-tags
              collapse-tags-tooltip
            >
              <el-option
                v-for="user in userOptions"
                :key="user.id"
                :label="user.username"
                :value="user.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="重发原因" prop="reason" class="form-item">
            <el-input
              v-model="formData.reason"
              type="textarea"
              :rows="3"
              placeholder="请输入重发原因（可选）"
              maxlength="200"
              show-word-limit
              resize="vertical"
              class="form-textarea"
            />
          </el-form-item>
        </div>
      </el-form>

      <div class="warning-tip">
        <el-alert
          title="重发提醒"
          type="warning"
          :closable="false"
          show-icon
        >
          <template #default>
            <div class="alert-content">
              <p>• 重发操作将向选定的用户再次发送此通知</p>
              <p>• 请确认通知内容的准确性和必要性</p>
              <p v-if="formData.resend_type === 'all'">• 将向所有用户重新发送通知</p>
              <p v-else-if="formData.resend_type === 'failed'">• 仅向之前发送失败的用户重新发送</p>
              <p v-else-if="formData.resend_type === 'custom'">• 将向您选择的用户发送通知</p>
            </div>
          </template>
        </el-alert>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button size="large" @click="handleClose" class="cancel-btn">
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
            <Refresh />
          </el-icon>
          确认重发
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import type { NotificationItem } from '@/types/factory'

// Props
interface Props {
  visible: boolean
  noticeData?: Partial<NotificationItem> | null
  submitting?: boolean
  userOptions?: Array<{ id: number; username: string }>
  userSearchLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  noticeData: null,
  submitting: false,
  userOptions: () => [],
  userSearchLoading: false
})

// Emits
interface Emits {
  'update:visible': [value: boolean]
  submit: [data: {
    notice_id: number
    resend_type: string
    recipient_user_ids?: number[]
    reason?: string
  }]
  searchUsers: [query: string]
  loadAllUsers: []
}

const emit = defineEmits<Emits>()

// 响应式数据
const formRef = ref<FormInstance>()
const formData = reactive({
  resend_type: 'all',
  recipient_user_ids: [] as number[],
  reason: ''
})

// 表单验证规则
const formRules: FormRules = {
  resend_type: [
    { required: true, message: '请选择重发类型', trigger: 'change' }
  ],
  recipient_user_ids: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (formData.resend_type === 'custom' && (!value || value.length === 0)) {
          callback(new Error('请选择要重发的用户'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 监听visible变化
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})

// 方法
const resetForm = () => {
  Object.assign(formData, {
    resend_type: 'all',
    recipient_user_ids: [],
    reason: ''
  })
  formRef.value?.resetFields()
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '未知'
  try {
    return new Date(dateStr).toLocaleString('zh-CN')
  } catch {
    return '未知'
  }
}

const handleResendTypeChange = (value: string) => {
  if (value !== 'custom') {
    formData.recipient_user_ids = []
  }
  setTimeout(() => {
    formRef.value?.validateField('recipient_user_ids')
  }, 100)
}

const searchUsers = (query: string) => {
  emit('searchUsers', query)
}

const loadAllUsers = () => {
  emit('loadAllUsers')
}

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!formRef.value || !props.noticeData) return

  try {
    await formRef.value.validate()

    const submitData: {
      notice_id: number
      resend_type: string
      recipient_user_ids?: number[]
      reason?: string
    } = {
      notice_id: props.noticeData.id as number,
      resend_type: formData.resend_type
    }

    if (formData.reason) {
      submitData.reason = formData.reason
    }

    if (formData.resend_type === 'custom') {
      submitData.recipient_user_ids = formData.recipient_user_ids
    }

    emit('submit', submitData)
  } catch (error) {
    ElMessage.error('请检查表单输入')
  }
}
</script>

<style scoped>
.resend-dialog {
  --el-dialog-border-radius: 8px;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.dialog-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.dialog-content {
  padding: 0 4px;
}

.notice-info {
  margin-bottom: 20px;
  padding: 16px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 6px;
  border: 1px solid var(--el-border-color-light);
}

.info-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.info-item {
  display: flex;
  margin-bottom: 8px;
  align-items: flex-start;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  min-width: 80px;
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.value {
  flex: 1;
  color: var(--el-text-color-primary);
}

.content-text {
  line-height: 1.5;
  word-break: break-word;
}

.resend-form {
  margin-bottom: 20px;
}

.form-section {
  padding: 16px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 6px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-border-color-light);
  padding-bottom: 8px;
}

.form-item {
  margin-bottom: 16px;
}

.form-select,
.form-textarea {
  width: 100%;
}

.radio-label {
  font-size: 14px;
  margin-left: 4px;
}

.warning-tip {
  margin-top: 16px;
}

.alert-content p {
  margin: 4px 0;
  font-size: 13px;
  line-height: 1.4;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 0 0 0;
}

.cancel-btn,
.submit-btn {
  min-width: 100px;
}

.submit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-icon {
  font-size: 16px;
}

:deep(.el-dialog__body) {
  padding: 20px 24px;
}

:deep(.el-dialog__footer) {
  padding: 0 24px 20px 24px;
  border-top: 1px solid var(--el-border-color-light);
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

:deep(.el-radio-group) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:deep(.el-radio) {
  margin-right: 0;
  height: auto;
}

:deep(.el-textarea__inner) {
  resize: vertical;
  min-height: 80px;
}
</style>
