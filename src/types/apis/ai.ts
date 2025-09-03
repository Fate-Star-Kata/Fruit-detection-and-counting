// AI聊天相关类型定义

// AI聊天消息类型
export interface AiMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

// AI聊天会话类型
export interface AiChat {
  id: number
  title: string
  created_at: string
  updated_at: string
  latest_message?: string
}

// AI聊天列表请求参数
export interface AiChatListRequest {
  query?: string
  page?: number
  page_size?: number
}

// AI聊天列表响应
export interface AiChatListResponse {
  code: number
  msg: string
  data: {
    total: number
    page: number
    page_size: number
    chats: AiChat[]
  }
}

// 创建AI聊天请求
export interface AiChatCreateRequest {
  title: string
}

// 创建AI聊天响应
export interface AiChatCreateResponse {
  code: number
  msg: string
  data: {
    chat_id: number
    title: string
  }
}

// AI聊天详情响应
export interface AiChatDetailResponse {
  code: number
  msg: string
  data: {
    chat_id: number
    title: string
    created_at: string
    messages: AiMessage[]
  }
}

// 更新AI聊天请求
export interface AiChatUpdateRequest {
  title: string
}

// 发送AI消息请求
export interface AiMessageSendRequest {
  chat_id: number|string
  content: string
}

// 发送AI消息响应
export interface AiMessageSendResponse {
  code: number
  msg: string
  data: {
    user_message: AiMessage
    ai_message: AiMessage
  }
}

// 删除AI聊天请求
export interface AiChatDeleteRequest {
  chat_ids: number[]
}

// 更新AI聊天响应
export interface AiChatUpdateResponse {
  code: number
  msg: string
  data: null
}

// 删除AI聊天响应
export interface AiChatDeleteResponse {
  code: number
  msg: string
  data: null
}

// AI聊天状态
export interface AiChatState {
  chats: AiChat[]
  currentChat: AiChat | null
  messages: AiMessage[]
  loading: boolean
  sending: boolean
  total: number
  page: number
  pageSize: number
  searchQuery: string
}

// Emoji相关类型
export interface Emoji {
  emoji: string
  name: string
  category: string
}

export interface EmojiCategory {
  name: string
  emojis: Emoji[]
}