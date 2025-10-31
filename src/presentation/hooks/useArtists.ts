import { useState, useEffect, useCallback } from 'react'
import { Artist } from '../../domain/entities/Artist.entity'
import { container } from '../../shared/di/container'
import { ArtistFilters } from '../../domain/repositories/IArtistRepository'

interface UseArtistsResult {
  artists: Artist[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export const useArtists = (filters?: ArtistFilters): UseArtistsResult => {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchArtists = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await container.listArtistsUseCase.execute(filters)
      // Garantir que data seja sempre um array
      setArtists(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err as Error)
      container.logger.error('useArtists: Failed to fetch artists', err as Error, { filters })
      // Em caso de erro, manter o array vazio
      setArtists([])
    } finally {
      setLoading(false)
    }
  }, [filters?.genre, filters?.search])

  useEffect(() => {
    fetchArtists()
  }, [fetchArtists])

  return {
    artists,
    loading,
    error,
    refetch: fetchArtists,
  }
}

