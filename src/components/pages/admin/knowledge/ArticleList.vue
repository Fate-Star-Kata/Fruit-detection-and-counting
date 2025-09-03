<template>
  <el-card shadow="never" class="list-card">
    <template #header>
      <div class="list-header">
        <span class="list-title">文章列表</span>
        <el-space>
          <el-button 
            :icon="Delete" 
            type="danger" 
            :disabled="multipleSelection.length === 0" 
            @click="$emit('batchDelete', multipleSelection)"
          >
            批量删除
          </el-button>
        </el-space>
      </div>
    </template>

    <div v-if="loading" v-loading="loading" class="loading-container">
      <el-empty description="正在加载数据..." />
    </div>

    <div v-else-if="articles.length === 0" class="empty-container">
      <el-empty description="暂无文章">
        <template #image>
          <el-icon size="60" color="var(--el-color-info)">
            <DocumentRemove />
          </el-icon>
        </template>
        <el-button type="primary" :icon="Plus" @click="$emit('create')">新建文章</el-button>
      </el-empty>
    </div>

    <div v-else class="table-container">
      <el-table 
        :data="articles" 
        border 
        stripe 
        style="width: 100%" 
        :loading="loading" 
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />

        <el-table-column label="标题" min-width="240" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="title-cell">
              <span class="title-text">{{ row.title }}</span>
              <el-tag v-if="row.is_featured" type="warning" size="small" class="ml-2">精选</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="category_name" label="分类" width="120" show-overflow-tooltip />

        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="author_name" label="作者" width="120" show-overflow-tooltip />

        <el-table-column label="浏览/点赞" width="120" align="center">
          <template #default="{ row }">
            <span>{{ row.view_count }} / {{ row.like_count }}</span>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="160" align="center">
          <template #default="{ row }">
            <div class="time-cell">
              <el-icon class="time-icon"><Clock /></el-icon>
              <span class="time-text">{{ formatDate(row.created_at) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="发布时间" width="160" align="center">
          <template #default="{ row }">
            <div class="time-cell">
              <el-icon class="time-icon"><Clock /></el-icon>
              <span class="time-text">{{ row.published_at ? formatDate(row.published_at) : '-' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="240" fixed="right" align="center">
          <template #default="{ row }">
            <el-button-group size="small">
              <el-button type="primary" @click="$emit('edit', row.id)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button 
                type="success" 
                v-if="row.status !== 'published'" 
                @click="$emit('publish', row)"
              >
                <el-icon><Promotion /></el-icon>
              </el-button>
              <el-button 
                type="warning" 
                v-else 
                @click="$emit('unpublish', row)"
              >
                <el-icon><VideoPause /></el-icon>
              </el-button>
              <el-button type="danger" @click="$emit('delete', row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="localPagination.page"
        v-model:page-size="localPagination.page_size"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        background
      />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Delete, DocumentRemove, Plus, Edit, Promotion, VideoPause, Clock } from '@element-plus/icons-vue'
import type { KnowledgeArticle } from '@/types/factory'

// Props
const props = defineProps<{
  articles: KnowledgeArticle[]
  loading: boolean
  total: number
  pagination: { page: number; page_size: number }
}>()

// Emits
const emit = defineEmits<{
  create: []
  edit: [id: number]
  delete: [article: KnowledgeArticle]
  publish: [article: KnowledgeArticle]
  unpublish: [article: KnowledgeArticle]
  batchDelete: [articles: KnowledgeArticle[]]
  sizeChange: [size: number]
  currentChange: [page: number]
}>()

// 本地分页状态
const localPagination = reactive({
  page: props.pagination.page,
  page_size: props.pagination.page_size
})

// 监听外部分页变化
watch(() => props.pagination, (newPagination) => {
  localPagination.page = newPagination.page
  localPagination.page_size = newPagination.page_size
}, { deep: true })

// 选择的文章
const multipleSelection = ref<KnowledgeArticle[]>([])

// 处理选择变化
const handleSelectionChange = (rows: KnowledgeArticle[]) => {
  multipleSelection.value = rows
}

// 处理分页变化
const handleSizeChange = (size: number) => {
  localPagination.page_size = size
  emit('sizeChange', size)
}

const handleCurrentChange = (page: number) => {
  localPagination.page = page
  emit('currentChange', page)
}

// 工具函数
const formatDate = (s?: string | null) => {
  if (!s) return '-'
  try { return new Date(s).toLocaleString() } catch { return String(s) }
}

const statusText = (s: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档'
  }
  return statusMap[s] || s
}

const statusTagType = (s: string) => {
  const typeMap: Record<string, any> = {
    draft: 'info',
    published: 'success',
    archived: 'warning'
  }
  return typeMap[s] || 'info'
}
</script>

<style scoped>
.list-card {
  margin-top: 12px;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list-title {
  font-size: 16px;
  font-weight: 600;
}

.loading-container,
.empty-container {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-cell {
  display: flex;
  align-items: center;
}

.title-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.time-icon {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.time-text {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>