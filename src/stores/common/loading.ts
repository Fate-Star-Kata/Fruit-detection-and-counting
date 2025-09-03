import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false)
  const showProgress = ref(true)

  // 显示加载动画
  const showLoading = (text: string = '加载中', progress: boolean = true) => {
    showProgress.value = progress
    isLoading.value = true
  }

  // 隐藏加载动画
  const hideLoading = () => {
    isLoading.value = false
  }

  return {
    isLoading,
    showProgress,
    showLoading,
    hideLoading,
  }
})