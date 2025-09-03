import type {
  KnowledgeCategoriesResponse,
  KnowledgeArticlesRequest,
  KnowledgeArticlesResponse,
  KnowledgeArticleDetailResponse,
  KnowledgeArticleLikeResponse
} from '@/types/factory'
import serviceAxios from '@/http'

// 获取文章分类列表
export function getKnowledgeCategories(): Promise<KnowledgeCategoriesResponse> {
  return serviceAxios({
    url: '/hzadmin/client/knowledge/categories/',
    method: 'get',
  })
}

// 获取知识文章列表
export function getKnowledgeArticles(params?: KnowledgeArticlesRequest): Promise<KnowledgeArticlesResponse> {
  return serviceAxios({
    url: '/hzadmin/client/knowledge/articles/',
    method: 'get',
    params,
  })
}

// 获取知识文章详细内容
export function getKnowledgeArticleDetail(id: number): Promise<KnowledgeArticleDetailResponse> {
  return serviceAxios({
    url: `/hzadmin/client/knowledge/articles/${id}/`,
    method: 'get',
  })
}

// 给指定文章点赞
export function likeKnowledgeArticle(id: number): Promise<KnowledgeArticleLikeResponse> {
  return serviceAxios({
    url: `/hzadmin/client/knowledge/articles/${id}/like/`,
    method: 'post',
  })
}
