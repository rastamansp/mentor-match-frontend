import { useState, useCallback } from 'react'
import { ChatMessage } from '../../application/dto/ChatMessageDto'
import { container } from '../../shared/di/container'
import { ILogger } from '../../infrastructure/logging/ILogger'

interface UseChatResult {
  messages: ChatMessage[]
  sendMessage: (content: string) => Promise<void>
  isLoading: boolean
  isTyping: boolean
  error: string | null
}

export const useChat = (): UseChatResult => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const logger: ILogger = container.logger

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    const userMessage: ChatMessage = {
      content: content.trim(),
      timestamp: new Date(),
      sender: 'user'
    }

    // Adicionar mensagem do usuário imediatamente
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)
    setIsTyping(true)

    try {
      logger.info('useChat: Sending message', { content })
      
      // Enviar para o backend
      const response = await container.chatRepository.sendMessage({ message: content.trim() })
      
      // Simular delay de resposta do bot (2-3 segundos)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const botMessage: ChatMessage = {
        content: response.answer,
        timestamp: new Date(),
        sender: 'bot'
      }

      setMessages(prev => [...prev, botMessage])
      
      logger.info('useChat: Message received from bot', { answer: response.answer })
      
      if (response.toolsUsed && response.toolsUsed.length > 0) {
        logger.info('useChat: Tools used by bot', { tools: response.toolsUsed })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar mensagem'
      setError(errorMessage)
      logger.error('useChat: Error sending message', err as Error, { content })
      
      // Adicionar mensagem de erro do bot
      const errorBotMessage: ChatMessage = {
        content: 'Desculpe, não consegui processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date(),
        sender: 'bot'
      }
      setMessages(prev => [...prev, errorBotMessage])
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }, [logger])

  return {
    messages,
    sendMessage,
    isLoading,
    isTyping,
    error,
  }
}

