import { IAuthRepository, LoginResponse, RegisterResponse, RegisterData } from '../../domain/repositories/IAuthRepository'
import { NetworkError, UnauthorizedError } from '../../domain/errors/DomainError'
import axios, { AxiosInstance } from 'axios'

export class AuthRepository implements IAuthRepository {
  constructor(private readonly httpClient: AxiosInstance) {}

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await this.httpClient.post('/auth/login', { email, password })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new UnauthorizedError('Credenciais inválidas')
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to login: ${error.message}`, error)
      }
      throw error
    }
  }

  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await this.httpClient.post('/auth/register', data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to register: ${error.message}`, error)
      }
      throw error
    }
  }

  async getProfile(): Promise<any> {
    try {
      const response = await this.httpClient.get('/auth/profile')
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new UnauthorizedError('Token inválido ou expirado')
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to get profile: ${error.message}`, error)
      }
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      await this.httpClient.post('/auth/logout')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to logout: ${error.message}`, error)
      }
      throw error
    }
  }
}
