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
      
      console.log('🎫 useTickets.fetchTickets - Filtros:', filters)
      
      // Se não há filtros específicos, buscar meus tickets
      const data = filters?.userId 
        ? await container.ticketRepository.findAll(filters)
        : await container.ticketRepository.findMyTickets()
      
      console.log('🎫 useTickets.fetchTickets - Tickets recebidos:', data)
      console.log('🎫 useTickets.fetchTickets - Tipo:', typeof data)
      console.log('🎫 useTickets.fetchTickets - É array?', Array.isArray(data))
      
      // Garantir que temos um array
      const ticketsArray = Array.isArray(data) ? data : []
      console.log('🎫 useTickets.fetchTickets - Quantidade de tickets:', ticketsArray.length)
      
      setTickets(ticketsArray)
    } catch (err) {
      console.error('❌ useTickets.fetchTickets - Erro:', err)
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
