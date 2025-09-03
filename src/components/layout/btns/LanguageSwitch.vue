<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { currentLocale, switchLanguage } = useI18n()

// 支持的语言列表
const languages = [
  { code: 'zh-CN', name: '简体中文', shortCode: 'ZH' },
  { code: 'en', name: 'English', shortCode: 'EN' },
  { code: 'ja', name: '日本語', shortCode: 'JA' },
]

// 当前语言信息

// 切换语言
async function handleLanguageChange(langCode: string) {
  await switchLanguage(langCode as any)
}
</script>

<template>
  <div class="dropdown dropdown-end">
    <!-- 触发按钮 -->
    <div tabindex="0" role="button" class="btn btn-sm btn-ghost gap-1 px-1.5 text-[.5625rem] font-bold"
      aria-label="Language" title="Change Language">
      <!-- 地球图标 -->
      <svg class="text-base-content/70 size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"
          d="M12 21a9 9 0 1 0 0-18m0 18a9 9 0 1 1 0-18m0 18c2.761 0 3.941-5.163 3.941-9S14.761 3 12 3m0 18c-2.761 0-3.941-5.163-3.941-9S9.239 3 12 3M3.5 9h17m-17 6h17" />
      </svg>
      <!-- 下拉箭头 -->
      <svg class="mt-px hidden size-2 fill-current opacity-60 sm:inline-block" xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 2048 2048">
        <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z" />
      </svg>
    </div>

    <!-- 下拉菜单 -->
    <div tabindex="0"
      class="dropdown-content bg-base-200 text-base-content rounded-box top-px mt-16 h-auto max-h-[calc(100vh-8.6rem)] w-56 overflow-y-auto border border-white/5 shadow-2xl outline-1 outline-black/5">
      <ul class="menu menu-sm w-full">
        <li v-for="language in languages" :key="language.code">
          <button :class="{
            'menu-active': currentLocale === language.code,
          }" @click="handleLanguageChange(language.code)">
            <span class="pe-4 font-mono text-[.5625rem] font-bold tracking-[0.09375rem] opacity-40">
              {{ language.shortCode }}
            </span>
            <span class="font-[sans-serif]">
              {{ language.name }}
            </span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* 确保下拉菜单在正确的层级 */
.dropdown-content {
  z-index: 1000;
}
</style>
