import type { SupportLocale } from '@/i18n'
import { computed } from 'vue'
import { useI18n as useVueI18n } from 'vue-i18n'
import { setI18nLanguage, SUPPORT_LOCALES } from '@/i18n'

/**
 * i18n组合式函数
 */
export function useI18n() {
  const { t, locale } = useVueI18n()

  /**
   * 当前语言
   */
  const currentLocale = computed(() => locale.value as SupportLocale)

  /**
   * 支持的语言列表
   */
  const supportedLocales = computed(() => SUPPORT_LOCALES)

  /**
   * 切换语言
   * @param newLocale 新语言
   */
  const switchLanguage = async (newLocale: SupportLocale) => {
    if (newLocale === currentLocale.value) {
      return
    }

    try {
      await setI18nLanguage(newLocale)
      console.log(`Language switched to ${newLocale}`)
    }
    catch (error) {
      console.error('Failed to switch language:', error)
    }
  }

  /**
   * 获取语言显示名称
   * @param locale 语言代码
   */
  const getLanguageName = (locale: SupportLocale): string => {
    const names: Record<SupportLocale, string> = {
      'zh-CN': '简体中文',
      'en': 'English',
      'ja': '日本語',
    }
    return names[locale] || locale
  }

  return {
    t,
    currentLocale,
    supportedLocales,
    switchLanguage,
    getLanguageName,
  }
}
