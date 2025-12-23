import { ChatMessageDto } from '@application/dto/ChatMessageDto';
import { ILogger } from '@infrastructure/logging/Logger';

export interface ChatMentor {
  id: string;
  name: string;
  email: string;
  role: string | null;
  company: string | null;
  phone: string | null;
  whatsappNumber?: string | null;
  bio: string | null;
  avatar: string | null;
  areas: string[] | null;
  specialty: string | null;
  languages: string[];
  pricePerHour: number;
  status: string;
  rating: number | null;
  reviews: number;
  totalSessions: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatResponse {
  answer: string;
  sessionId?: string; // ID da sessão retornado pela API
  toolsUsed: Array<{
    name: string;
    arguments?: Record<string, unknown>;
  }>;
  formattedResponse: {
    answer: string;
    message_type?: string;
    data: {
      type: string;
      rawData: ChatMentor[] | Record<string, unknown> | null;
      suggestions?: string[];
    };
  };
}

export class SendChatMessageUseCase {
  private readonly apiUrl: string;

  constructor(private readonly logger: ILogger) {
    this.apiUrl = import.meta.env.VITE_CHAT_API_URL || 'http://localhost:3005/api/chat';
  }

  async execute(dto: ChatMessageDto | { message: string }, token?: string): Promise<ChatResponse> {
    const message = dto.message;
    const userId = 'userCtx' in dto ? dto.userCtx?.userId : 'anonymous';
    
    this.logger.debug('Sending chat message', { message, userId, hasToken: !!token });

    try {
      // Se for apenas uma mensagem simples, envia apenas o message
      const requestBody = 'userCtx' in dto ? dto : { message: dto.message };
      
      // Prepara headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      };
      
      // Adiciona token de autenticação se fornecido
      if (token) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Chat API error', new Error(`HTTP ${response.status}: ${errorText}`));
        throw new Error(`Erro ao enviar mensagem: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.logger.info('Chat message sent successfully', { userId });

      return data;
    } catch (error) {
      this.logger.error('Failed to send chat message', error as Error);
      throw error;
    }
  }
}

