<template>
  <el-dialog 
    v-model="visible" 
    :title="`编辑文章 #${editingId || ''}`" 
    width="720px" 
    :close-on-click-modal="false" 
    :close-on-press-escape="false" 
    destroy-on-close 
    align-center
    @close="handleClose"
  >
    <div v-if="detailLoading" class="p-4">
      <el-skeleton :rows="6" animated />
    </div>
    
    <div v-else>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" clearable />
        </el-form-item>
        
        <el-form-item label="内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="10" placeholder="请输入内容" />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="选择状态" style="width: 200px">
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="updateLoading" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { type FormInstance, type FormRules } from 'element-plus'
import type { AdminUpdateArticlePayload } from '@/types/factory'

// Props
const props = defineProps<{
  modelValue: boolean
  editingId: number | null
  detailLoading: boolean
  updateLoading: boolean
  articleData?: {
    title: string
    content: string
    status: string
  }
}>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [id: number, payload: AdminUpdateArticlePayload]
  loadDetail: [id: number]
}>()

// 表单引用
const formRef = ref<FormInstance>()

// 对话框可见性
const visible = ref(props.modelValue)

// 监听外部可见性变化
watch(() => props.modelValue, (newValue) => {
  visible.value = newValue
})

// 监听内部可见性变化
watch(visible, (newValue) => {
  emit('update:modelValue', newValue)
  if (newValue && props.editingId) {
    emit('loadDetail', props.editingId)
  }
})

// 表单数据
const form = reactive<Required<AdminUpdateArticlePayload>>({
  title: '',
  content: '',
  status: 'draft'
})

// 监听文章数据变化
watch(() => props.articleData, (newData) => {
  if (newData) {
    form.title = newData.title
    form.content = newData.content
    form.status = newData.status as any
  }
}, { deep: true })

// 表单验证规则
const rules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

// 重置表单
const resetForm = () => {
  form.title = ''
  form.content = ''
  form.status = 'draft'
  formRef.value?.resetFields()
}

// 处理关闭
const handleClose = () => {
  visible.value = false
  resetForm()
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value || !props.editingId) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    const payload: AdminUpdateArticlePayload = {
      title: form.title,
      content: form.content,
      status: form.status
    }
    
    emit('submit', props.editingId!, payload)
  })
}
</script>

<style scoped>
/* 组件样式 */
</style>