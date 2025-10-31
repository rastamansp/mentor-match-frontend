import { useState, useCallback } from 'react'
import { Artist } from '../../domain/entities/Artist.entity'
import { container } from '../../shared/di/container'
import { CreateArtistDto } from '../../application/dto/CreateArtistDto'

interface UseCreateArtistResult {
  loading: boolean
  error: Error | null
  createArtist: (data: CreateArtistDto) => Promise<Artist>
}

export const useCreateArtist = (): UseCreateArtistResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createArtist = useCallback(async (data: CreateArtistDto): Promise<Artist> => {
    try {
      setLoading(true)
      setError(null)
      
      const artist = await container.createArtistUseCase.execute(data)
      
      container.logger.info('useCreateArtist: Artist created successfully', { artistId: artist.id })
      return artist
    } catch (err) {
      setError(err as Error)
      container.logger.error('useCreateArtist: Failed to create artist', err as Error, { artisticName: data.artisticName })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createArtist,
  }
}

