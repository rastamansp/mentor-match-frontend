import { IMentorRepository, MentorFilters } from '@domain/repositories/IMentorRepository';
import { Mentor, MentorSchema } from '@domain/entities/Mentor.entity';
import { NotFoundError } from '@domain/errors/NotFoundError';
import { ILogger } from '../logging/Logger';
import { UpdateMentorDto } from '@application/dto/UpdateMentorDto';

interface ApiMentorResponse {
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
  areas: string[];
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
}

export class MentorRepository implements IMentorRepository {
  private readonly apiUrl: string;

  constructor(private readonly logger: ILogger) {
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';
  }

  private mapApiMentorToMentor(apiMentor: ApiMentorResponse): Mentor {
    return {
      id: apiMentor.id,
      name: apiMentor.name,
      email: apiMentor.email,
      role: apiMentor.role,
      company: apiMentor.company,
      specialty: apiMentor.specialty,
      phone: apiMentor.phone,
      whatsappNumber: apiMentor.whatsappNumber,
      bio: apiMentor.bio,
      location: apiMentor.location,
      avatar: apiMentor.avatar,
      areas: apiMentor.areas,
      skills: apiMentor.skills,
      languages: apiMentor.languages,
      achievements: apiMentor.achievements,
      experience: apiMentor.experience,
      pricePerHour: apiMentor.pricePerHour,
      price: apiMentor.pricePerHour, // Compatibilidade
      status: apiMentor.status,
      rating: apiMentor.rating,
      reviews: apiMentor.reviews,
      totalSessions: apiMentor.totalSessions,
      createdAt: apiMentor.createdAt,
      updatedAt: apiMentor.updatedAt,
    };
  }

  private buildQueryParams(filters?: MentorFilters): string {
    if (!filters) return '';

    const params = new URLSearchParams();

    if (filters.area) {
      params.append('area', filters.area);
    }

    if (filters.language) {
      params.append('language', filters.language);
    }

    if (filters.maxPrice !== undefined) {
      params.append('maxPrice', filters.maxPrice.toString());
    }

    if (filters.minRating !== undefined) {
      params.append('minRating', filters.minRating.toString());
    }

    if (filters.specialty) {
      params.append('specialty', filters.specialty);
    }

    if (filters.location) {
      params.append('location', filters.location);
    }

    if (filters.searchTerm) {
      params.append('search', filters.searchTerm);
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  async findAll(filters?: MentorFilters): Promise<Mentor[]> {
    this.logger.debug('Finding all mentors', filters);

    try {
      const queryParams = this.buildQueryParams(filters);
      const url = `${this.apiUrl}/mentors${queryParams}`;

      this.logger.debug('Fetching mentors from API', { url });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to fetch mentors', new Error(`HTTP ${response.status}: ${errorText}`));
        throw new Error(`Erro ao buscar mentores: ${response.status} ${response.statusText}`);
      }

      const apiMentors: ApiMentorResponse[] = await response.json();

      // Mapeia e valida os mentores
      const mentors = apiMentors.map((apiMentor) => {
        const mentor = this.mapApiMentorToMentor(apiMentor);
        // Valida com Zod
        return MentorSchema.parse(mentor);
      });

      this.logger.info('Mentors fetched successfully', { count: mentors.length });

      return mentors;
    } catch (error) {
      this.logger.error('Error fetching mentors', error as Error);
      throw error;
    }
  }

  async findById(id: string): Promise<Mentor | null> {
    this.logger.debug('Finding mentor by id', { id });

    try {
      const url = `${this.apiUrl}/mentors/${id}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to fetch mentor', new Error(`HTTP ${response.status}: ${errorText}`));
        throw new Error(`Erro ao buscar mentor: ${response.status} ${response.statusText}`);
      }

      const apiMentor: ApiMentorResponse = await response.json();
      const mentor = this.mapApiMentorToMentor(apiMentor);
      const validatedMentor = MentorSchema.parse(mentor);

      this.logger.info('Mentor fetched successfully', { id });

      return validatedMentor;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      this.logger.error('Error fetching mentor', error as Error);
      throw error;
    }
  }

  async search(query: string): Promise<Mentor[]> {
    this.logger.debug('Searching mentors', { query });
    return this.findAll({ searchTerm: query });
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

  async update(id: string, dto: UpdateMentorDto): Promise<Mentor> {
    this.logger.debug('Updating mentor', { id, dto });

    try {
      const url = `${this.apiUrl}/mentors/${id}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Failed to update mentor', new Error(`HTTP ${response.status}: ${errorText}`));
        
        if (response.status === 401) {
          throw new Error('Não autenticado. Por favor, faça login novamente.');
        }
        if (response.status === 403) {
          throw new Error('Você não tem permissão para atualizar este mentor.');
        }
        if (response.status === 404) {
          throw new Error('Mentor não encontrado.');
        }
        
        throw new Error(`Erro ao atualizar mentor: ${response.status} ${response.statusText}`);
      }

      const apiMentor: ApiMentorResponse = await response.json();
      const mentor = this.mapApiMentorToMentor(apiMentor);
      const validatedMentor = MentorSchema.parse(mentor);

      this.logger.info('Mentor updated successfully', { id });

      return validatedMentor;
    } catch (error) {
      this.logger.error('Error updating mentor', error as Error);
      throw error;
    }
  }
}

