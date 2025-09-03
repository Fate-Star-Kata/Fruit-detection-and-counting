import serviceAxios from '@/http'
import type {
  FileListRequest,
  FileListResponse,
  FileDetailResponse,
  DeleteFilesRequest,
  DeleteFilesResponse
} from '@/types/factory'

// 获取用户文件列表
export const getUserFiles = (params: FileListRequest): Promise<FileListResponse> => {
  return serviceAxios.get('/hzadmin/client/public/user_files/', { params })
}

// 获取用户文件详情
export const getUserFileDetail = (fileId: number): Promise<FileDetailResponse> => {
  return serviceAxios.get(`/hzadmin/client/public/user_files/${fileId}/`)
}

// 删除用户文件
export const deleteUserFiles = (data: DeleteFilesRequest): Promise<DeleteFilesResponse> => {
  return serviceAxios.post('/hzadmin/client/public/user_files/delete/', data)
}

// 文件上传接口地址（用于 el-upload 组件）
export const getUploadUrl = (): string => {
  return `${import.meta.env.VITE_API_BASE_URL}/hzadmin/client/public/upload/`
}

// 获取文件访问URL
export const getFileUrl = (filePath: string): string => {
  return `${import.meta.env.VITE_API_BASE_URL}/${filePath}`
}