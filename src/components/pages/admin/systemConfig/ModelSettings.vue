<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Motion } from 'motion-v'
import { getAdminModelSettings, updateAdminModelSettings } from '@/api'
import type { AdminModelSettingsData, AdminModelSettingsUpdateRequest } from '@/types/apis/PagesApi_T'

// 动画配置
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const modelSettings = ref<AdminModelSettingsData | null>(null)

// 表单数据
const formData = ref<AdminModelSettingsUpdateRequest>({
  confidence_threshold: 0.5,
  iou_threshold: 0.5
})

// 表单验证规则
const rules = {
  confidence_threshold: [
    { required: true, message: '请输入置信度阈值', trigger: 'blur' },
    { type: 'number', min: 0, max: 1, message: '置信度阈值必须在0-1之间', trigger: 'blur' }
  ],
  iou_threshold: [
    { required: true, message: '请输入IoU阈值', trigger: 'blur' },
    { type: 'number', min: 0, max: 1, message: 'IoU阈值必须在0-1之间', trigger: 'blur' }
  ]
}

// 获取模型设置
const fetchModelSettings = async () => {
  try {
    loading.value = true
    const response = await getAdminModelSettings()
    if (response.code === 200) {
      modelSettings.value = response.data
      formData.value = {
        confidence_threshold: response.data.confidence_threshold,
        iou_threshold: response.data.iou_threshold
      }
    } else {
      ElMessage.error(response.msg || '获取模型设置失败')
    }
  } catch (error) {
    console.error('获取模型设置失败:', error)
    ElMessage.error('获取模型设置失败')
  } finally {
    loading.value = false
  }
}

// 更新模型设置
const updateSettings = async () => {
  try {
    saving.value = true
    const response = await updateAdminModelSettings(formData.value)
    if (response.code === 200) {
      ElMessage.success('模型设置更新成功')
      await fetchModelSettings() // 重新获取最新设置
    } else {
      ElMessage.error(response.msg || '更新模型设置失败')
    }
  } catch (error) {
    console.error('更新模型设置失败:', error)
    ElMessage.error('更新模型设置失败')
  } finally {
    saving.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (modelSettings.value) {
    formData.value = {
      confidence_threshold: modelSettings.value.confidence_threshold,
      iou_threshold: modelSettings.value.iou_threshold
    }
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchModelSettings()
})
</script>

<template>
  <div class="model-settings">
    <!-- 模型信息卡片 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate" 
      :transition="{ ...cardVariants.transition, delay: 0.1 }">
      <el-card class="info-card" v-loading="loading">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon">
              <InfoFilled />
            </el-icon>
            <span class="header-title">模型信息</span>
          </div>
        </template>
        
        <div v-if="modelSettings" class="model-info">
          <el-row :gutter="24">
            <el-col :span="12">
              <div class="info-item">
                <span class="info-label">模型状态:</span>
                <el-tag :type="modelSettings.model_info.model_loaded ? 'success' : 'danger'">
                  {{ modelSettings.model_info.model_loaded ? '已加载' : '未加载' }}
                </el-tag>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <span class="info-label">模型路径:</span>
                <span class="info-value">{{ modelSettings.model_path }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <span class="info-label">创建时间:</span>
                <span class="info-value">{{ modelSettings.created_time }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <span class="info-label">更新时间:</span>
                <span class="info-value">{{ modelSettings.updated_time }}</span>
              </div>
            </el-col>
          </el-row>
          
          <el-divider />
          
          <div class="supported-fruits">
            <h4>支持的水果类型</h4>
            <div class="fruit-tags">
              <el-tag 
                v-for="fruit in modelSettings.model_info.supported_fruits" 
                :key="fruit"
                class="fruit-tag"
              >
                {{ fruit }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>
    </Motion>

    <!-- 模型设置卡片 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate" 
      :transition="{ ...cardVariants.transition, delay: 0.2 }">
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon">
              <Setting />
            </el-icon>
            <span class="header-title">模型参数设置</span>
          </div>
        </template>
        
        <el-form 
          :model="formData" 
          :rules="rules" 
          label-width="120px"
          class="settings-form"
        >
          <el-form-item label="置信度阈值" prop="confidence_threshold">
            <el-slider
              v-model="formData.confidence_threshold"
              :min="0"
              :max="1"
              :step="0.01"
              :format-tooltip="(val: number) => `${(val * 100).toFixed(0)}%`"
              show-input
              :show-input-controls="false"
              class="threshold-slider"
            />
            <div class="threshold-desc">
              置信度阈值决定了模型检测结果的可信程度，值越高检测越严格
            </div>
          </el-form-item>
          
          <el-form-item label="IoU阈值" prop="iou_threshold">
            <el-slider
              v-model="formData.iou_threshold"
              :min="0"
              :max="1"
              :step="0.01"
              :format-tooltip="(val: number) => `${(val * 100).toFixed(0)}%`"
              show-input
              :show-input-controls="false"
              class="threshold-slider"
            />
            <div class="threshold-desc">
              IoU阈值用于非极大值抑制，控制重叠检测框的过滤程度
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-space>
              <el-button 
                type="primary" 
                @click="updateSettings" 
                :loading="saving"
                :disabled="loading"
              >
                <el-icon><Check /></el-icon>
                保存设置
              </el-button>
              <el-button @click="resetForm" :disabled="loading || saving">
                <el-icon><RefreshLeft /></el-icon>
                重置
              </el-button>
              <el-button @click="fetchModelSettings" :loading="loading">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </el-space>
          </el-form-item>
        </el-form>
      </el-card>
    </Motion>
  </div>
</template>

<style scoped lang="scss">
.model-settings {
  .info-card,
  .settings-card {
    margin-bottom: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    
    :deep(.el-card__body) {
      padding: 24px;
    }
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .header-icon {
      font-size: 18px;
      color: var(--el-color-primary);
    }
    
    .header-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
  
  .model-info {
    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      
      .info-label {
        font-weight: 500;
        color: var(--el-text-color-regular);
        margin-right: 8px;
        min-width: 80px;
      }
      
      .info-value {
        color: var(--el-text-color-primary);
        word-break: break-all;
      }
    }
    
    .supported-fruits {
      h4 {
        margin: 0 0 12px 0;
        color: var(--el-text-color-primary);
        font-size: 14px;
        font-weight: 600;
      }
      
      .fruit-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        
        .fruit-tag {
          margin: 0;
        }
      }
    }
  }
  
  .settings-form {
    .threshold-slider {
      width: 100%;
      
      :deep(.el-slider__input) {
        width: 80px;
      }
    }
    
    .threshold-desc {
      margin-top: 8px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      line-height: 1.4;
    }
  }
}
</style>