import { z } from 'zod';

export const ChatMessageDtoSchema = z.object({
  message: z.string().min(1, 'Mensagem é obrigatória'),
  userCtx: z.object({
    userId: z.string().min(1, 'UserId é obrigatório'),
    language: z.string().default('pt-BR'),
  }),
});

export type ChatMessageDto = z.infer<typeof ChatMessageDtoSchema>;

