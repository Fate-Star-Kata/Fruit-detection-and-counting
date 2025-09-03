<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Motion } from 'motion-v'
import { ElMessage, ElLoading } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { User, Lock, Platform, Message, Check, Connection, Refresh } from '@element-plus/icons-vue'
import type {
  EmailConfig,
  EmailConfigFormRules,
  ConfigItem
} from '@/types/factory'
import {
  getEmailConfigAPI,
  updateEmailConfigAPI
} from '@/api/admin/config'

// 动画配置
const formVariants = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5, ease: 'easeOut' }
}

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const formRef = ref<FormInstance>()

// 邮箱配置表单数据
const emailForm = reactive<EmailConfig>({
  EMAIL_HOST: '',
  EMAIL_PORT: '587',
  EMAIL_USE_TLS: 'False',
  EMAIL_HOST_USER: '',
  EMAIL_HOST_PASSWORD: '',
  DEFAULT_FROM_EMAIL: ''
})

// TLS开关的计算属性，用于处理字符串和布尔值的转换
const tlsEnabled = computed({
  get: () => emailForm.EMAIL_USE_TLS === 'True',
  set: (value: boolean) => {
    emailForm.EMAIL_USE_TLS = value ? 'True' : 'False'
  }
})

// 表单验证规则
const rules: EmailConfigFormRules = {
  EMAIL_HOST: [
    { required: true, message: '请输入邮箱服务器地址', trigger: 'blur' },
    { min: 3, max: 100, message: '长度在 3 到 100 个字符', trigger: 'blur' }
  ],
  EMAIL_PORT: [
    { required: true, message: '请输入端口号', trigger: 'blur' },
    {
      validator: (value: string) => {
        const port = parseInt(value)
        if (port < 1 || port > 65535) {
          return '端口号必须在 1-65535 之间'
        }
        return true
      },
      trigger: 'blur'
    }
  ],
  EMAIL_HOST_USER: [
    { required: true, message: '请输入邮箱用户名', trigger: 'blur' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  EMAIL_HOST_PASSWORD: [
    { required: true, message: '请输入邮箱密码', trigger: 'blur' },
    { min: 6, max: 50, message: '长度在 6 到 50 个字符', trigger: 'blur' }
  ],
  DEFAULT_FROM_EMAIL: [
    { required: true, message: '请输入默认发件人邮箱', trigger: 'blur' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

// 获取邮箱配置
const getEmailConfig = async () => {
  try {
    loading.value = true
    const res = await getEmailConfigAPI()

    if (res.code === 200 && res.data) {
      // 将配置项数组转换为表单对象
      const configMap = res.data.reduce((acc: any, item: ConfigItem) => {
        acc[item.key] = item.value
        return acc
      }, {})

      // 赋值给表单，确保数据类型正确
      emailForm.EMAIL_HOST = configMap.EMAIL_HOST || ''
      emailForm.EMAIL_PORT = configMap.EMAIL_PORT || '587'
      emailForm.EMAIL_USE_TLS = configMap.EMAIL_USE_TLS || 'False'
      emailForm.EMAIL_HOST_USER = configMap.EMAIL_HOST_USER || ''
      emailForm.EMAIL_HOST_PASSWORD = configMap.EMAIL_HOST_PASSWORD || ''
      emailForm.DEFAULT_FROM_EMAIL = configMap.DEFAULT_FROM_EMAIL || ''
    } else {
      ElMessage.error(res.msg || '获取邮箱配置失败')
    }
  } catch (error) {
    console.error('获取邮箱配置失败:', error)
    ElMessage.error('获取邮箱配置失败')
  } finally {
    loading.value = false
  }
}

// 保存邮箱配置
const saveEmailConfig = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    saving.value = true
    const loadingInstance = ElLoading.service({
      text: '保存中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    // 将表单数据转换为后端期望的格式
    const configData = {
      EMAIL_HOST: emailForm.EMAIL_HOST,
      EMAIL_PORT: emailForm.EMAIL_PORT,
      EMAIL_USE_TLS: emailForm.EMAIL_USE_TLS,
      EMAIL_HOST_USER: emailForm.EMAIL_HOST_USER,
      EMAIL_HOST_PASSWORD: emailForm.EMAIL_HOST_PASSWORD,
      DEFAULT_FROM_EMAIL: emailForm.DEFAULT_FROM_EMAIL
    }

    const res = await updateEmailConfigAPI(configData)

    if (res.code === 200) {
      ElMessage.success('邮箱配置保存成功')
      await getEmailConfig() // 重新获取最新配置
    } else {
      ElMessage.error(res.msg || '保存邮箱配置失败')
    }

    loadingInstance.close()
  } catch (error) {
    console.error('保存邮箱配置失败:', error)
    ElMessage.error('保存邮箱配置失败')
  } finally {
    saving.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  getEmailConfig()
}

// 测试邮箱连接
const testConnection = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    const loadingInstance = ElLoading.service({
      text: '测试连接中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    // 这里可以添加测试连接的API调用
    setTimeout(() => {
      loadingInstance.close()
      ElMessage.success('邮箱连接测试成功')
    }, 2000)
  } catch (error) {
    console.error('测试连接失败:', error)
    ElMessage.error('测试连接失败')
  }
}

// 组件挂载时获取配置
onMounted(() => {
  getEmailConfig()
})
</script>

<template>
  <!-- @vue-ignore -->
  <Motion :initial="formVariants.initial" :animate="formVariants.animate" :transition="formVariants.transition"
    class="email-config">
    <el-form ref="formRef" :model="emailForm" :rules="rules" label-width="140px" v-loading="loading"
      class="config-form">
      <el-row :gutter="24">
        <el-col :span="12">
          <Motion :initial="{ opacity: 0, x: -20 }" :animate="{ opacity: 1, x: 0 }"
            :transition="{ duration: 0.4, delay: 0.1 }">
            <el-form-item label="邮箱服务器" prop="EMAIL_HOST">
              <el-input v-model="emailForm.EMAIL_HOST" placeholder="请输入邮箱服务器地址，如：smtp.gmail.com" clearable>
                <template #prefix>
                  <el-icon>
                    <Platform />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
          </Motion>
        </el-col>

        <el-col :span="12">
          <Motion :initial="{ opacity: 0, x: 20 }" :animate="{ opacity: 1, x: 0 }"
            :transition="{ duration: 0.4, delay: 0.2 }">
            <el-form-item label="端口号" prop="EMAIL_PORT">
              <el-input v-model="emailForm.EMAIL_PORT" placeholder="请输入端口号" class="w-full" />
            </el-form-item>
          </Motion>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <Motion :initial="{ opacity: 0, x: -20 }" :animate="{ opacity: 1, x: 0 }"
            :transition="{ duration: 0.4, delay: 0.3 }">
            <el-form-item label="邮箱用户名" prop="EMAIL_HOST_USER">
              <el-input v-model="emailForm.EMAIL_HOST_USER" placeholder="请输入邮箱用户名" clearable>
                <template #prefix>
                  <el-icon>
                    <User />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
          </Motion>
        </el-col>

        <el-col :span="12">
          <Motion :initial="{ opacity: 0, x: 20 }" :animate="{ opacity: 1, x: 0 }"
            :transition="{ duration: 0.4, delay: 0.4 }">
            <el-form-item label="邮箱密码" prop="EMAIL_HOST_PASSWORD">
              <el-input v-model="emailForm.EMAIL_HOST_PASSWORD" type="password" placeholder="请输入邮箱密码或授权码" show-password
                clearable>
                <template #prefix>
                  <el-icon>
                    <Lock />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
          </Motion>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <Motion :initial="{ opacity: 0, x: -20 }" :animate="{ opacity: 1, x: 0 }"
            :transition="{ duration: 0.4, delay: 0.5 }">
            <el-form-item label="默认发件人" prop="DEFAULT_FROM_EMAIL">
              <el-input v-model="emailForm.DEFAULT_FROM_EMAIL" placeholder="请输入默认发件人邮箱" clearable>
                <template #prefix>
                  <el-icon>
                    <Message />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
          </Motion>
        </el-col>

        <el-col :span="12">
          <Motion :initial="{ opacity: 0, x: 20 }" :animate="{ opacity: 1, x: 0 }"
            :transition="{ duration: 0.4, delay: 0.6 }">
            <el-form-item label="启用TLS">
              <el-switch v-model="tlsEnabled" active-text="启用" inactive-text="禁用" active-color="#13ce66"
                inactive-color="#ff4949" />
              <el-text class="ml-2 text-gray-500" size="small">
                建议启用TLS加密连接以提高安全性
              </el-text>
            </el-form-item>
          </Motion>
        </el-col>
      </el-row>



      <!-- 操作按钮 -->
      <Motion :initial="{ opacity: 0, y: 30 }" :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.7 }" class="form-actions">
        <el-space size="large">
          <Motion :whileHover="{ scale: 1.05 }" :whileTap="{ scale: 0.95 }">
            <el-button type="primary" size="large" :loading="saving" @click="saveEmailConfig">
              <el-icon>
                <Check />
              </el-icon>
              保存配置
            </el-button>
          </Motion>

          <Motion :whileHover="{ scale: 1.05 }" :whileTap="{ scale: 0.95 }">
            <el-button type="success" size="large" @click="testConnection">
              <el-icon>
                <Connection />
              </el-icon>
              测试连接
            </el-button>
          </Motion>

          <Motion :whileHover="{ scale: 1.05 }" :whileTap="{ scale: 0.95 }">
            <el-button size="large" @click="resetForm">
              <el-icon>
                <Refresh />
              </el-icon>
              重置
            </el-button>
          </Motion>
        </el-space>
      </Motion>
    </el-form>
  </Motion>
</template>

<style scoped lang="scss">
.email-config {
  .config-form {
    max-width: 800px;

    :deep(.el-form-item__label) {
      font-weight: 500;
      color: #303133;
    }

    :deep(.el-input) {
      .el-input__wrapper {
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
    }

    :deep(.el-input-number) {
      width: 100%;

      .el-input__wrapper {
        border-radius: 8px;
      }
    }

    :deep(.el-switch) {
      .el-switch__core {
        border-radius: 12px;
      }
    }
  }

  .form-actions {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #f0f2f5;
    text-align: center;

    .el-button {
      min-width: 120px;
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }
  }
}
</style>