import { IProductRepository } from '../../../domain/repositories/IProductRepository'
import { Product } from '../../../domain/entities/Product.entity'
import { CreateProductDto, CreateProductDtoSchema } from '../../dto/CreateProductDto'
import { NotFoundError, ValidationError } from '../../../domain/errors/DomainError'
import { ILogger } from '../../../infrastructure/logging/ILogger'

export class UpdateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly logger: ILogger
  ) {}

  async execute(id: string, data: Partial<CreateProductDto>): Promise<Product> {
    try {
      // Validar dados parciais com Zod (tornando campos opcionais)
      // Remover eventId do schema parcial pois não pode ser atualizado
      const { eventId, ...updateData } = data
      const partialSchema = CreateProductDtoSchema.omit({ eventId: true }).partial()
      const validationResult = partialSchema.safeParse(updateData)
      
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ')
        throw new ValidationError(`Dados inválidos: ${errors}`)
      }

      this.logger.info('UpdateProductUseCase: Updating product', { id })
      
      // Verificar se o produto existe
      const existingProduct = await this.productRepository.findById(id)
      if (!existingProduct) {
        throw new NotFoundError('Product', id)
      }
      
      const updatedProduct = await this.productRepository.update(id, validationResult.data)
      
      this.logger.info('UpdateProductUseCase: Product updated successfully', { id })
      
      return updatedProduct
    } catch (error) {
      this.logger.error('UpdateProductUseCase: Error updating product', error as Error, { id })
      throw error
    }
  }
}

