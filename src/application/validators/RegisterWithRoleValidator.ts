import { z } from 'zod';
import { RegisterWithRoleDto } from '../dto/RegisterWithRoleDto';

export const RegisterWithRoleSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(100, 'Senha deve ter no máximo 100 caracteres'),
  phone: z.string().min(10, 'Telefone deve ter no mínimo 10 dígitos').max(11, 'Telefone deve ter no máximo 11 dígitos').regex(/^\d+$/, 'Telefone deve conter apenas números'),
  whatsappNumber: z.string().min(10, 'WhatsApp deve ter no mínimo 10 dígitos').max(13, 'WhatsApp deve ter no máximo 13 dígitos (com código do país)').regex(/^\d+$/, 'WhatsApp deve conter apenas números'),
});

export function validateRegisterWithRole(data: unknown): RegisterWithRoleDto {
  return RegisterWithRoleSchema.parse(data);
}
