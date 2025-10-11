import { useState, useEffect, useCallback } from 'react'
import { Event } from '../../domain/entities/Event.entity'
import { Ticket } from '../../domain/entities/Ticket.entity'
import { Payment } from '../../domain/entities/Payment.entity'
import { container } from '../../shared/di/container'
import { ILogger } from '../../infrastructure/logging/ILogger'

interface DashboardData {
  events: Event[]
  tickets: Ticket[]
  payments: Payment[]
}

interface UseDashboardDataResult {
  data: DashboardData
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export const useDashboardData = (userId?: string): UseDashboardDataResult => {
  const [data, setData] = useState<DashboardData>({
    events: [],
    tickets: [],
    payments: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const logger: ILogger = container.logger

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      logger.info('useDashboardData: Fetching dashboard data', { userId })
      
      const [events, tickets, payments] = await Promise.all([
        container.listEventsUseCase.execute(),
        container.ticketRepository.findAll({ userId }),
        container.paymentRepository.findAll({ userId })
      ])
      
      setData({ events, tickets, payments })
      logger.info('useDashboardData: Dashboard data fetched successfully', { 
        eventsCount: events.length,
        ticketsCount: tickets.length,
        paymentsCount: payments.length
      })
    } catch (err) {
      setError(err as Error)
      logger.error('useDashboardData: Error fetching dashboard data', err as Error, { userId })
    } finally {
      setLoading(false)
    }
  }, [userId, logger])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}
