<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '@/utils/useI18n'
import Footer from './Footer.vue'
import Header from './Header.vue'
// eslint-disable-next-line unused-imports/no-unused-vars
const { t } = useI18n()
const route = useRoute()

// 判断是否在auth路径下
const isAuthPage = computed(() => {
  return route.path.startsWith('/auth')
})
</script>

<template>
  <Header v-if="!isAuthPage" />
  <!-- 路由出口，用于显示页面内容 -->
  <div class="w-full" :style="isAuthPage ? 'height: 100vh;' : 'height: calc(100vh - 65px);'">
    <slot>
      <!-- 默认内容或RouterView -->
    </slot>
  </div>
  <Footer v-if="!isAuthPage" />
</template>

<style scoped lang="scss"></style>
