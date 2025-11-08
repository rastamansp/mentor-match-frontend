import { ITicketRepository } from '../../../domain/repositories/ITicketRepository'
import { IPaymentRepository } from '../../../domain/repositories/IPaymentRepository'
import { IProductOrderRepository } from '../../../domain/repositories/IProductOrderRepository'
import { Ticket } from '../../../domain/entities/Ticket.entity'
import { Payment } from '../../../domain/entities/Payment.entity'
import { ProductOrder } from '../../../domain/entities/ProductOrder.entity'
import { ILogger } from '../../../infrastructure/logging/ILogger'

export interface PurchaseOrder {
  orderId: string
  purchaseDate: string
  event: {
    id: string
    title: string
    date: string
    location: string
    image?: string
  }
  tickets: Ticket[]
  products: ProductOrder[]
  payment?: Payment
  total: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED' | 'UNKNOWN'
  ticketStatus: 'ACTIVE' | 'USED' | 'CANCELLED' | 'MIXED'
}

export interface PurchaseHistory {
  orders: PurchaseOrder[]
  statistics: {
    totalSpent: number
    totalTickets: number
    upcomingEvents: number
    pastEvents: number
  }
}

export class GetPurchaseHistoryUseCase {
  constructor(
    private readonly ticketRepository: ITicketRepository,
    private readonly paymentRepository: IPaymentRepository,
    private readonly productOrderRepository: IProductOrderRepository,
    private readonly logger: ILogger
  ) {}

  async execute(userId: string): Promise<PurchaseHistory> {
    try {
      this.logger.info('GetPurchaseHistoryUseCase: Fetching purchase history', { userId })

      // Buscar tickets e pagamentos em paralelo
      const [tickets, payments] = await Promise.all([
        this.ticketRepository.findMyTickets(),
        this.paymentRepository.findAll({ userId })
      ])

      // Coletar eventos únicos dos tickets
      const uniqueEventIds = new Set<string>()
      tickets.forEach(ticket => {
        uniqueEventIds.add(ticket.eventId)
      })

      // Buscar produtos comprados para cada evento
      const productOrdersPromises = Array.from(uniqueEventIds).map(eventId =>
        this.productOrderRepository.findByEventId(eventId, userId).catch(() => {
          // Se o endpoint não existir ou der erro, retornar array vazio
          this.logger.info('GetPurchaseHistoryUseCase: Product orders not available for event', { eventId })
          return []
        })
      )

      const productOrdersArrays = await Promise.all(productOrdersPromises)
      const productOrders = productOrdersArrays.flat()

      this.logger.info('GetPurchaseHistoryUseCase: Data fetched', {
        ticketsCount: tickets.length,
        paymentsCount: payments.length,
        productOrdersCount: productOrders.length,
        eventsCount: uniqueEventIds.size
      })

      // Criar mapa de payments por ticketId
      const paymentByTicketId = new Map<string, Payment>()
      payments.forEach(payment => {
        paymentByTicketId.set(payment.ticketId, payment)
      })

      // Criar mapa de payments por transactionId (para agrupar múltiplos tickets)
      const paymentsByTransactionId = new Map<string, Payment[]>()
      payments.forEach(payment => {
        if (payment.transactionId) {
          const existing = paymentsByTransactionId.get(payment.transactionId) || []
          existing.push(payment)
          paymentsByTransactionId.set(payment.transactionId, existing)
        }
      })

      // Agrupar tickets por ordem
      const ordersMap = new Map<string, PurchaseOrder>()

      tickets.forEach(ticket => {
        // Tentar encontrar payment relacionado
        const payment = paymentByTicketId.get(ticket.id)

        // Determinar chave de agrupamento
        let orderKey: string

        if (payment?.transactionId) {
          // Agrupar por transactionId se disponível
          orderKey = payment.transactionId
        } else {
          // Agrupar por purchaseDate com janela de 2 minutos
          const purchaseDate = new Date(ticket.purchaseDate)
          // Arredondar para o minuto mais próximo (janela de 2 minutos)
          const roundedMinute = Math.floor(purchaseDate.getMinutes() / 2) * 2
          const roundedDate = new Date(purchaseDate)
          roundedDate.setMinutes(roundedMinute, 0, 0)
          orderKey = `${ticket.eventId}-${roundedDate.toISOString()}`
        }

        if (!ordersMap.has(orderKey)) {
          // Criar nova ordem
          const orderId = payment?.transactionId || this.generateOrderId(ticket.purchaseDate)
          
          // Encontrar payment principal (primeiro payment da transação ou payment do ticket)
          let mainPayment: Payment | undefined = payment
          if (payment?.transactionId) {
            const transactionPayments = paymentsByTransactionId.get(payment.transactionId) || []
            mainPayment = transactionPayments[0] // Usar o primeiro payment da transação
          }

          // Determinar status da ordem
          const orderStatus = mainPayment?.status || 'UNKNOWN'

          // Determinar status dos tickets
          const ticketStatuses = new Set<string>()
          ticketStatuses.add(ticket.status)
          const ticketStatus = this.determineTicketStatus(Array.from(ticketStatuses))

          // Garantir que price seja número
          const ticketPrice = typeof ticket.price === 'string' ? parseFloat(ticket.price) : ticket.price

          ordersMap.set(orderKey, {
            orderId,
            purchaseDate: ticket.purchaseDate,
            event: {
              id: ticket.eventId,
              title: ticket.eventTitle,
              date: ticket.eventDate,
              location: ticket.eventLocation,
            },
            tickets: [ticket],
            products: [],
            payment: mainPayment,
            total: ticketPrice || 0,
            status: orderStatus as PurchaseOrder['status'],
            ticketStatus: ticketStatus as PurchaseOrder['ticketStatus'],
          })
        } else {
          // Adicionar ticket à ordem existente
          const order = ordersMap.get(orderKey)!
          order.tickets.push(ticket)
          // Garantir que price seja número
          const ticketPrice = typeof ticket.price === 'string' ? parseFloat(ticket.price) : ticket.price
          order.total += ticketPrice || 0

          // Atualizar status dos tickets
          const ticketStatuses = new Set(order.tickets.map(t => t.status))
          order.ticketStatus = this.determineTicketStatus(Array.from(ticketStatuses)) as PurchaseOrder['ticketStatus']
        }
      })

      // Criar mapa de produtos por ticketId (mais preciso)
      const productOrdersByTicketId = new Map<string, ProductOrder[]>()
      productOrders.forEach(productOrder => {
        if (productOrder.ticketId) {
          if (!productOrdersByTicketId.has(productOrder.ticketId)) {
            productOrdersByTicketId.set(productOrder.ticketId, [])
          }
          productOrdersByTicketId.get(productOrder.ticketId)!.push(productOrder)
        }
      })

      // Criar mapa de produtos por evento e data (fallback para produtos sem ticketId)
      const productOrdersByEvent = new Map<string, ProductOrder[]>()
      productOrders.forEach(productOrder => {
        if (!productOrder.ticketId) {
          const purchaseDate = new Date(productOrder.purchaseDate)
          const roundedMinute = Math.floor(purchaseDate.getMinutes() / 2) * 2
          const roundedDate = new Date(purchaseDate)
          roundedDate.setMinutes(roundedMinute, 0, 0)
          const productOrderKey = `${productOrder.eventId}-${roundedDate.toISOString()}`
          
          if (!productOrdersByEvent.has(productOrderKey)) {
            productOrdersByEvent.set(productOrderKey, [])
          }
          productOrdersByEvent.get(productOrderKey)!.push(productOrder)
        }
      })

      // Associar produtos às ordens correspondentes
      ordersMap.forEach((order) => {
        const matchingProducts: ProductOrder[] = []
        
        // Primeiro, tentar associar produtos pelos ticketIds dos tickets na ordem
        order.tickets.forEach(ticket => {
          const productsForTicket = productOrdersByTicketId.get(ticket.id) || []
          matchingProducts.push(...productsForTicket)
        })
        
        // Se não encontrou produtos por ticketId, tentar por evento e data
        if (matchingProducts.length === 0) {
          const purchaseDate = new Date(order.purchaseDate)
          const roundedMinute = Math.floor(purchaseDate.getMinutes() / 2) * 2
          const roundedDate = new Date(purchaseDate)
          roundedDate.setMinutes(roundedMinute, 0, 0)
          const productKey = `${order.event.id}-${roundedDate.toISOString()}`
          
          const productsByDate = productOrdersByEvent.get(productKey) || []
          matchingProducts.push(...productsByDate)
        }
        
        order.products = matchingProducts
        
        // Adicionar total dos produtos ao total da ordem
        const productsTotal = matchingProducts.reduce((sum, po) => sum + (po.total || 0), 0)
        order.total += productsTotal
      })

      // Converter para array e ordenar por data (mais recente primeiro)
      const orders = Array.from(ordersMap.values()).sort((a, b) => 
        new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
      )

      // Calcular estatísticas
      const statistics = this.calculateStatistics(orders)

      this.logger.info('GetPurchaseHistoryUseCase: Purchase history processed', {
        ordersCount: orders.length,
        statistics
      })

      return {
        orders,
        statistics
      }
    } catch (error) {
      this.logger.error('GetPurchaseHistoryUseCase: Error fetching purchase history', error as Error, { userId })
      throw error
    }
  }

  private generateOrderId(dateString: string): string {
    const date = new Date(dateString)
    const timestamp = date.getTime().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `ORD-${timestamp}-${random}`
  }

  private determineTicketStatus(statuses: string[]): 'ACTIVE' | 'USED' | 'CANCELLED' | 'MIXED' {
    if (statuses.length === 1) {
      const status = statuses[0]
      if (status === 'ACTIVE') return 'ACTIVE'
      if (status === 'USED') return 'USED'
      if (status === 'CANCELLED') return 'CANCELLED'
    }
    return 'MIXED'
  }

  private calculateStatistics(orders: PurchaseOrder[]): PurchaseHistory['statistics'] {
    let totalSpent = 0
    let totalTickets = 0
    let upcomingEvents = 0
    let pastEvents = 0

    const processedEvents = new Set<string>()

    orders.forEach(order => {
      // Garantir que order.total seja número
      const orderTotal = typeof order.total === 'number' ? order.total : (typeof order.total === 'string' ? parseFloat(order.total) : 0)
      
      // Calcular total gasto apenas de pagamentos aprovados
      if (order.payment?.status === 'APPROVED') {
        totalSpent += orderTotal
      } else if (!order.payment) {
        // Se não há payment, assumir que foi pago (tickets existem)
        totalSpent += orderTotal
      }

      totalTickets += order.tickets.length

      // Contar eventos únicos
      if (!processedEvents.has(order.event.id)) {
        processedEvents.add(order.event.id)
        const eventDate = new Date(order.event.date)
        if (eventDate > new Date()) {
          upcomingEvents++
        } else {
          pastEvents++
        }
      }
    })

    return {
      totalSpent,
      totalTickets,
      upcomingEvents,
      pastEvents
    }
  }
}

