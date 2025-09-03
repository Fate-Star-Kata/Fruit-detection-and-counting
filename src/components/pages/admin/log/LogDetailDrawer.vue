<template>
  <el-drawer 
    v-model="visible" 
    title="日志详情" 
    size="520px" 
    :with-header="true"
    @close="handleClose"
  >
    <!-- 加载状态蒙层 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        <span>数据加载中...</span>
      </div>
    </div>

    <div v-if="loading" class="p-4">
      <el-skeleton rows="8" animated></el-skeleton>
    </div>
    <div v-else-if="detailData" class="p-4 detail-content">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="用户">
          {{ detailData.user?.username }} (ID: {{ detailData.user?.id }})
        </el-descriptions-item>
        <el-descriptions-item label="类型">
          {{ detailData.action_type_display }} ({{ detailData.action_type }})
        </el-descriptions-item>
        <el-descriptions-item label="模块">{{ detailData.module }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ detailData.description }}</el-descriptions-item>
        <el-descriptions-item label="目标模型">{{ detailData.target_model ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="目标ID">{{ detailData.target_id ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="IP">{{ detailData.ip_address }}</el-descriptions-item>
        <el-descriptions-item label="状态码">
          <el-tag :type="detailData.response_status === 200 ? 'success' : 'danger'">
            {{ detailData.response_status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="时间">{{ detailData.created_at }}</el-descriptions-item>
        <el-descriptions-item label="UA">{{ detailData.user_agent || '-' }}</el-descriptions-item>
      </el-descriptions>
      <div class="mt-3">
        <div class="text-sm text-gray-500 mb-1">请求数据</div>
        <el-input 
          type="textarea" 
          :rows="8" 
          :model-value="formatJson(detailData.request_data)" 
          readonly 
        />
      </div>
    </div>
    <div v-else class="p-4">
      <el-empty description="暂无数据" />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import type { OperationLogDetail } from '@/types/factory'

interface Props {
  modelValue: boolean
  detailData: OperationLogDetail | null
  loading?: boolean
}

interface Emits {
  'update:modelValue': [value: boolean]
  close: []
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

// 抽屉显示状态的计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 格式化JSON数据
function formatJson(obj: any) {
  try {
    return JSON.stringify(obj ?? {}, null, 2)
  } catch (e) {
    return String(obj ?? '')
  }
}

// 关闭抽屉处理
function handleClose() {
  emit('close')
}
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 4px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #409eff;
  font-size: 14px;
}

.detail-content {
  position: relative;
}

.p-4 {
  padding: 16px;
}

.mt-3 {
  margin-top: 12px;
}

.mb-1 {
  margin-bottom: 4px;
}

.text-sm {
  font-size: 14px;
}

.text-gray-500 {
  color: #6b7280;
}
</style>