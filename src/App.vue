<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import { useElementPlusLocale } from '@/composables/useElementPlusLocale'
import { useRoute } from 'vue-router'
import { computed, nextTick, watch } from 'vue'
import Layout from './components/layout/index.vue'
import GlobalLoading from '@/components/common/GlobalLoading.vue'
import RequestLoading from '@/components/common/RequestLoading.vue'
import { useLoadingStore } from '@/stores/common/loading'
import { useRequestLoadingStore } from '@/stores/common/requestLoading'

// 获取 Element Plus 国际化配置
const { elementPlusLocale } = useElementPlusLocale()

// 获取当前路由
const route = useRoute()

// 判断是否为后台管理页面
const isAdminPage = computed(() => {
  return route.path.startsWith('/admin')
})

const reqShosw = computed(() => {
  return (requestLoadingStore.isLoading && !route.path.startsWith('/admin'))
})

// 获取加载状态
const loadingStore = useLoadingStore()
const requestLoadingStore = useRequestLoadingStore()
</script>

<template>
  <ElConfigProvider :locale="elementPlusLocale">
    <!-- 后台管理页面不使用全局Layout -->
    <router-view v-if="isAdminPage" />

    <!-- 其他页面使用全局Layout -->
    <Layout v-else>
      <router-view />
    </Layout>

    <!-- 全局加载动画 -->
    <GlobalLoading :is-loading="loadingStore.isLoading" :show-progress="loadingStore.showProgress" />

    <!-- TODO 查看生产环境vif是否异常 网络请求加载动画 -->
    <RequestLoading v-if="reqShosw" />

  </ElConfigProvider>
</template>

<style scoped></style>
