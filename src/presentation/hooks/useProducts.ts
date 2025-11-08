import { useState, useEffect, useCallback } from 'react'
import { Product } from '../../domain/entities/Product.entity'
import { container } from '../../shared/di/container'

interface UseProductsResult {
  products: Product[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export const useProducts = (eventId: string, activeOnly: boolean = true): UseProductsResult => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await container.listProductsByEventUseCase.execute(eventId, activeOnly)
      // Garantir que data seja sempre um array
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err as Error)
      container.logger.error('useProducts: Failed to fetch products', err as Error, { eventId, activeOnly })
      // Em caso de erro, manter o array vazio
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [eventId, activeOnly])

  useEffect(() => {
    if (eventId) {
      fetchProducts()
    }
  }, [fetchProducts, eventId])

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  }
}

