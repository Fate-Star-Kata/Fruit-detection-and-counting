<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { Motion } from 'motion-v'
import { useUserStore } from '@/stores/auth/user'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Message, Edit } from '@element-plus/icons-vue'
import { getCurrentUserInfo } from '@/api/user/index'
import { updateUserInfo } from '@/api/user/userinfo'
import type { UpdateUserInfoRequest } from '@/types/factory'

const userStore = useUserStore()
const { userInfo, getUserAvatar } = storeToRefs(userStore)

// 确保userInfo初始化
if (!userInfo.value) {
  userInfo.value = {
    ip: '',
    login_time: new Date(),
    user_id: 0,
    username: '',
    avatar: null,
    email: null,
    phone: null,
    role: null,
    id: 0,
    first_name: '',
    last_name: '',
    is_active: true,
    user_info: {
      avatar: ''
    }
  }
}

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

// 保存状态
const loading = ref(false)
const saving = ref(false)

// 初始化用户详细信息
const initUserInfo = () => {
  if (userInfo.value && !userInfo.value.user_info) {
    userInfo.value.user_info = {
      avatar: ''
    }
  }
}

// 获取用户信息
const fetchUserInfo = async () => {
  loading.value = true
  try {
    const response = await getCurrentUserInfo()
    if (response.code === 200) {
      userInfo.value = response.data
      initUserInfo() // 初始化用户详细信息
    } else {
      ElMessage.error(response.msg || '获取用户信息失败')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 头像上传相关已移除

// 保存个人信息
async function saveProfile() {
  try {
    saving.value = true

    if (!userInfo.value) {
      ElMessage.error('用户信息不存在')
      return
    }

    if (!userInfo.value.username?.trim()) {
      ElMessage.error('用户名不能为空')
      return
    }

    if (userInfo.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.value.email)) {
      ElMessage.error('请输入有效的邮箱地址')
      return
    }

    // 构造更新请求数据
    const updateData: UpdateUserInfoRequest = {
      id: userInfo.value.id as number,
      username: userInfo.value.username,
      email: userInfo.value.email || '',
      first_name: userInfo.value.first_name || '',
      last_name: userInfo.value.last_name || '',
      is_active: userInfo.value.is_active as boolean,
      user_info: {
        avatar: userInfo.value.user_info?.avatar || ''
      }
    }

    // 调用更新用户信息API
    const response = await updateUserInfo(updateData)

    if (response.code === 200) {
      await userStore.setUserInfo(userInfo.value)
      ElMessage.success('个人信息保存成功')
    } else {
      ElMessage.error(response.msg || '保存失败，请稍后重试')
    }
  } catch (error: any) {
    ElMessage.error(`保存失败：${error.message || '请检查网络连接后重试'}`)
  } finally {
    saving.value = false
  }
}

// 头像上传功能已移除

// 重置表单
function resetForm() {
  ElMessageBox.confirm(
    '确定要重置所有修改吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    if (userInfo.value) {
      userInfo.value.username = userInfo.value.username || ''
      userInfo.value.email = userInfo.value.email || ''

      userInfo.value.avatar = getUserAvatar.value || ''
    }
    ElMessage.success('表单已重置')
  })
}

// 页面挂载时获取用户信息
onMounted(() => {
  fetchUserInfo()
})
</script>

<template>
  <div class="profile-container h-full mb-5">
    <!-- @vue-ignore -->
    <Motion :initial="pageVariants.initial" :animate="pageVariants.animate" :transition="pageVariants.transition">
      <div class="max-w-4xl mx-auto">
        <!-- 页面标题 -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">个人中心</h1>
          <p class="text-gray-600 mt-1">管理您的个人信息和账户设置</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- 左侧个人信息卡片 -->
          <!-- @vue-ignore -->
          <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
            :transition="{ ...cardVariants.transition, delay: 0.1 }">
            <el-card class="profile-card">
              <template #header>
                <div class="flex items-center">
                  <el-icon class="mr-2 text-blue-500">
                    <User />
                  </el-icon>
                  <span class="font-medium">基本信息</span>
                </div>
              </template>

              <div class="text-center mb-6">
                <el-avatar :size="80" :src="getUserAvatar" class="mb-4" />
                <h3 class="text-lg font-medium text-gray-900">
                  {{ userInfo?.first_name && userInfo?.last_name
                    ? `${userInfo.first_name} ${userInfo.last_name}`
                    : userInfo?.username || '未知用户' }}
                </h3>
                <p class="text-gray-500">{{ userInfo?.username || '未设置用户名' }}</p>
                <p class="text-sm text-gray-400 mt-2">{{ userInfo?.user_info?.bio || '暂无个人简介' }}</p>
              </div>

              <div class="space-y-3">
                <div class="flex items-center text-sm" v-if="userInfo?.email">
                  <el-icon class="mr-2 text-gray-400">
                    <Message />
                  </el-icon>
                  <span class="text-gray-600">{{ userInfo.email }}</span>
                </div>
              </div>
            </el-card>
          </Motion>

          <!-- 右侧编辑表单 -->
          <div class="lg:col-span-2">
            <!-- @vue-ignore -->
            <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
              :transition="{ ...cardVariants.transition, delay: 0.2 }">
              <el-card>
                <template #header>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <el-icon class="mr-2 text-green-500">
                        <Edit />
                      </el-icon>
                      <span class="font-medium">编辑信息</span>
                    </div>
                    <div class="flex space-x-2">
                      <el-button @click="resetForm" :disabled="saving">
                        重置
                      </el-button>
                      <el-button type="primary" @click="saveProfile" :loading="saving">
                        {{ saving ? '保存中...' : '保存更改' }}
                      </el-button>
                    </div>
                  </div>
                </template>

                <el-form :model="userInfo" label-width="100px" v-if="userInfo && userInfo.user_info"
                  class="profile-form">
                  <!-- 基本信息 -->
                  <div class="form-section">
                    <h4 class="section-title">基本信息</h4>

                    <el-form-item label="用户名">
                      <el-input disabled v-model="userInfo.username" placeholder="请输入用户名" />
                    </el-form-item>

                    <el-form-item label="邮箱">
                      <el-input v-model="userInfo.email" type="email" placeholder="请输入邮箱地址" />
                    </el-form-item>

                    <el-row :gutter="16">
                      <el-col :span="12">
                        <el-form-item label="姓">
                          <el-input v-model="userInfo.first_name" placeholder="请输入姓" />
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="名">
                          <el-input v-model="userInfo.last_name" placeholder="请输入名" />
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <el-form-item label="账户状态">
                      <el-switch v-model="userInfo.is_active" active-text="启用" inactive-text="禁用" :disabled="true" />
                    </el-form-item>

                    <el-form-item label="头像">
                      <div class="flex items-center space-x-4">
                        <el-avatar :size="40" :src="getUserAvatar" />
                        <span class="text-gray-500 text-sm">头像显示功能</span>
                      </div>
                    </el-form-item>
                  </div>

                </el-form>
                <div v-else class="text-center py-8 text-gray-500">
                  用户信息加载中...
                </div>
              </el-card>
            </Motion>
          </div>
        </div>
      </div>
    </Motion>
  </div>
</template>

<style scoped>
.profile-container {
  padding: 24px;
  height: calc(100vh - 120px);
}

.profile-card {
  height: fit-content;
}

.profile-form .el-form-item {
  margin-bottom: 20px;
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

/* 表单样式 */
.profile-form {
  max-width: 800px;
}

.form-section {
  margin-bottom: 32px;
  padding: 24px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #667eea;
}

.form-section .el-form-item {
  margin-bottom: 20px;
}

.form-section .el-form-item:last-child {
  margin-bottom: 0;
}

/* 头像上传样式已移除 */
</style>