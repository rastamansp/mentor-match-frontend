import { useState, useCallback } from 'react'
import { Ticket } from '../../domain/entities/Ticket.entity'
import { container } from '../../shared/di/container'
import { ILogger } from '../../infrastructure/logging/ILogger'
import { PurchaseTicketRequest } from '../../domain/repositories/ITicketRepository'

interface UsePurchaseTicketResult {
  purchaseTicket: (data: PurchaseTicketRequest) => Promise<Ticket[] | null>
  loading: boolean
  error: string | null
}

export const usePurchaseTicket = (): UsePurchaseTicketResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const logger: ILogger = container.logger

  const purchaseTicket = useCallback(async (data: PurchaseTicketRequest): Promise<Ticket[] | null> => {
    setLoading(true)
    setError(null)
    
    try {
      logger.info('usePurchaseTicket: Starting ticket purchase', { data })
      
      // Comprar ingressos via repository
      const tickets = await container.ticketRepository.buyTickets(data)
      
      logger.info('usePurchaseTicket: Ticket purchase completed successfully', { 
        ticketCount: tickets.length,
        eventId: data.eventId 
      })
      
      return tickets
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao comprar ingressos'
      setError(errorMessage)
      logger.error('usePurchaseTicket: Error purchasing ticket', err as Error, { data })
      return null
    } finally {
      setLoading(false)
    }
  }, [logger])

  return {
    purchaseTicket,
    loading,
    error,
  }
}
