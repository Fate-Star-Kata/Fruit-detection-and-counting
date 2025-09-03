<script setup lang="ts">
import type { SupportLocale } from '@/i18n'
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { setI18nLanguage } from '@/i18n'

const { t, locale } = useI18n()
const currentTheme = ref('light')
const currentDate = ref(new Date())

function toggleTheme() {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', currentTheme.value)
}

async function changeLanguage(lang: SupportLocale) {
  await setI18nLanguage(lang)
  ElMessage.success(`${t('demo.language_switched')} ${lang}`)
}

function showMessage() {
  ElMessage({
    message: t('demo.element_message'),
    type: 'success',
  })
}

onMounted(() => {
  // 主题初始化已在main.ts中处理，这里不再强制设置
  // document.documentElement.setAttribute('data-theme', 'light')
})
</script>

<template>
  <div class="min-h-screen bg-base-100 p-8">
    <!-- 标题区域 -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-primary mb-4">
        {{ t('demo.title') }}
      </h1>
      <p class="text-lg text-base-content/70">
        {{ t('demo.subtitle') }}
      </p>
    </div>

    <!-- 语言切换区域 -->
    <div class="text-center mb-8">
      <div class="flex gap-4 justify-center mb-4">
        <el-button type="primary" @click="changeLanguage('zh-CN')">
          {{ t('demo.chinese') }}
        </el-button>
        <el-button type="success" @click="changeLanguage('en')">
          {{ t('demo.english') }}
        </el-button>
        <el-button type="warning" @click="changeLanguage('ja')">
          {{ t('demo.japanese') }}
        </el-button>
      </div>
      <p class="text-sm text-base-content/60">
        {{ t('demo.current_language') }}: {{ locale }}
      </p>
    </div>

    <!-- Element Plus 组件演示 -->
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- 按钮组 -->
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-primary mb-4">
            {{ t('demo.button_component') }}
          </h2>
          <div class="flex flex-wrap gap-4">
            <el-button type="primary" @click="showMessage">
              {{ t('demo.primary_button') }}
            </el-button>
            <el-button type="success">
              {{ t('demo.success_button') }}
            </el-button>
            <el-button type="warning">
              {{ t('demo.warning_button') }}
            </el-button>
            <el-button type="danger">
              {{ t('demo.danger_button') }}
            </el-button>
            <el-button type="info">
              {{ t('demo.info_button') }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- 日期选择器 -->
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-primary mb-4">
            {{ t('demo.date_picker') }}
          </h2>
          <div class="flex flex-wrap gap-4 items-center">
            <el-date-picker v-model="currentDate" type="date" :placeholder="t('demo.select_date')"
              style="width: 200px" />
            <el-date-picker v-model="currentDate" type="datetime" :placeholder="t('demo.select_datetime')"
              style="width: 220px" />
          </div>
        </div>
      </div>

      <!-- 表单组件 -->
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-primary mb-4">
            {{ t('demo.form_component') }}
          </h2>
          <el-form :model="{}" label-width="120px">
            <el-form-item :label="t('demo.username_label')">
              <el-input :placeholder="t('demo.username_placeholder')" style="width: 200px" />
            </el-form-item>
            <el-form-item :label="t('demo.selector_label')">
              <el-select :placeholder="t('demo.selector_placeholder')" style="width: 200px">
                <el-option :label="t('demo.option1')" value="1" />
                <el-option :label="t('demo.option2')" value="2" />
                <el-option :label="t('demo.option3')" value="3" />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('demo.switch_label')">
              <el-switch />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 主题切换 -->
      <div class="text-center space-y-4">
        <div class="flex gap-4 justify-center">
          <button class="btn btn-outline" @click="toggleTheme">
            {{ t('demo.theme_toggle') }} ({{ t('demo.current_theme') }}: {{ currentTheme }})
          </button>
          <router-link to="/theme-demo" class="btn btn-primary">
            🎨 主题色演示页面
          </router-link>
        </div>
        <p class="text-sm text-base-content/60">
          点击右上角的彩色圆点可以切换主题色，体验不同的视觉效果
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
