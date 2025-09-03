<script setup lang="ts">
import type { SupportLocale } from '@/i18n'
import { useI18n } from '@/utils/useI18n'

const { currentLocale, supportedLocales, switchLanguage, getLanguageName } = useI18n()

async function handleLanguageChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const newLocale = target.value as SupportLocale
  await switchLanguage(newLocale)
}
</script>

<template>
  <div class="language-switcher">
    <select :value="currentLocale" class="language-select" @change="handleLanguageChange">
      <option v-for="locale in supportedLocales" :key="locale" :value="locale">
        {{ getLanguageName(locale) }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.language-switcher {
  display: inline-block;
}

.language-select {
  padding: 8px 12px;
  border: 1px solid #303030;
  border-radius: 4px;
  background-color: rgb(56, 56, 56);
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.language-select:hover {
  border-color: #409eff;
}

.language-select:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}
</style>
