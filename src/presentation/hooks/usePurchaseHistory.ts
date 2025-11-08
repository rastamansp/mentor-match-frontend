import { useState, useEffect, useCallback } from 'react'
import { container } from '../../shared/di/container'
import { PurchaseHistory } from '../../application/use-cases/purchases/GetPurchaseHistory.usecase'

interface UsePurchaseHistoryResult {
  history: PurchaseHistory | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export const usePurchaseHistory = (userId: string | undefined): UsePurchaseHistoryResult => {
  const [history, setHistory] = useState<PurchaseHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const data = await container.getPurchaseHistoryUseCase.execute(userId)
      setHistory(data)
    } catch (err) {
      setError(err as Error)
      container.logger.error('usePurchaseHistory: Failed to fetch purchase history', err as Error, { userId })
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return {
    history,
    loading,
    error,
    refetch: fetchHistory,
  }
}

