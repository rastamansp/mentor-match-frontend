import { Artist } from '../entities/Artist.entity'

export interface IArtistRepository {
  findAll(filters?: ArtistFilters): Promise<Artist[]>
  findById(id: string): Promise<Artist | null>
  create(data: CreateArtistData): Promise<Artist>
  update(id: string, data: UpdateArtistData): Promise<Artist>
  delete(id: string): Promise<void>
}

export interface ArtistFilters {
  genre?: string
  search?: string
}

export interface CreateArtistData {
  artisticName: string
  name?: string
  birthDate?: string
  biography?: string
  instagramUsername?: string
  youtubeUsername?: string
  xUsername?: string
  spotifyUsername?: string
  tiktokUsername?: string
  siteUrl?: string
  image?: string
}

export interface UpdateArtistData extends Partial<CreateArtistData> {}

