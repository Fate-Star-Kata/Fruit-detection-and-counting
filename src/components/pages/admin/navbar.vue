<script setup lang="ts">
import serverConfig from '@/configs';
import { adminMenuItems } from '@/configs/menuItems';
import { useUserStore } from '@/stores/auth/user';
import type { AdminHeader } from '@/types/factory';
import { storeToRefs } from 'pinia';
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const store = useUserStore()

const { userInfo } = storeToRefs(store)

interface Props {
  isCollapse: boolean
}

defineProps<Props>()

const router = useRouter()
const route = useRoute()

// 菜单数据
const menuItems = ref<AdminHeader[]>(adminMenuItems)

// 当前激活的菜单项
const activeMenu = computed(() => route.path)

// 默认展开的父菜单
const defaultOpeneds = computed(() => {
  const matched = menuItems.value.find(item =>
    item.children?.some(child => child.path === route.path)
  )
  return matched ? [matched.id] : []
})

// 处理菜单点击
function handleMenuClick(path: string) {
  if (path && path !== route.path) {
    router.push(path)
  }
}

// 监听路由变化更新
watch(() => route.path, () => {
  // 这里不用手动赋值，computed 会自动更新 activeMenu
})

onMounted(() => {
  // 登录拦截
  if (!userInfo.value) {
    router.push('/auth/login')
  }
})
</script>

<template>
  <div class="admin-navbar h-full">
    <!-- Logo -->
    <div class="logo-container flex items-center justify-center h-16 border-b border-gray-100">
      <div v-if="!isCollapse" class="flex items-center space-x-2">
        <component :is="serverConfig.VITE_APP_LOGO" class="w-10 h-8" size="20px" />
        <span class="text-gray-800 text-lg font-semibold">{{ serverConfig.VITE_APP_TITLE }}</span>
      </div>

      <div v-else class="flex items-center">
        <component :is="serverConfig.VITE_APP_LOGO" class="w-12 h-8" size="20px" />
      </div>
    </div>

    <!-- 菜单 -->
    <div class="menu-container flex-1 overflow-y-auto">
      <el-menu :default-active="activeMenu" :default-openeds="defaultOpeneds" :collapse="isCollapse"
        :unique-opened="true" background-color="#ffffff" text-color="#64748b" active-text-color="#3b82f6"
        class="border-none">
        <template v-for="item in menuItems" :key="item.id">
          <template v-if="!item.hide">
            <!-- 无子菜单 -->
            <el-menu-item v-if="!item.children || item.children.length === 0" :index="item.path"
              @click="handleMenuClick(item.path)">
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
              <template #title>{{ item.title }}</template>
            </el-menu-item>

            <!-- 有子菜单 -->
            <el-sub-menu v-else :index="item.id">
              <template #title>
                <el-icon>
                  <component :is="item.icon" />
                </el-icon>
                <span>{{ item.title }}</span>
              </template>

              <el-menu-item v-for="child in item.children" :key="child.id" :index="child.path" v-show="!child.hide"
                @click="handleMenuClick(child.path)">
                <el-icon v-if="child.icon" style="margin-right: 0;">
                  <component :is="child.icon" />
                </el-icon>
                <span>{{ child.title }}</span>
              </el-menu-item>
            </el-sub-menu>
          </template>
        </template>
      </el-menu>
    </div>

    <!-- 底部 -->
    <div v-if="!isCollapse" class="footer-info p-4 border-t border-gray-100">
      <div class="text-center text-gray-500 text-xs">
        <div class="font-medium">{{ serverConfig.VITE_APP_TITLE }} {{ serverConfig.VITE_APP_VERSION }}</div>
        <!-- <div class="mt-1 text-gray-400">© 2024 HZ Tech</div> -->
      </div>
    </div>
  </div>
</template>


<style scoped>
.admin-navbar {
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
}

.menu-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.menu-container::-webkit-scrollbar {
  width: 4px;
}

.menu-container::-webkit-scrollbar-track {
  background: transparent;
}

.menu-container::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 2px;
}

.menu-container::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

:deep(.el-menu) {
  border-right: none;
  padding: 0 12px;
}

:deep(.el-menu-item) {
  height: 44px;
  line-height: 44px;
  margin: 2px 0;
  border-radius: 8px;
  transition: all 0.2s ease;
}

:deep(.el-sub-menu .el-sub-menu__title) {
  height: 44px;
  line-height: 44px;
  margin: 2px 0;
  border-radius: 8px;
  transition: all 0.2s ease;
}

:deep(.el-menu-item:hover) {
  background-color: #f1f5f9 !important;
  color: #3b82f6 !important;
  transform: translateX(2px);
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%) !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

:deep(.el-sub-menu__title:hover) {
  background-color: #f1f5f9 !important;
  color: #3b82f6 !important;
  transform: translateX(2px);
}

:deep(.el-sub-menu .el-menu-item) {
  margin-left: 20px;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 36px !important;
  line-height: 36px !important;
}

:deep(.el-sub-menu .el-menu-item:hover) {
  background-color: #f8fafc !important;
  color: #3b82f6 !important;
}

:deep(.el-sub-menu .el-menu-item.is-active) {
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%) !important;
  color: #fff !important;
}

:deep(.el-menu-item .el-icon) {
  margin-right: 8px;
  font-size: 16px;
}

.footer-info {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}
</style>