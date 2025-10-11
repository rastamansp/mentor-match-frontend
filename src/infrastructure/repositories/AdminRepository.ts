import { IAdminRepository, DashboardStats, EventAnalytics, UserAnalytics } from '../../domain/repositories/IAdminRepository'
import { NetworkError } from '../../domain/errors/DomainError'
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
}
