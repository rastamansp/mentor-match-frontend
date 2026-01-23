import { useQuery } from '@tanstack/react-query';
import { container } from '@shared/di/container';
import { SessionSummaryDto } from '@application/dto/SessionSummaryDto';

export const useSessionSummary = (meetingUuid: string | undefined) => {
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');

  return useQuery<SessionSummaryDto>({
    queryKey: ['session', 'summary', meetingUuid],
    queryFn: () => {
      if (!meetingUuid) {
        throw new Error('UUID da reunião não fornecido');
      }
      if (!hasToken) {
        throw new Error('Token não encontrado. Por favor, faça login novamente.');
      }
      return container.getSessionSummaryUseCase.execute(meetingUuid);
    },
    enabled: !!meetingUuid && hasToken,
    retry: false,
  });
};
