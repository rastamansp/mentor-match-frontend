import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { usePurchaseHistory } from '../hooks/usePurchaseHistory'
import { PurchaseOrder } from '../../application/use-cases/purchases/GetPurchaseHistory.usecase'
import { Ticket } from '../../domain/entities/Ticket.entity'
import { 
  ShoppingBag, 
  Calendar, 
  MapPin, 
  Ticket as TicketIcon, 
  DollarSign, 
  Search, 
  Filter,
  X,
  Eye,
  ExternalLink,
  CreditCard
} from 'lucide-react'

export const PurchaseHistoryPage: React.FC = () => {
  const { user } = useAuth()
  const { history, loading, error, refetch } = usePurchaseHistory(user?.id)
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)
  
  // Filtros
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('ALL')
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('ALL')
  const [periodFilter, setPeriodFilter] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price: number | string | undefined): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : (price || 0)
    if (isNaN(numPrice)) return '0,00'
    return numPrice.toFixed(2).replace('.', ',')
  }

  const formatTicketCode = (ticketId: string): string => {
    return ticketId.substring(0, 4).toUpperCase() + '-' + 
           ticketId.substring(4, 6).toUpperCase() + '-' + 
           ticketId.substring(6, 10).toUpperCase()
  }

  const getParticipantName = (ticket: Ticket): string => {
    if (ticket.participantFirstName && ticket.participantLastName) {
      return `${ticket.participantFirstName} ${ticket.participantLastName}`
    }
    return ticket.userName
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Aprovado'
      case 'PENDING':
        return 'Pendente'
      case 'REJECTED':
        return 'Rejeitado'
      case 'REFUNDED':
        return 'Reembolsado'
      default:
        return 'Desconhecido'
    }
  }

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'USED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'TRANSFERRED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'MIXED':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTicketStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativo'
      case 'USED':
        return 'Usado'
      case 'CANCELLED':
        return 'Cancelado'
      case 'TRANSFERRED':
        return 'Transferido'
      case 'MIXED':
        return 'Misto'
      default:
        return status
    }
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'PIX':
        return 'PIX'
      case 'CREDIT_CARD':
        return 'Cartão de Crédito'
      case 'DEBIT_CARD':
        return 'Cartão de Débito'
      case 'DIGITAL_WALLET':
        return 'Carteira Digital'
      default:
        return method
    }
  }

  // Filtrar ordens
  const filteredOrders = useMemo(() => {
    if (!history?.orders) return []

    let filtered = history.orders

    // Filtro por status de pagamento
    if (paymentStatusFilter !== 'ALL') {
      filtered = filtered.filter(order => {
        if (paymentStatusFilter === 'UNKNOWN') {
          return !order.payment || order.status === 'UNKNOWN'
        }
        return order.payment?.status === paymentStatusFilter || order.status === paymentStatusFilter
      })
    }

    // Filtro por status de ingresso
    if (ticketStatusFilter !== 'ALL') {
      filtered = filtered.filter(order => order.ticketStatus === ticketStatusFilter)
    }

    // Filtro por período
    if (periodFilter !== 'ALL') {
      const now = new Date()
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.purchaseDate)
        switch (periodFilter) {
          case 'LAST_MONTH':
            const lastMonth = new Date(now)
            lastMonth.setMonth(lastMonth.getMonth() - 1)
            return orderDate >= lastMonth
          case 'LAST_3_MONTHS':
            const last3Months = new Date(now)
            last3Months.setMonth(last3Months.getMonth() - 3)
            return orderDate >= last3Months
          case 'LAST_YEAR':
            const lastYear = new Date(now)
            lastYear.setFullYear(lastYear.getFullYear() - 1)
            return orderDate >= lastYear
          default:
            return true
        }
      })
    }

    // Busca por nome do evento
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(order => 
        order.event.title.toLowerCase().includes(search) ||
        order.event.location.toLowerCase().includes(search)
      )
    }

    return filtered
  }, [history?.orders, paymentStatusFilter, ticketStatusFilter, periodFilter, searchTerm])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar histórico</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button 
            onClick={() => refetch()} 
            className="mt-4 btn-primary text-sm"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  if (!history || history.orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhuma compra encontrada
          </h3>
          <p className="text-gray-600 mb-6">
            Você ainda não realizou nenhuma compra. Que tal explorar nossos eventos?
          </p>
          <Link to="/events" className="btn-primary">
            Explorar Eventos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Histórico de Compras</h1>
        <p className="text-gray-600">Visualize todas as suas compras e pedidos</p>
      </div>

      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Gasto</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {formatPrice(history.statistics.totalSpent)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Ingressos</p>
              <p className="text-2xl font-bold text-gray-900">
                {history.statistics.totalTickets}
              </p>
            </div>
            <TicketIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Próximos Eventos</p>
              <p className="text-2xl font-bold text-gray-900">
                {history.statistics.upcomingEvents}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Eventos Passados</p>
              <p className="text-2xl font-bold text-gray-900">
                {history.statistics.pastEvents}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por evento ou local..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="min-w-[150px]">
            <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Status Pagamento
            </label>
            <select
              id="paymentStatus"
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Todos</option>
              <option value="APPROVED">Aprovado</option>
              <option value="PENDING">Pendente</option>
              <option value="REJECTED">Rejeitado</option>
              <option value="REFUNDED">Reembolsado</option>
              <option value="UNKNOWN">Sem Pagamento</option>
            </select>
          </div>

          <div className="min-w-[150px]">
            <label htmlFor="ticketStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Status Ingresso
            </label>
            <select
              id="ticketStatus"
              value={ticketStatusFilter}
              onChange={(e) => setTicketStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Todos</option>
              <option value="ACTIVE">Ativo</option>
              <option value="USED">Usado</option>
              <option value="CANCELLED">Cancelado</option>
              <option value="MIXED">Misto</option>
            </select>
          </div>

          <div className="min-w-[150px]">
            <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <select
              id="period"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Todos</option>
              <option value="LAST_MONTH">Último Mês</option>
              <option value="LAST_3_MONTHS">Últimos 3 Meses</option>
              <option value="LAST_YEAR">Último Ano</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Ordens */}
      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
            >
              {/* Imagem do Evento (placeholder) */}
              <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                <Calendar className="w-16 h-16 text-white opacity-50" />
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                    {order.event.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(order.event.date)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="line-clamp-1">{order.event.location}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.status)}`}>
                    {getPaymentStatusText(order.status)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTicketStatusColor(order.ticketStatus)}`}>
                    {getTicketStatusText(order.ticketStatus)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pedido:</span>
                    <span className="font-semibold text-gray-900">{order.orderId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Data:</span>
                    <span className="text-gray-900">{formatDate(order.purchaseDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ingressos:</span>
                    <span className="text-gray-900">{order.tickets.length}</span>
                  </div>
                  {order.products && order.products.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Produtos:</span>
                      <span className="text-gray-900">{order.products.length}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span>R$ {formatPrice(order.total)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrder(order)}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nenhuma compra encontrada com os filtros aplicados.</p>
        </div>
      )}

      {/* Modal de Detalhes da Ordem */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Detalhes do Pedido {selectedOrder.orderId}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6">
              {/* Informações do Evento */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Evento</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedOrder.event.title}</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(selectedOrder.event.date)} às {formatTime(selectedOrder.event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedOrder.event.location}</span>
                    </div>
                  </div>
                  <Link
                    to={`/events/${selectedOrder.event.id}`}
                    className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Ver detalhes do evento
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Informações do Pedido */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Informações do Pedido</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Número do Pedido</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.orderId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Data da Compra</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(selectedOrder.purchaseDate)} às {formatTime(selectedOrder.purchaseDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total</p>
                    <p className="text-lg font-bold text-gray-900">R$ {formatPrice(selectedOrder.total)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Quantidade de Ingressos</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.tickets.length}</p>
                  </div>
                  {selectedOrder.products && selectedOrder.products.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Quantidade de Produtos</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.products.length}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações de Pagamento */}
              {selectedOrder.payment && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Pagamento</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Método</p>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-600" />
                          <p className="font-semibold text-gray-900">{getPaymentMethodText(selectedOrder.payment.method)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(selectedOrder.payment.status)}`}>
                          {getPaymentStatusText(selectedOrder.payment.status)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Valor</p>
                        <p className="font-semibold text-gray-900">R$ {formatPrice(selectedOrder.payment.amount)}</p>
                      </div>
                      {selectedOrder.payment.installments && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Parcelas</p>
                          <p className="font-semibold text-gray-900">{selectedOrder.payment.installments}x</p>
                        </div>
                      )}
                      {selectedOrder.payment.approvedAt && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Data de Aprovação</p>
                          <p className="font-semibold text-gray-900">{formatDate(selectedOrder.payment.approvedAt)}</p>
                        </div>
                      )}
                      {selectedOrder.payment.transactionId && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">ID da Transação</p>
                          <p className="font-mono text-xs text-gray-900 break-all">{selectedOrder.payment.transactionId}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de Produtos Comprados */}
              {selectedOrder.products && selectedOrder.products.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Produtos Comprados ({selectedOrder.products.length})</h3>
                  <div className="space-y-4">
                    {selectedOrder.products.map((productOrder) => (
                      <div key={productOrder.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="mb-2">
                              <p className="text-sm font-semibold text-gray-900">{productOrder.product.name}</p>
                              {productOrder.product.description && (
                                <p className="text-xs text-gray-600 mt-1">{productOrder.product.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-700">
                              <span>
                                Quantidade: <strong>{productOrder.quantity}</strong>
                              </span>
                              <span>
                                Preço unitário: <strong>R$ {formatPrice(productOrder.price)}</strong>
                              </span>
                              <span className="font-semibold text-gray-900">
                                Total: R$ {formatPrice(productOrder.total)}
                              </span>
                            </div>
                            <div className="mt-2">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                productOrder.product.category === 'BEBIDA' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {productOrder.product.category}
                              </span>
                            </div>
                          </div>
                          {productOrder.product.image && (
                            <div className="flex-shrink-0 ml-4">
                              <img
                                src={productOrder.product.image}
                                alt={productOrder.product.name}
                                className="w-20 h-20 object-cover rounded-lg"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lista de Ingressos */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Ingressos ({selectedOrder.tickets.length})</h3>
                <div className="space-y-4">
                  {selectedOrder.tickets.map((ticket) => (
                    <div key={ticket.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="mb-3">
                            <p className="text-xs text-gray-600 mb-1">N° DO INGRESSO:</p>
                            <p className="text-sm font-bold text-gray-900">{formatTicketCode(ticket.id)}</p>
                          </div>
                          <div className="mb-3">
                            <p className="text-sm text-gray-700">
                              {ticket.categoryName} - R$ {formatPrice(ticket.price)}
                            </p>
                            <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium border ${
                              ticket.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-200' :
                              ticket.status === 'USED' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              ticket.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border-red-200' :
                              'bg-yellow-100 text-yellow-800 border-yellow-200'
                            }`}>
                              {getTicketStatusText(ticket.status)}
                            </span>
                          </div>
                          <div className="mt-3">
                            <p className="text-sm font-semibold text-gray-900">
                              {getParticipantName(ticket)}
                            </p>
                            <p className="text-sm text-gray-600">{ticket.participantEmail || ticket.userEmail}</p>
                          </div>
                        </div>
                        {/* QR Code */}
                        {ticket.qrCode && ticket.status === 'ACTIVE' && (
                          <div className="flex-shrink-0 ml-4">
                            <div className="bg-white p-2 rounded-lg border border-gray-200">
                              <img
                                src={ticket.qrCode.startsWith('data:image') ? ticket.qrCode : `data:image/png;base64,${ticket.qrCode}`}
                                alt={`QR Code do ingresso ${formatTicketCode(ticket.id)}`}
                                className="w-32 h-32 object-contain"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-center">QR Code</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <Link
                  to="/my-tickets"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <TicketIcon className="w-4 h-4" />
                  Ver Meus Ingressos
                </Link>
                <Link
                  to={`/events/${selectedOrder.event.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver Evento
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

