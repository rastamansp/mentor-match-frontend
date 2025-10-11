import { useState, useCallback } from 'react'
import { Event } from '../../domain/entities/Event.entity'
import { container } from '../../shared/di/container'
import { CreateEventDto } from '../../application/dto/CreateEventDto'

interface UseCreateEventResult {
  loading: boolean
  error: Error | null
  createEvent: (data: CreateEventDto) => Promise<Event>
}

export const useCreateEvent = (): UseCreateEventResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createEvent = useCallback(async (data: CreateEventDto): Promise<Event> => {
    try {
      setLoading(true)
      setError(null)
      
      const event = await container.createEventUseCase.execute(data)
      
      container.logger.info('useCreateEvent: Event created successfully', { eventId: event.id })
      return event
    } catch (err) {
      setError(err as Error)
      container.logger.error('useCreateEvent: Failed to create event', err as Error, { title: data.title })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createEvent,
  }
}
