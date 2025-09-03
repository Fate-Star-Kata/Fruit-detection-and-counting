import serviceAxios from '@/http'
import type {
  NotificationListReq,
  NotificationListResponse,
  CreateNotificationReq,
  UpdateNotificationReq,
  ReadNotificationReq,
  NotificationResponse,
  NotificationDetailResponse,
  NotificationStats,
  NotificationSettings,
  DeleteNotificationReq,
  SendEmailNotificationReq,
  SendEmailNotificationResponse,
  NotificationResendReq,
  NotificationResendResponse
} from '@/types/factory'

// 通知管理API
export const notificationApi = {

  // 获取用户通知列表
  getUserNotificationList: (params: NotificationListReq): Promise<NotificationListResponse> => {
    return serviceAxios.get('/hzadmin/client/notification/list/', {
      params, headers: {
        'Content-Type': 'application/json'
      } },

    )
  },

  // 创建通知
  createNotification: (data: CreateNotificationReq): Promise<NotificationResponse> => {
    return serviceAxios.post('/hzadmin/admin/notification/create/', data)
  },

  // 更新通知
  updateNotification: (data: UpdateNotificationReq): Promise<NotificationResponse> => {
    return serviceAxios.put(`/hzadmin/admin/notification/update/${data.id}/`, data)
  },

  // 获取通知详情
  getNotificationDetail: (id: string | number): Promise<NotificationDetailResponse> => {
    return serviceAxios.get(`/hzadmin/admin/notification/detail/${id}/`)
  },

  // 删除通知
  deleteNotification: (id: string | number): Promise<NotificationResponse> => {
    return serviceAxios.post('/hzadmin/admin/notification/delete/', {
      notification_ids: [id]
    })
  },

  // 批量删除通知
  batchDeleteNotification: (data: DeleteNotificationReq): Promise<NotificationResponse> => {
    return serviceAxios.post('/hzadmin/admin/notification/delete/', data)
  },

  // 标记通知已读
  markAsRead: (data: ReadNotificationReq): Promise<NotificationResponse> => {
    return serviceAxios.post('/hzadmin/client/notification/read/', data)
  },

  // 发送邮件通知
  sendEmailNotification: (data: SendEmailNotificationReq): Promise<SendEmailNotificationResponse> => {
    return serviceAxios.post('/hzadmin/admin/notification/send_email/', data)
  },

  // 重发通知
  resendNotification: (data: NotificationResendReq): Promise<NotificationResendResponse> => {
    return serviceAxios.post('/hzadmin/admin/notification/resend/', data)
  },


  // 获取通知统计
  getNotificationStats: (): Promise<{ code: number; msg: string; data: NotificationStats }> => {
    return serviceAxios.get('/hzadmin/admin/notification/stats/')
  },

  // 获取通知设置
  getNotificationSettings: (): Promise<{ code: number; msg: string; data: NotificationSettings }> => {
    return serviceAxios.get('/hzadmin/notification/settings/')
  },

  // 更新通知设置
  updateNotificationSettings: (data: NotificationSettings): Promise<NotificationResponse> => {
    return serviceAxios.put('/hzadmin/notification/settings/', data)
  }
}

export default notificationApi