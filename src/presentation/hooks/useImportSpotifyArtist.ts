import { useState, useCallback } from 'react'
import { container } from '../../shared/di/container'

interface UseImportSpotifyArtistResult {
  loading: boolean
  error: Error | null
  importArtist: (spotifyUrl: string) => Promise<void>
}

export const useImportSpotifyArtist = (): UseImportSpotifyArtistResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const importArtist = useCallback(async (spotifyUrl: string) => {
    try {
      setLoading(true)
      setError(null)

      // Fazer chamada direta para o endpoint de importação
      // O backend espera apenas { spotifyUrl } para importação de novo artista
      await container.httpClient.post('/artists/spotify/fetch-and-update', {
        spotifyUrl,
      })

      container.logger.info('useImportSpotifyArtist: Artist imported from Spotify', {
        spotifyUrl,
      })
    } catch (err) {
      const errorObj = err as Error
      setError(errorObj)
      container.logger.error('useImportSpotifyArtist: Failed to import artist from Spotify', errorObj, {
        spotifyUrl,
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    importArtist,
  }
}

