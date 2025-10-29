import { useState, useCallback, useEffect } from 'react'
import { User } from '../../domain/entities/User.entity'
import { container } from '../../shared/di/container'
import { UpdateUserData } from '../../domain/repositories/IAdminRepository'

interface UseUsersResult {
  users: User[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  updateUser: (userId: string, data: UpdateUserData) => Promise<User>
}

export const useUsers = (): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await container.adminRepository.getAllUsers()
      setUsers(data)
      
      container.logger.info('useUsers: Users fetched successfully', { count: data.length })
    } catch (err) {
      setError(err as Error)
      container.logger.error('useUsers: Failed to fetch users', err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUser = useCallback(async (userId: string, data: UpdateUserData): Promise<User> => {
    try {
      setLoading(true)
      setError(null)
      
      const updatedUser = await container.adminRepository.updateUser(userId, data)
      
      // Atualizar lista local
      setUsers(prev => prev.map(user => user.id === userId ? updatedUser : user))
      
      container.logger.info('useUsers: User updated successfully', { userId })
      return updatedUser
    } catch (err) {
      setError(err as Error)
      container.logger.error('useUsers: Failed to update user', err as Error, { userId })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    updateUser,
  }
}

