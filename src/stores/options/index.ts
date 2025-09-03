import { defineStore } from 'pinia'

export const useOptionsStore = defineStore('options', () => {
  // 这里可以添加其他选项相关的状态管理
  // 菜单相关功能已移至configs统一管理

  return {
    // 其他选项相关的状态和方法
  }
}, {
  persist: true,
})
