import { useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@shared/di/container';
import { UserMentor } from '@domain/entities/UserMentor.entity';
import { AssociateMentorDto } from '@application/dto/AssociateMentorDto';

export const useAssociateMentor = () => {
  const queryClient = useQueryClient();

  return useMutation<UserMentor, Error, { userId: string; dto: AssociateMentorDto }>({
    mutationFn: ({ userId, dto }) => {
      return container.associateMentorUseCase.execute(userId, dto);
    },
    onSuccess: (_, variables) => {
      // Invalida o cache de mentores do usuário
      queryClient.invalidateQueries({ queryKey: ['userMentors', variables.userId] });
    },
  });
};
