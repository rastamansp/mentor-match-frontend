import { useState, useEffect, useCallback } from 'react'
import { Artist } from '../../domain/entities/Artist.entity'
import { container } from '../../shared/di/container'

interface UseArtistDetailResult {
  artist: Artist | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export const useArtistDetail = (id: string): UseArtistDetailResult => {
  const [artist, setArtist] = useState<Artist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchArtist = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await container.getArtistByIdUseCase.execute(id)
      setArtist(data)
    } catch (err) {
      setError(err as Error)
      container.logger.error('useArtistDetail: Failed to fetch artist', err as Error, { artistId: id })
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchArtist()
    }
  }, [fetchArtist])

  return {
    artist,
    loading,
    error,
    refetch: fetchArtist,
  }
}

