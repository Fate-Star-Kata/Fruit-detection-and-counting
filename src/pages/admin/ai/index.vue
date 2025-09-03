<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { Motion } from 'motion-v'
import { useAiStore } from '@/stores/ai'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { AiChat, Emoji } from '@/types/factory'
import { useUserStore } from '@/stores/auth/user'

// AI Store
const aiStore = useAiStore()
const {
  chats,
  currentChat,
  messages,
  loading,
  sending,
  hasChats,
  hasMessages,
} = storeToRefs(aiStore)

// User Store
const userStore = useUserStore()
const { userInfo, getUserAvatar } = storeToRefs(userStore)

// 使用store中的头像方法
const userAvatar = getUserAvatar

// 响应式数据
const messageInput = ref('')
const showEmojiPicker = ref(false)
const messagesContainer = ref<HTMLElement>()
const sidebarCollapsed = ref(false)
const editingChatId = ref<number | null>(null)
const editingTitle = ref('')
const searchQuery = ref('')

// Emoji数据
const emojiCategories = ref([
  {
    name: '表情',
    emojis: [
      { emoji: '😀', name: 'grinning', category: 'smileys' },
      { emoji: '😃', name: 'smiley', category: 'smileys' },
      { emoji: '😄', name: 'smile', category: 'smileys' },
      { emoji: '😁', name: 'grin', category: 'smileys' },
      { emoji: '😆', name: 'laughing', category: 'smileys' },
      { emoji: '😅', name: 'sweat_smile', category: 'smileys' },
      { emoji: '🤣', name: 'rofl', category: 'smileys' },
      { emoji: '😂', name: 'joy', category: 'smileys' },
      { emoji: '🙂', name: 'slightly_smiling_face', category: 'smileys' },
      { emoji: '🙃', name: 'upside_down_face', category: 'smileys' },
      { emoji: '😉', name: 'wink', category: 'smileys' },
      { emoji: '😊', name: 'blush', category: 'smileys' },
      { emoji: '😇', name: 'innocent', category: 'smileys' },
      { emoji: '🥰', name: 'smiling_face_with_hearts', category: 'smileys' },
      { emoji: '😍', name: 'heart_eyes', category: 'smileys' },
      { emoji: '🤩', name: 'star_struck', category: 'smileys' },
      { emoji: '😘', name: 'kissing_heart', category: 'smileys' },
      { emoji: '😗', name: 'kissing', category: 'smileys' },
      { emoji: '😚', name: 'kissing_smiling_eyes', category: 'smileys' },
      { emoji: '😙', name: 'kissing_closed_eyes', category: 'smileys' },
      { emoji: '🥲', name: 'smiling_face_with_tear', category: 'smileys' },
      { emoji: '😋', name: 'yum', category: 'smileys' },
      { emoji: '😛', name: 'stuck_out_tongue', category: 'smileys' },
      { emoji: '😜', name: 'stuck_out_tongue_winking_eye', category: 'smileys' },
      { emoji: '🤪', name: 'zany_face', category: 'smileys' },
      { emoji: '😝', name: 'stuck_out_tongue_closed_eyes', category: 'smileys' },
      { emoji: '🤑', name: 'money_mouth_face', category: 'smileys' },
      { emoji: '🤗', name: 'hugs', category: 'smileys' },
      { emoji: '🤭', name: 'hand_over_mouth', category: 'smileys' },
      { emoji: '🤫', name: 'shushing_face', category: 'smileys' },
      { emoji: '🤔', name: 'thinking', category: 'smileys' },
      { emoji: '🤐', name: 'zipper_mouth_face', category: 'smileys' }
    ]
  },
  {
    name: '手势',
    emojis: [
      { emoji: '👍', name: 'thumbsup', category: 'people' },
      { emoji: '👎', name: 'thumbsdown', category: 'people' },
      { emoji: '👌', name: 'ok_hand', category: 'people' },
      { emoji: '✌️', name: 'v', category: 'people' },
      { emoji: '🤞', name: 'crossed_fingers', category: 'people' },
      { emoji: '🤟', name: 'love_you_gesture', category: 'people' },
      { emoji: '🤘', name: 'metal', category: 'people' },
      { emoji: '🤙', name: 'call_me_hand', category: 'people' },
      { emoji: '👈', name: 'point_left', category: 'people' },
      { emoji: '👉', name: 'point_right', category: 'people' },
      { emoji: '👆', name: 'point_up_2', category: 'people' },
      { emoji: '👇', name: 'point_down', category: 'people' },
      { emoji: '☝️', name: 'point_up', category: 'people' },
      { emoji: '✋', name: 'raised_hand', category: 'people' },
      { emoji: '🤚', name: 'raised_back_of_hand', category: 'people' },
      { emoji: '🖐️', name: 'raised_hand_with_fingers_splayed', category: 'people' },
      { emoji: '🖖', name: 'vulcan_salute', category: 'people' },
      { emoji: '👋', name: 'wave', category: 'people' },
      { emoji: '🤏', name: 'pinching_hand', category: 'people' },
      { emoji: '👏', name: 'clap', category: 'people' },
      { emoji: '🙌', name: 'raised_hands', category: 'people' },
      { emoji: '🤝', name: 'handshake', category: 'people' },
      { emoji: '🙏', name: 'pray', category: 'people' },
      { emoji: '✍️', name: 'writing_hand', category: 'people' },
      { emoji: '💪', name: 'muscle', category: 'people' }
    ]
  }
])

// 计算属性
const filteredChats = computed(() => {
  if (!searchQuery.value.trim()) {
    return chats.value
  }
  return chats.value.filter(chat => chat.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (chat.latest_message && chat.latest_message.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

// 动画配置
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
}

const sidebarVariants = {
  expanded: { width: '380px' },
  collapsed: { width: '80px' },
  transition: { duration: 0.3, ease: 'easeOut' }
}

const messageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.3, ease: 'easeOut' }
}

const chatItemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  whileHover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  transition: { duration: 0.3, ease: 'easeOut' }
}

// 方法
const createNewChat = async () => {
  try {
    const title = `新对话 ${new Date().toLocaleString()}`
    await aiStore.createNewChat({ title })
  } catch (error) {
    console.error('创建聊天失败:', error)
    ElMessage.error('创建对话失败')
  }
}

const selectChat = async (chat: AiChat) => {
  await aiStore.selectChat(chat)
  nextTick(() => {
    scrollToBottom()
  })
}

const sendMessage = async () => {
  if (!messageInput.value.trim() || !currentChat.value || sending.value) {
    return
  }

  const message = messageInput.value.trim()
  messageInput.value = ''
  showEmojiPicker.value = false

  try {
    await aiStore.sendMessage(message)
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败')
    messageInput.value = message
  }
}

const insertEmoji = (emoji: Emoji) => {
  messageInput.value += emoji.emoji
  showEmojiPicker.value = false
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const startEditChat = (chat: AiChat) => {
  editingChatId.value = chat.id
  editingTitle.value = chat.title
}

const saveEditChat = async () => {
  if (!editingChatId.value || !editingTitle.value.trim()) {
    return
  }

  try {
    await aiStore.updateChatTitle(editingChatId.value, { title: editingTitle.value.trim() })
    editingChatId.value = null
    editingTitle.value = ''
    ElMessage.success('标题更新成功')
  } catch (error) {
    console.error('更新聊天标题失败:', error)
    ElMessage.error('更新标题失败')
  }
}

const cancelEditChat = () => {
  editingChatId.value = null
  editingTitle.value = ''
}

const deleteChat = async (chat: AiChat) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除对话 "${chat.title}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await aiStore.deleteChatList({ chat_ids: [chat.id] })
    ElMessage.success('对话删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除聊天失败:', error)
      ElMessage.error('删除对话失败')
    }
  }
}

const clearAllMessages = async () => {
  if (!currentChat.value) return

  try {
    await ElMessageBox.confirm(
      '确定要清空当前对话的所有消息吗？',
      '确认清空',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )


    ElMessage.success('消息清空成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空消息失败:', error)
      ElMessage.error('清空消息失败')
    }
  }
}

const formatMessageContent = (content: string) => {
  // 处理think标签，添加特殊样式
  return content.replace(
    /<think>(.*?)<\/think>/gs,
    '<div class="think-block"><div class="think-header">思考过程</div><div class="think-content">$1</div></div>'
  )
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// 生命周期
onMounted(async () => {
  await aiStore.fetchChats()
  if (chats.value.length > 0) {
    await selectChat(chats.value[0])
  }
})
</script>

<template>
  <div
    class="h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-blue-50 flex flex-col overflow-hidden">
    <!-- @vue-ignore 页面入场 -->
    <Motion :initial="pageVariants.initial" :animate="pageVariants.animate" :transition="pageVariants.transition"
      class="flex-1 flex min-h-0 h-full">

      <!-- 侧边栏 -->
      <!-- @vue-ignore -->
      <Motion :animate="sidebarCollapsed ? sidebarVariants.collapsed : sidebarVariants.expanded"
        :transition="sidebarVariants.transition"
        class="bg-white/80 border-r border-gray-200/70 flex flex-col shadow-xl backdrop-blur-md">
        <!-- 侧边栏头部 -->
        <div class="p-5 border-b border-gray-100/80">
          <div class="flex items-center justify-between">
            <div v-if="!sidebarCollapsed" class="flex-1">
              <h1 class="text-base font-semibold text-gray-900">AI 助手</h1>
              <p class="text-xs text-gray-500 mt-0.5">智能对话中心</p>
            </div>
            <button @click="toggleSidebar"
              class="p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  :d="sidebarCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'" />
              </svg>
            </button>
          </div>

          <!-- 新建与搜索 -->
          <div v-if="!sidebarCollapsed" class="mt-4 space-y-2">
            <button @click="createNewChat" :disabled="loading"
              class="w-full h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition">
              新建对话
            </button>
            <div v-if="hasChats" class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input v-model="searchQuery" type="text" placeholder="搜索对话..."
                class="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition outline-none" />
            </div>
          </div>
        </div>

        <!-- 对话列表 -->
        <div class="flex-1 overflow-y-auto">
          <!-- 加载/空态 -->
          <div v-if="loading && !hasChats" class="flex flex-col items-center justify-center p-10 text-gray-500">
            <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p class="text-sm">加载中...</p>
          </div>

          <div v-else-if="!hasChats" class="flex flex-col items-center justify-center p-10">
            <div class="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p v-if="!sidebarCollapsed" class="text-sm text-gray-500">暂无对话，点击上方按钮创建</p>
          </div>

          <!-- 列表 -->
          <div v-else class="p-3 space-y-2">
            <!-- @vue-ignore -->
            <Motion v-for="(chat, index) in filteredChats" :key="chat.id" :initial="chatItemVariants.initial"
              :animate="chatItemVariants.animate" :whileHover="chatItemVariants.whileHover"
              :transition="{ ...chatItemVariants.transition, delay: index * 0.04 }" class="block">
              <div @click="selectChat(chat)" :class="[
                'group relative rounded-xl border transition overflow-hidden cursor-pointer',
                currentChat && currentChat.id === chat.id
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-md'
                  : 'bg-white/80 border-gray-200 hover:border-blue-200 hover:bg-blue-50/40'
              ]">
                <div class="flex items-start p-3" :class="sidebarCollapsed ? 'justify-center' : ''">
                  <!-- 图标 -->
                  <div :class="[
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition',
                    currentChat && currentChat.id === chat.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-700'
                  ]">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>

                  <!-- 详情 -->
                  <div v-if="!sidebarCollapsed" class="flex-1 min-w-0 ml-3">
                    <!-- 编辑态 -->
                    <div v-if="editingChatId === chat.id" class="flex items-center gap-2">
                      <input v-model="editingTitle" @keydown.enter="saveEditChat" @keydown.escape="cancelEditChat"
                        @click.stop
                        class="flex-1 text-sm font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none pb-1"
                        autofocus>
                      <div class="flex gap-1">
                        <button @click.stop="saveEditChat" class="btn-icon success">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button @click.stop="cancelEditChat" class="btn-icon danger">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <!-- 普通态 -->
                    <div v-else class="space-y-1">
                      <div class="flex items-start justify-between gap-2">
                        <h3 :class="[
                          'text-sm font-semibold truncate',
                          currentChat && currentChat.id === chat.id ? 'text-blue-800' : 'text-gray-900'
                        ]">
                          {{ chat.title }}
                        </h3>
                        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button @click.stop="startEditChat(chat)" class="btn-icon">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button @click.stop="deleteChat(chat)" class="btn-icon danger">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <p v-if="chat.latest_message"
                        :class="['text-xs truncate', currentChat && currentChat.id === chat.id ? 'text-blue-700/80' : 'text-gray-500']">
                        {{ chat.latest_message }}
                      </p>

                      <div class="flex items-center justify-between">
                        <span
                          :class="['text-[11px]', currentChat && currentChat.id === chat.id ? 'text-blue-600' : 'text-gray-400']">
                          {{ formatTime(chat.updated_at) }}
                        </span>
                        <div v-if="currentChat && currentChat.id === chat.id" class="flex items-center gap-1">
                          <span class="inline-flex w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                          <span class="text-[11px] text-blue-700 font-medium">当前</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Motion>
          </div>
        </div>
      </Motion>

      <!-- 主区域 -->
      <div class="flex-1 flex flex-col bg-white/70 backdrop-blur min-w-0 h-full">
        <!-- 头部 -->
        <div class="px-6 py-4 border-b border-gray-100/80 bg-white/70 flex-shrink-0">
          <div v-if="currentChat" class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 class="text-base font-semibold text-gray-900">{{ currentChat.title }}</h2>
                <p class="text-xs text-gray-500">AI 助手 · 在线</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button @click="clearAllMessages"
                class="h-9 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-200 transition text-sm">
                清空对话
              </button>
            </div>
          </div>

          <div v-else class="flex items-center justify-between">
            <div class="flex items-center gap-3 text-gray-500">
              <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h2 class="text-base font-medium text-gray-700">选择一个对话开始聊天</h2>
                <p class="text-xs text-gray-500">或在左侧创建新对话</p>
              </div>
            </div>
            <button @click="createNewChat"
              class="h-9 px-3 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition">
              新建对话
            </button>
          </div>
        </div>

        <!-- 消息区 -->
        <div ref="messagesContainer"
          class="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50/60 to-white min-h-0 pb-4">
          <!-- 加载状态 -->
          <div v-if="loading && currentChat" class="flex flex-col items-center justify-center py-20 text-gray-500">
            <div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p class="text-sm font-medium">加载消息中...</p>
          </div>

          <!-- 空状态 -->
          <div v-else-if="!hasMessages && currentChat" class="flex items-center justify-center py-16">
            <div class="bg-white/90 rounded-3xl p-8 shadow-lg border border-gray-100 max-w-lg text-center">
              <div
                class="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center mb-6">
                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">开始新的对话</h3>
              <p class="text-sm text-gray-600 mb-6">选择一个话题开始聊天，或者直接输入您的问题</p>
              <div class="grid grid-cols-1 gap-3 text-left">
                <button
                  class="group w-full px-4 py-3 text-sm border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
                  @click="messageInput = '你好，请介绍一下自己'">
                  <div class="flex items-center gap-3">
                    <span class="text-lg">👋</span>
                    <span class="font-medium text-gray-700 group-hover:text-blue-700">打个招呼</span>
                  </div>
                </button>
                <button
                  class="group w-full px-4 py-3 text-sm border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
                  @click="messageInput = '你能帮我做什么？'">
                  <div class="flex items-center gap-3">
                    <span class="text-lg">🤔</span>
                    <span class="font-medium text-gray-700 group-hover:text-blue-700">了解功能</span>
                  </div>
                </button>
                <button
                  class="group w-full px-4 py-3 text-sm border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
                  @click="messageInput = '请给我一些建议'">
                  <div class="flex items-center gap-3">
                    <span class="text-lg">💡</span>
                    <span class="font-medium text-gray-700 group-hover:text-blue-700">获取建议</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- 消息列表 -->
          <div v-else class="space-y-6 max-w-4xl mx-auto">
            <!-- @vue-ignore -->
            <Motion v-for="(message, index) in messages" :key="message.id" :initial="messageVariants.initial"
              :animate="messageVariants.animate" :transition="{ ...messageVariants.transition, delay: index * 0.05 }"
              class="block">
              <div :class="['flex gap-4', { 'flex-row-reverse': message.role === 'user' }]">
                <!-- 头像 -->
                <div class="flex-shrink-0">
                  <div v-if="message.role === 'user'" class="w-10 h-10 rounded-full overflow-hidden shadow-lg">
                    <img :src="userAvatar" alt="用户头像" class="w-full h-full object-cover" />
                  </div>
                  <div v-else
                    class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <!-- 消息内容 -->
                <div :class="['flex-1 min-w-0', { 'flex justify-end': message.role === 'user' }]">
                  <div :class="['max-w-2xl']">
                    <div :class="['flex items-center gap-2 mb-2', { 'justify-end': message.role === 'user' }]">
                      <span class="text-xs font-semibold text-gray-700">{{ message.role === 'user' ? '您' : 'AI助手'
                      }}</span>
                      <span class="text-xs text-gray-400">{{ formatTime(message.created_at) }}</span>
                    </div>

                    <div :class="[
                      'inline-block px-5 py-3 rounded-2xl shadow-sm leading-relaxed border max-w-full break-words',
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-blue-200/50'
                        : 'bg-white text-gray-800 border-gray-200 shadow-gray-200/50'
                    ]" v-html="formatMessageContent(message.content)">
                    </div>
                  </div>
                </div>
              </div>
            </Motion>

            <!-- 发送中状态 -->
            <div v-if="sending" class="flex gap-4">
              <div class="flex-shrink-0">
                <div
                  class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="max-w-2xl">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-xs font-semibold text-gray-700">AI助手</span>
                    <span class="text-xs text-gray-400">正在输入...</span>
                  </div>
                  <div class="bg-white border border-gray-200 px-5 py-3 rounded-2xl shadow-sm flex items-center gap-3">
                    <div class="flex gap-1 items-center">
                      <span class="dot"></span>
                      <span class="dot" style="animation-delay:.12s"></span>
                      <span class="dot" style="animation-delay:.24s"></span>
                    </div>
                    <span class="text-sm text-gray-500">AI 正在思考中...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区 -->
        <div class="flex-shrink-0 p-6 border-t border-gray-100/80 bg-white/90 backdrop-blur relative">
          <!-- Emoji 选择器 -->
          <div v-if="showEmojiPicker"
            class="absolute bottom-full left-6 right-6 mb-2 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto z-50">
            <div class="p-4">
              <div v-for="category in emojiCategories" :key="category.name" class="mb-4 last:mb-0">
                <h4 class="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">{{ category.name }}</h4>
                <div class="grid grid-cols-8 gap-2">
                  <button v-for="emoji in category.emojis" :key="emoji.name" @click="insertEmoji(emoji)"
                    class="p-2 rounded-lg hover:bg-gray-100 text-xl transition-colors duration-150 hover:scale-110 transform">
                    {{ emoji.emoji }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 输入框容器 -->
          <div class="max-w-4xl mx-auto">
            <div
              class="rounded-2xl border border-gray-200 bg-white p-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-200 shadow-sm">
              <div class="flex items-end gap-3">
                <textarea v-model="messageInput" @keydown="handleKeydown"
                  placeholder="输入消息...按 Enter 发送，Shift + Enter 换行" rows="1"
                  class="flex-1 bg-transparent border-none outline-none resize-none text-base leading-relaxed max-h-32 min-h-[2.5rem] placeholder-gray-400" />
                <div class="flex items-center gap-2 flex-shrink-0">
                  <button @click="showEmojiPicker = !showEmojiPicker"
                    class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                    title="表情">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button @click="sendMessage" :disabled="!messageInput.trim() || !currentChat || sending"
                    class="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl hover:scale-105 transform">
                    <div v-if="sending"
                      class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Motion>
  </div>
</template>

<style scoped>
/* 公用小按钮 */
.btn-icon {
  padding: 0.375rem;
  border-radius: 0.5rem;
  color: #9ca3af;
  transition: all 0.15s ease-in-out;
}

.btn-icon:hover {
  color: #374151;
  background-color: #f3f4f6;
}

.btn-icon.danger:hover {
  color: #dc2626;
  background-color: #fef2f2;
}

.btn-icon.success:hover {
  color: #059669;
  background-color: #f0fdf4;
}

/* 发送按钮与图标按钮 */
.icon-btn {
  padding: 0.5rem;
  border-radius: 0.75rem;
  color: #4b5563;
  transition: all 0.15s ease-in-out;
}

.icon-btn:hover {
  color: #111827;
  background-color: #f3f4f6;
}

.send-btn {
  padding: 0.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(to right, #2563eb, #4f46e5);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.15s ease-in-out;
}

.send-btn:hover {
  background: linear-gradient(to right, #1d4ed8, #4338ca);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 输入中三点动画 */
.dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: rgb(156 163 175);
  display: inline-block;
  animation: bounce .9s infinite ease-in-out;
}

@keyframes bounce {

  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: .6;
  }

  40% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

/* 滚动条 */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 9999px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Think标签样式 - GPT风格 */
.message-bubble .think-block {
  margin: 16px 0 !important;
  padding: 0 !important;
  background: #f7f7f8 !important;
  border: 1px solid #d1d5db !important;
  border-radius: 8px !important;
  overflow: hidden !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

.message-bubble .think-header {
  font-size: 13px !important;
  font-weight: 600 !important;
  color: #374151 !important;
  margin: 0 !important;
  padding: 12px 16px !important;
  background: #f7f7f8 !important;
  border-bottom: 1px solid #e5e7eb !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

.message-bubble .think-header::before {
  content: '🤔' !important;
  font-size: 14px !important;
}

.message-bubble .think-content {
  font-size: 13px !important;
  line-height: 1.5 !important;
  color: #4b5563 !important;
  white-space: pre-wrap !important;
  padding: 16px !important;
  background: #ffffff !important;
  margin: 0 !important;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace !important;
  border-top: 1px solid #f3f4f6 !important;
}
</style>