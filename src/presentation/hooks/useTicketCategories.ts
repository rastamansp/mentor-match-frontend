import { useState, useEffect, useCallback } from 'react'
import { TicketCategory } from '../../domain/entities/Ticket.entity'
import { container } from '../../shared/di/container'

interface UseTicketCategoriesResult {
  categories: TicketCategory[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export const useTicketCategories = (eventId: string): UseTicketCategoriesResult => {
  const [categories, setCategories] = useState<TicketCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCategories = useCallback(async () => {
    if (!eventId) {
      setCategories([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const data = await container.eventRepository.getTicketCategories(eventId)
      setCategories(data)
    } catch (err) {
      setError(err as Error)
      container.logger.error('useTicketCategories: Failed to fetch categories', err as Error, { eventId })
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  }
}

