<template>
  <el-dialog 
    :model-value="visible" 
    @update:model-value="$emit('update:visible', $event)"
    :title="isEditing ? '编辑通知' : '发布通知'" 
    width="650px"
    :close-on-click-modal="false" 
    :close-on-press-escape="false" 
    destroy-on-close 
    class="notification-dialog"
    align-center
    @close="handleClose"
  >
    <template #header="{ titleId, titleClass }">
      <div class="dialog-header">
        <div class="dialog-icon">
          <el-icon size="24">
            <Edit v-if="isEditing" />
            <Plus v-else />
          </el-icon>
        </div>
        <h3 :id="titleId" :class="titleClass" class="dialog-title">
          {{ isEditing ? '编辑通知' : '发布通知' }}
        </h3>
      </div>
    </template>

    <div class="dialog-content">
      <el-form 
        ref="formRef" 
        :model="formData" 
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
              v-model="formData.title" 
              placeholder="请输入通知标题" 
              maxlength="100" 
              show-word-limit 
              clearable
              class="form-input" 
            />
          </el-form-item>

          <el-form-item label="通知内容" prop="content" class="form-item">
            <el-input 
              v-model="formData.content" 
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
                v-model="formData.is_active" 
                active-text="启用" 
                inactive-text="未启用"
                active-color="var(--el-color-success)" 
                inactive-color="var(--el-color-info)" 
                size="default" 
              />
            </el-form-item>

            <el-form-item label="通知所有人" class="switch-item">
              <el-switch 
                v-model="formData.notify_all" 
                active-text="是" 
                inactive-text="否"
                active-color="var(--el-color-primary)" 
                inactive-color="var(--el-color-info)" 
                size="default"
                @change="handleNotifyAllChange" 
              />
            </el-form-item>
          </div>
          <br>
          <!-- 指定用户选择 -->
          <el-form-item 
            v-if="!formData.notify_all" 
            label="指定用户" 
            prop="recipient_user_ids" 
            class="form-item"
          >
            <el-select 
              v-model="formData.recipient_user_ids" 
              multiple 
              filterable 
              remote 
              reserve-keyword
              placeholder="请选择要通知的用户" 
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
        </div>
      </el-form>
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
            <Edit v-if="isEditing" />
            <Plus v-else />
          </el-icon>
          {{ isEditing ? '更新通知' : '发布通知' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, Edit } from '@element-plus/icons-vue'
import type { CreateNotificationReq, NotificationItem } from '@/types/factory'

// Props
interface Props {
  visible: boolean
  editingData?: NotificationItem | null
  submitting?: boolean
  userOptions?: Array<{ id: number; username: string }>
  userSearchLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editingData: null,
  submitting: false,
  userOptions: () => [],
  userSearchLoading: false
})

// Emits
interface Emits {
  'update:visible': [value: boolean]
  submit: [data: CreateNotificationReq]
  searchUsers: [query: string]
  loadAllUsers: []
}

const emit = defineEmits<Emits>()

// 响应式数据
const formRef = ref<FormInstance>()
const formData = reactive<CreateNotificationReq>({
  title: '',
  content: '',
  is_public: true,
  is_active: true,
  notify_all: false,
  email_notification: false,
  recipient_user_ids: []
})

// 计算属性
const isEditing = computed(() => !!props.editingData)

// 方法
const resetForm = () => {
  Object.assign(formData, {
    title: '',
    content: '',
    is_public: true,
    is_active: true,
    notify_all: false,
    email_notification: false,
    recipient_user_ids: []
  })
  formRef.value?.resetFields()
}

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
        callback()
      },
      trigger: 'change'
    }
  ]
}

// 监听编辑数据变化
watch(() => props.editingData, (newData) => {
  if (newData) {
    Object.assign(formData, {
      title: newData.title || '',
      content: newData.content || '',
      is_public: newData.is_public ?? true,
      is_active: newData.is_active ?? true,
      notify_all: false,
      email_notification: false,
      recipient_user_ids: []
    })
  } else {
    resetForm()
  }
}, { immediate: true })

// 监听visible变化
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})

const handleNotifyAllChange = (value: boolean) => {
  if (value) {
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
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    emit('submit', { ...formData })
  } catch (error) {
    ElMessage.error('请检查表单输入')
  }
}
</script>

<style scoped>
.notification-dialog {
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
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
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

.notification-form {
  max-height: 60vh;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 24px;
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

.form-input,
.form-textarea,
.form-select {
  width: 100%;
}

.switch-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.switch-item {
  margin-bottom: 0;
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

:deep(.el-textarea__inner) {
  resize: vertical;
  min-height: 120px;
}

:deep(.el-switch__label) {
  font-size: 13px;
}
</style>