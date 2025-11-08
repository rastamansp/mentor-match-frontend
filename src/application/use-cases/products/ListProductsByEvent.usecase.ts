import { IProductRepository } from '../../../domain/repositories/IProductRepository'
import { Product } from '../../../domain/entities/Product.entity'
import { ILogger } from '../../../infrastructure/logging/ILogger'

export class ListProductsByEventUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly logger: ILogger
  ) {}

  async execute(eventId: string, activeOnly: boolean = true): Promise<Product[]> {
    try {
      this.logger.info('ListProductsByEventUseCase: Fetching products', { eventId, activeOnly })
      
      const products = await this.productRepository.findAllByEvent(eventId, activeOnly)
      
      // Garantir que sempre retorne um array
      const productsArray = Array.isArray(products) ? products : []
      
      this.logger.info('ListProductsByEventUseCase: Products fetched successfully', {
        eventId,
        count: productsArray.length
      })
      
      return productsArray
    } catch (error) {
      this.logger.error('ListProductsByEventUseCase: Error fetching products', error as Error, { eventId, activeOnly })
      throw error
    }
  }
}

