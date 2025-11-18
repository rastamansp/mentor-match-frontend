import { IAuthRepository, LoginCredentials } from '@domain/repositories/IAuthRepository';
import { User } from '@domain/entities/User.entity';
import { ValidationError } from '@domain/errors/ValidationError';
import { ILogger } from '../logging/Logger';

export class AuthRepository implements IAuthRepository {
  constructor(private readonly logger: ILogger) {}

  async login(credentials: LoginCredentials): Promise<User> {
    this.logger.debug('Attempting login', { email: credentials.email });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simple validation: user = "user" and password = "senha"
    if (credentials.email === 'user' && credentials.password === 'senha') {
      const user: User = {
        id: '1',
        name: 'Usuário Teste',
        email: 'user@example.com',
        role: 'USER',
      };

      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      this.logger.info('User logged in', { userId: user.id });

      return user;
    }

    throw new ValidationError('Credenciais inválidas. Use email: "user" e senha: "senha"');
  }

  async logout(): Promise<void> {
    this.logger.debug('Logging out');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    localStorage.removeItem('user');
    this.logger.info('User logged out');
  }

  async getCurrentUser(): Promise<User | null> {
    this.logger.debug('Getting current user');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
      return null;
    }

    try {
      const user = JSON.parse(userStr) as User;
      return user;
    } catch (error) {
      this.logger.error('Error parsing user from localStorage', error);
      return null;
    }
  }
}

