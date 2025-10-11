import { useState, useEffect, useCallback } from 'react'
import { Payment } from '../../domain/entities/Payment.entity'
import { container } from '../../shared/di/container'
import { PaymentFilters } from '../../domain/repositories/IPaymentRepository'

interface UsePaymentsResult {
  payments: Payment[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export const usePayments = (filters?: PaymentFilters): UsePaymentsResult => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await container.paymentRepository.findAll(filters)
      setPayments(data)
    } catch (err) {
      setError(err as Error)
      container.logger.error('usePayments: Failed to fetch payments', err as Error, { filters })
    } finally {
      setLoading(false)
    }
  }, [filters?.userId, filters?.ticketId, filters?.status])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  return {
    payments,
    loading,
    error,
    refetch: fetchPayments,
  }
}
