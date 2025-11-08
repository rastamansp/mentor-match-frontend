import { useState, useCallback } from 'react'
import { container } from '../../shared/di/container'

interface UseDeleteProductResult {
  loading: boolean
  error: Error | null
  deleteProduct: (id: string) => Promise<void>
}

export const useDeleteProduct = (): UseDeleteProductResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      await container.deleteProductUseCase.execute(id)

      container.logger.info('useDeleteProduct: Product deleted successfully', { productId: id })
    } catch (err) {
      setError(err as Error)
      container.logger.error('useDeleteProduct: Failed to delete product', err as Error, { productId: id })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    deleteProduct,
  }
}

