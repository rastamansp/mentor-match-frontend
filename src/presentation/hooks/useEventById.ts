import { useState, useEffect, useCallback } from 'react'
import { Event } from '../../domain/entities/Event.entity'
import { container } from '../../shared/di/container'

interface UseEventByIdResult {
  event: Event | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export const useEventById = (id: string): UseEventByIdResult => {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await container.getEventByIdUseCase.execute(id)
      setEvent(data)
    } catch (err) {
      setError(err as Error)
      container.logger.error('useEventById: Failed to fetch event', err as Error, { eventId: id })
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchEvent()
    }
  }, [fetchEvent])

  return {
    event,
    loading,
    error,
    refetch: fetchEvent,
  }
}
