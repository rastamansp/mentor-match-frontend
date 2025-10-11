import { useState, useCallback } from 'react'
import { RegisterDto } from '../../application/dto/RegisterDto'
import { container } from '../../shared/di/container'
import { ILogger } from '../../infrastructure/logging/ILogger'
import { ValidationError } from '../../domain/errors/DomainError'

interface UseRegisterResult {
  register: (data: RegisterDto) => Promise<void>
  loading: boolean
  error: string | null
}

export const useRegister = (): UseRegisterResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const logger: ILogger = container.logger

  const register = useCallback(async (data: RegisterDto): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      logger.info('useRegister: Starting registration process', { email: data.email })
      
      const response = await container.registerUseCase.execute(data)
      
      // Armazenar token e dados do usuário
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      logger.info('useRegister: Registration successful', { userId: response.user.id })
    } catch (err) {
      let errorMessage = 'Erro ao criar conta'
      
      if (err instanceof ValidationError) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      logger.error('useRegister: Registration failed', err as Error, { email: data.email })
      throw err
    } finally {
      setLoading(false)
    }
  }, [logger])

  return {
    register,
    loading,
    error,
  }
}
