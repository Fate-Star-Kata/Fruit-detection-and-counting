// 用户管理相关类型定义
export interface User {
  id: number | null
  username: string
  email: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  date_joined?: string
  last_login?: string
  role?: string
  status?: string
  created_at?: string
  avatar?: string
  phone?: string
  address?: string
  bio?: string
}

// 用户查询参数
export interface UserQueryParams {
  query: string
  page: number
  page_size: number
}

// 用户列表响应
export interface UserListResponse {
  code: number
  data: {
    users: User[]
    total: number
  }
  message?: string
}

// API响应基础类型
export interface ApiResponse {
  message?: string
  msg?: string
  data?: any
}

// 表格列配置
export interface TableColumn {
  title: string
  dataIndex: string
  key?: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  scopedSlots?: any
}

// 管理员导航菜单项
export interface AdminMenuItem {
  id: string
  title: string
  icon?: string
  path: string
  hide?: boolean
  children?: AdminMenuItem[]
}

// 管理员头部组件类型
export interface AdminHeader {
  id: string
  title: string
  icon?: string
  path: string
  hide?: boolean
  children?: AdminHeader[]
}

// 分页配置
export interface PaginationConfig {
  total: number
  current: number
  pageSize: number
  showTotal: (total: number) => string
  onChange: (current: number, size: number) => void
}