import { IProductRepository, CreateProductData, UpdateProductData } from '../../domain/repositories/IProductRepository'
import { Product } from '../../domain/entities/Product.entity'
import { NotFoundError, NetworkError } from '../../domain/errors/DomainError'
import axios, { AxiosInstance } from 'axios'

export class ProductRepository implements IProductRepository {
  constructor(private readonly httpClient: AxiosInstance) {}

  async findAllByEvent(eventId: string, activeOnly: boolean = true): Promise<Product[]> {
    try {
      const response = await this.httpClient.get(`/products/event/${eventId}`, {
        params: { activeOnly }
      })
      
      // Garantir que a resposta seja sempre um array
      const data = response.data
      if (Array.isArray(data)) {
        return data
      }
      
      // Se a resposta for um objeto com propriedade data ou products, usar isso
      if (data && typeof data === 'object') {
        if (Array.isArray(data.data)) {
          return data.data
        }
        if (Array.isArray(data.products)) {
          return data.products
        }
      }
      
      // Se nada funcionar, retornar array vazio
      return []
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to fetch products: ${error.message}`, error)
      }
      throw error
    }
  }

  async findById(id: string): Promise<Product | null> {
    try {
      const response = await this.httpClient.get(`/products/${id}`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError('Product', id)
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to fetch product: ${error.message}`, error)
      }
      throw error
    }
  }

  async create(data: CreateProductData): Promise<Product> {
    try {
      const response = await this.httpClient.post('/products', data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to create product: ${error.message}`, error)
      }
      throw error
    }
  }

  async update(id: string, data: UpdateProductData): Promise<Product> {
    try {
      const response = await this.httpClient.put(`/products/${id}`, data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError('Product', id)
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to update product: ${error.message}`, error)
      }
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.httpClient.delete(`/products/${id}`)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError('Product', id)
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to delete product: ${error.message}`, error)
      }
      throw error
    }
  }
}

