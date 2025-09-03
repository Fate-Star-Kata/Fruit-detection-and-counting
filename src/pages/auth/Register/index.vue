<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UserFilled, Check, Refresh, RefreshLeft } from '@element-plus/icons-vue'
import type { RegisterForm, RegisterRequest, RegisterResponse } from '@/types/apis/auth'
import type { CaptchaResponse } from '@/types/apis/auth'
import { register, getCaptCha } from '@/api/user'
import serverConfig from '@/configs'

const router = useRouter()

// 表单数据
const registerForm = ref<RegisterForm>({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  captcha_id: '',
  captcha_text: ''
})

// 状态管理
const loading = ref(false)
const captchaImage = ref('')

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '密码必须包含大小写字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== registerForm.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  captcha_text: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 4, message: '验证码为4位', trigger: 'blur' }
  ]
}

// 刷新验证码
async function refreshCaptcha(): Promise<void> {
  try {
    const response: CaptchaResponse = await getCaptCha()
    console.log(response)

    if (response.code === 200 && response.data) {
      captchaImage.value = import.meta.env.VITE_SERVER_PATH + response.data.captcha_url
      registerForm.value.captcha_id = response.data.captcha_id
    } else {
      throw new Error(response.msg)
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
    ElMessage.error('获取验证码失败')
    // 模拟验证码图片
    const randomCode = Math.random().toString(36).substr(2, 4).toUpperCase()
    captchaImage.value = `data:image/svg+xml;base64,${btoa(`
      <svg width="120" height="40" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="40" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
        <text x="60" y="25" text-anchor="middle" font-family="Arial" font-size="16" fill="#495057" font-weight="bold">
          ${randomCode}
        </text>
      </svg>
    `)}`
  }
}

// 表单引用
const formRef = ref()

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    const requestData: RegisterRequest = {
      username: registerForm.value.username,
      password: registerForm.value.password,
      email: registerForm.value.email,
      captcha_id: registerForm.value.captcha_id,
      captcha_text: registerForm.value.captcha_text
    }

    const response: RegisterResponse = await register(requestData)
    if (response.code === 200) {
      ElMessage.success('注册成功！')
      await ElMessageBox.alert('注册成功，即将跳转到登录页面', '提示', {
        confirmButtonText: '确定',
        type: 'success'
      })
      router.push('/auth/login')
    } else {
      ElMessage.error(response.msg || '注册失败')
      // 刷新验证码
      await refreshCaptcha()
      registerForm.value.captcha_text = ''
    }
  } catch (error: any) {
    console.error('注册失败:', error)
    ElMessage.error(error.message || '注册失败，请重试')
    // 刷新验证码
    await refreshCaptcha()
    registerForm.value.captcha_text = ''
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  refreshCaptcha()
}

// 组件挂载时获取验证码
onMounted(() => {
  refreshCaptcha()
})
</script>

<template>
  <div class="register-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-wrapper">
      <!-- 左侧信息面板 -->
      <div class="info-panel">
        <div class="info-content">
          <div class="logo-section">
            <div class="logo-icon">
              <el-icon size="48">
                <component :is="serverConfig.VITE_APP_LOGO" v-if="serverConfig.VITE_APP_LOGO" size="80px" />
              </el-icon>
            </div>
            <h1 class="brand-title">{{ serverConfig.VITE_APP_TITLE }}</h1>
          </div>

          <div class="welcome-text">
            <h2>欢迎加入我们</h2>
            <p>创建您的账户，开始您的数字化之旅</p>
          </div>

          <div class="features-list">
            <div class="feature-item">
              <el-icon>
                <Check />
              </el-icon>
              <span>安全可靠的数据保护</span>
            </div>
            <div class="feature-item">
              <el-icon>
                <Check />
              </el-icon>
              <span>简洁直观的用户界面</span>
            </div>
            <div class="feature-item">
              <el-icon>
                <Check />
              </el-icon>
              <span>强大的功能支持</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧注册表单 -->
      <div class="form-panel">
        <div class="form-container">
          <!-- 表单标题 -->
          <div class="form-header">
            <h3>创建新账户</h3>
            <p>请填写以下信息完成注册</p>
          </div>

          <!-- 注册表单 -->
          <el-form ref="formRef" :model="registerForm" :rules="rules" label-position="top" size="large"
            class="register-form" @submit.prevent="handleSubmit">
            <!-- 用户名和邮箱并排 -->
            <div class="form-row">
              <el-form-item label="用户名" prop="username" class="form-item-half">
                <el-input v-model="registerForm.username" placeholder="请输入用户名" prefix-icon="User" clearable />
              </el-form-item>

              <el-form-item label="邮箱地址" prop="email" class="form-item-half">
                <el-input v-model="registerForm.email" type="email" placeholder="请输入邮箱地址" prefix-icon="Message"
                  clearable />
              </el-form-item>
            </div>

            <!-- 密码和确认密码并排 -->
            <div class="form-row">
              <el-form-item label="密码" prop="password" class="form-item-half">
                <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock"
                  show-password clearable />
              </el-form-item>

              <el-form-item label="确认密码" prop="confirmPassword" class="form-item-half">
                <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码"
                  prefix-icon="Lock" show-password clearable />
              </el-form-item>
            </div>

            <!-- 验证码 -->
            <el-form-item label="验证码" prop="captcha_text">
              <div class="captcha-container">
                <el-input v-model="registerForm.captcha_text" placeholder="请输入验证码" prefix-icon="Picture" maxlength="4"
                  clearable class="captcha-input" />
                <div class="captcha-image-wrapper">
                  <img v-if="captchaImage" :src="captchaImage" alt="验证码" class="captcha-image" @click="refreshCaptcha"
                    title="点击刷新验证码" />
                  <div v-else class="captcha-placeholder" @click="refreshCaptcha">
                    <el-icon>
                      <Refresh />
                    </el-icon>
                    <span>点击获取</span>
                  </div>
                </div>
              </div>
            </el-form-item>

            <!-- 操作按钮 -->
            <div class="form-actions">
              <el-button type="primary" size="large" :loading="loading" @click="handleSubmit" class="submit-btn">
                <el-icon v-if="!loading">
                  <UserFilled />
                </el-icon>
                {{ loading ? '注册中...' : '立即注册' }}
              </el-button>

              <el-button size="large" @click="resetForm" class="reset-btn">
                <el-icon>
                  <RefreshLeft />
                </el-icon>
                重置表单
              </el-button>
            </div>
          </el-form>

          <!-- 登录链接 -->
          <div class="form-footer">
            <div class="divider">
              <!-- <span>或</span> -->
            </div>
            <p class="login-link">
              已有账号？
              <router-link to="/auth/login" class="link">
                立即登录
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 主容器 */
.register-container {
  min-height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }

  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* 内容包装器 */
.content-wrapper {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* 信息面板 */
.info-panel {
  flex: 1;
  max-width: 500px;
  padding: 3rem;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-content {
  text-align: center;
  animation: slideInLeft 0.8s ease-out;
}

.logo-section {
  margin-bottom: 3rem;
}

.logo-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #fff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-text {
  margin-bottom: 3rem;
}

.welcome-text h2 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #fff;
}

.welcome-text p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.features-list {
  text-align: left;
  max-width: 300px;
  margin: 0 auto;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
}

.feature-item .el-icon {
  margin-right: 0.75rem;
  color: #4ade80;
  font-size: 1.2rem;
}

/* 表单面板 */
.form-panel {
  flex: 1;
  max-width: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-container {
  width: 100%;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideInRight 0.8s ease-out;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h3 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.form-header p {
  color: #6b7280;
  font-size: 0.95rem;
}

/* 表单样式 */
.register-form {
  margin-top: 0;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 0;
}

.form-item-half {
  flex: 1;
  margin-bottom: 1.5rem;
}

.form-item-half :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-item-half :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.form-item-half :deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.form-item-half :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 验证码容器 */
.captcha-container {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.captcha-input {
  flex: 1;
}

.captcha-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.captcha-image-wrapper {
  flex-shrink: 0;
}

.captcha-image {
  width: 120px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
  object-fit: cover;
}

.captcha-image:hover {
  border-color: #667eea;
  transform: scale(1.05);
}

.captcha-placeholder {
  width: 120px;
  height: 40px;
  border-radius: 8px;
  border: 2px dashed #d1d5db;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #f9fafb;
  transition: all 0.3s ease;
  font-size: 0.75rem;
  color: #6b7280;
}

.captcha-placeholder:hover {
  border-color: #667eea;
  background: #f0f4ff;
  color: #667eea;
}

.captcha-placeholder .el-icon {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

/* 操作按钮 */
.form-actions {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
}

.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  margin-left: 0;
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.submit-btn .el-icon {
  margin-right: 0.5rem;
}

.reset-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  margin-left: 0;
  font-size: 1rem;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  background: #fff;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  color: #667eea;
  border-color: #667eea;
  background: #f0f4ff;
}

.reset-btn .el-icon {
  margin-right: 0.5rem;
}

/* 表单底部 */
.form-footer {
  margin-top: 2rem;
  text-align: center;
}

.divider {
  position: relative;
  margin: 1.5rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e5e7eb;
}

.divider span {
  background: rgba(255, 255, 255, 0.95);
  padding: 0 1rem;
  color: #9ca3af;
  font-size: 0.875rem;
  position: relative;
  z-index: 1;
}

.login-link {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.link:hover {
  color: #4f46e5;
  text-decoration: underline;
}

/* 动画 */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-wrapper {
    flex-direction: column;
    padding: 1rem;
  }

  .info-panel {
    max-width: 100%;
    padding: 2rem 1rem;
  }

  .form-container {
    padding: 2rem;
    margin-top: 1rem;
  }
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .form-item-half {
    margin-bottom: 1rem;
  }

  .captcha-container {
    flex-direction: column;
    align-items: stretch;
  }

  .captcha-image-wrapper {
    align-self: center;
    margin-top: 0.5rem;
  }



  .brand-title {
    font-size: 2rem;
  }

  .welcome-text h2 {
    font-size: 1.5rem;
  }
}
</style>