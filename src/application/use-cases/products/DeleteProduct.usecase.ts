import { IProductRepository } from '../../../domain/repositories/IProductRepository'
import { NotFoundError } from '../../../domain/errors/DomainError'
import { ILogger } from '../../../infrastructure/logging/ILogger'

export class DeleteProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly logger: ILogger
  ) {}

  async execute(id: string): Promise<void> {
    try {
      this.logger.info('DeleteProductUseCase: Deleting product', { id })
      
      // Verificar se o produto existe
      const product = await this.productRepository.findById(id)
      if (!product) {
        throw new NotFoundError('Product', id)
      }
      
      await this.productRepository.delete(id)
      
      this.logger.info('DeleteProductUseCase: Product deleted successfully', { id })
    } catch (error) {
      this.logger.error('DeleteProductUseCase: Error deleting product', error as Error, { id })
      throw error
    }
  }
}

