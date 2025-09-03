<template>
  <div class="user-info-page">
    <div class="page-header">
      <h1 class="page-title">个人信息</h1>
      <p class="page-description">管理您的个人资料和账户设置</p>
    </div>

    <div class="content-wrapper">
      <!-- 基本信息 -->
      <BaseInfo ref="baseInfoRef" :user-info="localUserInfo" @update:userInfo="localUserInfo = $event" />

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" @click="saveUserInfo" :loading="saving">
          保存更改
        </el-button>
        <el-button @click="resetForm">
          重置
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import router from '@/router'
import { ElMessage } from 'element-plus'
import { getCurrentUserInfo } from '@/api/user/index'
import { updateUserInfo } from '@/api/user/userinfo'
import type { UpdateUserInfoRequest } from '@/types/apis/userinfo'
import BaseInfo from '@/components/pages/userInfo/BaseInfo.vue'

// 定义页面元数据
defineOptions({
  name: 'UserInfo'
})

// 响应式数据
const loading = ref(false)
const saving = ref(false)

// 子组件引用
const baseInfoRef = ref()

// 本地用户数据
const localUserInfo = ref<any>(null)

// 获取用户信息
const fetchUserInfo = async () => {
  loading.value = true
  try {
    const response = await getCurrentUserInfo()
    if (response.code === 200) {
      localUserInfo.value = response.data
      // 确保user_info存在并包含所有必要字段
      if (!localUserInfo.value.user_info) {
        localUserInfo.value.user_info = {}
      }

      // 确保所有字段都有默认值
      localUserInfo.value.user_info = {
        // 个人详细信息字段
        phone: localUserInfo.value.user_info.phone || '',
        gender: localUserInfo.value.user_info.gender || 'other',
        birthday: localUserInfo.value.user_info.birthday || '',
        address: localUserInfo.value.user_info.address || '',
        bio: localUserInfo.value.user_info.bio || '',

        // 社交信息字段
        wechat: localUserInfo.value.user_info.wechat || '',
        qq: localUserInfo.value.user_info.qq || '',
        weibo: localUserInfo.value.user_info.weibo || '',
        personal_site: localUserInfo.value.user_info.personal_site || '',

        // 其他字段
        avatar: localUserInfo.value.user_info.avatar || '',
        ...localUserInfo.value.user_info
      }
    } else if (response.code === 401) {
      ElMessage.error('身份认证失败，请先登录')
      router.push('/auth/login')
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



// 保存用户信息
const saveUserInfo = async () => {
  if (!localUserInfo.value) {
    ElMessage.warning('没有可保存的用户信息')
    return
  }

  try {
    // 验证基本信息表单
    if (baseInfoRef.value && baseInfoRef.value.validateForm) {
      const isValid = await baseInfoRef.value.validateForm()
      if (!isValid) {
        ElMessage.warning('请检查表单输入')
        return
      }
    }

    saving.value = true

    // 构造更新数据
    const updateData: UpdateUserInfoRequest = {
      id: localUserInfo.value.id,
      username: localUserInfo.value.username,
      is_active: localUserInfo.value.is_active,
      email: localUserInfo.value.email,
      first_name: localUserInfo.value.first_name || '',
      last_name: localUserInfo.value.last_name || '',
      user_info: {
        avatar: localUserInfo.value.user_info?.avatar || '',
        phone: localUserInfo.value.user_info?.phone || '',
        gender: localUserInfo.value.user_info?.gender || '',
        birthday: localUserInfo.value.user_info?.birthday || '',
        address: localUserInfo.value.user_info?.address || '',
        bio: localUserInfo.value.user_info?.bio || '',
        wechat: localUserInfo.value.user_info?.wechat || '',
        qq: localUserInfo.value.user_info?.qq || '',
        weibo: localUserInfo.value.user_info?.weibo || '',
        personal_site: localUserInfo.value.user_info?.personal_site || ''
      }
    }

    console.log('准备保存的用户信息:', updateData)

    // 调用更新接口
    await updateUserInfo(updateData)

    ElMessage.success('用户信息更新成功')

    // 重新获取最新的用户信息
    await fetchUserInfo()
  } catch (error: any) {
    console.error('保存用户信息失败:', error)
    ElMessage.error(error.message || '保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// 重置表单
const resetForm = async () => {
  try {
    // 重新获取用户信息
    await fetchUserInfo()

    ElMessage.success('表单已重置')
  } catch (error: any) {
    console.error('重置表单失败:', error)
    ElMessage.error('重置失败，请重试')
  }
}

// 组件挂载时获取用户信息
onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.user-info-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.action-buttons {
  padding: 24px 32px;
  background: #f8f9fa;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.action-buttons .el-button {
  min-width: 100px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-info-page {
    padding: 10px;
  }

  .content-wrapper {
    margin: 0;
    border-radius: 8px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-description {
    font-size: 14px;
  }

  .action-buttons {
    padding: 16px 20px;
    flex-direction: column;
  }

  .action-buttons .el-button {
    width: 100%;
  }
}
</style>
