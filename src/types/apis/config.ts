// 系统配置相关类型定义

// 邮箱配置类型
export interface EmailConfig {
  EMAIL_HOST: string
  EMAIL_PORT: string
  EMAIL_USE_TLS: string
  EMAIL_HOST_USER: string
  EMAIL_HOST_PASSWORD: string
  DEFAULT_FROM_EMAIL: string
}

// 验证码配置类型
export interface CaptchaConfig {
  CAPTCHA_LENGTH: number
  CAPTCHA_TIMEOUT: number
  CAPTCHA_IMAGE_SIZE: [number, number]
  CAPTCHA_FONT_SIZE: number
}


// 配置项类型
export interface ConfigItem {
  id: number | null
  name: string
  key: string
  value: string
  type: string
  description: string
  created_at?: string
  updated_at?: string
  is_default: boolean
}

// 配置列表响应类型
export interface ConfigListResponse {
  code: number
  msg: string
  data: {
    configs: ConfigItem[]
  }
}

// 配置详情响应类型
export interface ConfigDetailResponse {
  code: number
  msg: string
  data: ConfigItem
}

// 邮箱配置响应类型
export interface EmailConfigResponse {
  code: number
  msg: string | null
  data: ConfigItem[]
}

// 验证码配置响应类型
export interface CaptchaConfigResponse {
  code: number
  msg: string
  data: ConfigItem[]
}

// 通用API响应类型
export interface ConfigApiResponse {
  code: number
  msg: string
  data?: any
}

// 邮箱配置表单验证规则
export interface EmailConfigFormRules {
  EMAIL_HOST: configFormValidationRule[]
  EMAIL_PORT: configFormValidationRule[]
  EMAIL_HOST_USER: configFormValidationRule[]
  EMAIL_HOST_PASSWORD: configFormValidationRule[]
  DEFAULT_FROM_EMAIL: configFormValidationRule[]
}

// 验证码配置表单验证规则
export interface CaptchaConfigFormRules {
  captcha_length: configFormValidationRule[]
  captcha_timeout: configFormValidationRule[]
  captcha_font_size?: configFormValidationRule[]
}

// 表单验证规则类型（从auth.ts复用）
export interface configFormValidationRule {
  required?: boolean
  message?: string
  trigger?: string | string[]
  min?: number
  max?: number
  len?: number
  pattern?: RegExp
  validator?: (value: any) => boolean | string
}