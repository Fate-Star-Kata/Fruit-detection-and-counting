<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Motion } from 'motion-v'
import { ElMessage, ElLoading } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { View, Check, Refresh } from '@element-plus/icons-vue'
import type {
  CaptchaConfig,
  CaptchaConfigFormRules,
  ConfigItem
} from '@/types/factory'
import {
  getCaptchaConfigAPI,
  updateCaptchaConfigAPI
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

// 验证码配置表单数据
const captchaForm = reactive<CaptchaConfig>({
  CAPTCHA_LENGTH: 4,
  CAPTCHA_TIMEOUT: 300,
  CAPTCHA_IMAGE_SIZE: [120, 40],
  CAPTCHA_FONT_SIZE: 30
})

// 表单验证规则
const rules: CaptchaConfigFormRules = {
  captcha_length: [
    { required: true, message: '请输入验证码长度', trigger: 'blur' },
    {
      validator: (value: number) => {
        if (value < 3 || value > 8) {
          return '验证码长度必须在 3-8 之间'
        }
        return true
      },
      trigger: 'blur'
    }
  ],
  captcha_timeout: [
    { required: true, message: '请输入验证码超时时间', trigger: 'blur' },
    {
      validator: (value: number) => {
        if (value < 60 || value > 3600) {
          return '超时时间必须在 60-3600 秒之间'
        }
        return true
      },
      trigger: 'blur'
    }
  ],
  captcha_font_size: [
    { required: true, message: '请输入字体大小', trigger: 'blur' },
    {
      validator: (value: number) => {
        if (value < 12 || value > 50) {
          return '字体大小必须在 12-50 之间'
        }
        return true
      },
      trigger: 'blur'
    }
  ]
}

// 图片尺寸选项
const imageSizeOptions = [
  { label: '120x40 (推荐)', value: [120, 40] },
  { label: '150x50', value: [150, 50] },
  { label: '180x60', value: [180, 60] },
  { label: '200x80', value: [200, 80] }
]

// 获取验证码配置
const getCaptchaConfig = async () => {
  try {
    loading.value = true
    const res = await getCaptchaConfigAPI()

    if (res.code === 200 && res.data) {
      // 将配置项数组转换为表单对象
      const configMap = res.data.reduce((acc: any, item: ConfigItem) => {
        acc[item.key] = item.value
        return acc
      }, {})

      // 赋值给表单，确保数据类型正确
      captchaForm.CAPTCHA_LENGTH = configMap.CAPTCHA_LENGTH ? parseInt(configMap.CAPTCHA_LENGTH) : 4
      captchaForm.CAPTCHA_TIMEOUT = configMap.CAPTCHA_TIMEOUT ? parseInt(configMap.CAPTCHA_TIMEOUT) * 60 : 300 // 转换为秒
      captchaForm.CAPTCHA_FONT_SIZE = configMap.CAPTCHA_FONT_SIZE ? parseInt(configMap.CAPTCHA_FONT_SIZE) : 30

      // 处理图片尺寸
      if (configMap.CAPTCHA_IMAGE_SIZE) {
        try {
          // 解析类似 "(100, 40)" 的字符串
          const sizeStr = configMap.CAPTCHA_IMAGE_SIZE.replace(/[()]/g, '')
          const [width, height] = sizeStr.split(',').map((s: string) => parseInt(s.trim()))
          captchaForm.CAPTCHA_IMAGE_SIZE = [width || 120, height || 40]
        } catch {
          captchaForm.CAPTCHA_IMAGE_SIZE = [120, 40]
        }
      }
    } else {
      ElMessage.error(res.msg || '获取验证码配置失败')
    }
  } catch (error) {
    console.error('获取验证码配置失败:', error)
    ElMessage.error('获取验证码配置失败')
  } finally {
    loading.value = false
  }
}

// 保存验证码配置
const saveCaptchaConfig = async () => {
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
    const configData: CaptchaConfig = {
      CAPTCHA_LENGTH: captchaForm.CAPTCHA_LENGTH,
      CAPTCHA_TIMEOUT: Math.floor(captchaForm.CAPTCHA_TIMEOUT / 60), // 转换为分钟
      CAPTCHA_IMAGE_SIZE: captchaForm.CAPTCHA_IMAGE_SIZE,
      CAPTCHA_FONT_SIZE: captchaForm.CAPTCHA_FONT_SIZE || 30
    }

    const res = await updateCaptchaConfigAPI(configData)

    if (res.code === 200) {
      ElMessage.success('验证码配置保存成功')
      await getCaptchaConfig() // 重新获取最新配置
    } else {
      ElMessage.error(res.msg || '保存验证码配置失败')
    }

    loadingInstance.close()
  } catch (error) {
    console.error('保存验证码配置失败:', error)
    ElMessage.error('保存验证码配置失败')
  } finally {
    saving.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  getCaptchaConfig()
}

// 预览验证码
const previewCaptcha = () => {
  ElMessage.info('验证码预览功能开发中...')
}

// 组件挂载时获取配置
onMounted(() => {
  getCaptchaConfig()
})
</script>

<template>
  <!-- @vue-ignore -->
  <Motion :initial="formVariants.initial" :animate="formVariants.animate" :transition="formVariants.transition"
    class="captcha-config">
    <el-form ref="formRef" :model="captchaForm" :rules="rules" label-width="140px" v-loading="loading"
      class="config-form">
      <el-row :gutter="24">
        <el-col :span="8">
          <Motion :initial="{ opacity: 0, x: -20 }" :animate="{ opacity: 1, x: 0 }"
            :transition="{ duration: 0.4, delay: 0.1 }">
            <el-form-item label="验证码长度" prop="CAPTCHA_LENGTH">
              <el-input-number v-model="captchaForm.CAPTCHA_LENGTH" :min="3" :max="8" placeholder="请输入验证码长度"
                class="w-full" />
              <el-text class="block mt-1 text-gray-500" size="small">
                建议设置为 4-6 位
              </el-text>
            </el-form-item>
          </Motion>
        </el-col>

        <el-col :span="8">
          <Motion :initial="{ opacity: 0, x: 0 }" :animate="{ opacity: 1, x: 0 }"
            :transition="{ duration: 0.4, delay: 0.2 }">
            <el-form-item label="超时时间(秒)" prop="CAPTCHA_TIMEOUT">
              <el-input-number v-model="captchaForm.CAPTCHA_TIMEOUT" :min="60" :max="3600" placeholder="请输入超时时间"
                class="w-full" />
              <el-text class="block mt-1 text-gray-500" size="small">
                验证码有效期
              </el-text>
            </el-form-item>
          </Motion>
        </el-col>

        <el-col :span="8">
          <Motion :initial="{ opacity: 0, x: 20 }" :animate="{ opacity: 1, x: 0 }"
            :transition="{ duration: 0.4, delay: 0.3 }">
            <el-form-item label="字体大小" prop="CAPTCHA_FONT_SIZE">
              <el-input-number v-model="captchaForm.CAPTCHA_FONT_SIZE" :min="12" :max="50" placeholder="请输入字体大小"
                class="w-full" />
              <el-text class="block mt-1 text-gray-500" size="small">
                字体大小（像素）
              </el-text>
            </el-form-item>
          </Motion>
        </el-col>
      </el-row>

      <Motion :initial="{ opacity: 0, y: 20 }" :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.4, delay: 0.4 }">
        <el-form-item label="图片尺寸">
          <el-radio-group v-model="captchaForm.CAPTCHA_IMAGE_SIZE" class="image-size-group">
            <el-radio v-for="option in imageSizeOptions" :key="option.label" :value="option.value"
              class="image-size-radio">
              {{ option.label }}
            </el-radio>
          </el-radio-group>
          <el-text class="block mt-2 text-gray-500" size="small">
            当前尺寸：{{ captchaForm.CAPTCHA_IMAGE_SIZE[0] }} x {{ captchaForm.CAPTCHA_IMAGE_SIZE[1] }} 像素
          </el-text>
        </el-form-item>
      </Motion>

      <!-- 配置预览区域 -->
      <Motion :initial="{ opacity: 0, y: 20 }" :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.4, delay: 0.5 }">
        <el-form-item label="配置预览">
          <el-card class="preview-card" shadow="never">
            <div class="preview-content">
              <div class="preview-item">
                <el-text class="preview-label">验证码长度：</el-text>
                <el-tag type="primary">{{ captchaForm.CAPTCHA_LENGTH }} 位</el-tag>
              </div>
              <div class="preview-item">
                <el-text class="preview-label">有效期：</el-text>
                <el-tag type="success">{{ Math.floor(captchaForm.CAPTCHA_TIMEOUT / 60) }} 分钟</el-tag>
              </div>
              <div class="preview-item">
                <el-text class="preview-label">图片尺寸：</el-text>
                <el-tag type="info">{{ captchaForm.CAPTCHA_IMAGE_SIZE[0] }}x{{ captchaForm.CAPTCHA_IMAGE_SIZE[1]
                  }}</el-tag>
              </div>
              <div class="preview-item">
                <el-text class="preview-label">字体大小：</el-text>
                <el-tag type="warning">{{ captchaForm.CAPTCHA_FONT_SIZE }}px</el-tag>
              </div>
            </div>
            <el-divider />
            <div class="preview-actions">
              <el-button type="primary" plain @click="previewCaptcha">
                <el-icon>
                  <View />
                </el-icon>
                预览验证码
              </el-button>
            </div>
          </el-card>
        </el-form-item>
      </Motion>

      <!-- 操作按钮 -->
      <Motion :initial="{ opacity: 0, y: 30 }" :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.6 }" class="form-actions">
        <el-space size="large">
          <Motion :whileHover="{ scale: 1.05 }" :whileTap="{ scale: 0.95 }">
            <el-button type="primary" size="large" :loading="saving" @click="saveCaptchaConfig">
              <el-icon>
                <Check />
              </el-icon>
              保存配置
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
.captcha-config {
  .config-form {
    max-width: 800px;

    :deep(.el-form-item__label) {
      font-weight: 500;
      color: #303133;
    }

    :deep(.el-input-number) {
      width: 100%;

      .el-input__wrapper {
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }

  .image-size-group {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .image-size-radio {
      :deep(.el-radio__label) {
        font-weight: 500;
      }
    }
  }

  .preview-card {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border: 1px solid #e2e8f0;
    border-radius: 12px;

    .preview-content {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;

      .preview-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .preview-label {
          font-weight: 500;
          color: #64748b;
        }
      }
    }

    .preview-actions {
      text-align: center;
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