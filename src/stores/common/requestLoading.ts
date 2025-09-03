import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRequestLoadingStore = defineStore('requestLoading', () => {
  // 状态
  const isLoading = ref(false)
  const loadingText = ref('请求中...')
  const requestCount = ref(0) // 记录当前请求数量

  // 显示加载动画
  const showLoading = (text = '请求中...') => {
    requestCount.value++
    loadingText.value = text
    isLoading.value = true
  }

  // 隐藏加载动画
  const hideLoading = () => {
    requestCount.value--
    // 只有当所有请求都完成时才隐藏加载动画
    if (requestCount.value <= 0) {
      requestCount.value = 0
      isLoading.value = false
    }
  }

  // 强制隐藏加载动画（用于错误处理）
  const forceHideLoading = () => {
    requestCount.value = 0
    isLoading.value = false
  }

  // 设置加载文本
  const setLoadingText = (text: string) => {
    loadingText.value = text
  }

  return {
    isLoading,
    loadingText,
    requestCount,
    showLoading,
    hideLoading,
    forceHideLoading,
    setLoadingText
  }
})