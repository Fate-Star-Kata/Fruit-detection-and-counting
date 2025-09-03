<template>
  <div class="personal-details">
    <el-form ref="formRef" :model="localUserInfo" :rules="rules" label-width="100px" v-if="localUserInfo">
      <!-- 手机号 -->
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="localUserInfo.phone" placeholder="请输入手机号" @input="updateUserInfo" />
      </el-form-item>

      <!-- 性别 -->
      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="localUserInfo.gender" @change="updateUserInfo">
          <el-radio label="male">男</el-radio>
          <el-radio label="female">女</el-radio>
          <el-radio label="other">其他</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 生日 -->
      <el-form-item label="生日" prop="birthday">
        <el-date-picker
          v-model="localUserInfo.birthday"
          type="date"
          placeholder="请选择生日"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="updateUserInfo"
          style="width: 100%"
        />
      </el-form-item>



      <!-- 详细地址 -->
      <el-form-item label="详细地址" prop="address">
        <el-input
          v-model="localUserInfo.address"
          type="textarea"
          :rows="3"
          placeholder="请输入详细地址"
          @input="updateUserInfo"
        />
      </el-form-item>

      <!-- 个人简介 -->
      <el-form-item label="个人简介" prop="bio">
        <el-input
          v-model="localUserInfo.bio"
          type="textarea"
          :rows="4"
          placeholder="请输入个人简介"
          maxlength="500"
          show-word-limit
          @input="updateUserInfo"
        />
      </el-form-item>
    </el-form>
    <div v-else class="loading-placeholder">
      <el-skeleton :rows="6" animated />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

// 定义组件名称
defineOptions({
  name: 'PersonalDetails'
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
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  address: [
    { max: 200, message: '详细地址不能超过200个字符', trigger: 'blur' }
  ],
  bio: [
    { max: 500, message: '个人简介不能超过500个字符', trigger: 'blur' }
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
.personal-details {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(229, 231, 235, 0.8);
  transition: all 0.3s ease;
  animation: fadeIn 0.5s ease-in-out;
}

.personal-details:hover {
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

:deep(.el-date-editor) {
  width: 100%;
}

:deep(.el-date-editor .el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-radio-group) {
  display: flex;
  gap: 16px;
}

:deep(.el-radio) {
  margin-right: 0;
}

:deep(.el-col) {
  margin-bottom: 0;
}

:deep(.el-row .el-form-item) {
  margin-bottom: 18px;
}
</style>