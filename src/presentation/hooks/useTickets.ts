import { useState, useEffect, useCallback } from 'react'
import { Ticket } from '../../domain/entities/Ticket.entity'
import { container } from '../../shared/di/container'
import { TicketFilters } from '../../domain/repositories/ITicketRepository'

interface UseTicketsResult {
  tickets: Ticket[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export const useTickets = (filters?: TicketFilters): UseTicketsResult => {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await container.ticketRepository.findAll(filters)
      setTickets(data)
    } catch (err) {
      setError(err as Error)
      container.logger.error('useTickets: Failed to fetch tickets', err as Error, { filters })
    } finally {
      setLoading(false)
    }
  }, [filters?.userId, filters?.eventId, filters?.status])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  return {
    tickets,
    loading,
    error,
    refetch: fetchTickets,
  }
}
