import { AxiosInstance } from 'axios'
import { IChatRepository } from '../../domain/repositories/IChatRepository'
import { SendMessageRequest, SendMessageResponse } from '../../application/dto/ChatMessageDto'
import { NetworkError } from '../../domain/errors/DomainError'
import axios from 'axios'

export class ChatRepository implements IChatRepository {
  constructor(private readonly httpClient: AxiosInstance) {}

  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      console.log('💬 ChatRepository.sendMessage - Enviando mensagem:', data)
      const response = await this.httpClient.post('/chat', data)
      console.log('✅ ChatRepository.sendMessage - Resposta recebida:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ ChatRepository.sendMessage - Erro:', error)
      if (axios.isAxiosError(error)) {
        console.error('❌ Status:', error.response?.status)
        console.error('❌ Data:', error.response?.data)
        throw new NetworkError(`Failed to send message: ${error.message}`, error)
      }
      throw error
    }
  }
}

