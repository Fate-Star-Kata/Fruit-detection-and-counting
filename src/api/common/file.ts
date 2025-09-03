import serviceAxios from '@/http'
import type { AxiosProgressEvent } from 'axios'

/**
 * 上传单个文件
 * @param file 文件对象
 * @param uploadUrl 上传地址
 * @param onProgress 进度回调函数
 * @returns Promise<any>
 */
export const uploadFile = (
  file: File,
  uploadUrl: string,
  onProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<any> => {
  const formData = new FormData()
  formData.append('file', file)

  console.log(formData);

  return serviceAxios({
    method: 'POST',
    url: uploadUrl,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: onProgress
  })
}

/**
 * 批量上传文件
 * @param files 文件数组
 * @param uploadUrl 上传地址
 * @returns Promise<any[]>
 */
export const uploadMultipleFiles = (files: File[], uploadUrl: string): Promise<any[]> => {
  const uploadPromises = files.map(file => uploadFile(file, uploadUrl))
  return Promise.all(uploadPromises)
}