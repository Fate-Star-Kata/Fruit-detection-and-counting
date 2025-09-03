<template>
  <el-card shadow="never" class="search-card">
    <el-form :inline="true" class="search-form">
      <el-form-item label="搜索">
        <el-input 
          v-model="localFilters.query" 
          placeholder="输入标题、内容关键字..." 
          :prefix-icon="Search" 
          clearable 
          style="width: 280px" 
          @keyup.enter.native="handleSearch" 
        />
      </el-form-item>

      <el-form-item label="分类">
        <el-select 
          v-model="localFilters.category_id" 
          placeholder="全部分类" 
          clearable 
          style="width: 180px" 
          @change="handleFilterChange"
        >
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="状态">
        <el-select 
          v-model="localFilters.status" 
          placeholder="全部状态" 
          clearable 
          style="width: 140px" 
          @change="handleFilterChange"
        >
          <el-option label="草稿" value="draft" />
          <el-option label="已发布" value="published" />
          <el-option label="已归档" value="archived" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import type { KnowledgeCategory, AdminKnowledgeArticlesQuery } from '@/types/factory'

// Props
const props = defineProps<{
  filters: AdminKnowledgeArticlesQuery
  categories: KnowledgeCategory[]
}>()

// Emits
const emit = defineEmits<{
  search: [filters: AdminKnowledgeArticlesQuery]
  reset: []
  filterChange: [filters: AdminKnowledgeArticlesQuery]
}>()

// 本地过滤器状态
const localFilters = reactive<AdminKnowledgeArticlesQuery>({
  query: props.filters.query || '',
  category_id: props.filters.category_id,
  status: props.filters.status,
})

// 监听外部过滤器变化
watch(() => props.filters, (newFilters) => {
  localFilters.query = newFilters.query || ''
  localFilters.category_id = newFilters.category_id
  localFilters.status = newFilters.status
}, { deep: true })

// 处理搜索
const handleSearch = () => {
  emit('search', { ...localFilters })
}

// 处理过滤器变化
const handleFilterChange = () => {
  emit('filterChange', { ...localFilters })
}

// 处理重置
const handleReset = () => {
  localFilters.query = ''
  localFilters.category_id = undefined
  localFilters.status = undefined
  emit('reset')
}
</script>

<style scoped>
.search-card {
  margin-top: 12px;
  margin-bottom: 12px;
}

.search-form.el-form--inline {
  display: flex;
  align-items: center;
}

.search-form.el-form--inline .el-form-item {
  margin-bottom: 0;
}
</style>