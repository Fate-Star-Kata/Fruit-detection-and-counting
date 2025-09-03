// 导入Element Plus图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 导入Element Plus
import ElementPlus from 'element-plus'
import { createApp } from 'vue'

// 导入i18n配置
import i18n, { setupI18n } from '@/i18n'

// 导入路由
import router from '@/router'
// 导入Pinia store
import pinia from '@/stores'
import App from './App.vue'

import 'element-plus/dist/index.css'

import './style.css'
import './styles/themes.css'

// 全局主题初始化函数
function initGlobalTheme() {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme)
  } else {
    // 如果没有保存的主题，使用系统偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const defaultTheme = prefersDark ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', defaultTheme)
    localStorage.setItem('theme', defaultTheme)
  }
}

// 在应用创建前初始化主题
initGlobalTheme()

// 创建应用实例
const app = createApp(App)

// 使用Pinia
app.use(pinia)

// 使用i18n
app.use(i18n)

// 使用Element Plus
app.use(ElementPlus)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用路由
app.use(router)

// 初始化i18n并挂载应用
setupI18n()
  .then(() => {
    return router.isReady() // ✅ 等路由准备好
  })
  .then(() => {
    app.mount('#app')
  })
  .catch((error) => {
    console.error('Failed to setup i18n:', error)
    // 即使i18n初始化失败，也等路由准备好再挂载
    router.isReady().then(() => {
      app.mount('#app')
    })
  })