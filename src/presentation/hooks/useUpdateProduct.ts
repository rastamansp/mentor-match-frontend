import { useState, useCallback } from 'react'
import { Product } from '../../domain/entities/Product.entity'
import { container } from '../../shared/di/container'
import { CreateProductDto } from '../../application/dto/CreateProductDto'

interface UseUpdateProductResult {
  loading: boolean
  error: Error | null
  updateProduct: (id: string, data: Partial<CreateProductDto>) => Promise<Product>
}

export const useUpdateProduct = (): UseUpdateProductResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateProduct = useCallback(async (id: string, data: Partial<CreateProductDto>): Promise<Product> => {
    try {
      setLoading(true)
      setError(null)
      
      const product = await container.updateProductUseCase.execute(id, data)
      
      container.logger.info('useUpdateProduct: Product updated successfully', { productId: product.id })
      return product
    } catch (err) {
      setError(err as Error)
      container.logger.error('useUpdateProduct: Failed to update product', err as Error, { id })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    updateProduct,
  }
}

