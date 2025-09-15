import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { EventsService } from '../events/events.service';
import { TicketsService } from '../tickets/tickets.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class AdminService {
  constructor(
    private usersService: UsersService,
    private eventsService: EventsService,
    private ticketsService: TicketsService,
    private paymentsService: PaymentsService,
  ) {}

  async getDashboardStats() {
    const users = await this.usersService.findAll();
    const events = await this.eventsService.findAll();
    const tickets = await this.ticketsService.findAll();
    const payments = await this.paymentsService.findAll();

    const paymentStats = await this.paymentsService.getPaymentStats();
    const ticketStats = await this.ticketsService.getTicketStats();

    return {
      users: {
        total: users.length,
        organizers: users.filter(u => u.role === 'ORGANIZER').length,
        customers: users.filter(u => u.role === 'USER').length,
      },
      events: {
        total: events.length,
        active: events.filter(e => e.status === 'ACTIVE').length,
        soldOut: events.filter(e => e.status === 'SOLD_OUT').length,
        cancelled: events.filter(e => e.status === 'CANCELLED').length,
      },
      tickets: ticketStats,
      payments: paymentStats,
      revenue: {
        total: paymentStats.totalAmount,
        thisMonth: this.calculateMonthlyRevenue(payments),
        growth: this.calculateGrowthRate(payments),
      },
    };
  }

  async getEventAnalytics(eventId: string) {
    const event = await this.eventsService.findById(eventId);
    if (!event) {
      throw new Error('Evento não encontrado');
    }

    const tickets = await this.ticketsService.findByEventId(eventId);
    const payments = await this.paymentsService.findAll();
    const eventPayments = payments.filter(p => 
      tickets.some(t => t.id === p.ticketId)
    );

    return {
      event,
      tickets: {
        total: tickets.length,
        active: tickets.filter(t => t.status === 'ACTIVE').length,
        used: tickets.filter(t => t.status === 'USED').length,
        cancelled: tickets.filter(t => t.status === 'CANCELLED').length,
      },
      revenue: {
        total: eventPayments
          .filter(p => p.status === 'APPROVED')
          .reduce((sum, p) => sum + p.amount, 0),
        byMethod: this.groupPaymentsByMethod(eventPayments),
      },
      attendance: {
        expected: tickets.filter(t => t.status === 'ACTIVE').length,
        actual: tickets.filter(t => t.status === 'USED').length,
        rate: tickets.filter(t => t.status === 'ACTIVE').length > 0 
          ? (tickets.filter(t => t.status === 'USED').length / tickets.filter(t => t.status === 'ACTIVE').length) * 100
          : 0,
      },
    };
  }

  async getUserAnalytics(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const tickets = await this.ticketsService.findByUserId(userId);
    const payments = await this.paymentsService.findByUserId(userId);

    return {
      user,
      tickets: {
        total: tickets.length,
        active: tickets.filter(t => t.status === 'ACTIVE').length,
        used: tickets.filter(t => t.status === 'USED').length,
        cancelled: tickets.filter(t => t.status === 'CANCELLED').length,
      },
      payments: {
        total: payments.length,
        approved: payments.filter(p => p.status === 'APPROVED').length,
        pending: payments.filter(p => p.status === 'PENDING').length,
        refunded: payments.filter(p => p.status === 'REFUNDED').length,
        totalAmount: payments
          .filter(p => p.status === 'APPROVED')
          .reduce((sum, p) => sum + p.amount, 0),
      },
      preferences: {
        categories: this.getUserCategoryPreferences(tickets),
        averageTicketPrice: tickets.length > 0 
          ? tickets.reduce((sum, t) => sum + t.price, 0) / tickets.length
          : 0,
      },
    };
  }

  private calculateMonthlyRevenue(payments: any[]): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return payments
      .filter(p => 
        p.status === 'APPROVED' && 
        p.approvedAt &&
        new Date(p.approvedAt).getMonth() === currentMonth &&
        new Date(p.approvedAt).getFullYear() === currentYear
      )
      .reduce((sum, p) => sum + p.amount, 0);
  }

  private calculateGrowthRate(payments: any[]): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentRevenue = this.calculateMonthlyRevenue(payments);
    const lastRevenue = payments
      .filter(p => 
        p.status === 'APPROVED' && 
        p.approvedAt &&
        new Date(p.approvedAt).getMonth() === lastMonth &&
        new Date(p.approvedAt).getFullYear() === lastMonthYear
      )
      .reduce((sum, p) => sum + p.amount, 0);

    return lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;
  }

  private groupPaymentsByMethod(payments: any[]): any {
    const grouped = payments
      .filter(p => p.status === 'APPROVED')
      .reduce((acc, payment) => {
        acc[payment.method] = (acc[payment.method] || 0) + payment.amount;
        return acc;
      }, {});

    return grouped;
  }

  private getUserCategoryPreferences(tickets: any[]): any {
    const eventIds = tickets.map(t => t.eventId);
    // Aqui seria necessário buscar os eventos para obter as categorias
    // Por simplicidade, retornamos um objeto vazio
    return {};
  }
}
