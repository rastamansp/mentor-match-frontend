import { useQuery } from '@tanstack/react-query';
import { container } from '@shared/di/container';
import { SessionTranscriptDto } from '@application/dto/SessionTranscriptDto';

export const useSessionTranscript = (
  sessionId: string | undefined,
  meetingId: string | undefined,
  enabled: boolean = true
) => {
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');

  return useQuery<SessionTranscriptDto>({
    queryKey: ['session', 'transcript', sessionId, meetingId],
    queryFn: () => {
      if (!sessionId) {
        throw new Error('ID da sessão não fornecido');
      }
      if (!meetingId) {
        throw new Error('ID da reunião não fornecido');
      }
      if (!hasToken) {
        throw new Error('Token não encontrado. Por favor, faça login novamente.');
      }
      return container.getSessionTranscriptUseCase.execute(sessionId, meetingId);
    },
    enabled: enabled && !!sessionId && !!meetingId && hasToken,
    retry: false,
  });
};
