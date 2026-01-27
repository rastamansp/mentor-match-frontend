import { useMutation } from '@tanstack/react-query';
import { container } from '@shared/di/container';

export const useSendSessionSummaryByWhatsApp = (sessionId: string) => {
  return useMutation<{ success: boolean; message: string }, Error, void>({
    mutationFn: async () => {
      return container.sendSessionSummaryByWhatsAppUseCase.execute(sessionId);
    },
  });
};
