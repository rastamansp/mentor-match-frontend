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
  toolsUsed: Array<{
    name: string;
    arguments?: Record<string, unknown>;
  }>;
  formattedResponse: {
    answer: string;
    data: {
      type: string;
      rawData: ChatMentor[] | null;
      suggestions?: string[];
    };
  };
}

export class SendChatMessageUseCase {
  private readonly apiUrl: string;

  constructor(private readonly logger: ILogger) {
    this.apiUrl = import.meta.env.VITE_CHAT_API_URL || 'http://localhost:3005/api/chat';
  }

  async execute(dto: ChatMessageDto): Promise<ChatResponse> {
    this.logger.debug('Sending chat message', { message: dto.message, userId: dto.userCtx.userId });

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Chat API error', new Error(`HTTP ${response.status}: ${errorText}`));
        throw new Error(`Erro ao enviar mensagem: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.logger.info('Chat message sent successfully', { userId: dto.userCtx.userId });

      return data;
    } catch (error) {
      this.logger.error('Failed to send chat message', error as Error);
      throw error;
    }
  }
}

