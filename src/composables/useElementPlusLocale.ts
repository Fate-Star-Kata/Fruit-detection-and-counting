import en from 'element-plus/es/locale/lang/en'
import ja from 'element-plus/es/locale/lang/ja'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

// Element Plus 语言包映射
const elementPlusLocales = {
  'zh-CN': zhCn,
  'en': en,
  'ja': ja,
}

/**
 * Element Plus 国际化组合式函数
 */
export function useElementPlusLocale() {
  const { locale } = useI18n()

  // 计算当前的 Element Plus 语言包
  const elementPlusLocale = computed(() => {
    const currentLocale = locale.value as keyof typeof elementPlusLocales
    return elementPlusLocales[currentLocale] || elementPlusLocales['zh-CN']
  })

  return {
    elementPlusLocale,
  }
}
