import { User } from '../entities/User.entity'

export interface IAuthRepository {
  login(email: string, password: string): Promise<LoginResponse>
  register(data: RegisterData): Promise<RegisterResponse>
  getProfile(): Promise<User>
  logout(): Promise<void>
}

export interface LoginResponse {
  user: User
  token: string
}

export interface RegisterResponse {
  user: User
  token: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
}
