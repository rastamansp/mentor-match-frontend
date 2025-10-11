import { IAuthRepository } from '../../../domain/repositories/IAuthRepository'
import { LoginDto, LoginDtoSchema } from '../../dto/LoginDto'
import { ValidationError, UnauthorizedError } from '../../../domain/errors/DomainError'
import { ILogger } from '../../../infrastructure/logging/ILogger'
import { z } from 'zod'

export class LoginUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly logger: ILogger
  ) {}

  async execute(data: LoginDto): Promise<{ user: any; token: string }> {
    try {
      this.logger.info('LoginUseCase: Validating input', { email: data.email })
      
      // Validação com Zod
      const validatedData = LoginDtoSchema.parse(data)
      
      this.logger.info('LoginUseCase: Attempting login')
      
      const response = await this.authRepository.login(validatedData.email, validatedData.password)
      
      this.logger.info('LoginUseCase: Login successful', {
        userId: response.user.id,
        email: response.user.email
      })
      
      return response
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.logger.warn('LoginUseCase: Validation failed', { errors: error.issues })
        throw new ValidationError('Dados de login inválidos')
      }
      
      this.logger.error('LoginUseCase: Login failed', error as Error, { email: data.email })
      throw new UnauthorizedError('Credenciais inválidas')
    }
  }
}
