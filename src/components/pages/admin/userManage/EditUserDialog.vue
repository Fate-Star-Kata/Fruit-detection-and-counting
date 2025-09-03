<template>
  <el-dialog
    v-model="dialogVisible"
    title="编辑用户"
    width="600px"
    :before-close="handleClose"
    destroy-on-close
    center
    append-to-body
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      label-position="right"
      class="user-edit-form"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="formData.username"
          placeholder="请输入用户名"
          clearable
        />
      </el-form-item>
      
      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="formData.email"
          placeholder="请输入邮箱"
          clearable
        />
      </el-form-item>
      
      <el-form-item label="状态" prop="is_active">
        <el-switch
          v-model="formData.is_active"
          active-text="启用"
          inactive-text="停用"
        />
      </el-form-item>
      
      <el-form-item label="工作人员权限" prop="is_staff">
        <el-switch
          v-model="formData.is_staff"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
      
      <el-form-item label="超级管理员权限" prop="is_superuser">
        <el-switch
          v-model="formData.is_superuser"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { User } from '@/types/components/admin'
import { editUserAPI } from '@/api/admin/users'

// Props
interface Props {
  visible: boolean
  userData?: User | null
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  userData: null
})

// Emits
interface Emits {
  'update:visible': [value: boolean]
  'success': []
}

const emit = defineEmits<Emits>()

// 响应式数据
const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<User>({
  id: null,
  username: '',
  email: '',
  is_active: false,
  is_staff: false,
  is_superuser: false
})

// 表单验证规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

// 监听 visible 变化
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal
    if (newVal && props.userData) {
      // 填充表单数据
      Object.assign(formData, props.userData)
    }
  },
  { immediate: true }
)

// 监听 dialogVisible 变化
watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal)
})

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
  // 重置表单
  nextTick(() => {
    formRef.value?.resetFields()
    Object.assign(formData, {
      id: null,
      username: '',
      email: '',
      is_active: false,
      is_staff: false,
      is_superuser: false
    })
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    // 表单验证
    await formRef.value.validate()
    
    loading.value = true
    
    // 调用编辑API
    const res = await editUserAPI(formData)
    
    ElMessage.success(res.message || '编辑成功')
    
    // 关闭弹窗并触发成功事件
    handleClose()
    emit('success')
    
  } catch (error: any) {
    console.error('编辑用户失败:', error)
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('编辑失败')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.user-edit-form {
  max-height: 60vh;
  overflow-y: auto;
}

:deep(.el-dialog) {
  border-radius: 12px;
  box-shadow: 0 12px 32px 4px rgba(0, 0, 0, 0.04), 0 8px 20px rgba(0, 0, 0, 0.08);
  z-index: 3000;
}

:deep(.el-overlay) {
  z-index: 2999;
}

:deep(.el-dialog__header) {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f0f2f5;
  background: #fafbfc;
}

:deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

:deep(.el-dialog__body) {
  padding: 24px;
  background: #ffffff;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px 24px;
  border-top: 1px solid #f0f2f5;
  background: #fafbfc;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
  line-height: 1.5;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:hover) {
  border-color: #409eff;
}

:deep(.el-switch) {
  --el-switch-on-color: #10b981;
  --el-switch-off-color: #d1d5db;
  --el-switch-border-color: #d1d5db;
}

:deep(.el-switch__label) {
  font-weight: 500;
  color: #6b7280;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-footer .el-button {
  border-radius: 8px;
  font-weight: 500;
  padding: 10px 20px;
}

.dialog-footer .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.dialog-footer .el-button--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}
</style>