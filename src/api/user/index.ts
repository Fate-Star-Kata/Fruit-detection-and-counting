import type { CaptchaResponse, LoginReq, LoginResNoToken, RegisterRequest, RegisterResponse, UserInfo, UserDetailInfo } from '@/types/apis/auth'
import serviceAxios from '@/http'

export function getUserInfo(query: UserInfo) {
  return serviceAxios({
    url: '/api/website/queryMenuWebsite',
    method: 'get',
    params: query,
  })
}

// 获取当前用户详细信息（包含is_staff和is_superuser字段）
export function getCurrentUserInfo(): Promise<{
  code: number
  msg: string
  data: {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    is_active: boolean
    is_staff: boolean
    is_superuser: boolean
    date_joined: string
    user_info: UserDetailInfo
    login_info: {
      login_time: string
      ip: string
    }
  }
}> {
  return serviceAxios({
    url: '/hzadmin/client/auth/userinfo/',
    method: 'get',
  })
}

export function login(data: LoginReq): Promise<LoginResNoToken> {
  return serviceAxios({
    url: '/hzadmin/client/auth/login/',
    method: 'post',
    data,
  })
}

export function getCaptCha(): Promise<CaptchaResponse> {
  return serviceAxios({
    url: '/hzadmin/client/auth/captcha/',
    method: 'get',
  })
}

export function register(data: RegisterRequest): Promise<RegisterResponse> {
  return serviceAxios({
    url: '/hzadmin/client/auth/register/',
    method: 'post',
    data,
  })
}