import { useState, useCallback } from 'react'
import { Artist } from '../../domain/entities/Artist.entity'
import { container } from '../../shared/di/container'
import { CreateArtistDto } from '../../application/dto/CreateArtistDto'

interface UseUpdateArtistResult {
  loading: boolean
  error: Error | null
  updateArtist: (id: string, data: Partial<CreateArtistDto>) => Promise<Artist>
}

export const useUpdateArtist = (): UseUpdateArtistResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateArtist = useCallback(async (id: string, data: Partial<CreateArtistDto>): Promise<Artist> => {
    try {
      setLoading(true)
      setError(null)
      
      const artist = await container.updateArtistUseCase.execute(id, data)
      
      container.logger.info('useUpdateArtist: Artist updated successfully', { artistId: artist.id })
      return artist
    } catch (err) {
      setError(err as Error)
      container.logger.error('useUpdateArtist: Failed to update artist', err as Error, { id, artisticName: data.artisticName })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    updateArtist,
  }
}

