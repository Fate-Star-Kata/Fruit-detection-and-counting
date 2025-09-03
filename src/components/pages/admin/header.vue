<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/auth/user'
import { storeToRefs } from 'pinia'
import type { AdminHeader } from '@/types/factory'
import { useCommonStore } from '@/stores/common'
import { adminMenuItems } from '@/configs/menuItems'

interface Props {
  isCollapse: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  toggleSidebar: []
}>()

const router = useRouter()
const route = useRoute()

const store = useUserStore()
const { GlobalKeyWord } = storeToRefs(useCommonStore())
const { userInfo, getUserAvatar } = storeToRefs(store)

// 使用store中的头像方法
const avatar = getUserAvatar

// 动态面包屑数据
const breadcrumbs = computed(() => {
  const currentPath = route.path
  const breadcrumbItems: { label: string; path?: string }[] = [{ label: '首页', path: '/' }]

  // 递归查找菜单项
  const findMenuItem = (items: AdminHeader[], path: string): AdminHeader | null => {
    for (const item of items) {
      if (item.path === path) {
        return item
      }
      if (item.children) {
        const found = findMenuItem(item.children, path)
        if (found) {
          return found
        }
      }
    }
    return null
  }

  // 递归构建面包屑路径
  const buildBreadcrumb = (items: AdminHeader[], targetPath: string, parentPath: AdminHeader[] = []): AdminHeader[] => {
    for (const item of items) {
      const currentBreadcrumb = [...parentPath, item]

      if (item.path === targetPath) {
        return currentBreadcrumb
      }

      if (item.children) {
        const result = buildBreadcrumb(item.children, targetPath, currentBreadcrumb)
        if (result.length > 0) {
          return result
        }
      }
    }
    return []
  }

  // 如果不是首页，构建完整的面包屑
  if (currentPath !== '/admin/dashboard') {
    const menuPath = buildBreadcrumb(adminMenuItems, currentPath)
    if (menuPath.length > 0) {
      // 添加找到的菜单路径到面包屑
      menuPath.forEach(item => {
        breadcrumbItems.push({
          label: item.title,
          path: item.path as string
        })
      })
    } else {
      // 如果没找到匹配的菜单项，使用当前路由信息
      const pathSegments = currentPath.split('/').filter(Boolean)
      if (pathSegments.length > 1) {
        breadcrumbItems.push({
          label: pathSegments[pathSegments.length - 1],
          path: currentPath as string
        })
      }
    }
  }

  return breadcrumbItems
})

// 用户下拉菜单项
const userMenuItems = ref([
  {
    command: 'profile',
    label: '个人中心',
    icon: 'User',
    href: '/admin/profile',
    event: () => {
      router.push('/admin/profile')
    }
  },
  {
    command: 'logout',
    label: '退出登录',
    icon: 'SwitchButton',
    href: null,
    divided: true,
    event: () => {
      handleLogout()
    }
  }
])

// 切换侧边栏
function handleToggleSidebar() {
  emit('toggleSidebar')
}

// 用户下拉菜单命令处理
function handleCommand(command: string) {
  const menuItem = userMenuItems.value.find(item => item.command === command)
  if (menuItem) {
    if (menuItem.event) {
      // 如果有自定义事件处理函数，执行它
      menuItem.event()
    } else if (menuItem.href) {
      // 如果有href属性，进行路由跳转
      router.push(menuItem.href)
    }
  }
}

// 退出登录
function handleLogout() {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success('退出成功')
    router.push('/auth/login')
  }).catch(() => {
    // 用户取消
  })
}

// 全屏切换
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}
</script>

<template>
  <div class="admin-header flex items-center justify-between pl-2 pr-6 h-full relative mb-5">
    <!-- 左侧区域 -->
    <div class="flex items-center">
      <!-- 菜单切换按钮 -->
      <el-button type="text" size="large" @click="handleToggleSidebar" class="mr-4">
        <el-icon size="18">
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>
      </el-button>

      <!-- 面包屑导航 -->
      <el-breadcrumb separator="/" class="text-sm">
        <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index" :to="item.path || undefined">
          {{ item.label }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右侧区域 -->
    <div class="flex items-center space-x-4">
      <!-- 搜索框 -->
      <!-- <el-input placeholder="搜索菜单" size="small" v-model="GlobalKeyWord" style="width: 200px" prefix-icon="Search"
        clearable /> -->

      <!-- 全屏按钮 -->
      <el-tooltip content="全屏" placement="bottom">
        <el-button type="text" size="large" @click="toggleFullscreen">
          <el-icon size="18">
            <FullScreen />
          </el-icon>
        </el-button>
      </el-tooltip>

      <!-- 通知按钮 -->
      <el-tooltip content="通知" placement="bottom">
        <el-badge class="item" :offset="[-10, 10]" v-show="false">
          <el-button type="text" size="large">
            <el-icon size="18">
              <Bell />
            </el-icon>
          </el-button>
        </el-badge>
      </el-tooltip>

      <!-- 用户信息下拉菜单 -->
      <el-dropdown @command="handleCommand" trigger="click">
        <div class="flex items-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
          <el-avatar :size="32" :src="avatar" class="mr-2" />
          <div class="text-sm">
            <div class="font-medium text-gray-900">{{ userInfo?.username || '用户' }}</div>
            <div class="text-gray-500 text-xs">{{ userInfo?.role || '管理员' }}</div>
          </div>
          <el-icon class="ml-2 text-gray-400">
            <ArrowDown />
          </el-icon>
        </div>

        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="item in userMenuItems" :key="item.command" :command="item.command"
              :divided="item.divided">
              <el-icon class="mr-2">
                <component :is="item.icon" />
              </el-icon>
              {{ item.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped>
.admin-header {
  border-bottom: 1px solid #f0f0f0;
}

.item {
  margin-right: 8px;
}
</style>
