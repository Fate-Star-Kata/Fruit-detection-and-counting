<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 当前选中的主题色
const currentColorTheme = ref('light')

// DaisyUI主题色配置（精选常用主题）
const colorThemes = computed(() => [
  {
    name: 'light',
    displayName: '浅色',
    primary: '#570df8',
    secondary: '#f000b8',
    accent: '#37cdbe',
  },
  {
    name: 'dark',
    displayName: '深色',
    primary: '#661ae6',
    secondary: '#d926aa',
    accent: '#1fb2a5',
  },
  {
    name: 'cupcake',
    displayName: '纸杯蛋糕',
    primary: '#65c3c8',
    secondary: '#ef9fbc',
    accent: '#eeaf3a',
  },
  {
    name: 'bumblebee',
    displayName: '大黄蜂',
    primary: '#e0a82e',
    secondary: '#f9d72f',
    accent: '#181830',
  },
  {
    name: 'emerald',
    displayName: '翡翠',
    primary: '#66cc8a',
    secondary: '#377cfb',
    accent: '#ea5234',
  },
  {
    name: 'corporate',
    displayName: '企业',
    primary: '#4b6bfb',
    secondary: '#7b92b2',
    accent: '#67cba0',
  },
  {
    name: 'synthwave',
    displayName: '合成波',
    primary: '#e779c1',
    secondary: '#58c7f3',
    accent: '#f3cc30',
  },
  {
    name: 'retro',
    displayName: '复古',
    primary: '#ef9995',
    secondary: '#a4cbb4',
    accent: '#dc8850',
  },
  {
    name: 'cyberpunk',
    displayName: '赛博朋克',
    primary: '#ff7598',
    secondary: '#75d1f0',
    accent: '#c7f59b',
  },
  {
    name: 'valentine',
    displayName: '情人节',
    primary: '#e96d7b',
    secondary: '#a991f7',
    accent: '#88dbdd',
  },
  {
    name: 'forest',
    displayName: '森林',
    primary: '#1eb854',
    secondary: '#1fd65f',
    accent: '#1db584',
  },
  {
    name: 'luxury',
    displayName: '奢华',
    primary: '#ffffff',
    secondary: '#152747',
    accent: '#513448',
  },
  {
    name: 'dracula',
    displayName: '德古拉',
    primary: '#ff79c6',
    secondary: '#bd93f9',
    accent: '#ffb86c',
  },
])

// 当前主题色的主色调
const currentThemeColor = computed(() => {
  const theme = colorThemes.value.find(t => t.name === currentColorTheme.value)
  return theme?.primary || '#3b82f6'
})

// 设置主题色
function setColorTheme(themeName: string) {
  currentColorTheme.value = themeName

  // 使用DaisyUI的主题系统
  document.documentElement.setAttribute('data-theme', themeName)

  // 保存到localStorage
  localStorage.setItem('color-theme', themeName)
}

// 初始化主题色
onMounted(() => {
  // 从localStorage获取保存的主题色
  const savedTheme = localStorage.getItem('color-theme')
  if (savedTheme && colorThemes.value.some(t => t.name === savedTheme)) {
    setColorTheme(savedTheme)
  }
  else {
    // 默认使用浅色主题
    setColorTheme('light')
  }
})
</script>

<template>
  <div class="dropdown dropdown-end">
    <!-- 主题色切换按钮 -->
    <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
      <div class="w-5 h-5 rounded-full" :style="{ backgroundColor: currentThemeColor }" />
    </div>

    <!-- 主题色选择下拉菜单 -->
    <ul tabindex="0" class="dropdown-content z-[1] p-2 shadow-2xl bg-base-100 rounded-box w-52">
      <li class="mb-2">
        <div class="text-sm font-medium opacity-60 px-2 py-1">
          {{ t('colorTheme.title') }}
        </div>
      </li>

      <!-- 主题色选项 -->
      <li v-for="theme in colorThemes" :key="theme.name">
        <button class="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 w-full"
          :class="{ 'bg-base-200': currentColorTheme === theme.name }" @click="setColorTheme(theme.name)">
          <!-- 主题色预览 -->
          <div class="flex gap-1">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: theme.primary }" />
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: theme.secondary }" />
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: theme.accent }" />
          </div>

          <!-- 主题名称 -->
          <span class="flex-1 text-left text-sm">{{ theme.displayName }}</span>

          <!-- 选中状态 -->
          <div v-if="currentColorTheme === theme.name" class="w-2 h-2 bg-primary rounded-full" />
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* 组件样式 */
.dropdown-content {
  max-height: 400px;
  overflow-y: auto;
}

/* 滚动条样式 */
.dropdown-content::-webkit-scrollbar {
  width: 4px;
}

.dropdown-content::-webkit-scrollbar-track {
  background: transparent;
}

.dropdown-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.dropdown-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
