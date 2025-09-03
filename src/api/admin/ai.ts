import serviceAxios from '@/http'
import type {
  AiChatListRequest,
  AiChatListResponse,
  AiChatCreateRequest,
  AiChatCreateResponse,
  AiChatDetailResponse,
  AiChatUpdateRequest,
  AiChatUpdateResponse,
  AiMessageSendRequest,
  AiMessageSendResponse,
  AiChatDeleteRequest,
  AiChatDeleteResponse
} from '@/types/factory'

// 获取AI聊天列表
export const getAiChats = (params: AiChatListRequest): Promise<AiChatListResponse> => {
  return serviceAxios.get('/hzadmin/ai/chats/', { params })
}

// 创建AI聊天
export const createAiChat = (data: AiChatCreateRequest): Promise<AiChatCreateResponse> => {
  return serviceAxios.post('/hzadmin/ai/chats/create/', data)
}

// 获取AI聊天详情
export const getAiChatDetail = (chatId: number): Promise<AiChatDetailResponse> => {
  return serviceAxios.get(`/hzadmin/ai/chats/${chatId}/`)
}

// 更新AI聊天
export const updateAiChat = (chatId: number, data: AiChatUpdateRequest): Promise<AiChatUpdateResponse> => {
  return serviceAxios.put(`/hzadmin/ai/chats/${chatId}/update/`, data)
}

// 发送AI消息
export const sendAiMessage = (data: AiMessageSendRequest): Promise<AiMessageSendResponse> => {
  return serviceAxios.post(`/hzadmin/ai/chats/${data.chat_id}/message/`, {
    chat_id: data.chat_id,
    content: data.content
  })
}

// 删除AI聊天
export const deleteAiChats = (data: AiChatDeleteRequest): Promise<AiChatDeleteResponse> => {
  return serviceAxios.post('/hzadmin/ai/chats/delete/', data)
}