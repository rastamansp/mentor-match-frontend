import { useState, useEffect, useCallback } from 'react'
import { Event } from '../../domain/entities/Event.entity'
import { container } from '../../shared/di/container'
import { EventFilters } from '../../domain/repositories/IEventRepository'

interface UseEventsResult {
  events: Event[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export const useEvents = (filters?: EventFilters): UseEventsResult => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await container.listEventsUseCase.execute(filters)
      setEvents(data)
    } catch (err) {
      setError(err as Error)
      container.logger.error('useEvents: Failed to fetch events', err as Error, { filters })
    } finally {
      setLoading(false)
    }
  }, [filters?.category, filters?.city, filters?.status, filters?.search])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
  }
}
