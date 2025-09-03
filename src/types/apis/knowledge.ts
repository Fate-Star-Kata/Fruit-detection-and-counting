// 知识库相关类型定义

// 文章分类类型
export interface KnowledgeCategory {
  id: number
  name: string
  description: string
  parent: number | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  children_count: number
  articles_count: number
  full_path: string
}

// 获取文章分类列表响应类型
export interface KnowledgeCategoriesResponse {
  code: number
  msg: string | null
  data: KnowledgeCategory[]
}

// 文章基本信息类型
export interface KnowledgeArticle {
  id: number
  title: string
  summary: string
  image: string | null
  category_name: string
  author_name: string
  status: string
  tags_list: string[]
  view_count: number
  like_count: number
  is_featured: boolean
  created_at: string
  updated_at: string
  published_at: string | null
}

// 文章详细信息类型
export interface KnowledgeArticleDetail extends KnowledgeArticle {
  content: string
  category: number
  author: number
  tags: string
  sort_order: number
  is_liked: boolean
}

// 文章列表查询参数类型
export interface KnowledgeArticlesRequest {
  category_id?: string | number
  page?: string | number
  page_size?: string | number
  search?: string
}

// 文章列表响应类型
export interface KnowledgeArticlesResponse {
  code: number
  msg: string | null
  data: {
    total: number
    page: number
    page_size: number
    articles: KnowledgeArticle[]
  }
}

// 文章详情响应类型
export interface KnowledgeArticleDetailResponse {
  code: number
  msg: string | null
  data: KnowledgeArticleDetail
}

// 文章点赞响应类型
export interface KnowledgeArticleLikeResponse {
  code: number
  msg: string
  data: {
    is_liked: boolean
    like_count: number
  }
}

// 通用API响应类型
export interface KnowledgeApiResponse {
  code: number
  msg: string
  data?: any
}

// ------------------ 管理端类型定义 ------------------

// 管理端文章查询参数（根据文档）
export interface AdminKnowledgeArticlesQuery {
  query?: string
  page?: number
  page_size?: number
  status?: 'draft' | 'published' | 'archived'
  category_id?: number
  author_id?: number
  start_date?: string
  end_date?: string
}

// 管理端文章列表响应
export interface AdminKnowledgeArticlesListResponse {
  code: number
  msg: string | null
  data: {
    total: number
    page: number
    page_size: number
    articles: KnowledgeArticle[]
  }
}

// 管理端文章详情响应（沿用 KnowledgeArticleDetail）
export interface AdminKnowledgeArticleDetailResponse {
  code: number
  msg: string | null
  data: KnowledgeArticleDetail
}

// 管理端文章创建入参
export interface AdminCreateArticlePayload {
  title: string
  content: string
  summary: string
  image: string | null
  category: number
  tags: string // 用逗号分隔
  is_featured: boolean
  sort_order: number
}

export interface AdminCreateArticleResponse {
  code: number
  msg: string | null
  data: { id: number }
}

// 管理端文章更新入参（文档示例为部分字段）
export interface AdminUpdateArticlePayload {
  title?: string
  content?: string
  status?: 'draft' | 'published' | 'archived'
}

export interface AdminCommonResponse {
  code: number
  msg: string | null
  data?: any
}

export interface AdminBatchDeletePayload {
  article_ids: number[]
}

// 文章统计
export interface AdminArticleStatisticsResponse {
  code: number
  msg: string | null
  data: {
    basic_stats: {
      total_articles: number
      published_articles: number
      draft_articles: number
      archived_articles: number
      featured_articles: number
    }
    category_stats: Array<{
      id: number
      name: string
      articles_count: number
    }>
    author_stats: Array<{
      id: number
      username: string
      articles_count: number
    }>
    recent_articles: KnowledgeArticle[]
  }
}