import { useState, useCallback } from 'react'
import { User } from '../../domain/entities/User.entity'
import { container } from '../../shared/di/container'
import { LoginDto } from '../../application/dto/LoginDto'
import { RegisterDto } from '../../application/dto/RegisterDto'

interface UseAuthResult {
  user: User | null
  loading: boolean
  error: Error | null
  login: (data: LoginDto) => Promise<void>
  register: (data: RegisterDto) => Promise<void>
  logout: () => void
}

export const useAuth = (): UseAuthResult => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const login = useCallback(async (data: LoginDto) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await container.loginUseCase.execute(data)
      
      // Armazenar token e usuário
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      setUser(response.user)
      
      container.logger.info('useAuth: Login successful', { userId: response.user.id })
    } catch (err) {
      setError(err as Error)
      container.logger.error('useAuth: Login failed', err as Error, { email: data.email })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (data: RegisterDto) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await container.registerUseCase.execute(data)
      
      // Armazenar token e usuário
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      setUser(response.user)
      
      container.logger.info('useAuth: Registration successful', { userId: response.user.id })
    } catch (err) {
      setError(err as Error)
      container.logger.error('useAuth: Registration failed', err as Error, { email: data.email })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    container.logger.info('useAuth: Logout successful')
  }, [])

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
  }
}
