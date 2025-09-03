<template>
  <div class="knowledge-admin-container h-full overflow-y-auto">
    <!-- 顶部统计与操作 -->
    <StatsCard 
      :stats="stats" 
      :loading="loading.list || loading.stats" 
      @create="openCreateDialog" 
      @refresh="refreshAll" 
    />

    <!-- 筛选搜索区域 -->
    <SearchFilter 
      v-model:filters="filters" 
      :categories="categories" 
      @search="getList" 
      @reset="resetFilters" 
    />

    <!-- 列表 -->
    <ArticleList 
      :articles="articles" 
      :loading="loading.list" 
      :total="total" 
      :pagination="pagination" 
      :multiple-selection="multipleSelection" 
      @selection-change="handleSelectionChange" 
      @size-change="(size) => { pagination.page_size = size; pagination.page = 1; getList() }" 
      @current-change="(page) => { pagination.page = page; getList() }" 
      @edit="openEditDialog" 
      @publish="handlePublish" 
      @unpublish="handleUnpublish" 
      @delete="confirmDelete" 
      @batch-delete="confirmBatchDelete" 
      @create="openCreateDialog" 
    />

    <!-- 创建文章对话框 -->
    <CreateArticleDialog 
      v-model="dialogs.create" 
      :categories="categories" 
      :loading="loading.create" 
      @submit="submitCreate" 
    />

    <!-- 编辑文章对话框 -->
    <EditArticleDialog 
      v-model="dialogs.edit" 
      :editing-id="editingId" 
      :detail-loading="loading.detail" 
      :update-loading="loading.update" 
      @submit="submitEdit" 
      @load-detail="loadEditDetail" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getKnowledgeCategories } from '@/api/user/knowledge'
import { adminGetArticles, adminGetArticleDetail, adminUpdateArticle, adminDeleteArticle, adminBatchDeleteArticles, adminPublishArticle, adminUnpublishArticle, adminCreateArticle, adminGetArticleStatistics } from '@/api/admin/knowledge'
import type { KnowledgeCategory, KnowledgeArticle, AdminKnowledgeArticlesQuery, AdminArticleStatisticsResponse, AdminCreateArticlePayload, AdminUpdateArticlePayload } from '@/types/factory'

// 导入组件
import StatsCard from '@/components/pages/admin/knowledge/StatsCard.vue'
import SearchFilter from '@/components/pages/admin/knowledge/SearchFilter.vue'
import ArticleList from '@/components/pages/admin/knowledge/ArticleList.vue'
import CreateArticleDialog from '@/components/pages/admin/knowledge/CreateArticleDialog.vue'
import EditArticleDialog from '@/components/pages/admin/knowledge/EditArticleDialog.vue'

// 分类
const categories = ref<KnowledgeCategory[]>([])

// 列表与分页
const articles = ref<KnowledgeArticle[]>([])
const total = ref(0)
const pagination = reactive({ page: 1, page_size: 10 })

// 过滤项
const filters = reactive<AdminKnowledgeArticlesQuery>({
  query: '',
  category_id: undefined,
  status: undefined,
})

// 选择
const multipleSelection = ref<KnowledgeArticle[]>([])

// 加载状态
const loading = reactive({ list: false, create: false, update: false, detail: false, stats: false })

// 统计
const stats = reactive<AdminArticleStatisticsResponse['data']>({
  basic_stats: { total_articles: 0, published_articles: 0, draft_articles: 0, archived_articles: 0, featured_articles: 0 },
  category_stats: [],
  author_stats: [],
  recent_articles: [],
})

// 对话框与表单
const dialogs = reactive({ create: false, edit: false })

// 编辑相关
const editingId = ref<number | null>(null)

// 方法
const handleSelectionChange = (rows: KnowledgeArticle[]) => { multipleSelection.value = rows }

const resetFilters = () => {
  filters.query = ''
  filters.category_id = undefined
  filters.status = undefined
  pagination.page = 1
  pagination.page_size = 10
  getList()
}



const getList = async () => {
  loading.list = true
  try {
    const params: AdminKnowledgeArticlesQuery = {
      query: filters.query || undefined,
      category_id: filters.category_id || undefined,
      status: filters.status,
      page: pagination.page,
      page_size: pagination.page_size,
    }
    const res = await adminGetArticles(params)
    if (res.code === 200) {
      articles.value = res.data.articles || []
      total.value = res.data.total || 0
    } else {
      ElMessage.error(res.msg || '获取文章列表失败')
    }
  } catch (e) {
    ElMessage.error('获取文章列表失败')
  } finally {
    loading.list = false
  }
}

const refreshAll = () => { getStats(); getList() }

const getStats = async () => {
  loading.stats = true
  try {
    const res = await adminGetArticleStatistics()
    if (res.code === 200) {
      Object.assign(stats, res.data)
    }
  } catch (e) { /* 忽略 */ } finally { loading.stats = false }
}

// 创建
const openCreateDialog = () => { dialogs.create = true }
const submitCreate = async (payload: AdminCreateArticlePayload) => {
  loading.create = true
  try {
    const res = await adminCreateArticle(payload)
    if (res.code === 200) {
      ElMessage.success('创建成功')
      dialogs.create = false
      getList()
    } else {
      ElMessage.error(res.msg || '创建失败')
    }
  } catch (e) {
    ElMessage.error('创建失败')
  } finally {
    loading.create = false
  }
}

// 编辑
const openEditDialog = (id: number) => {
  dialogs.edit = true
  editingId.value = id
}

const loadEditDetail = async (id: number) => {
  loading.detail = true
  try {
    const res = await adminGetArticleDetail(id)
    if (res.code === 200) {
      return res.data
    } else {
      ElMessage.error(res.msg || '获取文章详情失败')
      return null
    }
  } catch (e) {
    ElMessage.error('获取文章详情失败')
    return null
  } finally {
    loading.detail = false
  }
}

const submitEdit = async (id: number, payload: AdminUpdateArticlePayload) => {
  loading.update = true
  try {
    const res = await adminUpdateArticle(id, payload)
    if (res.code === 200) {
      ElMessage.success('保存成功')
      dialogs.edit = false
      getList()
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    loading.update = false
  }
}

// 发布 / 下架
const handlePublish = async (row: KnowledgeArticle) => {
  try {
    await ElMessageBox.confirm(`确定发布《${row.title}》吗？`, '发布确认', { type: 'warning' })
    const res = await adminPublishArticle(row.id)
    if (res.code === 200) { ElMessage.success('发布成功'); getList() } else { ElMessage.error(res.msg || '发布失败') }
  } catch { /* 取消 */ }
}

const handleUnpublish = async (row: KnowledgeArticle) => {
  try {
    await ElMessageBox.confirm(`确定取消发布《${row.title}》吗？`, '取消发布确认', { type: 'warning' })
    const res = await adminUnpublishArticle(row.id)
    if (res.code === 200) { ElMessage.success('已取消发布'); getList() } else { ElMessage.error(res.msg || '操作失败') }
  } catch { /* 取消 */ }
}

// 删除
const confirmDelete = (row: KnowledgeArticle) => {
  ElMessageBox.confirm(`确定删除《${row.title}》吗？该操作不可恢复。`, '删除确认', { type: 'warning' })
    .then(async () => {
      const res = await adminDeleteArticle(row.id)
      if (res.code === 200) { ElMessage.success('删除成功'); getList() } else { ElMessage.error(res.msg || '删除失败') }
    })
    .catch(() => {})
}

// 批量删除
const confirmBatchDelete = () => {
  const ids = multipleSelection.value.map(i => i.id)
  if (ids.length === 0) return
  ElMessageBox.confirm(`确定批量删除选中的 ${ids.length} 篇文章吗？不可恢复。`, '批量删除确认', { type: 'warning' })
    .then(async () => {
      const res = await adminBatchDeleteArticles({ article_ids: ids })
      if (res.code === 200) { ElMessage.success('批量删除成功'); getList() } else { ElMessage.error(res.msg || '批量删除失败') }
    })
    .catch(() => {})
}

onMounted(async () => {
  // 分类
  try {
    const res = await getKnowledgeCategories()
    if (res.code === 200) categories.value = res.data
  } catch { /* ignore */ }
  await Promise.all([getStats(), getList()])
})
</script>

<style scoped>
.knowledge-admin-container {
  padding: 16px;
}
.stats-header, .list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.stats-title, .list-title {
  font-size: 16px;
  font-weight: 600;
}
.stats-row { margin-top: 4px; }
.stat-card { text-align: center; }

.search-card { margin-top: 12px; margin-bottom: 12px; }
.search-form.el-form--inline { display: flex; align-items: center; }
.search-form.el-form--inline .el-form-item { margin-bottom: 0; }
.list-card { margin-top: 12px; }

.title-cell { display: flex; align-items: center; }
.title-text { font-weight: 600; }
.time-cell { display: flex; align-items: center; justify-content: center; }
.time-icon { margin-right: 6px; }

.pagination-container { display: flex; justify-content: flex-end; margin-top: 12px; }
</style>
