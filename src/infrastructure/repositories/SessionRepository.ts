import { ISessionRepository, CreateSessionData } from '@domain/repositories/ISessionRepository';
import { Session, SessionSchema } from '@domain/entities/Session.entity';
import { NotFoundError } from '@domain/errors/NotFoundError';
import { ILogger } from '../logging/Logger';

interface ApiSessionResponse {
  id: string;
  mentorId: string;
  menteeId: string; // userId na API
  planId?: string | null;
  scheduledAt: string; // ISO datetime
  duration: number; // em minutos
  status: string;
  zoomLink?: string | null;
  zoomMeetingId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export class SessionRepository implements ISessionRepository {
  private readonly apiUrl: string;

  constructor(private readonly logger: ILogger) {
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';
  }

  /**
   * Converte date e time para scheduledAt (ISO datetime)
   */
  private combineDateAndTime(date: string, time: string): string {
    // date já vem como ISO string, precisamos combinar com time
    const dateObj = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    dateObj.setHours(hours, minutes, 0, 0);
    return dateObj.toISOString();
  }

  /**
   * Normaliza o status da API (pode vir em maiúsculas) para o formato esperado (minúsculas)
   */
  private normalizeStatus(status: string | undefined): 'scheduled' | 'completed' | 'cancelled' {
    if (!status) return 'scheduled';
    const normalized = status.toLowerCase();
    if (['scheduled', 'completed', 'cancelled'].includes(normalized)) {
      return normalized as 'scheduled' | 'completed' | 'cancelled';
    }
    return 'scheduled';
  }

  async create(data: CreateSessionData): Promise<Session> {
    this.logger.debug('Creating session', data);

    try {
      const url = `${this.apiUrl}/sessions`;

      const token = localStorage.getItem('token');
      
      if (!token) {
        this.logger.error('No token found in localStorage');
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`, // Remove espaços extras
      };

      // Converte date + time para scheduledAt (ISO datetime)
      const scheduledAt = this.combineDateAndTime(data.date, data.time);

      // Monta o body conforme a especificação da API
      // A API espera: mentorId (UUID string), planId (obrigatório segundo a spec), scheduledAt, duration, notes
      // Nota: planId pode ser null se não houver plano associado
      const requestBody: {
        mentorId: string;
        planId: string | null;
        scheduledAt: string;
        duration: number;
        notes?: string;
      } = {
        mentorId: data.mentorId, // UUID como string
        planId: null, // Por enquanto null, pode ser ajustado depois se necessário
        scheduledAt,
        duration: 60, // Duração padrão de 1 hora (60 minutos)
      };

      // Adiciona notes se fornecido
      if (data.notes) {
        requestBody.notes = data.notes;
        // Se houver topic, adiciona nas notes também
        if (data.topic) {
          requestBody.notes = `Tópico: ${data.topic}\n${data.notes}`;
        }
      } else if (data.topic) {
        // Se só houver topic, usa como notes
        requestBody.notes = `Tópico: ${data.topic}`;
      }

      this.logger.debug('Creating session at', { url, mentorId: data.mentorId, scheduledAt });

      this.logger.debug('Creating session at', { url, mentorId: data.mentorId, scheduledAt });

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (response.status === 401) {
        // Token inválido ou expirado - limpa o localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.logger.error('Unauthorized - token invalid or expired');
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to create session', new Error(`HTTP ${response.status}: ${errorText}`));
        throw new Error(`Erro ao criar sessão: ${response.status} ${errorText}`);
      }

      const apiSession: ApiSessionResponse = await response.json();
      
      // Extrai date e time de scheduledAt para manter compatibilidade
      const scheduledDate = new Date(apiSession.scheduledAt);
      const dateStr = scheduledDate.toISOString().split('T')[0];
      const timeStr = `${String(scheduledDate.getHours()).padStart(2, '0')}:${String(scheduledDate.getMinutes()).padStart(2, '0')}`;

      // Extrai topic das notes se existir
      let topic = data.topic;
      let notes = apiSession.notes || data.notes;
      if (notes && notes.startsWith('Tópico: ')) {
        const lines = notes.split('\n');
        topic = lines[0].replace('Tópico: ', '');
        notes = lines.slice(1).join('\n') || undefined;
      }

      const session: Session = {
        id: apiSession.id,
        mentorId: apiSession.mentorId,
        mentorName: 'Mentor Name', // Será preenchido pelo use case
        mentorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor',
        userId: apiSession.menteeId || data.userId,
        date: dateStr,
        time: timeStr,
        topic: topic || '',
        notes: notes,
        status: this.normalizeStatus(apiSession.status),
        price: data.price, // A API não retorna price, mantém o que foi enviado
        createdAt: apiSession.createdAt,
      };

      const validatedSession = SessionSchema.parse(session);
      this.logger.info('Session created successfully', { sessionId: validatedSession.id });
      
      return validatedSession;
    } catch (error) {
      this.logger.error('Error creating session', error as Error);
      throw error;
    }
  }

  async createForUserByAdmin(userId: string, data: { mentorId: string; planId: string | null; scheduledAt: string; duration: number; notes?: string }): Promise<Session> {
    this.logger.debug('Creating session for user by admin', { userId, ...data });

    try {
      const url = `${this.apiUrl}/admin/user/sessions`;

      const token = localStorage.getItem('token');
      
      if (!token) {
        this.logger.error('No token found in localStorage');
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`,
      };

      // Monta o body conforme o formato esperado pelo endpoint admin
      const requestBody = {
        userId,
        mentorId: data.mentorId,
        planId: data.planId ?? null,
        scheduledAt: data.scheduledAt,
        duration: data.duration,
        notes: data.notes,
      };

      this.logger.debug('Creating session for user by admin', { url, userId, mentorId: data.mentorId });

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
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

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to create session for user by admin', new Error(`HTTP ${response.status}: ${errorText}`));
        throw new Error(`Erro ao criar sessão: ${response.status} ${response.statusText}`);
      }

      const apiSession: ApiSessionResponse = await response.json();
      
      // Converte para formato Session
      const scheduledDate = new Date(apiSession.scheduledAt);
      const dateStr = scheduledDate.toISOString().split('T')[0];
      const timeStr = `${String(scheduledDate.getHours()).padStart(2, '0')}:${String(scheduledDate.getMinutes()).padStart(2, '0')}`;

      // Extrai topic das notes se existir
      let topic = '';
      let notes = apiSession.notes || undefined;
      if (notes && notes.startsWith('Tópico: ')) {
        const lines = notes.split('\n');
        topic = lines[0].replace('Tópico: ', '');
        notes = lines.slice(1).join('\n') || undefined;
      }

      // Busca informações do mentor para preencher mentorName e mentorAvatar
      let mentorName = 'Mentor Name';
      let mentorAvatar: string | null = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor';
      
      try {
        const mentorUrl = `${this.apiUrl}/mentors/${data.mentorId}`;
        const mentorResponse = await fetch(mentorUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.trim()}`,
          },
        });

        if (mentorResponse.ok) {
          const mentorData: any = await mentorResponse.json();
          mentorName = mentorData.name || 'Mentor Name';
          mentorAvatar = mentorData.avatar || null;
        }
      } catch (mentorError) {
        this.logger.warn('Could not fetch mentor data', mentorError as Error);
        // Continua com valores padrão
      }

      const session: Session = {
        id: apiSession.id,
        mentorId: apiSession.mentorId,
        mentorName,
        mentorAvatar,
        userId: apiSession.menteeId,
        date: dateStr,
        time: timeStr,
        topic: topic,
        notes: notes,
        status: this.normalizeStatus(apiSession.status),
        price: undefined,
        createdAt: apiSession.createdAt,
      };

      const validatedSession = SessionSchema.parse(session);
      this.logger.info('Session created for user by admin successfully', { sessionId: validatedSession.id, userId });
      return validatedSession;
    } catch (error) {
      this.logger.error('Error creating session for user by admin', error as Error);
      throw error;
    }
  }

  async update(id: string, data: { scheduledAt: string; duration?: number; notes?: string }): Promise<Session> {
    this.logger.debug('Updating session', { id, ...data });

    try {
      const url = `${this.apiUrl}/sessions/${id}`;
      const token = localStorage.getItem('token');
      
      if (!token) {
        this.logger.error('No token found in localStorage');
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`,
      };

      const requestBody: {
        scheduledAt: string;
        duration?: number;
        notes?: string;
      } = {
        scheduledAt: data.scheduledAt,
      };

      if (data.duration !== undefined) {
        requestBody.duration = data.duration;
      }

      if (data.notes !== undefined) {
        requestBody.notes = data.notes;
      }

      this.logger.debug('Updating session', { url, id, scheduledAt: data.scheduledAt });

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.logger.error('Unauthorized - token invalid or expired');
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      if (response.status === 403) {
        this.logger.error('Forbidden - user does not have permission');
        throw new Error('Você não tem permissão para editar esta sessão.');
      }

      if (response.status === 404) {
        this.logger.error('Session not found', { id });
        throw new Error('Sessão não encontrada.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to update session', new Error(`HTTP ${response.status}: ${errorText}`));
        throw new Error(`Erro ao atualizar sessão: ${response.status} ${response.statusText}`);
      }

      const apiSession: ApiSessionResponse = await response.json();
      
      // Converte para formato Session
      const scheduledDate = new Date(apiSession.scheduledAt);
      const dateStr = scheduledDate.toISOString().split('T')[0];
      const timeStr = `${String(scheduledDate.getHours()).padStart(2, '0')}:${String(scheduledDate.getMinutes()).padStart(2, '0')}`;

      // Extrai topic das notes se existir
      let topic = '';
      let notes = apiSession.notes || undefined;
      if (notes && notes.startsWith('Tópico: ')) {
        const lines = notes.split('\n');
        topic = lines[0].replace('Tópico: ', '');
        notes = lines.slice(1).join('\n') || undefined;
      }

      // Busca informações do mentor para preencher mentorName e mentorAvatar
      let mentorName = 'Mentor Name';
      let mentorAvatar: string | null = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor';
      
      try {
        const mentorUrl = `${this.apiUrl}/mentors/${apiSession.mentorId}`;
        const mentorResponse = await fetch(mentorUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.trim()}`,
          },
        });

        if (mentorResponse.ok) {
          const mentorData: any = await mentorResponse.json();
          mentorName = mentorData.name || 'Mentor Name';
          mentorAvatar = mentorData.avatar || null;
        }
      } catch (mentorError) {
        this.logger.warn('Could not fetch mentor data', mentorError as Error);
        // Continua com valores padrão
      }

      const session: Session = {
        id: apiSession.id,
        mentorId: apiSession.mentorId,
        mentorName,
        mentorAvatar,
        userId: apiSession.menteeId,
        date: dateStr,
        time: timeStr,
        topic: topic,
        notes: notes,
        status: this.normalizeStatus(apiSession.status),
        price: undefined,
        createdAt: apiSession.createdAt,
      };

      const validatedSession = SessionSchema.parse(session);
      this.logger.info('Session updated successfully', { sessionId: validatedSession.id });
      return validatedSession;
    } catch (error) {
      this.logger.error('Error updating session', error as Error);
      throw error;
    }
  }

  async findById(id: string): Promise<Session | null> {
    this.logger.debug('Finding session by id', { id });

    try {
      const url = `${this.apiUrl}/sessions/${id}`;
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to fetch session', new Error(`HTTP ${response.status}: ${errorText}`));
        throw new Error(`Erro ao buscar sessão: ${response.status} ${response.statusText}`);
      }

      const apiSession: ApiSessionResponse = await response.json();
      
      // Converte para formato Session
      const scheduledDate = new Date(apiSession.scheduledAt);
      const dateStr = scheduledDate.toISOString().split('T')[0];
      const timeStr = `${String(scheduledDate.getHours()).padStart(2, '0')}:${String(scheduledDate.getMinutes()).padStart(2, '0')}`;

      // Extrai topic das notes se existir
      let topic = '';
      let notes = apiSession.notes || undefined;
      if (notes && notes.startsWith('Tópico: ')) {
        const lines = notes.split('\n');
        topic = lines[0].replace('Tópico: ', '');
        notes = lines.slice(1).join('\n') || undefined;
      }

      const session: Session = {
        id: apiSession.id,
        mentorId: apiSession.mentorId,
        mentorName: 'Mentor Name',
        mentorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor',
        userId: apiSession.menteeId,
        date: dateStr,
        time: timeStr,
        topic: topic,
        notes: notes,
        status: this.normalizeStatus(apiSession.status),
        price: undefined, // A API não retorna price
        createdAt: apiSession.createdAt,
      };

      return SessionSchema.parse(session);
    } catch (error) {
      this.logger.error('Error fetching session', error as Error);
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Session[]> {
    this.logger.debug('Finding sessions by user id', { userId });

    try {
      const url = `${this.apiUrl}/sessions`;
      const token = localStorage.getItem('token');
      
      if (!token) {
        this.logger.error('No token found in localStorage');
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`, // Remove espaços extras
      };

      this.logger.debug('Fetching sessions', { url, hasToken: !!token });

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

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to fetch sessions', new Error(`HTTP ${response.status}: ${errorText}`));
        throw new Error(`Erro ao buscar sessões: ${response.status} ${response.statusText}`);
      }

      const apiSessions: ApiSessionResponse[] = await response.json();
      
      // Filtra por userId e converte para formato Session
      return apiSessions
        .filter(s => s.menteeId === userId)
        .map(apiSession => {
          const scheduledDate = new Date(apiSession.scheduledAt);
          const dateStr = scheduledDate.toISOString().split('T')[0];
          const timeStr = `${String(scheduledDate.getHours()).padStart(2, '0')}:${String(scheduledDate.getMinutes()).padStart(2, '0')}`;

          // Extrai topic das notes se existir
          let topic = '';
          let notes = apiSession.notes || undefined;
          if (notes && notes.startsWith('Tópico: ')) {
            const lines = notes.split('\n');
            topic = lines[0].replace('Tópico: ', '');
            notes = lines.slice(1).join('\n') || undefined;
          }

          return SessionSchema.parse({
            id: apiSession.id,
            mentorId: apiSession.mentorId,
            mentorName: 'Mentor Name',
            mentorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor',
            userId: apiSession.menteeId,
            date: dateStr,
            time: timeStr,
            topic: topic,
            notes: notes,
            status: this.normalizeStatus(apiSession.status),
            price: undefined, // A API não retorna price
            createdAt: apiSession.createdAt,
          });
        });
    } catch (error) {
      this.logger.error('Error fetching sessions', error as Error);
      throw error;
    }
  }

  async findByUserIdAdmin(userId: string): Promise<Session[]> {
    this.logger.debug('Finding sessions by user id (admin)', { userId });

    try {
      const url = `${this.apiUrl}/admin/user/${userId}/sessions`;
      const token = localStorage.getItem('token');
      
      if (!token) {
        this.logger.error('No token found in localStorage');
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`,
      };

      this.logger.debug('Fetching sessions by admin', { url, userId });

      const response = await fetch(url, {
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

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to fetch sessions by admin', new Error(`HTTP ${response.status}: ${errorText}`));
        throw new Error(`Erro ao buscar sessões: ${response.status} ${response.statusText}`);
      }

      const apiSessions: ApiSessionResponse[] = await response.json();
      
      // Converte para formato Session
      const sessions = await Promise.all(
        apiSessions.map(async (apiSession) => {
          const scheduledDate = new Date(apiSession.scheduledAt);
          const dateStr = scheduledDate.toISOString().split('T')[0];
          const timeStr = `${String(scheduledDate.getHours()).padStart(2, '0')}:${String(scheduledDate.getMinutes()).padStart(2, '0')}`;

          // Extrai topic das notes se existir
          let topic = '';
          let notes = apiSession.notes || undefined;
          if (notes && notes.startsWith('Tópico: ')) {
            const lines = notes.split('\n');
            topic = lines[0].replace('Tópico: ', '');
            notes = lines.slice(1).join('\n') || undefined;
          }

          // Busca informações do mentor para preencher mentorName e mentorAvatar
          let mentorName = 'Mentor Name';
          let mentorAvatar: string | null = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor';
          
          try {
            const mentorUrl = `${this.apiUrl}/mentors/${apiSession.mentorId}`;
            const mentorResponse = await fetch(mentorUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.trim()}`,
              },
            });

            if (mentorResponse.ok) {
              const mentorData: any = await mentorResponse.json();
              mentorName = mentorData.name || 'Mentor Name';
              mentorAvatar = mentorData.avatar || null;
            }
          } catch (mentorError) {
            this.logger.warn('Could not fetch mentor data', mentorError as Error);
            // Continua com valores padrão
          }

          return SessionSchema.parse({
            id: apiSession.id,
            mentorId: apiSession.mentorId,
            mentorName,
            mentorAvatar,
            userId: apiSession.menteeId,
            date: dateStr,
            time: timeStr,
            topic: topic,
            notes: notes,
            status: this.normalizeStatus(apiSession.status),
            price: undefined,
            createdAt: apiSession.createdAt,
          });
        })
      );

      this.logger.info('Sessions fetched by admin successfully', { userId, count: sessions.length });
      return sessions;
    } catch (error) {
      this.logger.error('Error fetching sessions by admin', error as Error);
      throw error;
    }
  }

  async findByMentorId(mentorId: string): Promise<Session[]> {
    this.logger.debug('Finding sessions by mentor id', { mentorId });

    try {
      const url = `${this.apiUrl}/sessions`;
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to fetch sessions', new Error(`HTTP ${response.status}: ${errorText}`));
        throw new Error(`Erro ao buscar sessões: ${response.status} ${response.statusText}`);
      }

      const apiSessions: ApiSessionResponse[] = await response.json();
      
      // Filtra por mentorId e converte para formato Session
      return apiSessions
        .filter(s => s.mentorId === mentorId)
        .map(apiSession => {
          const scheduledDate = new Date(apiSession.scheduledAt);
          const dateStr = scheduledDate.toISOString().split('T')[0];
          const timeStr = `${String(scheduledDate.getHours()).padStart(2, '0')}:${String(scheduledDate.getMinutes()).padStart(2, '0')}`;

          // Extrai topic das notes se existir
          let topic = '';
          let notes = apiSession.notes || undefined;
          if (notes && notes.startsWith('Tópico: ')) {
            const lines = notes.split('\n');
            topic = lines[0].replace('Tópico: ', '');
            notes = lines.slice(1).join('\n') || undefined;
          }

          return SessionSchema.parse({
            id: apiSession.id,
            mentorId: apiSession.mentorId,
            mentorName: 'Mentor Name',
            mentorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor',
            userId: apiSession.menteeId,
            date: dateStr,
            time: timeStr,
            topic: topic,
            notes: notes,
            status: this.normalizeStatus(apiSession.status),
            price: undefined, // A API não retorna price
            createdAt: apiSession.createdAt,
          });
        });
    } catch (error) {
      this.logger.error('Error fetching sessions', error as Error);
      throw error;
    }
  }
}

