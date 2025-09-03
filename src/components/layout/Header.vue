<script setup lang="ts">
import { provide, ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import router from '@/router'
import LanguageSwitch from './btns/LanguageSwitch.vue'
import Search from './btns/search.vue'
import NotificationBell from './btns/NotificationBell.vue'
import MenuItems from './MenuItems.vue'
import NotificationsPanel from '@/pages/user/notifications/index.vue'
import serverConfig from '@/configs'
import { defaultMenuItems } from '@/configs/menuItems'
import { useUserStore } from '@/stores/auth/user'
import { storeToRefs } from "pinia"
import { getNotificationList } from '@/api/user/notification'
import ThemeSwitch from './btns/ThemeSwitch.vue'

const { t } = useI18n()
const expandedMenus = ref<Set<string>>(new Set())
const icon = serverConfig.VITE_APP_LOGO

const store = useUserStore()

const { userInfo, getUserAvatar } = storeToRefs(store)

// 使用store中的头像方法
const avatar = getUserAvatar

// 新增：消息抽屉开关与子组件引用
const showNotify = ref(false)
const notifyRef = ref()
const drawerScrollRef = ref<HTMLElement | null>(null)

// 未读消息数量
const unreadCount = ref(0)
let pollTimer: number | null = null

const handleBeforeClose = async (done: () => void) => {
  try {
    await notifyRef.value?.markVisibleUnreadAsRead?.(drawerScrollRef.value as HTMLElement | undefined)
    // 关闭抽屉后刷新未读数量
    await fetchUnreadCount()
  } catch (e) {
    console.error('auto mark visible unread failed:', e)
  } finally {
    done()
  }
}

const handleOpen = async () => {
  // 打开时刷新列表，确保展示最新消息
  try {
    await nextTick()
    await notifyRef.value?.refreshList?.()
    // 刷新未读数量
    await fetchUnreadCount()
  } catch (e) {
    console.error('refresh notifications on open failed:', e)
  }
}

// 获取未读消息数量
const fetchUnreadCount = async () => {
  try {
    const response = await getNotificationList({ page: 1, page_size: 1, is_read: false })
    if (response.code === 200) {
      unreadCount.value = response.data.unread_count || 0
    }
  } catch (error) {
    console.error('获取未读消息数量失败:', error)
  }
}

// 开始轮询未读消息数量
const startPolling = () => {
  fetchUnreadCount()
  pollTimer = setInterval(fetchUnreadCount, 30000) // 每30秒轮询一次
}

// 停止轮询
const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// 用户头像下拉菜单项
const userMenuItems = ref([
  {
    title: '个人资料',
    class: 'justify-between',
    badge: null,
    event: () => {
      console.log('跳转到个人资料页面')
      router.push('/userInfo')
    }
  },
  {
    title: '设置',
    class: '',
    badge: '新',
    hide: true,
    event: () => {
      console.log('跳转到设置页面')
      // router.push('/settings')
    }
  },
  {
    title: '退出登录',
    class: '',
    event: () => {
      console.log('执行退出登录')
      router.push("/auth/login")
    }
  }
])

// 从configs获取菜单项并应用国际化
const menuItems = computed(() => {
  const applyI18n = (items: any[]): any[] => {
    return items.map(item => ({
      ...item,
      label: t(item.label),
      children: item.children ? applyI18n(item.children) : undefined
    }))
  }
  return applyI18n(defaultMenuItems)
})

function toggleSubmenu(menuId: string) {
  if (expandedMenus.value.has(menuId)) {
    expandedMenus.value.delete(menuId)
  }
  else {
    expandedMenus.value.add(menuId)
  }
}

function isMenuExpanded(menuId: string) {
  return expandedMenus.value.has(menuId)
}

// 提供菜单状态管理函数给子组件
provide('isMenuExpanded', isMenuExpanded)
provide('toggleSubmenu', toggleSubmenu)

// 生命周期钩子
onMounted(() => {
  // 如果用户已登录，开始轮询未读消息数量
  if (userInfo.value?.username) {
    startPolling()
  }
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <div class="navbar bg-base-100 shadow-sm">
    <div class="navbar-start">
      <div class="dropdown">
        <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        </div>
        <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
          <MenuItems :menu-items="menuItems" />
        </ul>
      </div>
      <component :is="icon" size="50px" />
      <a href="/" class="btn btn-ghost text-xl">{{ serverConfig.VITE_APP_TITLE }}</a>
      <search />
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu lg:menu-horizontal rounded-box">
        <MenuItems :menu-items="menuItems" />
      </ul>
    </div>
    <div class="navbar-end">
      <div class="flex items-center gap-2">
        <!-- 语言切换 -->
        <LanguageSwitch />
        <!-- 主题切换 -->
        <ThemeSwitch />
        <!-- 铃铛按钮组件 -->
        <NotificationBell v-if="userInfo?.username" :unread-count="unreadCount" @click="showNotify = true" />

        <!-- 用户头像显示区域 -->
        <div class="dropdown dropdown-end" v-if="userInfo?.username">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar avatar-online">
            <div class="w-10 rounded-full">
              <img alt="用户头像" height="30" :src="avatar" />
            </div>
          </div>
          <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
            <li v-for="(item, index) in userMenuItems" :key="index" v-show="!item.hide">
              <a :class="item.class" :title="item.title" @click="item.event">
                {{ item.title }}
                <span v-if="item.badge" class="badge">{{ item.badge }}</span>
              </a>
            </li>
          </ul>
        </div>

        <div v-else>
          <button class="btn btn-soft btn-success w-28 mr-1" @click="router.push('/auth/login')">
            {{ t('header.login') }}
          </button>
          <button class="btn btn-soft btn-warning w-28" @click="router.push('/auth/register')">
            {{ t('header.register') }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 右侧消息抽屉：点击遮罩自动关闭，在关闭前自动标记视口内未读为已读 -->
  <el-drawer v-model="showNotify" :with-header="false" direction="rtl" size="420px" :append-to-body="true"
    :before-close="handleBeforeClose" :close-on-click-modal="true" @open="handleOpen">
    <div ref="drawerScrollRef" class="drawer-body-scroll">
      <NotificationsPanel ref="notifyRef" :in-drawer="true" />
    </div>
  </el-drawer>
</template>

<style lang='stylus' scoped></style>
