import { useState, useCallback } from 'react'
import { container } from '../../shared/di/container'

interface UseFetchSpotifyDataResult {
  loading: boolean
  error: Error | null
  fetchAndUpdate: (spotifyUsername: string, artistId: string) => Promise<void>
}

export const useFetchSpotifyData = (): UseFetchSpotifyDataResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchAndUpdate = useCallback(async (spotifyUsername: string, artistId: string) => {
    try {
      setLoading(true)
      setError(null)

      // Construir URL do Spotify a partir do username
      const spotifyUrl = `https://open.spotify.com/artist/${spotifyUsername}`

      await container.artistRepository.fetchAndUpdateSpotifyData({
        spotifyUrl,
        artistId,
      })

      container.logger.info('useFetchSpotifyData: Spotify data fetch requested', {
        artistId,
        spotifyUsername,
      })
    } catch (err) {
      const errorObj = err as Error
      setError(errorObj)
      container.logger.error('useFetchSpotifyData: Failed to fetch Spotify data', errorObj, {
        artistId,
        spotifyUsername,
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    fetchAndUpdate,
  }
}

