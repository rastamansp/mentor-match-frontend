import { IProductRepository } from '../../../domain/repositories/IProductRepository'
import { Product } from '../../../domain/entities/Product.entity'
import { NotFoundError } from '../../../domain/errors/DomainError'
import { ILogger } from '../../../infrastructure/logging/ILogger'

export class GetProductByIdUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly logger: ILogger
  ) {}

  async execute(id: string): Promise<Product> {
    try {
      this.logger.info('GetProductByIdUseCase: Fetching product', { id })
      
      const product = await this.productRepository.findById(id)
      
      if (!product) {
        throw new NotFoundError('Product', id)
      }
      
      this.logger.info('GetProductByIdUseCase: Product fetched successfully', { id })
      
      return product
    } catch (error) {
      this.logger.error('GetProductByIdUseCase: Error fetching product', error as Error, { id })
      throw error
    }
  }
}

