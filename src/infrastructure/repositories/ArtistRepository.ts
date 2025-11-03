import { IArtistRepository, ArtistFilters, CreateArtistData, UpdateArtistData, FetchSpotifyDataRequest } from '../../domain/repositories/IArtistRepository'
import { Artist } from '../../domain/entities/Artist.entity'
import { NotFoundError, NetworkError } from '../../domain/errors/DomainError'
import axios, { AxiosInstance } from 'axios'

export class ArtistRepository implements IArtistRepository {
  constructor(private readonly httpClient: AxiosInstance) {}

  async findAll(filters?: ArtistFilters): Promise<Artist[]> {
    try {
      const response = await this.httpClient.get('/artists', { params: filters })
      
      // Garantir que a resposta seja sempre um array
      const data = response.data
      if (Array.isArray(data)) {
        return data
      }
      
      // Se a resposta for um objeto com propriedade data ou artists, usar isso
      if (data && typeof data === 'object') {
        if (Array.isArray(data.data)) {
          return data.data
        }
        if (Array.isArray(data.artists)) {
          return data.artists
        }
      }
      
      // Se nada funcionar, retornar array vazio
      return []
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to fetch artists: ${error.message}`, error)
      }
      throw error
    }
  }

  async findById(id: string): Promise<Artist | null> {
    try {
      const response = await this.httpClient.get(`/artists/${id}`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError('Artist', id)
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to fetch artist: ${error.message}`, error)
      }
      throw error
    }
  }

  async create(data: CreateArtistData): Promise<Artist> {
    try {
      const response = await this.httpClient.post('/artists', data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to create artist: ${error.message}`, error)
      }
      throw error
    }
  }

  async update(id: string, data: UpdateArtistData): Promise<Artist> {
    try {
      const response = await this.httpClient.put(`/artists/${id}`, data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError('Artist', id)
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to update artist: ${error.message}`, error)
      }
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.httpClient.delete(`/artists/${id}`)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError('Artist', id)
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to delete artist: ${error.message}`, error)
      }
      throw error
    }
  }

  async fetchAndUpdateSpotifyData(data: FetchSpotifyDataRequest): Promise<void> {
    try {
      await this.httpClient.post('/artists/spotify/fetch-and-update', data)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to fetch and update Spotify data: ${error.message}`, error)
      }
      throw error
    }
  }
}

