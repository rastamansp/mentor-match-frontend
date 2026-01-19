import { IAvailabilityRepository } from '@domain/repositories/IAvailabilityRepository';
import { Availability, AvailabilitySchema } from '@domain/entities/Availability.entity';
import { ILogger } from '../logging/Logger';

interface ApiAvailabilityResponse {
  id: string;
  mentorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class AvailabilityRepository implements IAvailabilityRepository {
  private readonly apiUrl: string;

  constructor(private readonly logger: ILogger) {
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';
  }

  async findByMentorId(mentorId: string): Promise<Availability[]> {
    this.logger.debug('Finding availability by mentor id', { mentorId });

    try {
      const url = `${this.apiUrl}/mentors/${mentorId}/availability`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to fetch availability', new Error(`HTTP ${response.status}: ${errorText}`));
        throw new Error(`Erro ao buscar disponibilidade: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      
      // Handle both array response and object with availability property
      const apiAvailabilities: ApiAvailabilityResponse[] = Array.isArray(responseData) 
        ? responseData 
        : (responseData.availability || []);

      // Mapeia e valida as disponibilidades (incluindo inativas para gerenciamento)
      const availabilities = apiAvailabilities.map((apiAv) => {
          const availability: Availability = {
            id: apiAv.id,
            mentorId: apiAv.mentorId,
            dayOfWeek: apiAv.dayOfWeek,
            startTime: apiAv.startTime,
            endTime: apiAv.endTime,
            timezone: apiAv.timezone,
            isActive: apiAv.isActive,
            createdAt: apiAv.createdAt,
            updatedAt: apiAv.updatedAt,
          };
          // Valida com Zod
          return AvailabilitySchema.parse(availability);
        });

      this.logger.info('Availability fetched successfully', { mentorId, count: availabilities.length });

      return availabilities;
    } catch (error) {
      this.logger.error('Error fetching availability', error as Error);
      throw error;
    }
  }

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token.trim()}`;
    }
    return headers;
  }

  async create(mentorId: string, dto: CreateAvailabilityDto): Promise<Availability> {
    this.logger.debug('Creating availability', { mentorId, dto });

    try {
      const url = `${this.apiUrl}/mentors/${mentorId}/availability`;

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to create availability', new Error(`HTTP ${response.status}: ${errorText}`));
        
        if (response.status === 401) {
          throw new Error('Não autenticado. Por favor, faça login novamente.');
        }
        if (response.status === 403) {
          throw new Error('Você não tem permissão para criar disponibilidade para este mentor.');
        }
        if (response.status === 404) {
          throw new Error('Mentor não encontrado.');
        }
        
        throw new Error(`Erro ao criar disponibilidade: ${response.status} ${response.statusText}`);
      }

      const apiAvailability: ApiAvailabilityResponse = await response.json();

      const availability: Availability = {
        id: apiAvailability.id,
        mentorId: apiAvailability.mentorId,
        dayOfWeek: apiAvailability.dayOfWeek,
        startTime: apiAvailability.startTime,
        endTime: apiAvailability.endTime,
        timezone: apiAvailability.timezone,
        isActive: apiAvailability.isActive,
        createdAt: apiAvailability.createdAt,
        updatedAt: apiAvailability.updatedAt,
      };

      const validated = AvailabilitySchema.parse(availability);
      this.logger.info('Availability created successfully', { mentorId, availabilityId: validated.id });

      return validated;
    } catch (error) {
      this.logger.error('Error creating availability', error as Error);
      throw error;
    }
  }

  async update(mentorId: string, availabilityId: string, dto: UpdateAvailabilityDto): Promise<Availability> {
    this.logger.debug('Updating availability', { mentorId, availabilityId, dto });

    try {
      const url = `${this.apiUrl}/mentors/${mentorId}/availability/${availabilityId}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to update availability', new Error(`HTTP ${response.status}: ${errorText}`));
        
        if (response.status === 401) {
          throw new Error('Não autenticado. Por favor, faça login novamente.');
        }
        if (response.status === 403) {
          throw new Error('Você não tem permissão para atualizar esta disponibilidade.');
        }
        if (response.status === 404) {
          throw new Error('Disponibilidade não encontrada.');
        }
        
        throw new Error(`Erro ao atualizar disponibilidade: ${response.status} ${response.statusText}`);
      }

      const apiAvailability: ApiAvailabilityResponse = await response.json();

      const availability: Availability = {
        id: apiAvailability.id,
        mentorId: apiAvailability.mentorId,
        dayOfWeek: apiAvailability.dayOfWeek,
        startTime: apiAvailability.startTime,
        endTime: apiAvailability.endTime,
        timezone: apiAvailability.timezone,
        isActive: apiAvailability.isActive,
        createdAt: apiAvailability.createdAt,
        updatedAt: apiAvailability.updatedAt,
      };

      const validated = AvailabilitySchema.parse(availability);
      this.logger.info('Availability updated successfully', { mentorId, availabilityId: validated.id });

      return validated;
    } catch (error) {
      this.logger.error('Error updating availability', error as Error);
      throw error;
    }
  }

  async delete(mentorId: string, availabilityId: string): Promise<void> {
    this.logger.debug('Deleting availability', { mentorId, availabilityId });

    try {
      const url = `${this.apiUrl}/mentors/${mentorId}/availability/${availabilityId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to delete availability', new Error(`HTTP ${response.status}: ${errorText}`));
        
        if (response.status === 401) {
          throw new Error('Não autenticado. Por favor, faça login novamente.');
        }
        if (response.status === 403) {
          throw new Error('Você não tem permissão para deletar esta disponibilidade.');
        }
        if (response.status === 404) {
          throw new Error('Disponibilidade não encontrada.');
        }
        
        throw new Error(`Erro ao deletar disponibilidade: ${response.status} ${response.statusText}`);
      }

      this.logger.info('Availability deleted successfully', { mentorId, availabilityId });
    } catch (error) {
      this.logger.error('Error deleting availability', error as Error);
      throw error;
    }
  }
}

