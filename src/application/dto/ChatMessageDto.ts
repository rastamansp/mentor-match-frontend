import { z } from 'zod'

export const ChatMessageSchema = z.object({
  content: z.string().min(1, 'Mensagem não pode estar vazia').max(1000, 'Mensagem muito longa'),
  timestamp: z.date(),
  sender: z.enum(['user', 'bot']),
  id: z.string().uuid().optional(),
})

export type ChatMessage = z.infer<typeof ChatMessageSchema>

export interface SendMessageRequest {
  message: string
}

export interface ToolUsed {
  name: string
  arguments: Record<string, unknown>
}

export interface SendMessageResponse {
  answer: string
  toolsUsed?: ToolUsed[]
}

