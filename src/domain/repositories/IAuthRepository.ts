import { User } from '../entities/User.entity';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface RegisterWithRoleCredentials {
  name: string;
  email: string;
  password: string;
  phone: string;
  whatsappNumber: string;
}

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<User>;
  register(credentials: RegisterCredentials): Promise<User>;
  registerWithRole(credentials: RegisterWithRoleCredentials): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  getProfile(): Promise<User>;
}

