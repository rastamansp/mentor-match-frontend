import { useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@shared/di/container';
import { UpdateMentorDto } from '@application/dto/UpdateMentorDto';
import { Mentor } from '@domain/entities/Mentor.entity';

export const useUpdateMentor = () => {
  const queryClient = useQueryClient();

  return useMutation<Mentor, Error, { id: string; dto: UpdateMentorDto }>({
    mutationFn: ({ id, dto }) => {
      return container.updateMentorUseCase.execute(id, dto);
    },
    onSuccess: (data, variables) => {
      // Invalida queries relacionadas ao mentor
      queryClient.invalidateQueries({ queryKey: ['mentor', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['mentors'] });
    },
  });
};
