import axios from 'axios'
import { User, Event, Ticket, Payment, TicketCategory, LoginData, RegisterData } from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para lidar com respostas de erro
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data)
    return response.data
  },
  
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data
  },
}

// Events API
export const eventsApi = {
  getAll: async (params?: { category?: string; city?: string }) => {
    const response = await api.get('/events', { params })
    return response.data
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/events/${id}`)
    return response.data
  },
  
  create: async (data: Partial<Event>) => {
    const response = await api.post('/events', data)
    return response.data
  },
  
  update: async (id: string, data: Partial<Event>) => {
    const response = await api.put(`/events/${id}`, data)
    return response.data
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/events/${id}`)
    return response.data
  },
  
  getTicketCategories: async (eventId: string) => {
    const response = await api.get(`/events/${eventId}/ticket-categories`)
    return response.data
  },
  
  createTicketCategory: async (eventId: string, data: Partial<TicketCategory>) => {
    const response = await api.post(`/events/${eventId}/ticket-categories`, data)
    return response.data
  },
}

// Tickets API
export const ticketsApi = {
  getAll: async (params?: { userId?: string; eventId?: string }) => {
    const response = await api.get('/tickets', { params })
    return response.data
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/tickets/${id}`)
    return response.data
  },
  
  create: async (data: Partial<Ticket>) => {
    const response = await api.post('/tickets', data)
    return response.data
  },
  
  validate: async (id: string, qrCodeData: string) => {
    const response = await api.post(`/tickets/${id}/validate`, { qrCodeData })
    return response.data
  },
  
  use: async (id: string) => {
    const response = await api.put(`/tickets/${id}/use`)
    return response.data
  },
  
  transfer: async (id: string, transferData: any) => {
    const response = await api.put(`/tickets/${id}/transfer`, transferData)
    return response.data
  },
  
  cancel: async (id: string) => {
    const response = await api.put(`/tickets/${id}/cancel`)
    return response.data
  },
  
  getStats: async (eventId?: string) => {
    const response = await api.get('/tickets/stats', { params: { eventId } })
    return response.data
  },
}

// Payments API
export const paymentsApi = {
  getAll: async (params?: { userId?: string; ticketId?: string }) => {
    const response = await api.get('/payments', { params })
    return response.data
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/payments/${id}`)
    return response.data
  },
  
  create: async (data: Partial<Payment>) => {
    const response = await api.post('/payments', data)
    return response.data
  },
  
  approve: async (id: string) => {
    const response = await api.put(`/payments/${id}/approve`)
    return response.data
  },
  
  reject: async (id: string) => {
    const response = await api.put(`/payments/${id}/reject`)
    return response.data
  },
  
  refund: async (id: string) => {
    const response = await api.put(`/payments/${id}/refund`)
    return response.data
  },
  
  getStats: async () => {
    const response = await api.get('/payments/stats')
    return response.data
  },
}

// Admin API
export const adminApi = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard')
    return response.data
  },
  
  getEventAnalytics: async (eventId: string) => {
    const response = await api.get(`/admin/events/${eventId}/analytics`)
    return response.data
  },
  
  getUserAnalytics: async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}/analytics`)
    return response.data
  },
}

export default api
