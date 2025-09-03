import type { UserInfoNoToken } from '@/types/factory'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCommonStore = defineStore('common', () => {
  // 用户信息对象
  const GlobalKeyWord = ref<UserInfoNoToken>()

  return {
    GlobalKeyWord,
  }
}, {
  persist: {
    key: 'user-store',
    storage: localStorage,
  },
})
