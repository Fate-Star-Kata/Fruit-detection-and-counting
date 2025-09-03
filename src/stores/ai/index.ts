import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  AiChat,
  AiMessage,
  AiChatListRequest,
  AiChatCreateRequest,
  AiChatUpdateRequest,
  AiMessageSendRequest,
  AiChatDeleteRequest
} from '@/types/factory'
import {
  getAiChats,
  createAiChat,
  getAiChatDetail,
  updateAiChat,
  sendAiMessage,
  deleteAiChats
} from '@/api/admin/ai'
import { ElMessage } from 'element-plus'
import router from '@/router'

export const useAiStore = defineStore('ai', () => {
  // 状态
  const chats = ref<AiChat[]>([])
  const currentChat = ref<AiChat | null>(null)
  const messages = ref<AiMessage[]>([])
  const loading = ref(false)
  const sending = ref(false)
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const searchQuery = ref('')

  // 计算属性
  const hasChats = computed(() => chats.value.length > 0)
  const hasMessages = computed(() => messages.value.length > 0)
  const canLoadMore = computed(() => chats.value.length < total.value)

  // 获取聊天列表
  const fetchChats = async (params?: AiChatListRequest) => {
    try {
      loading.value = true
      const response = await getAiChats({
        query: searchQuery.value,
        page: page.value,
        page_size: pageSize.value,
        ...params
      })

      if (response.code === 200) {
        if (params?.page === 1 || !params?.page) {
          chats.value = response.data.chats
        }
        else {
          chats.value.push(...response.data.chats)
        }
        total.value = response.data.total
        page.value = response.data.page
      }
      else if (response.code === 401) {
          ElMessage.error('未授权，请登录后重试')
          // 这里可以添加重定向到登录页面的逻辑
          router.push('/auth/login')
        return
      }
      else {
        ElMessage.error(response.msg || '获取聊天列表失败')
      }
    } catch (error) {
      console.error('获取聊天列表失败:', error)
      ElMessage.error('获取聊天列表失败')
    } finally {
      loading.value = false
    }
  }

  // 创建新聊天
  const createNewChat = async (data: AiChatCreateRequest) => {
    try {
      loading.value = true
      const response = await createAiChat(data)

      if (response.code === 200) {
        ElMessage.success('创建聊天成功')
        // 重新获取聊天列表
        await fetchChats({ page: 1 })
        // 自动选择新创建的聊天
        const newChat = chats.value.find(chat => chat.id === response.data.chat_id)
        if (newChat) {
          await selectChat(newChat)
        }
        return response.data
      } else {
        ElMessage.error(response.msg || '创建聊天失败')
        throw new Error(response.msg)
      }
    } catch (error) {
      console.error('创建聊天失败:', error)
      ElMessage.error('创建聊天失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 选择聊天
  const selectChat = async (chat: AiChat) => {
    try {
      loading.value = true
      currentChat.value = chat

      const response = await getAiChatDetail(chat.id)
      if (response.code === 200) {
        messages.value = response.data.messages
      } else {
        ElMessage.error(response.msg || '获取聊天详情失败')
      }
    } catch (error) {
      console.error('获取聊天详情失败:', error)
      ElMessage.error('获取聊天详情失败')
    } finally {
      loading.value = false
    }
  }

  // 更新聊天标题
  const updateChatTitle = async (chatId: number, data: AiChatUpdateRequest) => {
    try {
      const response = await updateAiChat(chatId, data)

      if (response.code === 200) {
        ElMessage.success('更新聊天标题成功')
        // 更新本地数据
        const chatIndex = chats.value.findIndex(chat => chat.id === chatId)
        if (chatIndex !== -1) {
          chats.value[chatIndex].title = data.title
        }
        if (currentChat.value?.id === chatId) {
          currentChat.value.title = data.title
        }
      } else {
        ElMessage.error(response.msg || '更新聊天标题失败')
        throw new Error(response.msg)
      }
    } catch (error) {
      console.error('更新聊天标题失败:', error)
      ElMessage.error('更新聊天标题失败')
      throw error
    }
  }

  // 发送消息
  const sendMessage = async (message: string) => {
    if (!currentChat.value || !message.trim()) {
      ElMessage.warning('请选择聊天或输入消息内容')
      return
    }

    try {
      sending.value = true

      const response = await sendAiMessage({
        chat_id: currentChat.value.id,
        content: message.trim()
      })

      if (response.code === 200) {
        // 添加用户消息和AI回复到消息列表
        messages.value.push(response.data.user_message)
        messages.value.push(response.data.ai_message)

        // 更新当前聊天的最新消息
        if (currentChat.value) {
          currentChat.value.latest_message = response.data.ai_message.content.substring(0, 50)

          // 更新聊天列表中对应的聊天
          const chatIndex = chats.value.findIndex(chat => chat.id === currentChat.value!.id)
          if (chatIndex !== -1) {
            chats.value[chatIndex] = { ...currentChat.value }
          }
        }

        return response.data
      } else {
        ElMessage.error(response.msg || '发送消息失败')
        throw new Error(response.msg)
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      ElMessage.error('发送消息失败')
      throw error
    } finally {
      sending.value = false
    }
  }

  // 删除聊天
  const deleteChatList = async (data: AiChatDeleteRequest) => {
    try {
      loading.value = true
      const response = await deleteAiChats(data)

      if (response.code === 200) {
        ElMessage.success('删除聊天成功')
        // 从本地列表中移除已删除的聊天
        chats.value = chats.value.filter(chat => !data.chat_ids.includes(chat.id))

        // 如果当前选中的聊天被删除，清空当前聊天
        if (currentChat.value && data.chat_ids.includes(currentChat.value.id)) {
          currentChat.value = null
          messages.value = []
        }

        // 更新总数
        total.value -= data.chat_ids.length
      } else {
        ElMessage.error(response.msg || '删除聊天失败')
        throw new Error(response.msg)
      }
    } catch (error) {
      console.error('删除聊天失败:', error)
      ElMessage.error('删除聊天失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 搜索聊天
  const searchChats = async (query: string) => {
    searchQuery.value = query
    page.value = 1
    await fetchChats({ page: 1, query })
  }

  // 加载更多聊天
  const loadMoreChats = async () => {
    if (canLoadMore.value && !loading.value) {
      page.value += 1
      await fetchChats({ page: page.value })
    }
  }

  // 重置状态
  const resetState = () => {
    chats.value = []
    currentChat.value = null
    messages.value = []
    loading.value = false
    sending.value = false
    total.value = 0
    page.value = 1
    searchQuery.value = ''
  }

  return {
    // 状态
    chats,
    currentChat,
    messages,
    loading,
    sending,
    total,
    page,
    pageSize,
    searchQuery,

    // 计算属性
    hasChats,
    hasMessages,
    canLoadMore,

    // 方法
    fetchChats,
    createNewChat,
    selectChat,
    updateChatTitle,
    sendMessage,
    deleteChatList,
    searchChats,
    loadMoreChats,
    resetState
  }
})