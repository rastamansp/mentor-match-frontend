export interface IAdminRepository {
  getDashboardStats(): Promise<DashboardStats>
  getEventAnalytics(eventId: string): Promise<EventAnalytics>
  getUserAnalytics(userId: string): Promise<UserAnalytics>
}

export interface DashboardStats {
  totalUsers: number
  totalEvents: number
  totalTickets: number
  totalRevenue: number
  activeEvents: number
  soldOutEvents: number
  pendingPayments: number
  monthlyRevenue: number
  userGrowth: number
  eventGrowth: number
}

export interface EventAnalytics {
  eventId: string
  eventTitle: string
  totalTickets: number
  soldTickets: number
  revenue: number
  attendanceRate: number
  categoryBreakdown: Record<string, number>
  salesOverTime: Array<{ date: string; sales: number }>
}

export interface UserAnalytics {
  userId: string
  userName: string
  totalEvents: number
  totalTickets: number
  totalSpent: number
  favoriteCategories: string[]
  lastActivity: string
}
