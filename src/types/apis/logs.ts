// 操作日志相关类型定义

export interface OperationLogUser {
  id: number
  username: string
  first_name?: string
  email?: string
}

export interface OperationLogItem {
  id: number
  user: OperationLogUser
  action_type: string
  action_type_display: string
  module: string
  description: string
  target_model: string | null
  target_id: number | null
  ip_address: string
  response_status: number
  created_at: string
}

export interface OperationLogDetail extends OperationLogItem {
  user_agent?: string
  request_data?: Record<string, any>
}

// 列表查询参数
export interface OperationLogsListRequest {
  search?: string
  page?: number
  page_size?: number
  action_type?: string
  module?: string
  user_id?: string | number
  start_date?: string
  end_date?: string
}

// 分页信息（来自响应）
export interface OperationLogsPaginationInfo {
  current_page: number
  total_pages: number
  total_count: number
  page_size: number
  has_next: boolean
  has_previous: boolean
}

// 过滤器信息（来自响应）
export interface OperationLogsFiltersInfo {
  action_types: [string, string][]
  modules: string[]
}

// 列表响应
export interface OperationLogsListResponse {
  code: number
  msg: string | null
  data: {
    logs: OperationLogItem[]
    pagination: OperationLogsPaginationInfo
    filters: OperationLogsFiltersInfo
  }
}

// 详情响应
export interface OperationLogDetailResponse {
  code: number
  msg: string | null
  data: OperationLogDetail
}

// 删除响应（单个/批量均返回字符串提示）
export interface OperationLogsActionResponse {
  code: number
  msg: string | null
  data: string | null
}

// 批量删除请求
export interface OperationLogsBatchDeleteRequest {
  log_ids: number[]
}

// 清空日志参数（任选其一或组合）
export interface OperationLogsClearParams {
  days?: number
  start_date?: string
  end_date?: string
}

export interface OperationLogsClearResponse {
  code: number
  msg: string | null
  data?: any
}