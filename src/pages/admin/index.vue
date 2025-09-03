<!-- 关闭这个页面 Motion 组件的所有ts检测 -->
<script setup lang="ts">
import { ref } from 'vue'
import { Motion } from 'motion-v'
import AdminHeader from '@/components/pages/admin/header.vue'
import AdminNavbar from '@/components/pages/admin/navbar.vue'

// 侧边栏折叠状态
const isCollapse = ref(false)

// 切换侧边栏折叠状态
function toggleSidebar() {
  isCollapse.value = !isCollapse.value
}

// 动画配置
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: ['easeOut'] }
}

const sidebarVariants = {
  initial: { x: -200, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.5, ease: ['easeOut'] }
}

// 侧边栏宽度动画配置
const sidebarWidthVariants = {
  expanded: { width: '200px' },
  collapsed: { width: '64px' },
  transition: { duration: 0.3, ease: 'easeOut' }
}

const headerVariants = {
  initial: { y: -60, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.5, delay: 0.2, ease: ['easeOut'] }
}

const cardVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  whileHover: {
    scale: 1.02,
    y: -5,
    transition: { duration: 0.2, ease: ['easeOut'] }
  },
  transition: { duration: 0.4, ease: ['easeOut'] }
}

const statsCardVariants = {
  initial: { opacity: 0, y: 40, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  whileHover: {
    scale: 1.05,
    y: -8,
    transition: { duration: 0.3, ease: ['easeOut'] }
  },
  transition: { duration: 0.5, ease: ['easeOut'] }
}

const iconVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: { scale: 1, rotate: 0 },
  whileHover: {
    scale: 1.2,
    rotate: 10,
    transition: { duration: 0.2, ease: ['easeOut'] }
  },
  transition: { duration: 0.6, delay: 0.3, ease: ['easeOut'] }
}
</script>


<template>
  <Motion :initial="pageVariants.initial" :animate="pageVariants.animate" :transition="pageVariants.transition as any"
    class="admin-layout">
    <el-container class="h-screen">

      <!-- 侧边栏 -->
      <Motion :animate="isCollapse ? sidebarWidthVariants.collapsed : sidebarWidthVariants.expanded"
        :transition="sidebarWidthVariants.transition as any" class="el-aside-wrapper">
        <el-aside class="el-aside h-full">
          <Motion :initial="sidebarVariants.initial" :animate="sidebarVariants.animate"
            :transition="sidebarVariants.transition as any">
            <AdminNavbar :is-collapse="isCollapse" />
          </Motion>
        </el-aside>
      </Motion>

      <!-- 主内容区域 -->
      <el-container class="main-content-transition">
        <!-- 头部 -->
        <el-header class="el-header border-b border-gray-200"
          style="overflow: visible; position: relative; z-index: 50;height: max-content;">

          <Motion :initial="headerVariants.initial" :animate="headerVariants.animate"
            :transition="headerVariants.transition as any" class="h-full">
            <AdminHeader @toggle-sidebar="toggleSidebar" :is-collapse="isCollapse" />
          </Motion>
        </el-header>

        <!-- 主要内容 -->
        <el-main class="bg-gray-50 flex flex-col">
          <div class="flex-1 p-6 min-h-0 ">
            <!-- 子路由内容 -->
            <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
              :transition="{ ...cardVariants.transition, delay: 0.2 } as any">
              <router-view />
            </Motion>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </Motion>
</template>

<style scoped>
.admin-layout {
  height: 100vh;
  overflow: hidden;
}

.el-aside-wrapper {
  background-color: #ffffff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
  /* Prevent flexbox from shrinking the sidebar width on content overflow */
  flex: 0 0 auto;
}

.el-aside {
  background-color: transparent;
  width: 100% !important;
  position: relative;
  overflow: hidden;
}

.el-header {
  background-color: #fff;
  padding: 0;
  height: 60px;
  line-height: 60px;
}

.el-main {
  padding: 0;
  height: calc(100vh - 60px);
}

/* 主内容区域过渡 */
.main-content-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 统计卡片增强样式 */
.cursor-pointer {
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.cursor-pointer:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* 响应式动画优化 */
@media (prefers-reduced-motion: reduce) {
  .main-content-transition {
    transition: none;
  }

  .cursor-pointer {
    transition: none;
  }
}

/* 容器基础样式 */
.el-container {
  position: relative;
}

/* 增强卡片视觉效果 */
.el-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.el-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}
</style>
