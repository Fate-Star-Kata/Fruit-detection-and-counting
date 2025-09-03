import serviceAxios from '@/http'
import type {
  AdminKnowledgeArticlesQuery,
  AdminKnowledgeArticlesListResponse,
  AdminKnowledgeArticleDetailResponse,
  AdminCreateArticlePayload,
  AdminCreateArticleResponse,
  AdminUpdateArticlePayload,
  AdminCommonResponse,
  AdminBatchDeletePayload,
  AdminArticleStatisticsResponse,
} from '@/types/factory'

// 获取文章列表
export const adminGetArticles = (params: AdminKnowledgeArticlesQuery): Promise<AdminKnowledgeArticlesListResponse> => {
  return serviceAxios.get('/hzadmin/admin/article/list/', { params })
}

// 获取指定文章详情
export const adminGetArticleDetail = (id: number): Promise<AdminKnowledgeArticleDetailResponse> => {
  return serviceAxios.get(`/hzadmin/admin/article/${id}/`)
}

// 更新指定文章
export const adminUpdateArticle = (id: number, data: AdminUpdateArticlePayload): Promise<AdminCommonResponse> => {
  return serviceAxios.put(`/hzadmin/admin/article/${id}/update/`, data)
}

// 删除指定文章（文档显示不支持 DELETE，将仍然按文档实现，前端用批量删除为主）
export const adminDeleteArticle = (id: number): Promise<AdminCommonResponse> => {
  return serviceAxios.delete(`/hzadmin/admin/article/${id}/`)
}

// 批量删除文章
export const adminBatchDeleteArticles = (data: AdminBatchDeletePayload): Promise<AdminCommonResponse> => {
  return serviceAxios.post('/hzadmin/admin/article/batch_delete/', data)
}

// 发布文章
export const adminPublishArticle = (id: number): Promise<AdminCommonResponse> => {
  return serviceAxios.post(`/hzadmin/admin/article/${id}/publish/`)
}

// 取消发布
export const adminUnpublishArticle = (id: number): Promise<AdminCommonResponse> => {
  return serviceAxios.post(`/hzadmin/admin/article/${id}/unpublish/`)
}

// 创建文章
export const adminCreateArticle = (data: AdminCreateArticlePayload): Promise<AdminCreateArticleResponse> => {
  return serviceAxios.post('/hzadmin/admin/article/create/', data)
}

// 获取文章统计
export const adminGetArticleStatistics = (): Promise<AdminArticleStatisticsResponse> => {
  return serviceAxios.get('/hzadmin/admin/article/statistics/')
}