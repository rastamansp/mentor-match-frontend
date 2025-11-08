import { useState, useCallback } from 'react'
import { Product } from '../../domain/entities/Product.entity'
import { container } from '../../shared/di/container'
import { CreateProductDto } from '../../application/dto/CreateProductDto'

interface UseCreateProductResult {
  loading: boolean
  error: Error | null
  createProduct: (data: CreateProductDto) => Promise<Product>
}

export const useCreateProduct = (): UseCreateProductResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createProduct = useCallback(async (data: CreateProductDto): Promise<Product> => {
    try {
      setLoading(true)
      setError(null)
      
      const product = await container.createProductUseCase.execute(data)
      
      container.logger.info('useCreateProduct: Product created successfully', { productId: product.id })
      return product
    } catch (err) {
      setError(err as Error)
      container.logger.error('useCreateProduct: Failed to create product', err as Error, { eventId: data.eventId, name: data.name })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createProduct,
  }
}

