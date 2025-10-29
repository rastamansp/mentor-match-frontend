import { ChatMessage, SendMessageRequest, SendMessageResponse } from '../../application/dto/ChatMessageDto'

export interface IChatRepository {
  sendMessage(data: SendMessageRequest): Promise<SendMessageResponse>
}

