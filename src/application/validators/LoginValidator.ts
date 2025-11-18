import { z } from 'zod';
import { LoginDto } from '../dto/LoginDto';

export const LoginSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export function validateLogin(data: unknown): LoginDto {
  return LoginSchema.parse(data);
}

