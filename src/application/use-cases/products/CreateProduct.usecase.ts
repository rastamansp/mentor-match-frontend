import { IProductRepository } from '../../../domain/repositories/IProductRepository'
import { Product } from '../../../domain/entities/Product.entity'
import { CreateProductDto, CreateProductDtoSchema } from '../../dto/CreateProductDto'
import { ValidationError } from '../../../domain/errors/DomainError'
import { ILogger } from '../../../infrastructure/logging/ILogger'

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly logger: ILogger
  ) {}

  async execute(data: CreateProductDto): Promise<Product> {
    try {
      // Validar dados com Zod
      const validationResult = CreateProductDtoSchema.safeParse(data)
      
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ')
        throw new ValidationError(`Dados inválidos: ${errors}`)
      }

      this.logger.info('CreateProductUseCase: Creating product', { eventId: data.eventId, name: data.name })
      
      const product = await this.productRepository.create(validationResult.data)
      
      this.logger.info('CreateProductUseCase: Product created successfully', {
        productId: product.id,
        eventId: product.eventId
      })
      
      return product
    } catch (error) {
      this.logger.error('CreateProductUseCase: Error creating product', error as Error, { eventId: data.eventId, name: data.name })
      throw error
    }
  }
}

