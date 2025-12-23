import { z } from 'zod';

export const ChatMessageDtoSchema = z.object({
  message: z.string().min(1, 'Mensagem é obrigatória'),
  userCtx: z.object({
    userId: z.string().min(1, 'UserId é obrigatório'),
    language: z.string().default('pt-BR').optional(),
    mentorId: z.string().uuid().optional(),
    planId: z.string().uuid().optional(),
    sessionId: z.string().uuid().optional(),
  }).passthrough().optional(), // .passthrough() permite campos adicionais
  phoneNumber: z.string().optional(), // Número de telefone para criar/buscar conversa
  sessionId: z.string().uuid().optional(), // ID da sessão para manter histórico
});

export type ChatMessageDto = z.infer<typeof ChatMessageDtoSchema>;

