import { ISessionRepository, CreateSessionData } from '@domain/repositories/ISessionRepository';
import { Session, SessionSchema, SessionSlot } from '@domain/entities/Session.entity';
import { NotFoundError } from '@domain/errors/NotFoundError';
import { ILogger } from '../logging/Logger';
import { convertLocalToUtc, convertUtcToLocal, calculateEndAtUtc } from '@shared/utils/timezone';

interface ApiSessionSlot {
  id: string;
  sessionId: string;
  mentorId: string;
  menteeId: string;
  startAtUtc: string;
  endAtUtc: string;
  timezone: string;
  status: 'CONFIRMED' | 'HELD' | 'RESCHEDULED' | 'CANCELED' | 'COMPLETED';
  holdExpiresAt?: string | null;
  createdBy: 'USER' | 'CONCIERGE';
  rescheduleFromSlotId?: string | null;
  provider?: string | null;
  providerMeetingId?: string | number | null; // Backend pode retornar número ou string
  providerJoinUrl?: string | null;
  providerPayload?: any | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiSessionResponse {
  id: string;
  mentorId: string;
  menteeId: string; // userId na API
  planId?: string | null;
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
  // Novos campos da API com session_slots
  activeSlot?: ApiSessionSlot | null;
  slots?: ApiSessionSlot[];
  scheduledAt?: string; // Computado do activeSlot
  duration?: number; // Computado do activeSlot
  zoomLink?: string | null; // Computado do activeSlot
  zoomMeetingId?: string | number | null; // Computado do activeSlot (pode vir como número do backend)
}

export class SessionRepository implements ISessionRepository {
  private readonly apiUrl: string;

  constructor(private readonly logger: ILogger) {
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';
  }

  /**
   * Converte date e time para scheduledAt (ISO datetime UTC)
   * Usa timezone para converter corretamente para UTC
   */
  private combineDateAndTimeToUtc(date: string, time: string, timezone: string = 'America/Sao_Paulo'): string {
    return convertLocalToUtc(date, time, timezone);
  }

  /**
   * Normaliza o status da API para o formato esperado pela entidade Session
   * Backend: DRAFT, SCHEDULED, IN_PROGRESS, DONE, CANCELED, NO_SHOW
   * Frontend: scheduled, completed, cancelled
   */
  private normalizeStatus(status: string | undefined): 'scheduled' | 'completed' | 'cancelled' {
    if (!status) return 'scheduled';
    const normalized = status.toUpperCase();
    
    // Mapeia status da API para status da entidade
    // DRAFT e SCHEDULED → scheduled
    if (['DRAFT', 'SCHEDULED'].includes(normalized)) {
      return 'scheduled';
    }
    // IN_PROGRESS também é considerado scheduled (sessão em andamento)
    if (['IN_PROGRESS', 'CONFIRMED', 'HELD'].includes(normalized)) {
      return 'scheduled';
    }
    // DONE e COMPLETED → completed
    if (['DONE', 'COMPLETED'].includes(normalized)) {
      return 'completed';
    }
    // CANCELED e NO_SHOW → cancelled
    if (['CANCELED', 'CANCELLED', 'NO_SHOW'].includes(normalized)) {
      return 'cancelled';
    }
    
    // Fallback para status em minúsculas (compatibilidade)
    const lowerNormalized = status.toLowerCase();
    if (['scheduled', 'completed', 'cancelled'].includes(lowerNormalized)) {
      return lowerNormalized as 'scheduled' | 'completed' | 'cancelled';
    }
    
    // Default para scheduled
    return 'scheduled';
  }

  /**
   * Converte ApiSessionResponse para Session entity
   * Extrai dados de activeSlot quando disponível, ou usa campos computados
   */
  private convertApiSessionToSession(
    apiSession: ApiSessionResponse,
    mentorName: string = 'Mentor Name',
    mentorAvatar: string | null = null
  ): Session {
    // Prioriza activeSlot para extrair data/hora, senão usa scheduledAt computado
    let dateStr: string;
    let timeStr: string;
    let scheduledAt: string | undefined;
    let duration: number | undefined;
    let zoomLink: string | null | undefined;
    let zoomMeetingId: string | null | undefined;

    if (apiSession.activeSlot) {
      // Usa activeSlot como fonte principal
      const localDateTime = convertUtcToLocal(apiSession.activeSlot.startAtUtc, apiSession.activeSlot.timezone);
      dateStr = localDateTime.date;
      timeStr = localDateTime.time;
      scheduledAt = apiSession.activeSlot.startAtUtc;
      duration = Math.round((new Date(apiSession.activeSlot.endAtUtc).getTime() - new Date(apiSession.activeSlot.startAtUtc).getTime()) / (1000 * 60));
      zoomLink = apiSession.activeSlot.providerJoinUrl || null;
      zoomMeetingId = apiSession.activeSlot.providerMeetingId != null 
        ? String(apiSession.activeSlot.providerMeetingId) 
        : null; // Converte número para string
    } else if (apiSession.scheduledAt) {
      // Fallback para scheduledAt computado
      const scheduledDate = new Date(apiSession.scheduledAt);
      dateStr = scheduledDate.toISOString().split('T')[0];
      timeStr = `${String(scheduledDate.getHours()).padStart(2, '0')}:${String(scheduledDate.getMinutes()).padStart(2, '0')}`;
      scheduledAt = apiSession.scheduledAt;
      duration = apiSession.duration;
      zoomLink = apiSession.zoomLink;
      zoomMeetingId = apiSession.zoomMeetingId != null 
        ? String(apiSession.zoomMeetingId) 
        : null; // Converte número para string
    } else {
      // Fallback para data atual (não deveria acontecer)
      const now = new Date();
      dateStr = now.toISOString().split('T')[0];
      timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

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
      mentorName,
      mentorAvatar,
      userId: apiSession.menteeId,
      date: dateStr,
      time: timeStr,
      topic,
      notes,
      status: this.normalizeStatus(apiSession.status),
      createdAt: apiSession.createdAt,
      activeSlot: apiSession.activeSlot ? {
        id: apiSession.activeSlot.id,
        sessionId: apiSession.activeSlot.sessionId,
        mentorId: apiSession.activeSlot.mentorId,
        menteeId: apiSession.activeSlot.menteeId,
        startAtUtc: apiSession.activeSlot.startAtUtc,
        endAtUtc: apiSession.activeSlot.endAtUtc,
        timezone: apiSession.activeSlot.timezone,
        status: apiSession.activeSlot.status,
        holdExpiresAt: apiSession.activeSlot.holdExpiresAt || null,
        createdBy: apiSession.activeSlot.createdBy,
        rescheduleFromSlotId: apiSession.activeSlot.rescheduleFromSlotId || null,
        provider: apiSession.activeSlot.provider || null,
        providerMeetingId: apiSession.activeSlot.providerMeetingId != null 
          ? String(apiSession.activeSlot.providerMeetingId) 
          : null, // Converte número para string
        providerJoinUrl: apiSession.activeSlot.providerJoinUrl || null,
        providerPayload: apiSession.activeSlot.providerPayload || null,
        createdAt: apiSession.activeSlot.createdAt,
        updatedAt: apiSession.activeSlot.updatedAt,
      } : null,
      slots: apiSession.slots?.map(slot => ({
        id: slot.id,
        sessionId: slot.sessionId,
        mentorId: slot.mentorId,
        menteeId: slot.menteeId,
        startAtUtc: slot.startAtUtc,
        endAtUtc: slot.endAtUtc,
        timezone: slot.timezone,
        status: slot.status,
        holdExpiresAt: slot.holdExpiresAt || null,
        createdBy: slot.createdBy,
        rescheduleFromSlotId: slot.rescheduleFromSlotId || null,
        provider: slot.provider || null,
        providerMeetingId: slot.providerMeetingId != null 
          ? String(slot.providerMeetingId) 
          : null, // Converte número para string
        providerJoinUrl: slot.providerJoinUrl || null,
        providerPayload: slot.providerPayload || null,
        createdAt: slot.createdAt,
        updatedAt: slot.updatedAt,
      })) || [],
      scheduledAt,
      duration,
      zoomLink,
      zoomMeetingId: apiSession.zoomMeetingId != null 
        ? String(apiSession.zoomMeetingId) 
        : null, // Converte número para string
    };

    return SessionSchema.parse(session);
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

      // Verifica se scheduledAt já foi fornecido (em UTC) ou se precisa converter
      let scheduledAt: string;
      const timezone = (data as any).timezone || 'America/Sao_Paulo';
      
      if ((data as any).scheduledAt) {
        // Se scheduledAt já foi fornecido em UTC, usa diretamente
        scheduledAt = (data as any).scheduledAt;
        this.logger.debug('Using provided scheduledAt in UTC', { scheduledAt, timezone });
      } else {
        // Caso contrário, converte date + time + timezone para scheduledAt (ISO datetime UTC)
        scheduledAt = this.combineDateAndTimeToUtc(data.date, data.time, timezone);
        this.logger.debug('Converted date+time to UTC', { date: data.date, time: data.time, timezone, scheduledAt });
      }

      // Monta o body conforme a especificação da API
      // A API espera: mentorId, planId (opcional), scheduledAt (UTC), duration, notes
      // O timezone é usado apenas no frontend para converter o horário local para UTC
      const requestBody: {
        mentorId: string;
        planId: string | null;
        scheduledAt: string;
        duration: number;
        notes?: string;
      } = {
        mentorId: data.mentorId,
        planId: null,
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
        // Tenta extrair mensagem de erro mais amigável
        let errorMessage = `Erro ao criar sessão: ${response.status} ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMessage = errorJson.message;
          }
        } catch {
          // Se não conseguir parsear, verifica se é conflito
          if (response.status === 409 || response.status === 400) {
            if (errorText.includes('conflito') || errorText.includes('conflict') || errorText.includes('sobreposição')) {
              errorMessage = 'Conflito de horário detectado. O mentor já possui um agendamento neste período.';
            }
          }
        }
        
        throw new Error(errorMessage);
      }

      const apiSession: ApiSessionResponse = await response.json();
      
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

      // Converte ApiSessionResponse para Session usando método auxiliar
      const session = this.convertApiSessionToSession(apiSession, mentorName, mentorAvatar);
      
      // Mantém price do data original (não vem da API)
      const sessionWithPrice = {
        ...session,
        price: data.price,
      };

      const validatedSession = SessionSchema.parse(sessionWithPrice);
      this.logger.info('Session created successfully', { sessionId: validatedSession.id });
      
      return validatedSession;
    } catch (error) {
      this.logger.error('Error creating session', error as Error);
      throw error;
    }
  }

  async createForUserByAdmin(userId: string, data: { mentorId: string; planId: string | null; scheduledAt: string; duration: number; notes?: string; timezone?: string }): Promise<Session> {
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

      // Obtém timezone (padrão America/Sao_Paulo)
      const timezone = data.timezone || 'America/Sao_Paulo';

      // Monta o body conforme o formato esperado pelo endpoint admin
      const requestBody = {
        userId,
        mentorId: data.mentorId,
        planId: data.planId ?? null,
        scheduledAt: data.scheduledAt, // Já deve estar em UTC
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

      // Converte ApiSessionResponse para Session usando método auxiliar
      const session = this.convertApiSessionToSession(apiSession, mentorName, mentorAvatar);

      const validatedSession = SessionSchema.parse(session);
      this.logger.info('Session created for user by admin successfully', { sessionId: validatedSession.id, userId });
      return validatedSession;
    } catch (error) {
      this.logger.error('Error creating session for user by admin', error as Error);
      throw error;
    }
  }

  async reschedule(id: string, data: { newStartAtUtc: string; newEndAtUtc: string; timezone: string; reason?: string }): Promise<Session> {
    this.logger.debug('Rescheduling session', { id, ...data });

    try {
      const url = `${this.apiUrl}/sessions/${id}/reschedule`;
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
        newStartAtUtc: string;
        newEndAtUtc: string;
        timezone: string;
        reason?: string;
      } = {
        newStartAtUtc: data.newStartAtUtc,
        newEndAtUtc: data.newEndAtUtc,
        timezone: data.timezone,
      };

      if (data.reason) {
        requestBody.reason = data.reason;
      }

      this.logger.debug('Rescheduling session', { url, id, newStartAtUtc: data.newStartAtUtc, timezone: data.timezone });

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
        throw new Error('Você não tem permissão para remarcar esta sessão.');
      }

      if (response.status === 404) {
        this.logger.error('Session not found', { id });
        throw new Error('Sessão não encontrada.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to reschedule session', new Error(`HTTP ${response.status}: ${errorText}`));
        throw new Error(`Erro ao remarcar sessão: ${response.status} ${response.statusText}`);
      }

      const apiSession: ApiSessionResponse = await response.json();
      
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

      // Converte ApiSessionResponse para Session usando método auxiliar
      const session = this.convertApiSessionToSession(apiSession, mentorName, mentorAvatar);

      const validatedSession = SessionSchema.parse(session);
      this.logger.info('Session rescheduled successfully', { sessionId: validatedSession.id });
      return validatedSession;
    } catch (error) {
      this.logger.error('Error rescheduling session', error as Error);
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
      
      // Busca informações do mentor para preencher mentorName e mentorAvatar
      let mentorName = 'Mentor Name';
      let mentorAvatar: string | null = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor';
      
      try {
        const mentorUrl = `${this.apiUrl}/mentors/${apiSession.mentorId}`;
        const mentorResponse = await fetch(mentorUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token.trim()}` : '',
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

      // Converte ApiSessionResponse para Session usando método auxiliar
      return this.convertApiSessionToSession(apiSession, mentorName, mentorAvatar);
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
      
      // Filtra por userId
      const userSessions = apiSessions.filter(s => s.menteeId === userId);
      
      // Otimização: busca mentores únicos apenas uma vez
      const uniqueMentorIds = [...new Set(userSessions.map(s => s.mentorId))];
      const mentorCache = new Map<string, { name: string; avatar: string | null }>();
      
      // Busca todos os mentores únicos em paralelo
      await Promise.all(
        uniqueMentorIds.map(async (mentorId) => {
          try {
            const mentorUrl = `${this.apiUrl}/mentors/${mentorId}`;
            const mentorResponse = await fetch(mentorUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.trim()}`,
              },
            });

            if (mentorResponse.ok) {
              const mentorData: any = await mentorResponse.json();
              mentorCache.set(mentorId, {
                name: mentorData.name || 'Mentor Name',
                avatar: mentorData.avatar || null,
              });
            } else {
              // Se falhar, usa valores padrão
              mentorCache.set(mentorId, {
                name: 'Mentor Name',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor',
              });
            }
          } catch (mentorError) {
            this.logger.warn('Could not fetch mentor data', mentorError as Error);
            // Usa valores padrão em caso de erro
            mentorCache.set(mentorId, {
              name: 'Mentor Name',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor',
            });
          }
        })
      );
      
      // Converte sessões usando o cache de mentores
      const sessions = userSessions.map((apiSession) => {
        const mentorInfo = mentorCache.get(apiSession.mentorId) || {
          name: 'Mentor Name',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor',
        };
        
        return this.convertApiSessionToSession(apiSession, mentorInfo.name, mentorInfo.avatar);
      });

      return sessions;
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
      
      // Otimização: busca mentores únicos apenas uma vez
      const uniqueMentorIds = [...new Set(apiSessions.map(s => s.mentorId))];
      const mentorCache = new Map<string, { name: string; avatar: string | null }>();
      
      // Busca todos os mentores únicos em paralelo
      await Promise.all(
        uniqueMentorIds.map(async (mentorId) => {
          try {
            const mentorUrl = `${this.apiUrl}/mentors/${mentorId}`;
            const mentorResponse = await fetch(mentorUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.trim()}`,
              },
            });

            if (mentorResponse.ok) {
              const mentorData: any = await mentorResponse.json();
              mentorCache.set(mentorId, {
                name: mentorData.name || 'Mentor Name',
                avatar: mentorData.avatar || null,
              });
            } else {
              // Se falhar, usa valores padrão
              mentorCache.set(mentorId, {
                name: 'Mentor Name',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor',
              });
            }
          } catch (mentorError) {
            this.logger.warn('Could not fetch mentor data', mentorError as Error);
            // Usa valores padrão em caso de erro
            mentorCache.set(mentorId, {
              name: 'Mentor Name',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor',
            });
          }
        })
      );
      
      // Converte sessões usando o cache de mentores
      const sessions = apiSessions.map((apiSession) => {
        const mentorInfo = mentorCache.get(apiSession.mentorId) || {
          name: 'Mentor Name',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor',
        };
        
        return this.convertApiSessionToSession(apiSession, mentorInfo.name, mentorInfo.avatar);
      });

      this.logger.info('Sessions fetched by admin successfully', { userId, count: sessions.length });
      return sessions;
    } catch (error) {
      this.logger.error('Error fetching sessions by admin', error as Error);
      throw error;
    }
  }

  async confirm(id: string, data?: { zoomLink?: string; zoomMeetingId?: string }): Promise<Session> {
    this.logger.debug('Confirming session', { id, ...data });

    try {
      const url = `${this.apiUrl}/sessions/${id}/confirm`;
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
        zoomLink?: string;
        zoomMeetingId?: string;
      } = {};

      if (data?.zoomLink) {
        requestBody.zoomLink = data.zoomLink;
      }

      if (data?.zoomMeetingId) {
        requestBody.zoomMeetingId = data.zoomMeetingId;
      }

      this.logger.debug('Confirming session', { url, id, hasZoomLink: !!data?.zoomLink });

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: Object.keys(requestBody).length > 0 ? JSON.stringify(requestBody) : undefined,
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.logger.error('Unauthorized - token invalid or expired');
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      if (response.status === 403) {
        this.logger.error('Forbidden - user does not have permission');
        throw new Error('Você não tem permissão para confirmar esta sessão.');
      }

      if (response.status === 404) {
        this.logger.error('Session not found', { id });
        throw new Error('Sessão não encontrada.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to confirm session', new Error(`HTTP ${response.status}: ${errorText}`));
        
        // Tenta extrair mensagem de erro mais amigável
        let errorMessage = `Erro ao confirmar sessão: ${response.status} ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMessage = errorJson.message;
          }
        } catch {
          // Se não conseguir parsear, usa a mensagem padrão
        }
        
        throw new Error(errorMessage);
      }

      const apiSession: ApiSessionResponse = await response.json();
      
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

      // Converte ApiSessionResponse para Session usando método auxiliar
      const session = this.convertApiSessionToSession(apiSession, mentorName, mentorAvatar);

      const validatedSession = SessionSchema.parse(session);
      this.logger.info('Session confirmed successfully', { sessionId: validatedSession.id });
      return validatedSession;
    } catch (error) {
      this.logger.error('Error confirming session', error as Error);
      throw error;
    }
  }

  async cancel(id: string): Promise<Session> {
    this.logger.debug('Canceling session', { id });

    try {
      const url = `${this.apiUrl}/sessions/${id}/cancel`;
      const token = localStorage.getItem('token');
      
      if (!token) {
        this.logger.error('No token found in localStorage');
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`,
      };

      this.logger.debug('Canceling session', { url, id });

      const response = await fetch(url, {
        method: 'PUT',
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
        throw new Error('Você não tem permissão para cancelar esta sessão.');
      }

      if (response.status === 404) {
        this.logger.error('Session not found', { id });
        throw new Error('Sessão não encontrada.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to cancel session', new Error(`HTTP ${response.status}: ${errorText}`));
        
        // Tenta extrair mensagem de erro mais amigável
        let errorMessage = `Erro ao cancelar sessão: ${response.status} ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMessage = errorJson.message;
          }
        } catch {
          // Se não conseguir parsear, usa a mensagem padrão
        }
        
        throw new Error(errorMessage);
      }

      const apiSession: ApiSessionResponse = await response.json();
      
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

      // Converte ApiSessionResponse para Session usando método auxiliar
      const session = this.convertApiSessionToSession(apiSession, mentorName, mentorAvatar);

      const validatedSession = SessionSchema.parse(session);
      this.logger.info('Session canceled successfully', { sessionId: validatedSession.id });
      return validatedSession;
    } catch (error) {
      this.logger.error('Error canceling session', error as Error);
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
      
      // Filtra por mentorId e converte para formato Session usando método auxiliar
      return apiSessions
        .filter(s => s.mentorId === mentorId)
        .map(apiSession => {
          // Para findByMentorId, não buscamos dados do mentor pois já temos o mentorId
          // Usa valores padrão ou pode buscar se necessário
          return this.convertApiSessionToSession(apiSession, 'Mentor Name', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor');
        });
    } catch (error) {
      this.logger.error('Error fetching sessions', error as Error);
      throw error;
    }
  }
}

