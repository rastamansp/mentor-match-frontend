import { useState, useCallback } from 'react'
import { container } from '../../shared/di/container'

interface UseDeleteArtistResult {
  deleteArtist: (id: string) => Promise<void>
  loading: boolean
  error: Error | null
}

export const useDeleteArtist = (): UseDeleteArtistResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteArtist = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      await container.deleteArtistUseCase.execute(id)

      container.logger.info('useDeleteArtist: Artist deleted successfully', {
        artistId: id,
      })
    } catch (err) {
      const errorObj = err as Error
      setError(errorObj)
      container.logger.error('useDeleteArtist: Failed to delete artist', errorObj, {
        artistId: id,
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    deleteArtist,
    loading,
    error,
  }
}

