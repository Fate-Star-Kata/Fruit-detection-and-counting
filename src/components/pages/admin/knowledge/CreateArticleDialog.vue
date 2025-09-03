<template>
  <el-dialog 
    v-model="visible" 
    title="新建文章" 
    width="720px" 
    :close-on-click-modal="false" 
    :close-on-press-escape="false" 
    destroy-on-close 
    align-center
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入标题" clearable />
      </el-form-item>
      
      <el-form-item label="摘要" prop="summary">
        <el-input v-model="form.summary" type="textarea" :rows="3" placeholder="请输入摘要" />
      </el-form-item>
      
      <el-form-item label="分类" prop="category">
        <el-select v-model="form.category" placeholder="请选择分类" style="width: 260px">
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="标签" prop="tags">
        <el-input v-model="form.tags" placeholder="使用英文逗号分隔，如：前端,Vue,TypeScript" />
      </el-form-item>
      
      <el-form-item label="封面图" prop="image">
        <el-input v-model="form.image" placeholder="图片URL（可选）" />
      </el-form-item>
      
      <el-form-item label="排序" prop="sort_order">
        <el-input-number v-model="form.sort_order" :min="0" />
      </el-form-item>
      
      <el-form-item label="精选">
        <el-switch v-model="form.is_featured" />
      </el-form-item>
      
      <el-form-item label="内容" prop="content">
        <el-input v-model="form.content" type="textarea" :rows="8" placeholder="请输入文章内容（支持Markdown）" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { type FormInstance, type FormRules } from 'element-plus'
import type { KnowledgeCategory, AdminCreateArticlePayload } from '@/types/factory'

// Props
const props = defineProps<{
  modelValue: boolean
  categories: KnowledgeCategory[]
  loading: boolean
}>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [payload: AdminCreateArticlePayload]
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
})

// 表单数据
const form = reactive<AdminCreateArticlePayload>({
  title: '',
  content: '',
  summary: '',
  image: '',
  category: undefined as unknown as number,
  tags: '',
  is_featured: false,
  sort_order: 0,
})

// 表单验证规则
const rules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  summary: [{ required: true, message: '请输入摘要', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
}

// 重置表单
const resetForm = () => {
  form.title = ''
  form.summary = ''
  form.category = undefined as unknown as number
  form.tags = ''
  form.image = ''
  form.is_featured = false
  form.sort_order = 0
  form.content = ''
  formRef.value?.resetFields()
}

// 处理关闭
const handleClose = () => {
  visible.value = false
  resetForm()
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    const payload: AdminCreateArticlePayload = {
      ...form,
      image: form.image || null
    }
    
    emit('submit', payload)
  })
}
</script>

<style scoped>
/* 组件样式 */
</style>