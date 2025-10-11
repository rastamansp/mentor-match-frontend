import { IAuthRepository } from '../../../domain/repositories/IAuthRepository'
import { RegisterDto, RegisterDtoSchema } from '../../dto/RegisterDto'
import { ValidationError } from '../../../domain/errors/DomainError'
import { ILogger } from '../../../infrastructure/logging/ILogger'
import { z } from 'zod'

export class RegisterUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly logger: ILogger
  ) {}

  async execute(data: RegisterDto): Promise<{ user: any; token: string }> {
    try {
      this.logger.info('RegisterUseCase: Validating input', { email: data.email })
      
      // Validação com Zod
      const validatedData = RegisterDtoSchema.parse(data)
      
      this.logger.info('RegisterUseCase: Creating user')
      
      const response = await this.authRepository.register(validatedData)
      
      this.logger.info('RegisterUseCase: User created successfully', {
        userId: response.user.id,
        email: response.user.email
      })
      
      return response
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.logger.warn('RegisterUseCase: Validation failed', { errors: error.issues })
        throw new ValidationError('Dados de registro inválidos')
      }
      
      this.logger.error('RegisterUseCase: Registration failed', error as Error, { email: data.email })
      throw error
    }
  }
}
