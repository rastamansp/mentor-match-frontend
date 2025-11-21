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

      const apiAvailabilities: ApiAvailabilityResponse[] = await response.json();

      // Mapeia e valida as disponibilidades
      const availabilities = apiAvailabilities
        .filter(av => av.isActive) // Apenas disponibilidades ativas
        .map((apiAv) => {
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
}

