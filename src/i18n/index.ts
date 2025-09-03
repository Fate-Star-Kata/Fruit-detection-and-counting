import { createI18n } from 'vue-i18n'

// 支持的语言列表
export const SUPPORT_LOCALES = ['zh-CN', 'en', 'ja'] as const
export type SupportLocale = typeof SUPPORT_LOCALES[number]

// 默认语言
export const DEFAULT_LOCALE: SupportLocale = 'zh-CN'

// 语言加载状态
const loadedLanguages: Set<string> = new Set()

// 创建i18n实例
const i18n = createI18n({
  legacy: false, // 使用 Composition API
  locale: DEFAULT_LOCALE,
  fallbackLocale: 'en',
  messages: {}, // 初始为空，通过懒加载添加
})

/**
 * 异步加载语言包
 * @param locale 语言代码
 */
export async function loadLanguageAsync(locale: SupportLocale): Promise<void> {
  // 如果语言已经加载过，直接返回
  if (loadedLanguages.has(locale)) {
    return
  }

  try {
    // 动态导入语言文件
    let messages
    switch (locale) {
      case 'zh-CN':
        messages = await import('../locales/zh-CN.json')
        break
      case 'en':
        messages = await import('../locales/en.json')
        break
      case 'ja':
        messages = await import('../locales/ja.json')
        break
      default:
        throw new Error(`Unsupported locale: ${locale}`)
    }

    // 设置语言包
    i18n.global.setLocaleMessage(locale, messages.default || messages)

    // 标记为已加载
    loadedLanguages.add(locale)

    console.log(`Language ${locale} loaded successfully`)
  }
  catch (error) {
    console.error(`Failed to load language ${locale}:`, error)
    throw error
  }
}

/**
 * 设置当前语言
 * @param locale 语言代码
 */
export async function setI18nLanguage(locale: SupportLocale): Promise<void> {
  // 先加载语言包
  await loadLanguageAsync(locale)

  // 设置当前语言
  i18n.global.locale.value = locale

  // 设置HTML lang属性
  if (typeof document !== 'undefined') {
    document.querySelector('html')?.setAttribute('lang', locale)
  }

  // 保存到localStorage
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('locale', locale)
  }
}

/**
 * 获取保存的语言设置
 */
export function getSavedLocale(): SupportLocale {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_LOCALE
  }

  const saved = localStorage.getItem('locale') as SupportLocale
  return SUPPORT_LOCALES.includes(saved) ? saved : DEFAULT_LOCALE
}

/**
 * 初始化i18n
 */
export async function setupI18n(): Promise<void> {
  const locale = getSavedLocale()
  await setI18nLanguage(locale)
}

export default i18n
