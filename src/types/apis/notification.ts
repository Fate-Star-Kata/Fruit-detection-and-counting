// 通知类型定义
export interface NotificationItem {
  id: string | number
  title: string
  content: string
  is_public: boolean
  is_active: boolean
  created_at: string
  updated_at?: string
  recipient_count?: number
  // 扩展字段（用于前端显示）
  notify_all?: boolean
  email_notification?: boolean
  email_sent?: boolean
  recipient_user_ids?: number[]
  creator?: {
    id: number
    username: string
  }
  recipients?: {
    user_id: number
    username: string
    is_read: boolean
    read_at: string | null
  }[]
}



// 通知列表响应
export interface NotificationListResponse {
  code: number
  msg: string | null
  data: {
    notifications: NotificationItem[]
    total: number
    page: number
    page_size: number
    unread_count?: number
  }
}

// 创建通知请求
export interface CreateNotificationReq {
  title: string
  content: string
  notify_all?:boolean,
  is_public: boolean
  is_active?: boolean,
  email_notification?: boolean,
  recipient_user_ids?: number[]
}

// 更新通知请求
export interface UpdateNotificationReq {
  id: string | number
  title?: string
  content?: string
  is_active?: boolean
}

// 标记已读请求
export interface ReadNotificationReq {
  notification_ids: (string | number)[]
}

// 发送邮件通知请求
export interface SendEmailNotificationReq {
  notification_id: number
  recipient_emails: string[]
}

// 发送邮件通知响应
export interface SendEmailNotificationResponse {
  code: number
  msg: string
  data: {
    sent_count: number
    failed_count: number
  }
}

// 重发通知请求
export interface NotificationResendReq {
  notification_id: number
  notify_all?: boolean
  recipient_user_ids?: number[]
  email_notification?: boolean
}

// 重发通知响应
export interface NotificationResendResponse {
  code: number
  msg: string
  data: {
    notification_id: number
    original_notification_id: number
    notify_all: boolean
    recipient_count: number
  } | null
}

// 删除通知请求
export interface DeleteNotificationReq {
  notification_ids: number[]
}

// 通用响应类型
export interface NotificationResponse {
  code: number
  msg: string
  data?: any
}

// 通知详情响应
export interface NotificationDetailResponse {
  code: number
  msg: string
  data: NotificationItem
}

// 通知表单验证规则
export interface NotificationFormRules {
  title: NotificationFormValidationRule[]
  content: NotificationFormValidationRule[]
  type: NotificationFormValidationRule[]
  priority: NotificationFormValidationRule[]
}

// 表单验证规则类型（如果在其他文件中没有定义）
export interface NotificationFormValidationRule {
  required?: boolean
  message?: string
  trigger?: string | string[]
  min?: number
  max?: number
  len?: number
  pattern?: RegExp
  validator?: (value: any) => boolean | string
}

// 通知统计信息
export interface NotificationStats {
  total: number
  today: number
  this_week: number
  this_month: number
}

// 通知设置
export interface NotificationSettings {
  email_enabled: boolean
  push_enabled: boolean
  sound_enabled: boolean
  auto_mark_read: boolean
  notification_types: string[]
}// 通知列表请求参数
export interface NotificationListReq {
  page: number
  page_size: number
  query?: string
  is_active?: boolean
  is_read?: boolean
  is_public?: 0|1
}