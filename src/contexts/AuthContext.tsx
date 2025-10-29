import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../domain/entities/User.entity'
import { RegisterDto } from '../application/dto/RegisterDto'
import { container } from '../shared/di/container'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterDto) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
        // Verificar se o token ainda é válido
        container.authRepository.getProfile().catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        })
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await container.loginUseCase.execute({ email, password })
      
      console.log('🔐 AuthContext.login - Resposta:', response)
      console.log('🔐 Token:', response.token)
      console.log('🔐 User:', response.user)
      
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      setUser(response.user)
      
      console.log('✅ AuthContext.login - Token salvo no localStorage')
    } catch (error) {
      console.error('❌ AuthContext.login - Erro:', error)
      throw error
    }
  }

  const register = async (userData: RegisterDto) => {
    try {
      const response = await container.registerUseCase.execute(userData)
      
      // Apenas salvar token se existir
      if (response.token) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        setUser(response.user)
      }
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
