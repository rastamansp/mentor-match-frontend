import { useState, useCallback } from 'react'
import { container } from '../../shared/di/container'
import { ILogger } from '../../infrastructure/logging/ILogger'
import { ValidationResponse } from '../../domain/repositories/ITicketRepository'

interface UseValidateTicketResult {
  validate: (code: string, apiKey: string) => Promise<ValidationResponse | null>
  loading: boolean
  error: string | null
}

export const useValidateTicket = (): UseValidateTicketResult => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const logger: ILogger = container.logger

  const validate = useCallback(async (code: string, apiKey: string): Promise<ValidationResponse | null> => {
    setLoading(true)
    setError(null)
    
    try {
      logger.info('useValidateTicket: Starting validation', { code })
      
      // Validar ticket via repository
      const result = await container.ticketRepository.validateByCode(code, apiKey)
      
      logger.info('useValidateTicket: Validation completed', { 
        code,
        valid: result.valid 
      })
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao validar ingresso'
      setError(errorMessage)
      logger.error('useValidateTicket: Error during validation', err as Error, { code })
      return null
    } finally {
      setLoading(false)
    }
  }, [logger])

  return {
    validate,
    loading,
    error,
  }
}

