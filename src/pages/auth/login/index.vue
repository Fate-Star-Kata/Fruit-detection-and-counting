<script setup lang="ts">
import { getCaptCha, login, getCurrentUserInfo } from '@/api/user'
import type { LoginReq, LoginFormRules, CaptchaResponse, LoginResNoToken } from '@/types/apis/auth'
import { Lock, Picture, User, UserFilled, Check, Refresh, RefreshLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
import router from '@/router'
import { useUserStore } from '@/stores/auth/user'
// import throttle from 'lodash/throttle'; // 移除节流机制
import serverConfig from '../../../configs/index';

const store = useUserStore();
const captchaImage = ref('')
const loading = ref(false)
const captchaLoading = ref(false) // 验证码加载状态
const loginFormRef = ref()

const loginForm = ref<LoginReq>({
  username: '',
  password: '',
  captcha_id: '',
  captcha_text: '',
})

// 表单验证规则
const rules: LoginFormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  captcha_text: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 4, message: '验证码长度为 4 个字符', trigger: 'blur' },
  ],
}

// 移除节流机制，改为使用loading状态控制

// 刷新验证码
async function refreshCaptcha(): Promise<void> {
  if (captchaLoading.value) return // 如果正在加载中，直接返回
  
  captchaLoading.value = true // 设置加载状态
  try {
    // 这里应该调用后端API获取验证码图片
    const response: CaptchaResponse = await getCaptCha()
    console.log(response);

    if (response.code === 200 && response.data) {
      captchaImage.value = import.meta.env.VITE_SERVER_PATH + response.data.captcha_url
      loginForm.value.captcha_id = response.data.captcha_id
    } else {
      throw new Error(response.msg)
    }
  }
  catch (error) {
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
  finally {
    captchaLoading.value = false // 无论成功失败都要重置加载状态
  }
}

// 登录处理
async function handleLogin(): Promise<void> {
  if (!loginFormRef.value)
    return

  try {
    // 验证表单
    await loginFormRef.value.validate()
    loading.value = true

    // 调用登录API
    const response: LoginResNoToken = await login(loginForm.value)
    if (response.code === 200 && response.data) {
      // 登录成功后获取用户详细信息
      const userInfoResponse = await getCurrentUserInfo()
      if (userInfoResponse.code === 200 && userInfoResponse.data) {
        // 保存基本登录信息到store
        store.setUserInfo(response.data)

        // 根据用户的is_staff和is_superuser字段判断角色
        const { is_staff, is_superuser } = userInfoResponse.data
        if (is_staff || is_superuser) {
          // 管理员跳转到管理端
          router.push('/admin/dashboard')
        } else {
          // 普通用户跳转到用户端首页（统计分析页面）
          router.push('/user/stats/')
        }
      } else {
        ElMessage.error('获取用户信息失败')
        throw new Error('获取用户信息失败')
      }
    } else {
      ElMessage.error(response.msg || '登录失败！')
      throw new Error(response.msg || '登录失败')
    }
  }
  catch (error) {
    if (error !== false) { // 不是表单验证错误
      console.error('登录失败:', error)
      ElMessage.error('登录失败，请检查用户名和密码')
    }
  }
  finally {
    loading.value = false
  }
}

// 组件挂载时获取验证码和读取记住的用户名
onMounted(() => {
  refreshCaptcha()
  if (store.getUserInfo() != null) {
    store.setUserInfo(null)
  }
})
</script>

<template>
  <div class="login-container">
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
            <h2>欢迎回来</h2>
            <p>登录您的账户，继续您的数字化之旅</p>
          </div>

          <div class="features-list">
            <div class="feature-item">
              <el-icon>
                <Lock />
              </el-icon>
              <span>安全可靠的登录保护</span>
            </div>
            <div class="feature-item">
              <el-icon>
                <Picture />
              </el-icon>
              <span>智能验证码识别</span>
            </div>
            <div class="feature-item">
              <el-icon>
                <User />
              </el-icon>
              <span>个性化用户体验</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="form-panel">
        <div class="form-container">
          <!-- 表单标题 -->
          <div class="form-header">
            <h3>用户登录</h3>
            <p>请输入您的账号信息</p>
          </div>

          <!-- 登录表单 -->
          <el-form ref="loginFormRef" :model="loginForm" :rules="rules" label-position="top" size="large"
            class="login-form" @submit.prevent="handleLogin">
            <!-- 用户名 -->
            <el-form-item label="用户名" prop="username">
              <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="User" clearable />
            </el-form-item>

            <!-- 密码 -->
            <el-form-item label="密码" prop="password">
              <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock"
                show-password clearable />
            </el-form-item>

            <!-- 验证码 -->
            <el-form-item label="验证码" prop="captcha_text">
              <div class="captcha-container">
                <el-input v-model="loginForm.captcha_text" placeholder="请输入验证码" prefix-icon="Picture" maxlength="4"
                  clearable class="captcha-input" />
                <div class="captcha-image-wrapper">
                  <img v-if="captchaImage" :src="captchaImage" alt="验证码" class="captcha-image"
                    :class="{ 'captcha-loading': captchaLoading }"
                    @click="refreshCaptcha" 
                    :title="captchaLoading ? '正在刷新...' : '点击刷新验证码'" />
                  <div v-else class="captcha-placeholder" @click="refreshCaptcha">
                    <el-icon>
                      <Picture />
                    </el-icon>
                    <span>点击获取</span>
                  </div>
                </div>
              </div>
            </el-form-item>

            <!-- 登录按钮 -->
            <div class="form-actions">
              <el-button type="primary" size="large" :loading="loading" @click="handleLogin" class="submit-btn">
                <el-icon v-if="!loading">
                  <User />
                </el-icon>
                {{ loading ? '登录中...' : '立即登录' }}
              </el-button>
            </div>
          </el-form>

          <!-- 其他操作 -->
          <div class="form-footer">
            <div class="form-links">
              <a href="#" class="forgot-link">忘记密码？</a>
            </div>

            <div class="divider">
              <!-- <span>或</span> -->
            </div>

            <p class="register-link">
              还没有账号？
              <router-link to="/auth/Register" class="link">
                立即注册
              </router-link>
            </p>

            <!-- 第三方登录 -->
            <!-- <div class="social-login">
              <p class="social-title">第三方登录</p>
              <div class="social-buttons">
                <button class="social-btn twitter">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </button>
                <button class="social-btn google">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4" />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853" />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05" />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335" />
                  </svg>
                </button>
                <button class="social-btn github">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </button>
              </div>
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 主容器 */
.login-container {
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
  max-width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-container {
  width: 100%;
  max-width: 450px;
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
.login-form {
  margin-top: 0;
}

.login-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.login-form :deep(.el-input__wrapper.is-focus) {
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

.captcha-image.captcha-loading {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.captcha-image.captcha-loading:hover {
  transform: none;
  border-color: #e5e7eb;
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

/* 记住我样式 */
.remember-me-container {
  margin: 1.5rem 0 1rem 0;
  display: flex;
  align-items: center;
}

.remember-me-checkbox {
  font-size: 0.9rem;
  color: #6b7280;
}

.remember-me-checkbox :deep(.el-checkbox__label) {
  color: #6b7280;
  font-weight: 400;
}

.remember-me-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #667eea;
  border-color: #667eea;
}

.remember-me-checkbox :deep(.el-checkbox__inner:hover) {
  border-color: #667eea;
}

/* 操作按钮 */
.form-actions {
  margin-top: 1.5rem;
}

.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
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

/* 表单底部 */
.form-footer {
  margin-top: 2rem;
  text-align: center;
}

.form-links {
  margin-bottom: 1rem;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #4f46e5;
  text-decoration: underline;
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

.register-link {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0 0 1.5rem 0;
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

/* 第三方登录 */
.social-login {
  margin-top: 1.5rem;
}

.social-title {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.social-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6b7280;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.social-btn.twitter:hover {
  background: #1da1f2;
  color: white;
  border-color: #1da1f2;
}

.social-btn.google:hover {
  background: #4285f4;
  color: white;
  border-color: #4285f4;
}

.social-btn.github:hover {
  background: #333;
  color: white;
  border-color: #333;
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

  .social-buttons {
    gap: 0.75rem;
  }

  .social-btn {
    width: 40px;
    height: 40px;
  }
}
</style>
