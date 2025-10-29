import { useState, useCallback } from 'react'
import { LoginDto } from '../../application/dto/LoginDto'
import { container } from '../../shared/di/container'
import { ILogger } from '../../infrastructure/logging/ILogger'
import { ValidationError, UnauthorizedError } from '../../domain/errors/DomainError'
import { useAuth as useAuthContext } from '../../contexts/AuthContext'

interface UseLoginResult {
  login: (data: LoginDto) => Promise<void>
  loading: boolean
  error: string | null
}

export const useLogin = (): UseLoginResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login: contextLogin } = useAuthContext()
  const logger: ILogger = container.logger

  const login = useCallback(async (data: LoginDto): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      logger.info('useLogin: Starting login process', { email: data.email })
      
      // Usar o login do contexto que já atualiza o estado global
      await contextLogin(data.email, data.password)
      
      logger.info('useLogin: Login successful')
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
  }, [logger, contextLogin])

  return {
    login,
    loading,
    error,
  }
}
