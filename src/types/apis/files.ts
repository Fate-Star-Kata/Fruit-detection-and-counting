// 文件管理相关类型定义

// 文件项类型
export interface FileItem {
  id: number
  file_name: string
  file_path: string
  file_size: number
  file_type: string
  mime_type?: string
  description?: string
  upload_time: string
}

// 文件上传请求参数
export interface FileUploadRequest {
  file: File
}

// 文件上传响应
export interface FileUploadResponse {
  code: number
  msg: string
  data: {
    file_id: number
    file_name: string
    file_path: string
    file_size: number
    file_type: string
    upload_time: string
  }
}

// 文件列表请求参数
export interface FileListRequest {
  page?: number
  page_size?: number
  file_type?: string
}

// 文件列表响应
export interface FileListResponse {
  code: number
  msg: string
  data: {
    total: number
    page: number
    page_size: number
    files: FileItem[]
  }
}

// 文件详情响应
export interface FileDetailResponse {
  code: number
  msg: string
  data: FileItem
}

// 删除文件请求参数
export interface DeleteFilesRequest {
  file_ids: number[]
}

// 删除文件响应
export interface DeleteFilesResponse {
  code: number
  msg: string
  data: null
}

// @ts-ignore 文件类型枚举
export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio'
}

// 支持的文件扩展名
export const SUPPORTED_FILE_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.doc', '.docx',
  '.rar', '.zip', '.7z', '.pptx', '.pdf',
  '.mp3', '.mp4', '.avi'
] as const

// 文件大小限制（字节）
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB