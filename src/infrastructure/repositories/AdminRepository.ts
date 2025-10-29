import { IAdminRepository, DashboardStats, EventAnalytics, UserAnalytics, UpdateUserData } from '../../domain/repositories/IAdminRepository'
import { User } from '../../domain/entities/User.entity'
import { NetworkError, NotFoundError } from '../../domain/errors/DomainError'
import axios, { AxiosInstance } from 'axios'

export class AdminRepository implements IAdminRepository {
  constructor(private readonly httpClient: AxiosInstance) {}

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await this.httpClient.get('/admin/dashboard')
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to get dashboard stats: ${error.message}`, error)
      }
      throw error
    }
  }

  async getEventAnalytics(eventId: string): Promise<EventAnalytics> {
    try {
      const response = await this.httpClient.get(`/admin/events/${eventId}/analytics`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to get event analytics: ${error.message}`, error)
      }
      throw error
    }
  }

  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    try {
      const response = await this.httpClient.get(`/admin/users/${userId}/analytics`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to get user analytics: ${error.message}`, error)
      }
      throw error
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await this.httpClient.get('/users')
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to get users: ${error.message}`, error)
      }
      throw error
    }
  }

  async updateUser(userId: string, data: UpdateUserData): Promise<User> {
    try {
      const response = await this.httpClient.put(`/users/${userId}`, data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError('User', userId)
      }
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to update user: ${error.message}`, error)
      }
      throw error
    }
  }
}
