import { IAuthRepository, LoginCredentials, RegisterCredentials } from '@domain/repositories/IAuthRepository';
import { User, UserSchema } from '@domain/entities/User.entity';
import { ValidationError } from '@domain/errors/ValidationError';
import { ILogger } from '../logging/Logger';

interface ApiLoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN' | 'MENTOR';
  };
  token?: string;
  access_token?: string; // API pode retornar access_token
}

interface DirectUserResponse {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MENTOR';
  token?: string;
  access_token?: string; // API pode retornar access_token
}

export class AuthRepository implements IAuthRepository {
  private readonly apiUrl: string;

  constructor(private readonly logger: ILogger) {
    // Prioriza VITE_AUTH_API_URL se configurada, senão usa VITE_API_URL
    const authApiUrl = import.meta.env.VITE_AUTH_API_URL;
    const baseApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';
    
    if (authApiUrl) {
      // Se VITE_AUTH_API_URL estiver configurada, usa ela diretamente
      this.apiUrl = authApiUrl.replace(/\/api$/, '');
    } else {
      // Remove /api se já estiver presente, pois vamos construir o path completo
      this.apiUrl = baseApiUrl.replace(/\/api$/, '');
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    this.logger.debug('Attempting login', { email: credentials.email });

    try {
      // Tenta vários endpoints possíveis, incluindo localhost:8080 diretamente
      const endpoints = [
        `${this.apiUrl}/api/auth/login`,
        `${this.apiUrl}/api/login`,
        `${this.apiUrl}/auth/login`,
        `${this.apiUrl}/login`,
        // Fallback direto para localhost:8080 se a API estiver em outra porta
        'http://localhost:8080/api/auth/login',
        'http://localhost:8080/api/login',
        'http://localhost:8080/auth/login',
        'http://localhost:8080/login',
      ];

      let lastError: Error | null = null;

      for (const url of endpoints) {
        try {
          this.logger.debug('Trying login endpoint', { url });

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            this.logger.debug('Login endpoint failed', { 
              url, 
              status: response.status, 
              error: errorText 
            });
            
            if (response.status === 401 || response.status === 403) {
              // Se for 401/403, não tenta outros endpoints - credenciais inválidas
              lastError = new ValidationError('Credenciais inválidas');
              break; // Para o loop, não tenta mais endpoints
            }
            
            // Se não for 401/403, tenta o próximo endpoint
            lastError = new Error(`HTTP ${response.status}: ${errorText}`);
            continue;
          }

          const data: ApiLoginResponse | DirectUserResponse = await response.json();
          
          // Verifica se o token está no header Authorization
          const authHeader = response.headers.get('Authorization');
          let token: string | undefined = undefined;
          
          if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
            this.logger.debug('Token found in Authorization header');
          } else {
            // Tenta obter do body da resposta - verifica tanto 'token' quanto 'access_token'
            // A API pode retornar { access_token: "...", user: {...} } ou { token: "...", user: {...} }
            if ('access_token' in data && data.access_token) {
              token = data.access_token;
              this.logger.debug('Token found as access_token in response body');
            } else if ('token' in data && data.token) {
              token = data.token;
              this.logger.debug('Token found as token in response body');
            } else {
              this.logger.warn('No token found in response body', { 
                dataKeys: Object.keys(data),
                hasAccessToken: 'access_token' in data,
                hasTokenField: 'token' in data 
              });
            }
          }
          
          // Mapeia a resposta da API para o formato User
          // A API pode retornar { user: {...}, token: "..." } ou diretamente { id, name, email, role, token: "..." }
          const userData = 'user' in data ? data.user : data;
          
          const user: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
          };

          // Valida com Zod
          const validatedUser = UserSchema.parse(user);

          // Armazena token se fornecido
          if (token) {
            localStorage.setItem('token', token.trim()); // Remove espaços extras
            this.logger.info('Token saved to localStorage', { tokenLength: token.length });
          } else {
            this.logger.warn('No token received from login response');
          }

          // Armazena usuário no localStorage
          localStorage.setItem('user', JSON.stringify(validatedUser));
          
          this.logger.info('User logged in successfully', { userId: validatedUser.id, hasToken: !!token });

          return validatedUser;
        } catch (error) {
          // Se for ValidationError, propaga imediatamente
          if (error instanceof ValidationError) {
            throw error;
          }
          
          // Caso contrário, salva o erro e tenta próximo endpoint
          lastError = error as Error;
          continue;
        }
      }

      // Se todos os endpoints falharam, lança o último erro
      if (lastError) {
        throw lastError;
      }

      throw new ValidationError('Erro ao conectar com o servidor. Tente novamente.');
    } catch (error) {
      this.logger.error('Login failed', error as Error);
      
      if (error instanceof ValidationError) {
        throw error;
      }

      // Se for erro de rede, fornece mensagem mais amigável
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ValidationError('Erro ao conectar com o servidor. Verifique sua conexão.');
      }

      throw new ValidationError('Erro ao fazer login. Tente novamente.');
    }
  }

  async register(credentials: RegisterCredentials): Promise<User> {
    this.logger.debug('Attempting register', { email: credentials.email });

    try {
      // Tenta vários endpoints possíveis, incluindo localhost:8080 diretamente
      const endpoints = [
        `${this.apiUrl}/api/auth/register`,
        `${this.apiUrl}/api/register`,
        `${this.apiUrl}/auth/register`,
        `${this.apiUrl}/register`,
        // Fallback direto para localhost:8080 se a API estiver em outra porta
        'http://localhost:8080/api/auth/register',
        'http://localhost:8080/api/register',
        'http://localhost:8080/auth/register',
        'http://localhost:8080/register',
      ];

      let lastError: Error | null = null;

      for (const url of endpoints) {
        try {
          this.logger.debug('Trying register endpoint', { url });

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: credentials.name,
              email: credentials.email,
              password: credentials.password,
              phone: credentials.phone,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            this.logger.debug('Register endpoint failed', { 
              url, 
              status: response.status, 
              error: errorText 
            });
            
            // Tratamento específico para erros comuns
            if (response.status === 400) {
              try {
                const errorData = JSON.parse(errorText);
                const errorMessage = errorData.message || errorData.error || 'Dados inválidos';
                throw new ValidationError(errorMessage);
              } catch {
                throw new ValidationError('Dados inválidos. Verifique os campos preenchidos.');
              }
            }
            
            if (response.status === 409) {
              throw new ValidationError('Este email já está cadastrado');
            }
            
            if (response.status === 401 || response.status === 403) {
              throw new ValidationError('Não autorizado');
            }
            
            // Se não for um erro conhecido, tenta o próximo endpoint
            lastError = new Error(`HTTP ${response.status}: ${errorText}`);
            continue;
          }

          const data: ApiLoginResponse | DirectUserResponse = await response.json();
          
          // Mapeia a resposta da API para o formato User
          // A API pode retornar { user: {...}, token: "..." } ou diretamente { id, name, email, role, token: "..." }
          const userData = 'user' in data ? data.user : data;
          const token = 'token' in data ? data.token : undefined;
          
          const user: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
          };

          // Valida com Zod
          const validatedUser = UserSchema.parse(user);

          // Armazena token se fornecido
          if (token) {
            localStorage.setItem('token', token);
          }

          // Armazena usuário no localStorage
          localStorage.setItem('user', JSON.stringify(validatedUser));
          
          this.logger.info('User registered successfully', { userId: validatedUser.id });

          return validatedUser;
        } catch (error) {
          // Se for ValidationError, propaga imediatamente
          if (error instanceof ValidationError) {
            throw error;
          }
          
          // Caso contrário, salva o erro e tenta próximo endpoint
          lastError = error as Error;
          continue;
        }
      }

      // Se todos os endpoints falharam, lança o último erro
      if (lastError) {
        throw lastError;
      }

      throw new ValidationError('Erro ao conectar com o servidor. Tente novamente.');
    } catch (error) {
      this.logger.error('Register failed', error as Error);
      
      if (error instanceof ValidationError) {
        throw error;
      }

      // Se for erro de rede, fornece mensagem mais amigável
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ValidationError('Erro ao conectar com o servidor. Verifique sua conexão.');
      }

      throw new ValidationError('Erro ao fazer cadastro. Tente novamente.');
    }
  }

  async logout(): Promise<void> {
    this.logger.debug('Logging out');

    try {
      const token = localStorage.getItem('token');
      
      // Tenta fazer logout no backend se houver token
      if (token) {
        const endpoints = [
          `${this.apiUrl}/api/auth/logout`,
          `${this.apiUrl}/api/logout`,
          `${this.apiUrl}/auth/logout`,
          `${this.apiUrl}/logout`,
        ];

        for (const url of endpoints) {
          try {
            await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            });
            break; // Se uma requisição funcionou, para de tentar
          } catch (error) {
            // Continua tentando outros endpoints
            this.logger.debug('Logout endpoint failed', { url, error });
          }
        }
      }
    } catch (error) {
      // Não falha o logout se o backend não responder
      this.logger.debug('Error calling logout endpoint', error as Error);
    }

    // Remove dados locais independente do resultado do backend
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.logger.info('User logged out');
  }

  async getCurrentUser(): Promise<User | null> {
    this.logger.debug('Getting current user');

    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      // Se não houver token nem usuário no localStorage, retorna null
      if (!token && !userStr) {
        return null;
      }

      // Se houver token, tenta buscar usuário atual do backend
      if (token) {
        const endpoints = [
          `${this.apiUrl}/api/auth/me`,
          `${this.apiUrl}/api/user/me`,
          `${this.apiUrl}/auth/me`,
          `${this.apiUrl}/user/me`,
        ];

        for (const url of endpoints) {
          try {
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              const userData = data.user || data;
              const user: User = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
              };

              const validatedUser = UserSchema.parse(user);
              localStorage.setItem('user', JSON.stringify(validatedUser));
              
              this.logger.info('Current user fetched from API', { userId: validatedUser.id });
              return validatedUser;
            }
          } catch (error) {
            // Continua tentando outros endpoints
            this.logger.debug('Get current user endpoint failed', { url, error });
          }
        }
      }

      // Fallback: usa dados do localStorage APENAS se houver token
      // Se não houver token, não retorna usuário (mesmo que exista no localStorage)
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr) as User;
          const validatedUser = UserSchema.parse(user);
          this.logger.debug('Current user loaded from localStorage', { userId: validatedUser.id });
          return validatedUser;
        } catch (error) {
          this.logger.error('Error parsing user from localStorage', error as Error);
          localStorage.removeItem('user');
          return null;
        }
      }

      // Se não houver token mas houver usuário no localStorage, limpa o usuário
      if (!token && userStr) {
        this.logger.warn('User found in localStorage but no token - clearing user data');
        localStorage.removeItem('user');
      }

      return null;
    } catch (error) {
      this.logger.error('Error getting current user', error as Error);
      return null;
    }
  }
}

