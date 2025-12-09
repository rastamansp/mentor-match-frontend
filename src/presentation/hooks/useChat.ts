import { useMutation } from '@tanstack/react-query';
import { SendChatMessageUseCase, ChatResponse } from '@application/use-cases/chat/SendChatMessage.usecase';
import { ChatMessageDto } from '@application/dto/ChatMessageDto';
import { container } from '@shared/di/container';
import { toast } from 'sonner';

const sendChatMessageUseCase = new SendChatMessageUseCase(container.logger);

export const useChat = () => {
  const mutation = useMutation<ChatResponse, Error, ChatMessageDto | { message: string }>({
    mutationFn: async (dto: ChatMessageDto | { message: string }) => {
      return await sendChatMessageUseCase.execute(dto);
    },
    onError: (error) => {
      toast.error('Erro ao enviar mensagem', {
        description: error.message || 'Tente novamente mais tarde',
      });
    },
  });

  return {
    sendMessage: mutation.mutate,
    sendMessageAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
};

