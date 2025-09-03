<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 当前选中的主题
const currentTheme = ref('light')

// 可用主题列表 - 使用计算属性支持国际化，每个主题对应不同的颜色方案
const themes = computed(() => [
  { name: 'light', displayName: t('theme.light'), colors: { primary: '#570df8', secondary: '#f000b8', accent: '#37cdbe', neutral: '#3d4451', background: '#ffffff' } },
  { name: 'dark', displayName: t('theme.dark'), colors: { primary: '#661ae6', secondary: '#d926aa', accent: '#1fb2a5', neutral: '#2a2e37', background: '#1d232a' } },
  { name: 'cupcake', displayName: t('theme.cupcake'), colors: { primary: '#65c3c8', secondary: '#ef9fbc', accent: '#eeaf3a', neutral: '#291334', background: '#faf7f5' } },
  { name: 'bumblebee', displayName: t('theme.bumblebee'), colors: { primary: '#e0a82e', secondary: '#f9d72f', accent: '#181830', neutral: '#181830', background: '#fffbeb' } },
  { name: 'emerald', displayName: t('theme.emerald'), colors: { primary: '#66cc8a', secondary: '#377cfb', accent: '#ea5234', neutral: '#333c4d', background: '#ffffff' } },
  { name: 'corporate', displayName: t('theme.corporate'), colors: { primary: '#4b6bfb', secondary: '#7b92b2', accent: '#67cba0', neutral: '#181a2a', background: '#ffffff' } },
  { name: 'synthwave', displayName: t('theme.synthwave'), colors: { primary: '#e779c1', secondary: '#58c7f3', accent: '#f3cc30', neutral: '#20134e', background: '#2d1b69' } },
  { name: 'retro', displayName: t('theme.retro'), colors: { primary: '#ef9995', secondary: '#a4cbb4', accent: '#dc8850', neutral: '#7f1d1d', background: '#ede4d3' } },
  { name: 'cyberpunk', displayName: t('theme.cyberpunk'), colors: { primary: '#ff7598', secondary: '#75d1f0', accent: '#c07eec', neutral: '#423a3a', background: '#ffee00' } },
  { name: 'valentine', displayName: t('theme.valentine'), colors: { primary: '#e96d7b', secondary: '#a991f7', accent: '#88dbdd', neutral: '#af4670', background: '#f0d6e8' } },
  { name: 'halloween', displayName: t('theme.halloween'), colors: { primary: '#f28c18', secondary: '#6d3a9c', accent: '#51a800', neutral: '#1b1d1d', background: '#1f2937' } },
  { name: 'garden', displayName: t('theme.garden'), colors: { primary: '#5c7f67', secondary: '#ecf4e7', accent: '#fae5e5', neutral: '#5d5656', background: '#e9f4e6' } },
  { name: 'forest', displayName: t('theme.forest'), colors: { primary: '#1eb854', secondary: '#1fd65f', accent: '#1db584', neutral: '#19362d', background: '#171212' } },
  { name: 'aqua', displayName: t('theme.aqua'), colors: { primary: '#09ecf3', secondary: '#966fb3', accent: '#ffe999', neutral: '#3b8ac4', background: '#345da7' } },
  { name: 'lofi', displayName: t('theme.lofi'), colors: { primary: '#0d0d0d', secondary: '#1a1a1a', accent: '#262626', neutral: '#0d0d0d', background: '#0f0f0f' } },
  { name: 'pastel', displayName: t('theme.pastel'), colors: { primary: '#d1c1d7', secondary: '#f6cbd1', accent: '#b4e9d6', neutral: '#70acc7', background: '#ffffff' } },
  { name: 'fantasy', displayName: t('theme.fantasy'), colors: { primary: '#6e0b75', secondary: '#007ebd', accent: '#f18c47', neutral: '#1f2937', background: '#f7f8fd' } },
  { name: 'wireframe', displayName: t('theme.wireframe'), colors: { primary: '#b8b8b8', secondary: '#b8b8b8', accent: '#b8b8b8', neutral: '#b8b8b8', background: '#ffffff' } },
  { name: 'black', displayName: t('theme.black'), colors: { primary: '#343232', secondary: '#343232', accent: '#343232', neutral: '#000000', background: '#000000' } },
  { name: 'luxury', displayName: t('theme.luxury'), colors: { primary: '#ffffff', secondary: '#152747', accent: '#513448', neutral: '#0e1012', background: '#09090b' } },
  { name: 'dracula', displayName: t('theme.dracula'), colors: { primary: '#ff79c6', secondary: '#bd93f9', accent: '#ffb86c', neutral: '#414558', background: '#282a36' } },
  { name: 'cmyk', displayName: t('theme.cmyk'), colors: { primary: '#45aeee', secondary: '#e8488a', accent: '#ffc23c', neutral: '#2a2e37', background: '#ffffff' } },
  { name: 'autumn', displayName: t('theme.autumn'), colors: { primary: '#8c0327', secondary: '#d85251', accent: '#ffb84d', neutral: '#a21caf', background: '#f1f1f1' } },
  { name: 'business', displayName: t('theme.business'), colors: { primary: '#1c4ed8', secondary: '#7c2d12', accent: '#dc2626', neutral: '#1e293b', background: '#ffffff' } },
  { name: 'acid', displayName: t('theme.acid'), colors: { primary: '#ff00ff', secondary: '#ffff00', accent: '#00ffff', neutral: '#1f1f1f', background: '#fafafa' } },
  { name: 'lemonade', displayName: t('theme.lemonade'), colors: { primary: '#519903', secondary: '#e9e92f', accent: '#ff9900', neutral: '#1e1e1e', background: '#ffffff' } },
  { name: 'night', displayName: t('theme.night'), colors: { primary: '#38bdf8', secondary: '#818cf8', accent: '#f471b5', neutral: '#1e293b', background: '#0f172a' } },
  { name: 'coffee', displayName: t('theme.coffee'), colors: { primary: '#db924b', secondary: '#263e3f', accent: '#10576d', neutral: '#20161f', background: '#1f2937' } },
  { name: 'winter', displayName: t('theme.winter'), colors: { primary: '#047aed', secondary: '#463aa2', accent: '#c148ac', neutral: '#394e6a', background: '#ffffff' } },
])

// 设置主题
function setTheme(themeName: string) {
  currentTheme.value = themeName
  document.documentElement.setAttribute('data-theme', themeName)
  localStorage.setItem('theme', themeName)
}

// 初始化主题 - 只读取当前状态，不重新设置
function initTheme() {
  const theme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme') || 'light'
  currentTheme.value = theme
}

// 组件挂载时初始化主题
onMounted(() => {
  initTheme()
})
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- 主题颜色切换下拉菜单 -->
    <div title="Change Theme" class="dropdown dropdown-end block">
      <!-- 触发按钮 -->
      <div tabindex="0" role="button" class="btn group btn-sm gap-1.5 px-1.5 btn-ghost" aria-label="Change Theme">
        <!-- 主题预览色块 -->
        <div
          class="bg-base-100 group-hover:border-base-content/20 border-base-content/10 grid shrink-0 grid-cols-2 gap-0.5 rounded-md border p-1 transition-colors"
        >
          <div class="bg-base-content size-1 rounded-full" />
          <div class="bg-primary size-1 rounded-full" />
          <div class="bg-secondary size-1 rounded-full" />
          <div class="bg-accent size-1 rounded-full" />
        </div>
        <!-- 下拉箭头 -->
        <svg
          width="12px" height="12px" class="mt-px hidden size-2 fill-current opacity-60 sm:inline-block"
          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048"
        >
          <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z" />
        </svg>
      </div>

      <!-- 下拉菜单内容 -->
      <div
        tabindex="0"
        class="dropdown-content bg-base-200 text-base-content rounded-box top-px h-[30.5rem] max-h-[calc(100vh-8.6rem)] overflow-y-auto border border-white/5 shadow-2xl outline-1 outline-black/5 mt-16"
      >
        <ul class="menu w-56">
          <li class="menu-title text-xs">
            {{ $t('theme.title') }}
          </li>

          <!-- 主题选项列表 -->
          <li v-for="theme in themes" :key="theme.name">
            <button
              class="gap-3 px-2" :class="{ '[&_svg]:visible': currentTheme === theme.name }"
              @click="setTheme(theme.name)"
            >
              <!-- 主题预览色块 -->
              <div class="grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm" :style="{ backgroundColor: theme.colors.background }">
                <div class="size-1 rounded-full" :style="{ backgroundColor: theme.colors.neutral }" />
                <div class="size-1 rounded-full" :style="{ backgroundColor: theme.colors.primary }" />
                <div class="size-1 rounded-full" :style="{ backgroundColor: theme.colors.secondary }" />
                <div class="size-1 rounded-full" :style="{ backgroundColor: theme.colors.accent }" />
              </div>

              <!-- 主题名称 -->
              <div class="w-32 truncate">
                {{ theme.displayName }}
              </div>

              <!-- 选中状态图标 -->
              <svg
                xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
                class="invisible h-3 w-3 shrink-0"
              >
                <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
              </svg>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
