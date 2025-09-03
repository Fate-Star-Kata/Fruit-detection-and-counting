import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { svgToBase64 } from '@/utils/tools'
import type { UserInfoNoToken } from '@/types/apis/auth'

export const useUserStore = defineStore('user', () => {
  // 用户信息对象
  const userInfo = ref<UserInfoNoToken | null>(null)

  // 获取用户信息
  const getUserInfo = (): UserInfoNoToken | null => {
    return userInfo.value
  }

  // 设置用户信息
  const setUserInfo = (info: UserInfoNoToken | null): void => {
    userInfo.value = info
  }

  // 获取用户头像
  const getUserAvatar = computed(() => {
    // 如果用户有自定义头像，直接返回
    if (userInfo.value?.avatar) {
      return userInfo.value.avatar
    }

    // 生成默认头像 SVG
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <circle cx="60" cy="60" r="58" fill="#e3f2fd" stroke="#90caf9" stroke-width="2"/>
        <text
          x="60"
          y="70"
          text-anchor="middle"
          font-family="Arial, sans-serif"
          font-size="48"
          fill="#1976d2"
          font-weight="bold"
        >
          ${(userInfo?.value?.username?.[0] || '?').toUpperCase()}
        </text>
      </svg>
    `

    return `data:image/svg+xml;base64,${svgToBase64(svg)}`
  })

  return {
    userInfo,
    getUserInfo,
    setUserInfo,
    getUserAvatar,
  }
}, {
  //开启持久化
  persist: true,
})
