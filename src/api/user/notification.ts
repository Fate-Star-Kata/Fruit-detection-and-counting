import serviceAxios from '@/http'

// 通知项类型定义
export interface NotificationItem {
  id: number
  title: string
  content: string
  created_at: string
  is_read: boolean
}

// 通知列表请求参数
export interface NotificationListParams {
  page?: number
  page_size?: number
  is_read?: boolean
}

// 通知列表响应
export interface NotificationListResponse {
  code: number
  msg: string
  data: {
    total: number
    page: number
    page_size: number
    unread_count: number
    notifications: NotificationItem[]
  }
}

// 通知详情响应
export interface NotificationDetailResponse {
  code: number
  msg: string
  data: NotificationItem
}

// 标记已读请求参数
export interface MarkReadRequest {
  notification_ids: number[]
}

// 标记已读响应
export interface MarkReadResponse {
  code: number
  msg: string
  data: null
}

// 获取用户通知列表
export function getNotificationList(params: NotificationListParams = {}): Promise<NotificationListResponse> {
  return serviceAxios({
    url: '/hzadmin/client/notification/list/',
    method: 'get',
    params: {
      page: params.page || 1,
      page_size: params.page_size || 10,
      ...params
    }
  })
}

// 获取通知详情
export function getNotificationDetail(notificationId: number): Promise<NotificationDetailResponse> {
  return serviceAxios({
    url: `/hzadmin/client/notification/detail/${notificationId}/`,
    method: 'get'
  })
}

// 标记通知已读
export function markNotificationRead(data: MarkReadRequest): Promise<MarkReadResponse> {
  return serviceAxios({
    url: '/hzadmin/client/notification/read/',
    method: 'post',
    data
  })
}

// 标记所有通知已读
export function markAllNotificationRead(): Promise<MarkReadResponse> {
  return serviceAxios({
    url: '/hzadmin/client/notification/read_all/',
    method: 'post'
  })
}

// 获取未读通知数量
export function getUnreadCount(): Promise<{ code: number; msg: string; data: { unread_count: number } }> {
  return serviceAxios({
    url: '/hzadmin/client/notification/list/',
    method: 'get',
    params: {
      page: 1,
      page_size: 1,
      is_read: false
    }
  })
}
