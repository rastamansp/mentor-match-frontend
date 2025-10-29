import { useState, useCallback } from 'react'
import { Event } from '../../domain/entities/Event.entity'
import { container } from '../../shared/di/container'
import { CreateEventDto } from '../../application/dto/CreateEventDto'

interface UseUpdateEventResult {
  loading: boolean
  error: Error | null
  updateEvent: (id: string, data: Partial<CreateEventDto>) => Promise<Event>
}

export const useUpdateEvent = (): UseUpdateEventResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateEvent = useCallback(async (id: string, data: Partial<CreateEventDto>): Promise<Event> => {
    try {
      setLoading(true)
      setError(null)
      
      const event = await container.eventRepository.update(id, data)
      
      container.logger.info('useUpdateEvent: Event updated successfully', { eventId: event.id })
      return event
    } catch (err) {
      setError(err as Error)
      container.logger.error('useUpdateEvent: Failed to update event', err as Error, { id, title: data.title })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    updateEvent,
  }
}

