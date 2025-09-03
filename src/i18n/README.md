# 国际化 (i18n) 使用指南

本项目使用 Vue I18n 实现国际化功能，支持懒加载以优化性能。

## 功能特性

- ✅ 懒加载语言包
- ✅ 自动保存用户语言偏好
- ✅ 支持多种语言切换
- ✅ TypeScript 类型支持
- ✅ Composition API 支持

## 支持的语言

- `zh-CN` - 简体中文
- `en` - English
- `ja` - 日本語

## 使用方法

### 1. 在组件中使用

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <div>
    <h1>{{ t('menu.home') }}</h1>
    <button>{{ t('common.save') }}</button>
  </div>
</template>
```

### 2. 语言切换

```vue
<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { switchLanguage, currentLocale, supportedLocales } = useI18n()

// 切换到英文
function switchToEnglish() {
  switchLanguage('en')
}
</script>
```

### 3. 添加新语言

1. 在 `src/locales/` 目录下创建新的语言文件，如 `fr.json`
2. 在 `src/i18n/index.ts` 中的 `SUPPORT_LOCALES` 数组中添加新语言代码
3. 在 `src/composables/useI18n.ts` 中的 `getLanguageName` 函数中添加语言显示名称

### 4. 语言文件结构

```json
{
  "common": {
    "save": "保存",
    "cancel": "取消"
  },
  "menu": {
    "home": "首页",
    "settings": "设置"
  }
}
```

## API 参考

### useI18n()

返回以下方法和属性：

- `t(key: string)` - 翻译函数
- `currentLocale` - 当前语言（响应式）
- `supportedLocales` - 支持的语言列表
- `switchLanguage(locale)` - 切换语言
- `getLanguageName(locale)` - 获取语言显示名称

### 工具函数

- `loadLanguageAsync(locale)` - 异步加载语言包
- `setI18nLanguage(locale)` - 设置当前语言
- `getSavedLocale()` - 获取保存的语言设置
- `setupI18n()` - 初始化 i18n

## 性能优化

- 语言包采用懒加载，只有在需要时才会加载
- 已加载的语言包会被缓存，避免重复加载
- 用户的语言偏好会保存在 localStorage 中

## 注意事项

1. 确保所有语言文件的 JSON 结构保持一致
2. 新增翻译 key 时，需要在所有语言文件中添加对应的翻译
3. 语言切换是异步操作，需要使用 `await` 或 `.then()` 处理
