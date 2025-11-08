import { useState, useEffect, useCallback } from 'react'
import { Product } from '../../domain/entities/Product.entity'
import { container } from '../../shared/di/container'

interface UseProductDetailResult {
  product: Product | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export const useProductDetail = (id: string): UseProductDetailResult => {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProduct = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const data = await container.getProductByIdUseCase.execute(id)
      setProduct(data)
    } catch (err) {
      setError(err as Error)
      setProduct(null)
      container.logger.error('useProductDetail: Failed to fetch product', err as Error, { id })
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  return {
    product,
    loading,
    error,
    refetch: fetchProduct,
  }
}

