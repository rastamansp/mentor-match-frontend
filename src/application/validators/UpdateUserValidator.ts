import { z } from 'zod';
import { UpdateUserDto } from '../dto/UpdateUserDto';

export const UpdateUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  phone: z.string().min(10, 'Telefone deve ter no mínimo 10 dígitos').max(11, 'Telefone deve ter no máximo 11 dígitos').regex(/^\d+$/, 'Telefone deve conter apenas números'),
  role: z.enum(['USER', 'ADMIN', 'MENTOR']).optional(),
});

export function validateUpdateUser(data: unknown): UpdateUserDto {
  return UpdateUserSchema.parse(data);
}
