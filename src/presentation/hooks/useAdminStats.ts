import { useState, useEffect, useCallback } from 'react'
import { DashboardStats } from '../../domain/repositories/IAdminRepository'
import { container } from '../../shared/di/container'

interface UseAdminStatsResult {
  stats: DashboardStats | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export const useAdminStats = (): UseAdminStatsResult => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await container.adminRepository.getDashboardStats()
      setStats(data)
    } catch (err) {
      setError(err as Error)
      container.logger.error('useAdminStats: Failed to fetch admin stats', err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  }
}
