import { useState, useCallback } from 'react'
import { LoginDto } from '../../application/dto/LoginDto'
import { container } from '../../shared/di/container'
import { ILogger } from '../../infrastructure/logging/ILogger'
import { ValidationError, UnauthorizedError } from '../../domain/errors/DomainError'

interface UseLoginResult {
  login: (data: LoginDto) => Promise<void>
  loading: boolean
  error: string | null
}

export const useLogin = (): UseLoginResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const logger: ILogger = container.logger

  const login = useCallback(async (data: LoginDto): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      logger.info('useLogin: Starting login process', { email: data.email })
      
      const response = await container.loginUseCase.execute(data)
      
      // Armazenar token e dados do usuário
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      logger.info('useLogin: Login successful', { userId: response.user.id })
    } catch (err) {
      let errorMessage = 'Erro ao fazer login'
      
      if (err instanceof ValidationError) {
        errorMessage = err.message
      } else if (err instanceof UnauthorizedError) {
        errorMessage = 'Credenciais inválidas'
      }
      
      setError(errorMessage)
      logger.error('useLogin: Login failed', err as Error, { email: data.email })
      throw err
    } finally {
      setLoading(false)
    }
  }, [logger])

  return {
    login,
    loading,
    error,
  }
}
