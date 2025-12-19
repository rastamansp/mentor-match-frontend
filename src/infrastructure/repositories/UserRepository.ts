import { IUserRepository, UpdateUserCredentials } from '@domain/repositories/IUserRepository';
import { User, UserSchema } from '@domain/entities/User.entity';
import { UserMentor, UserMentorSchema } from '@domain/entities/UserMentor.entity';
import { Mentor, MentorSchema } from '@domain/entities/Mentor.entity';
import { ILogger } from '../logging/Logger';

interface ApiUserResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN' | 'MENTOR';
  createdAt?: string;
  updatedAt?: string;
}

export class UserRepository implements IUserRepository {
  private readonly apiUrl: string;

  constructor(private readonly logger: ILogger) {
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';
  }

  async findAll(): Promise<User[]> {
    this.logger.debug('Finding all users');

    try {
      const url = `${this.apiUrl}/users`;
      const token = localStorage.getItem('token');
      
      if (!token) {
        this.logger.error('No token found in localStorage');
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`,
      };

      this.logger.debug('Fetching users', { url, hasToken: !!token });

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (response.status === 401) {
        // Token inválido ou expirado - limpa o localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.logger.error('Unauthorized - token invalid or expired');
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      if (response.status === 403) {
        this.logger.error('Forbidden - user does not have permission');
        throw new Error('Você não tem permissão para acessar esta funcionalidade.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to fetch users', new Error(`HTTP ${response.status}: ${errorText}`));
        throw new Error(`Erro ao buscar usuários: ${response.status} ${response.statusText}`);
      }

      const apiUsers: ApiUserResponse[] = await response.json();
      
      // Converte para formato User e valida
      const users: User[] = apiUsers.map(apiUser => {
        const user: User = {
          id: apiUser.id,
          name: apiUser.name,
          email: apiUser.email,
          role: apiUser.role,
          phone: apiUser.phone,
          createdAt: apiUser.createdAt,
          updatedAt: apiUser.updatedAt,
        };
        return UserSchema.parse(user);
      });
      
      this.logger.info('Users fetched successfully', { count: users.length });
      return users;
    } catch (error) {
      this.logger.error('Error finding users', error as Error);
      throw error;
    }
  }

  async update(id: string, data: UpdateUserCredentials): Promise<User> {
    this.logger.debug('Updating user', { userId: id });

    try {
      const url = `${this.apiUrl}/users/${id}`;
      const token = localStorage.getItem('token');
      
      if (!token) {
        this.logger.error('No token found in localStorage');
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`,
      };

      // Prepara o body apenas com os campos fornecidos
      const body: Record<string, string> = {
        name: data.name,
        email: data.email,
        phone: data.phone,
      };

      // Adiciona role apenas se fornecido
      if (data.role) {
        body.role = data.role;
      }

      this.logger.debug('Updating user', { url, hasToken: !!token, userId: id });

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      if (response.status === 401) {
        // Token inválido ou expirado - limpa o localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.logger.error('Unauthorized - token invalid or expired');
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      if (response.status === 403) {
        this.logger.error('Forbidden - user does not have permission');
        throw new Error('Você não tem permissão para acessar esta funcionalidade.');
      }

      if (response.status === 404) {
        this.logger.error('User not found', { userId: id });
        throw new Error('Usuário não encontrado.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to update user', new Error(`HTTP ${response.status}: ${errorText}`));
        throw new Error(`Erro ao atualizar usuário: ${response.status} ${response.statusText}`);
      }

      const apiUser: ApiUserResponse = await response.json();
      
      // Converte para formato User e valida
      const user: User = {
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        role: apiUser.role,
        phone: apiUser.phone,
        createdAt: apiUser.createdAt,
        updatedAt: apiUser.updatedAt,
      };
      
      const validatedUser = UserSchema.parse(user);
      this.logger.info('User updated successfully', { userId: validatedUser.id });
      return validatedUser;
    } catch (error) {
      this.logger.error('Error updating user', error as Error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.debug('Deleting user', { userId: id });

    try {
      const url = `${this.apiUrl}/users/${id}`;
      const token = localStorage.getItem('token');
      
      if (!token) {
        this.logger.error('No token found in localStorage');
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`,
      };

      this.logger.debug('Deleting user', { url, hasToken: !!token, userId: id });

      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      if (response.status === 401) {
        // Token inválido ou expirado - limpa o localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.logger.error('Unauthorized - token invalid or expired');
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      if (response.status === 403) {
        this.logger.error('Forbidden - user does not have permission');
        throw new Error('Você não tem permissão para acessar esta funcionalidade.');
      }

      if (response.status === 404) {
        this.logger.error('User not found', { userId: id });
        throw new Error('Usuário não encontrado.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to delete user', new Error(`HTTP ${response.status}: ${errorText}`));
        throw new Error(`Erro ao deletar usuário: ${response.status} ${response.statusText}`);
      }

      this.logger.info('User deleted successfully', { userId: id });
    } catch (error) {
      this.logger.error('Error deleting user', error as Error);
      throw error;
    }
  }

  async listUserMentors(userId: string, status?: 'ACTIVE' | 'INACTIVE'): Promise<UserMentor[]> {
    this.logger.debug('Finding user mentors', { userId, status });

    try {
      const url = new URL(`${this.apiUrl}/users/${userId}/mentors`);
      if (status) {
        url.searchParams.append('status', status);
      }

      const token = localStorage.getItem('token');
      
      if (!token) {
        this.logger.error('No token found in localStorage');
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`,
      };

      this.logger.debug('Fetching user mentors', { url: url.toString(), hasToken: !!token });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.logger.error('Unauthorized - token invalid or expired');
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      if (response.status === 403) {
        this.logger.error('Forbidden - user does not have permission');
        throw new Error('Você não tem permissão para acessar esta funcionalidade.');
      }

      if (response.status === 404) {
        this.logger.error('User not found', { userId });
        throw new Error('Usuário não encontrado.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to fetch user mentors', new Error(`HTTP ${response.status}: ${errorText}`));
        throw new Error(`Erro ao buscar mentores do usuário: ${response.status} ${response.statusText}`);
      }

      const apiUserMentors: Array<{
        id: string;
        mentorId: string;
        userId: string;
        status: string;
        subscriptionId?: string | null;
        associatedAt?: string;
        associatedBy?: string;
        mentor: {
          id: string;
          name: string;
          email: string;
          role: string | null;
          company: string | null;
          specialty: string | null;
          phone: string | null;
          whatsappNumber: string | null;
          bio: string | null;
          location: string | null;
          avatar: string | null;
          areas: string[] | null;
          skills: string[] | null;
          languages: string[];
          achievements: string[] | null;
          experience: Array<{
            title: string;
            company: string;
            period: string;
            description: string;
          }> | null;
          pricePerHour: number;
          status: string;
          rating: number | null;
          reviews: number;
          totalSessions: number;
          createdAt: string;
          updatedAt: string;
        };
        createdAt: string;
        updatedAt: string;
      }> = await response.json();

      // Mapeia e valida cada UserMentor
      const userMentors: UserMentor[] = apiUserMentors.map(apiUserMentor => {
        // Valida o mentor primeiro
        const mentorData: any = {
          id: apiUserMentor.mentor.id,
          name: apiUserMentor.mentor.name,
          email: apiUserMentor.mentor.email,
          role: apiUserMentor.mentor.role ?? null,
          company: apiUserMentor.mentor.company ?? null,
          specialty: apiUserMentor.mentor.specialty ?? null,
          phone: apiUserMentor.mentor.phone ?? null,
          whatsappNumber: apiUserMentor.mentor.whatsappNumber ?? null,
          bio: apiUserMentor.mentor.bio ?? null,
          location: apiUserMentor.mentor.location ?? null,
          avatar: apiUserMentor.mentor.avatar ?? null,
          areas: apiUserMentor.mentor.areas ?? null,
          skills: apiUserMentor.mentor.skills ?? null,
          languages: apiUserMentor.mentor.languages,
          achievements: apiUserMentor.mentor.achievements ?? null,
          experience: apiUserMentor.mentor.experience ?? null,
          pricePerHour: apiUserMentor.mentor.pricePerHour,
          price: apiUserMentor.mentor.pricePerHour,
          status: apiUserMentor.mentor.status,
          rating: apiUserMentor.mentor.rating ?? null,
          reviews: apiUserMentor.mentor.reviews,
          totalSessions: apiUserMentor.mentor.totalSessions,
          createdAt: apiUserMentor.mentor.createdAt,
          updatedAt: apiUserMentor.mentor.updatedAt,
        };

        const validatedMentor = MentorSchema.parse(mentorData);

        const userMentor: UserMentor = {
          id: apiUserMentor.id,
          mentorId: apiUserMentor.mentorId,
          userId: apiUserMentor.userId,
          status: apiUserMentor.status as 'ACTIVE' | 'INACTIVE',
          subscriptionId: apiUserMentor.subscriptionId ?? undefined,
          mentor: validatedMentor,
          createdAt: apiUserMentor.createdAt,
          updatedAt: apiUserMentor.updatedAt,
        };

        return UserMentorSchema.parse(userMentor);
      });

      this.logger.info('User mentors fetched successfully', { userId, count: userMentors.length });
      return userMentors;
    } catch (error) {
      this.logger.error('Error finding user mentors', error as Error);
      throw error;
    }
  }

  async associateMentor(userId: string, mentorId: string, subscriptionId?: string): Promise<UserMentor> {
    this.logger.debug('Associating mentor to user', { userId, mentorId, subscriptionId });

    try {
      const url = `${this.apiUrl}/users/${userId}/mentors`;
      const token = localStorage.getItem('token');
      
      if (!token) {
        this.logger.error('No token found in localStorage');
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`,
      };

      const body: { mentorId: string; subscriptionId?: string } = {
        mentorId,
      };

      if (subscriptionId) {
        body.subscriptionId = subscriptionId;
      }

      this.logger.debug('Associating mentor', { url, userId, mentorId });

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.logger.error('Unauthorized - token invalid or expired');
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      if (response.status === 403) {
        this.logger.error('Forbidden - user does not have permission');
        throw new Error('Você não tem permissão para acessar esta funcionalidade.');
      }

      if (response.status === 404) {
        this.logger.error('User or mentor not found', { userId, mentorId });
        throw new Error('Usuário ou mentor não encontrado.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to associate mentor', new Error(`HTTP ${response.status}: ${errorText}`));
        throw new Error(`Erro ao associar mentor: ${response.status} ${response.statusText}`);
      }

      const apiUserMentor: {
        id: string;
        mentorId: string;
        userId: string;
        status: string;
        subscriptionId?: string | null;
        associatedAt?: string;
        associatedBy?: string;
        mentor?: {
          id: string;
          name: string;
          email: string;
          role: string | null;
          company: string | null;
          specialty: string | null;
          phone: string | null;
          whatsappNumber: string | null;
          bio: string | null;
          location: string | null;
          avatar: string | null;
          areas: string[] | null;
          skills: string[] | null;
          languages: string[];
          achievements: string[] | null;
          experience: Array<{
            title: string;
            company: string;
            period: string;
            description: string;
          }> | null;
          pricePerHour: number;
          status: string;
          rating: number | null;
          reviews: number;
          totalSessions: number;
          createdAt: string;
          updatedAt: string;
        };
        createdAt: string;
        updatedAt: string;
      } = await response.json();

      // Se a resposta não incluir o objeto mentor completo, busca os dados do mentor
      if (!apiUserMentor.mentor) {
        this.logger.debug('Mentor object not in response, fetching mentor data', { mentorId });
        try {
          // Busca os dados do mentor via API
          const mentorUrl = `${this.apiUrl}/mentors/${apiUserMentor.mentorId}`;
          const mentorResponse = await fetch(mentorUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token.trim()}`,
            },
          });

          if (!mentorResponse.ok) {
            throw new Error(`Erro ao buscar dados do mentor: ${mentorResponse.status}`);
          }

          const mentorApiData: any = await mentorResponse.json();
          
          // Mapeia os dados do mentor
          const mentorData: any = {
            id: mentorApiData.id,
            name: mentorApiData.name,
            email: mentorApiData.email,
            role: mentorApiData.role ?? null,
            company: mentorApiData.company ?? null,
            specialty: mentorApiData.specialty ?? null,
            phone: mentorApiData.phone ?? null,
            whatsappNumber: mentorApiData.whatsappNumber ?? null,
            bio: mentorApiData.bio ?? null,
            location: mentorApiData.location ?? null,
            avatar: mentorApiData.avatar ?? null,
            areas: mentorApiData.areas ?? null,
            skills: mentorApiData.skills ?? null,
            languages: mentorApiData.languages,
            achievements: mentorApiData.achievements ?? null,
            experience: mentorApiData.experience ?? null,
            pricePerHour: mentorApiData.pricePerHour,
            price: mentorApiData.pricePerHour,
            status: mentorApiData.status,
            rating: mentorApiData.rating ?? null,
            reviews: mentorApiData.reviews,
            totalSessions: mentorApiData.totalSessions,
            createdAt: mentorApiData.createdAt,
            updatedAt: mentorApiData.updatedAt,
          };

          const validatedMentor = MentorSchema.parse(mentorData);
          
          const userMentor: UserMentor = {
            id: apiUserMentor.id,
            mentorId: apiUserMentor.mentorId,
            userId: apiUserMentor.userId,
            status: apiUserMentor.status as 'ACTIVE' | 'INACTIVE',
            subscriptionId: apiUserMentor.subscriptionId ?? undefined,
            mentor: validatedMentor,
            createdAt: apiUserMentor.createdAt,
            updatedAt: apiUserMentor.updatedAt,
          };

          const validatedUserMentor = UserMentorSchema.parse(userMentor);
          this.logger.info('Mentor associated successfully', { userId, mentorId });
          return validatedUserMentor;
        } catch (fetchError) {
          this.logger.error('Error fetching mentor data after association', fetchError as Error);
          // Se não conseguir buscar o mentor, ainda assim a associação foi feita
          // O cache invalidation vai buscar os dados atualizados
          throw new Error('Associação realizada com sucesso, mas não foi possível buscar os dados do mentor. Recarregue a página para ver os dados atualizados.');
        }
      }

      // Mapeia e valida o mentor se estiver presente na resposta
      const mentorData: any = {
        id: apiUserMentor.mentor.id,
        name: apiUserMentor.mentor.name,
        email: apiUserMentor.mentor.email,
        role: apiUserMentor.mentor.role ?? null,
        company: apiUserMentor.mentor.company ?? null,
        specialty: apiUserMentor.mentor.specialty ?? null,
        phone: apiUserMentor.mentor.phone ?? null,
        whatsappNumber: apiUserMentor.mentor.whatsappNumber ?? null,
        bio: apiUserMentor.mentor.bio ?? null,
        location: apiUserMentor.mentor.location ?? null,
        avatar: apiUserMentor.mentor.avatar ?? null,
        areas: apiUserMentor.mentor.areas ?? null,
        skills: apiUserMentor.mentor.skills ?? null,
        languages: apiUserMentor.mentor.languages,
        achievements: apiUserMentor.mentor.achievements ?? null,
        experience: apiUserMentor.mentor.experience ?? null,
        pricePerHour: apiUserMentor.mentor.pricePerHour,
        price: apiUserMentor.mentor.pricePerHour,
        status: apiUserMentor.mentor.status,
        rating: apiUserMentor.mentor.rating ?? null,
        reviews: apiUserMentor.mentor.reviews,
        totalSessions: apiUserMentor.mentor.totalSessions,
        createdAt: apiUserMentor.mentor.createdAt,
        updatedAt: apiUserMentor.mentor.updatedAt,
      };

      let validatedMentor: Mentor;
      try {
        validatedMentor = MentorSchema.parse(mentorData);
      } catch (validationError) {
        this.logger.error('Error validating mentor schema', validationError as Error);
        if (validationError instanceof Error) {
          throw new Error(`Erro ao validar dados do mentor: ${validationError.message}`);
        }
        throw validationError;
      }

      const userMentor: UserMentor = {
        id: apiUserMentor.id,
        mentorId: apiUserMentor.mentorId,
        userId: apiUserMentor.userId,
        status: apiUserMentor.status as 'ACTIVE' | 'INACTIVE',
        subscriptionId: apiUserMentor.subscriptionId ?? undefined,
        mentor: validatedMentor,
        createdAt: apiUserMentor.createdAt,
        updatedAt: apiUserMentor.updatedAt,
      };

      let validatedUserMentor: UserMentor;
      try {
        validatedUserMentor = UserMentorSchema.parse(userMentor);
      } catch (validationError) {
        this.logger.error('Error validating userMentor schema', validationError as Error);
        if (validationError instanceof Error) {
          throw new Error(`Erro ao validar associação usuário-mentor: ${validationError.message}`);
        }
        throw validationError;
      }
      this.logger.info('Mentor associated successfully', { userId, mentorId });
      return validatedUserMentor;
    } catch (error) {
      this.logger.error('Error associating mentor', error as Error);
      throw error;
    }
  }

  async removeMentor(userId: string, mentorId: string): Promise<void> {
    this.logger.debug('Removing mentor from user', { userId, mentorId });

    try {
      const url = `${this.apiUrl}/users/${userId}/mentors/${mentorId}`;
      const token = localStorage.getItem('token');
      
      if (!token) {
        this.logger.error('No token found in localStorage');
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`,
      };

      this.logger.debug('Removing mentor', { url, userId, mentorId });

      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.logger.error('Unauthorized - token invalid or expired');
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      if (response.status === 403) {
        this.logger.error('Forbidden - user does not have permission');
        throw new Error('Você não tem permissão para acessar esta funcionalidade.');
      }

      if (response.status === 404) {
        this.logger.error('Association not found', { userId, mentorId });
        throw new Error('Associação não encontrada.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to remove mentor', new Error(`HTTP ${response.status}: ${errorText}`));
        throw new Error(`Erro ao remover mentor: ${response.status} ${response.statusText}`);
      }

      this.logger.info('Mentor removed successfully', { userId, mentorId });
    } catch (error) {
      this.logger.error('Error removing mentor', error as Error);
      throw error;
    }
  }
}
