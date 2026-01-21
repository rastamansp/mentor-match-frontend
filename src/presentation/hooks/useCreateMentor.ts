import { useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@shared/di/container';
import { CreateMentorDto } from '@application/dto/CreateMentorDto';
import { Mentor } from '@domain/entities/Mentor.entity';

export const useCreateMentor = () => {
  const queryClient = useQueryClient();

  return useMutation<Mentor, Error, CreateMentorDto>({
    mutationFn: (dto) => {
      return container.createMentorUseCase.execute(dto);
    },
    onSuccess: () => {
      // Invalida queries relacionadas aos mentores
      queryClient.invalidateQueries({ queryKey: ['mentors'] });
    },
  });
};
