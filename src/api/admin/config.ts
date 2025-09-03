import type {
  ConfigListResponse,
  ConfigDetailResponse,
  EmailConfig,
  EmailConfigResponse,
  CaptchaConfig,
  CaptchaConfigResponse,
  ConfigApiResponse
} from '@/types/factory'
import serviceAxios from '@/http'

// 获取配置列表
export function getConfigsAPI(): Promise<ConfigListResponse> {
  return serviceAxios({
    url: '/hzadmin/admin/config/configs/',
    method: 'get'
  })
}

// 获取配置详情
export function getConfigDetailAPI(configId: number): Promise<ConfigDetailResponse> {
  return serviceAxios({
    url: `/hzadmin/admin/config/configs/${configId}/`,
    method: 'get'
  })
}

// 获取邮箱配置
export function getEmailConfigAPI(): Promise<EmailConfigResponse> {
  return serviceAxios({
    url: '/hzadmin/admin/config/configs/email/',
    method: 'get'
  })
}

// 更新邮箱配置
export function updateEmailConfigAPI(data: EmailConfig): Promise<ConfigApiResponse> {
  return serviceAxios({
    url: '/hzadmin/admin/config/configs/email/',
    method: 'post',
    data
  })
}

// 获取验证码配置
export function getCaptchaConfigAPI(): Promise<CaptchaConfigResponse> {
  return serviceAxios({
    url: '/hzadmin/admin/config/configs/captcha/',
    method: 'get'
  })
}

// 更新验证码配置
export function updateCaptchaConfigAPI(data: CaptchaConfig): Promise<ConfigApiResponse> {
  return serviceAxios({
    url: '/hzadmin/admin/config/configs/captcha/',
    method: 'post',
    data
  })
}