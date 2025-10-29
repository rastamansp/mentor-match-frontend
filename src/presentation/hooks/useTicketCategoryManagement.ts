import { useState, useCallback } from 'react'
import { TicketCategory } from '../../domain/entities/Ticket.entity'
import { container } from '../../shared/di/container'
import { CreateTicketCategoryData, UpdateTicketCategoryData } from '../../domain/repositories/IEventRepository'

interface UseTicketCategoryManagementResult {
  createCategory: (eventId: string, data: CreateTicketCategoryData) => Promise<TicketCategory>
  updateCategory: (categoryId: string, data: UpdateTicketCategoryData) => Promise<TicketCategory>
  deleteCategory: (categoryId: string) => Promise<void>
  loading: boolean
  error: Error | null
}

export const useTicketCategoryManagement = (): UseTicketCategoryManagementResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createCategory = useCallback(async (eventId: string, data: CreateTicketCategoryData): Promise<TicketCategory> => {
    try {
      setLoading(true)
      setError(null)
      
      const category = await container.eventRepository.createTicketCategory(eventId, data)
      
      container.logger.info('useTicketCategoryManagement: Category created successfully', { 
        categoryId: category.id,
        eventId 
      })
      return category
    } catch (err) {
      setError(err as Error)
      container.logger.error('useTicketCategoryManagement: Failed to create category', err as Error, { eventId })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateCategory = useCallback(async (categoryId: string, data: UpdateTicketCategoryData): Promise<TicketCategory> => {
    try {
      setLoading(true)
      setError(null)
      
      const category = await container.eventRepository.updateTicketCategory(categoryId, data)
      
      container.logger.info('useTicketCategoryManagement: Category updated successfully', { 
        categoryId
      })
      return category
    } catch (err) {
      setError(err as Error)
      container.logger.error('useTicketCategoryManagement: Failed to update category', err as Error, { categoryId })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteCategory = useCallback(async (categoryId: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      await container.eventRepository.deleteTicketCategory(categoryId)
      
      container.logger.info('useTicketCategoryManagement: Category deleted successfully', { 
        categoryId
      })
    } catch (err) {
      setError(err as Error)
      container.logger.error('useTicketCategoryManagement: Failed to delete category', err as Error, { categoryId })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    loading,
    error,
  }
}

