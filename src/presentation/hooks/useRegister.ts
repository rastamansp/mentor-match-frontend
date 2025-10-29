import { useState, useCallback } from 'react'
import { RegisterDto } from '../../application/dto/RegisterDto'
import { container } from '../../shared/di/container'
import { ILogger } from '../../infrastructure/logging/ILogger'
import { ValidationError } from '../../domain/errors/DomainError'
import { useAuth as useAuthContext } from '../../contexts/AuthContext'

interface UseRegisterResult {
  register: (data: RegisterDto) => Promise<{ success: boolean; hasToken: boolean }>
  loading: boolean
  error: string | null
}

export const useRegister = (): UseRegisterResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register: contextRegister } = useAuthContext()
  const logger: ILogger = container.logger

  const register = useCallback(async (data: RegisterDto): Promise<{ success: boolean; hasToken: boolean }> => {
    setLoading(true)
    setError(null)
    
    try {
      logger.info('useRegister: Starting registration process', { email: data.email })
      
      const response = await container.registerUseCase.execute(data)
      
      // Verificar se há token para login automático
      const hasToken = !!response.token
      
      if (hasToken) {
        // Usar o register do contexto que já atualiza o estado global
        await contextRegister(data)
        logger.info('useRegister: Registration successful with automatic login', { userId: response.user.id })
      } else {
        logger.info('useRegister: Registration successful without token - user needs to login', { userId: response.user.id })
      }
      
      return { success: true, hasToken }
    } catch (err) {
      let errorMessage = 'Erro ao criar conta'
      
      if (err instanceof ValidationError) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      logger.error('useRegister: Registration failed', err as Error, { email: data.email })
      return { success: false, hasToken: false }
    } finally {
      setLoading(false)
    }
  }, [logger, contextRegister])

  return {
    register,
    loading,
    error,
  }
}
