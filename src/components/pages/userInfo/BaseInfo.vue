<template>
  <div class="base-info">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" v-if="formData">
      <!-- 基本信息 -->
      <div class="form-section">
        <h4 class="section-title">基本信息</h4>

        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" disabled placeholder="用户名" />
        </el-form-item>

        <!-- 邮箱 -->
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" type="email" placeholder="请输入邮箱" @input="updateUserInfo" />
        </el-form-item>

        <!-- 姓名 -->
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="姓" prop="first_name">
              <el-input v-model="formData.first_name" placeholder="请输入姓" @input="updateUserInfo" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="名" prop="last_name">
              <el-input v-model="formData.last_name" placeholder="请输入名" @input="updateUserInfo" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 账户状态 -->
        <el-form-item label="账户状态">
          <el-switch v-model="formData.is_active" active-text="启用" inactive-text="禁用" :disabled="true" />
        </el-form-item>

        <!-- 头像 -->
        <el-form-item label="头像">
          <div class="flex items-center space-x-4">
            <el-avatar :size="40" :src="userStore.getUserAvatar.value" />
            <span class="text-gray-500 text-sm">头像显示功能</span>
          </div>
        </el-form-item>
      </div>
    </el-form>
    <div v-else class="loading-placeholder">
      <el-skeleton :rows="8" animated />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ChatDotRound, User, Share, Link } from '@element-plus/icons-vue'
import type { GetUserDetailInfoResponse } from '@/types/apis/userinfo'
import { useUserStore } from '@/stores/auth/user'
import { storeToRefs } from 'pinia'
const userStore = storeToRefs(useUserStore())

// 定义组件名称
defineOptions({
  name: 'BaseInfo'
})

// Props
interface Props {
  userInfo: GetUserDetailInfoResponse | null
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'update:userInfo', userInfo: GetUserDetailInfoResponse): void
}

const emit = defineEmits<Emits>()

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = ref<GetUserDetailInfoResponse | null>(null)

// 监听 props 变化，更新表单数据
watch(
  () => props.userInfo,
  (newUserInfo) => {
    if (newUserInfo) {
      formData.value = {
        ...newUserInfo,
        user_info: {

          ...newUserInfo.user_info
        }
      }
    }
  },
  { immediate: true, deep: true }
)

// 表单验证规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  first_name: [
    { max: 30, message: '姓不能超过30个字符', trigger: 'blur' }
  ],
  last_name: [
    { max: 30, message: '名不能超过30个字符', trigger: 'blur' }
  ],
  'user_info.phone': [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  'user_info.qq': [
    { pattern: /^[1-9][0-9]{4,10}$/, message: '请输入正确的QQ号', trigger: 'blur' }
  ],
  'user_info.personal_site': [
    { type: 'url', message: '请输入正确的网站地址', trigger: 'blur' }
  ],
  'user_info.bio': [
    { max: 500, message: '个人简介不能超过500个字符', trigger: 'blur' }
  ]
}

// 更新用户信息
const updateUserInfo = () => {
  if (formData.value) {
    emit('update:userInfo', formData.value)
  }
}

// 验证表单
const validateForm = async (): Promise<boolean> => {
  if (!formRef.value) return false
  try {
    await formRef.value.validate()
    return true
  } catch {
    return false
  }
}

// 暴露验证方法给父组件
defineExpose({
  validateForm
})
</script>

<style scoped lang="scss">
.base-info {
  background: white;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  animation: fadeIn 0.5s ease-in-out;

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .loading-placeholder {
    padding: 20px;
  }

  .form-section {
    margin-bottom: 32px;
    padding: 20px;
    background: #fafafa;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
  }

  .section-title {
    margin: 0 0 20px 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    border-bottom: 2px solid #409eff;
    padding-bottom: 8px;
  }

  .flex {
    display: flex;
  }

  .items-center {
    align-items: center;
  }

  .space-x-4>*+* {
    margin-left: 16px;
  }

  .text-gray-500 {
    color: #909399;
  }

  .text-sm {
    font-size: 14px;
  }

  .avatar-upload {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .form-control {
    .label-text {
      font-weight: 500;
    }
  }

  .input-error,
  .select-error {
    border-color: hsl(var(--error));
  }

  // Element Plus 表单样式优化
  :deep(.el-form-item) {
    margin-bottom: 20px;

    .el-form-item__label {
      font-weight: 600;
      color: #374151;
      font-size: 14px;
    }

    .el-input__wrapper {
      border-radius: 8px;
      border: 2px solid #e5e7eb;
      transition: all 0.3s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      &:hover {
        border-color: #d1d5db;
      }

      &.is-focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }

    .el-button {
      border-radius: 8px;
      font-weight: 600;
      padding: 12px 24px;
      transition: all 0.3s ease;

      &.el-button--primary {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        border: none;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }
  }

  :deep(.el-switch) {
    --el-switch-on-color: #409eff;
    --el-switch-off-color: #dcdfe6;
  }

  :deep(.el-col) {
    margin-bottom: 0;
  }

  :deep(.el-row .el-form-item) {
    margin-bottom: 18px;
  }
}
</style>
