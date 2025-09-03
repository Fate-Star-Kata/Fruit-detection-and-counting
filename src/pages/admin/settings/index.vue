<script setup lang="ts">
import { ref } from 'vue'
import { Motion } from 'motion-v'
import { ElMessage } from 'element-plus'

// 动画配置
const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: ['easeOut'] }
}

const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.4, ease: ['easeOut'] }
}

// 系统设置
const systemSettings = ref({
  siteName: 'HZ管理系统',
  siteDescription: '基于Vue3的现代化管理系统',
  theme: 'light',
  language: 'zh-CN',
  timezone: 'Asia/Shanghai'
})

// 通知设置
const notificationSettings = ref({
  emailNotification: true,
  smsNotification: false,
  browserNotification: true,
  systemMaintenance: true
})

// 安全设置
const securitySettings = ref({
  twoFactorAuth: false,
  sessionTimeout: 30,
  passwordExpiry: 90,
  loginAttempts: 5
})

// 保存设置
function saveSettings(type: string) {
  ElMessage.success(`${type}设置已保存`)
  console.log(`保存${type}设置`)
}
</script>

<template>
  <div class="settings-container h-full overflow-y-auto">
    <!-- @vue-ignore -->
    <Motion :initial="pageVariants.initial" :animate="pageVariants.animate" :transition="pageVariants.transition">
      <div class="max-w-6xl mx-auto">
        <!-- 页面标题 -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">系统设置</h1>
          <p class="text-gray-600 mt-1">管理系统配置和个人偏好设置</p>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <!-- 系统设置 -->
          <!-- @vue-ignore -->
          <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
            :transition="{ ...cardVariants.transition, delay: 0.1 }">
            <el-card class="settings-card">
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <el-icon class="mr-2 text-blue-500">
                      <Setting />
                    </el-icon>
                    <span class="font-medium">系统设置</span>
                  </div>
                  <el-button type="primary" size="small" @click="saveSettings('系统')">
                    保存
                  </el-button>
                </div>
              </template>

              <el-form :model="systemSettings" label-width="100px">
                <el-form-item label="站点名称">
                  <el-input v-model="systemSettings.siteName" placeholder="请输入站点名称" />
                </el-form-item>

                <el-form-item label="站点描述">
                  <el-input v-model="systemSettings.siteDescription" type="textarea" :rows="3" placeholder="请输入站点描述" />
                </el-form-item>

                <el-form-item label="主题模式">
                  <el-select v-model="systemSettings.theme" placeholder="选择主题">
                    <el-option label="浅色模式" value="light" />
                    <el-option label="深色模式" value="dark" />
                    <el-option label="跟随系统" value="auto" />
                  </el-select>
                </el-form-item>

                <el-form-item label="语言">
                  <el-select v-model="systemSettings.language" placeholder="选择语言">
                    <el-option label="简体中文" value="zh-CN" />
                    <el-option label="English" value="en-US" />
                  </el-select>
                </el-form-item>

                <el-form-item label="时区">
                  <el-select v-model="systemSettings.timezone" placeholder="选择时区">
                    <el-option label="北京时间 (UTC+8)" value="Asia/Shanghai" />
                    <el-option label="纽约时间 (UTC-5)" value="America/New_York" />
                    <el-option label="伦敦时间 (UTC+0)" value="Europe/London" />
                  </el-select>
                </el-form-item>
              </el-form>
            </el-card>
          </Motion>

          <!-- 通知设置 -->
          <!-- @vue-ignore -->
          <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
            :transition="{ ...cardVariants.transition, delay: 0.2 }">
            <el-card class="settings-card">
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <el-icon class="mr-2 text-green-500">
                      <Bell />
                    </el-icon>
                    <span class="font-medium">通知设置</span>
                  </div>
                  <el-button type="primary" size="small" @click="saveSettings('通知')">
                    保存
                  </el-button>
                </div>
              </template>

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-medium text-gray-900">邮件通知</div>
                    <div class="text-sm text-gray-500">接收重要系统邮件通知</div>
                  </div>
                  <el-switch v-model="notificationSettings.emailNotification" />
                </div>

                <el-divider />

                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-medium text-gray-900">短信通知</div>
                    <div class="text-sm text-gray-500">接收紧急事件短信提醒</div>
                  </div>
                  <el-switch v-model="notificationSettings.smsNotification" />
                </div>

                <el-divider />

                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-medium text-gray-900">浏览器通知</div>
                    <div class="text-sm text-gray-500">显示桌面推送通知</div>
                  </div>
                  <el-switch v-model="notificationSettings.browserNotification" />
                </div>

                <el-divider />

                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-medium text-gray-900">系统维护通知</div>
                    <div class="text-sm text-gray-500">系统维护时发送通知</div>
                  </div>
                  <el-switch v-model="notificationSettings.systemMaintenance" />
                </div>
              </div>
            </el-card>
          </Motion>

          <!-- 安全设置 -->
          <!-- @vue-ignore -->
          <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
            :transition="{ ...cardVariants.transition, delay: 0.3 }">
            <el-card class="settings-card">
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <el-icon class="mr-2 text-red-500">
                      <Lock />
                    </el-icon>
                    <span class="font-medium">安全设置</span>
                  </div>
                  <el-button type="primary" size="small" @click="saveSettings('安全')">
                    保存
                  </el-button>
                </div>
              </template>

              <el-form :model="securitySettings" label-width="120px">
                <el-form-item>
                  <template #label>
                    <div>
                      <div class="font-medium">双因素认证</div>
                      <div class="text-xs text-gray-500">增强账户安全性</div>
                    </div>
                  </template>
                  <el-switch v-model="securitySettings.twoFactorAuth" />
                </el-form-item>

                <el-form-item label="会话超时">
                  <div class="flex items-center space-x-2">
                    <el-input-number v-model="securitySettings.sessionTimeout" :min="5" :max="120" size="small" />
                    <span class="text-sm text-gray-500">分钟</span>
                  </div>
                </el-form-item>

                <el-form-item label="密码有效期">
                  <div class="flex items-center space-x-2">
                    <el-input-number v-model="securitySettings.passwordExpiry" :min="30" :max="365" size="small" />
                    <span class="text-sm text-gray-500">天</span>
                  </div>
                </el-form-item>

                <el-form-item label="登录尝试次数">
                  <div class="flex items-center space-x-2">
                    <el-input-number v-model="securitySettings.loginAttempts" :min="3" :max="10" size="small" />
                    <span class="text-sm text-gray-500">次</span>
                  </div>
                </el-form-item>
              </el-form>
            </el-card>
          </Motion>

          <!-- 其他设置 -->
          <!-- @vue-ignore -->
          <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
            :transition="{ ...cardVariants.transition, delay: 0.4 }">
            <el-card class="settings-card">
              <template #header>
                <div class="flex items-center">
                  <el-icon class="mr-2 text-purple-500">
                    <Tools />
                  </el-icon>
                  <span class="font-medium">其他设置</span>
                </div>
              </template>

              <div class="space-y-4">
                <el-button type="info" plain class="w-full">
                  <el-icon class="mr-2">
                    <Download />
                  </el-icon>
                  导出系统配置
                </el-button>

                <el-button type="warning" plain class="w-full">
                  <el-icon class="mr-2">
                    <Upload />
                  </el-icon>
                  导入系统配置
                </el-button>

                <el-button type="danger" plain class="w-full">
                  <el-icon class="mr-2">
                    <RefreshLeft />
                  </el-icon>
                  重置所有设置
                </el-button>
              </div>
            </el-card>
          </Motion>
        </div>
      </div>
    </Motion>
  </div>
</template>

<style scoped>
.settings-container {
  padding: 24px;
}

.settings-card {
  height: fit-content;
}

/* 卡片悬停效果 */
.el-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
}

.el-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.el-form-item {
  margin-bottom: 20px;
}

.el-divider {
  margin: 16px 0;
}
</style>