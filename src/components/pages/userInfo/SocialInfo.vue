<template>
  <div class="social-info">
    <el-form ref="formRef" :model="localUserInfo" :rules="rules" label-width="100px" v-if="localUserInfo">
      <!-- 微信 -->
      <el-form-item label="微信号" prop="wechat">
        <el-input v-model="localUserInfo.wechat" placeholder="请输入微信号" @input="updateUserInfo">
          <template #prefix>
            <el-icon><ChatDotRound /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- QQ -->
      <el-form-item label="QQ号" prop="qq">
        <el-input v-model="localUserInfo.qq" placeholder="请输入QQ号" @input="updateUserInfo">
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 微博 -->
      <el-form-item label="微博" prop="weibo">
        <el-input v-model="localUserInfo.weibo" placeholder="请输入微博用户名" @input="updateUserInfo">
          <template #prefix>
            <el-icon><Share /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 个人网站 -->
      <el-form-item label="个人网站" prop="personal_site">
        <el-input v-model="localUserInfo.personal_site" placeholder="请输入个人网站地址" @input="updateUserInfo">
          <template #prefix>
            <el-icon><Link /></el-icon>
          </template>
        </el-input>
      </el-form-item>


    </el-form>
    <div v-else class="loading-placeholder">
      <el-skeleton :rows="5" animated />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  ChatDotRound,
  User,
  Share,
  Link
} from '@element-plus/icons-vue'

// 定义组件名称
defineOptions({
  name: 'SocialInfo'
})

// Props
interface Props {
  userInfo?: any
}

const props = defineProps<Props>()

// Emits
interface Emits {
  'update:user-info': [userInfo: any]
}

const emit = defineEmits<Emits>()

// 表单引用
const formRef = ref<FormInstance>()

// 本地用户信息（用于双向绑定）
const localUserInfo = computed({
  get: () => props.userInfo,
  set: (value) => {
    emit('update:user-info', value)
  }
})

// 表单验证规则
const rules: FormRules = {
  wechat: [
    { max: 50, message: '微信号不能超过50个字符', trigger: 'blur' }
  ],
  qq: [
    { pattern: /^[1-9][0-9]{4,10}$/, message: '请输入正确的QQ号', trigger: 'blur' }
  ],
  weibo: [
    { max: 50, message: '微博用户名不能超过50个字符', trigger: 'blur' }
  ],
  personal_site: [
    { type: 'url', message: '请输入正确的网站地址', trigger: 'blur' }
  ]
}

// 更新用户信息
const updateUserInfo = () => {
  if (localUserInfo.value) {
    emit('update:user-info', { ...localUserInfo.value })
  }
}

// 暴露表单验证方法给父组件
defineExpose({
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields()
})
</script>

<style scoped>
.social-info {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(229, 231, 235, 0.8);
  transition: all 0.3s ease;
  animation: fadeIn 0.5s ease-in-out;
}

.social-info:hover {
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

/* 表单控件样式优化 */
:deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409eff inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

:deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.el-textarea__inner:hover) {
  border-color: #409eff;
}

:deep(.el-textarea__inner:focus) {
  border-color: #409eff;
}

:deep(.el-input__prefix) {
  color: #909399;
}

:deep(.el-input:hover .el-input__prefix) {
  color: #409eff;
}

:deep(.el-input.is-focus .el-input__prefix) {
  color: #409eff;
}
</style>