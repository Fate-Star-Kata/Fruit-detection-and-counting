import serviceAxios from '@/http'
import type {
  OperationLogsListRequest,
  OperationLogsListResponse,
  OperationLogDetailResponse,
  OperationLogsBatchDeleteRequest,
  OperationLogsActionResponse,
  OperationLogsClearParams,
  OperationLogsClearResponse
} from '@/types/factory'

export const logsApi = {
  // 获取操作日志列表
  getOperationLogs: (params: OperationLogsListRequest): Promise<OperationLogsListResponse> => {
    return serviceAxios.get('/hzadmin/admin/operation/logs/', {
      params,
      headers: { 'Content-Type': 'application/json' }
    })
  },

  // 获取日志详情
  getOperationLogDetail: (id: number | string): Promise<OperationLogDetailResponse> => {
    return serviceAxios.get(`/hzadmin/admin/operation/logs/${id}/`)
  },

  // 删除单个日志
  deleteOperationLog: (id: number | string): Promise<OperationLogsActionResponse> => {
    return serviceAxios.delete(`/hzadmin/admin/operation/logs/${id}/delete/`)
  },

  // 批量删除
  batchDeleteOperationLogs: (data: OperationLogsBatchDeleteRequest): Promise<OperationLogsActionResponse> => {
    return serviceAxios.post('/hzadmin/admin/operation/logs/batch-delete/', data)
  },

  // 清空日志（按天数或日期范围）
  clearOperationLogs: (params: OperationLogsClearParams): Promise<OperationLogsClearResponse> => {
    return serviceAxios.delete('/hzadmin/admin/operation/logs/clear/', { params })
  }
}

export default logsApi
