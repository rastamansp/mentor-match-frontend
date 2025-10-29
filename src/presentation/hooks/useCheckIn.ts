import { useState, useCallback } from 'react'
import { Ticket } from '../../domain/entities/Ticket.entity'
import { container } from '../../shared/di/container'
import { ILogger } from '../../infrastructure/logging/ILogger'

interface UseCheckInResult {
  checkIn: (ticketId: string) => Promise<Ticket | null>
  loading: boolean
  error: string | null
}

export const useCheckIn = (): UseCheckInResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const logger: ILogger = container.logger

  const checkIn = useCallback(async (ticketId: string): Promise<Ticket | null> => {
    setLoading(true)
    setError(null)
    
    try {
      logger.info('useCheckIn: Starting check-in', { ticketId })
      
      // Fazer check-in via repository
      const ticket = await container.ticketRepository.use(ticketId)
      
      logger.info('useCheckIn: Check-in completed successfully', { 
        ticketId,
        ticketStatus: ticket.status 
      })
      
      return ticket
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer check-in'
      setError(errorMessage)
      logger.error('useCheckIn: Error during check-in', err as Error, { ticketId })
      return null
    } finally {
      setLoading(false)
    }
  }, [logger])

  return {
    checkIn,
    loading,
    error,
  }
}

