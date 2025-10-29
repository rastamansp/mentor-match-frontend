import React, { useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTickets } from '../hooks/useTickets'
import { Ticket } from '../../domain/entities/Ticket.entity'
import { QrCode, Edit, FileText, Eye, X } from 'lucide-react'

interface TicketGroup {
  orderId: string
  purchaseDate: string
  tickets: Ticket[]
  total: number
}

export const MyTicketsPage: React.FC = () => {
  const { user } = useAuth()
  const { tickets, loading, error, refetch } = useTickets()
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)

  // Função para gerar ID do pedido (deve ser definida antes do useMemo)
  const generateOrderId = (dateString: string): string => {
    // Gerar ID de pedido baseado na data e um hash simples
    const date = new Date(dateString)
    const timestamp = date.getTime().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${timestamp}${random}`
  }

  // Agrupar tickets por pedido (usando purchaseDate como identificador de pedido)
  const ticketGroups = useMemo(() => {
    const groups: Map<string, TicketGroup> = new Map()

    tickets.forEach((ticket) => {
      // Usar timestamp da compra para agrupar (ingressos comprados na mesma hora são do mesmo pedido)
      const purchaseDate = new Date(ticket.purchaseDate)
      const orderKey = purchaseDate.toISOString().substring(0, 16) // Agrupa por data/hora (sem segundos)
      
      if (!groups.has(orderKey)) {
        const orderId = generateOrderId(ticket.purchaseDate)
        groups.set(orderKey, {
          orderId,
          purchaseDate: ticket.purchaseDate,
          tickets: [],
          total: 0,
        })
      }

      const group = groups.get(orderKey)!
      group.tickets.push(ticket)
      group.total += typeof ticket.price === 'string' ? parseFloat(ticket.price) : ticket.price
    })

    return Array.from(groups.values()).sort((a, b) => 
      new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    )
  }, [tickets])

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

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice.toFixed(2).replace('.', ',')
  }

  const getParticipantName = (ticket: Ticket): string => {
    if (ticket.participantFirstName && ticket.participantLastName) {
      return `${ticket.participantFirstName} ${ticket.participantLastName}`
    }
    return ticket.userName
  }

  const getParticipantEmail = (ticket: Ticket): string => {
    return ticket.participantEmail || ticket.userEmail
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'USED':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'CANCELLED':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'TRANSFERRED':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Confirmado'
      case 'USED':
        return 'Usado'
      case 'CANCELLED':
        return 'Cancelado'
      case 'TRANSFERRED':
        return 'Transferido'
      default:
        return status
    }
  }

  const formatTicketCode = (ticketId: string): string => {
    // Formatar ID como código de ingresso (ex: UE1R-VW-ZVB7)
    return ticketId.substring(0, 4).toUpperCase() + '-' + 
           ticketId.substring(4, 6).toUpperCase() + '-' + 
           ticketId.substring(6, 10).toUpperCase()
  }

  const selectedGroup = ticketGroups.find(g => g.orderId === selectedOrder)

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar ingressos</h2>
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

  if (tickets.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum ingresso encontrado
          </h3>
          <p className="text-gray-600 mb-6">
            Você ainda não possui nenhum ingresso. Que tal explorar nossos eventos?
          </p>
          <a href="/events" className="btn-primary">
            Explorar Eventos
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Ingressos</h1>
        <p className="text-gray-600">Gerencie seus ingressos e acesse-os facilmente</p>
      </div>

      <div className="space-y-4">
        {ticketGroups.map((group) => (
          <div key={group.orderId} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            {/* Resumo do Pedido */}
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h2 className="text-lg font-bold text-gray-900">
                      Pedido n° {group.orderId}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(group.tickets[0]?.status || 'ACTIVE')}`}>
                      {getStatusText(group.tickets[0]?.status || 'ACTIVE')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {formatDate(group.purchaseDate)} às {formatTime(group.purchaseDate)}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-gray-700">
                    <span>{group.tickets.length} ingresso{group.tickets.length > 1 ? 's' : ''}</span>
                    <span className="font-semibold text-gray-900">Total: R$ {formatPrice(group.total)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrder(group.orderId)}
                  className="ml-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  Ver Detalhes
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal com Detalhes Completos */}
      {selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Detalhes do Pedido {selectedGroup.orderId}
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
              {/* Header do Pedido */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Pedido n° {selectedGroup.orderId}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Enviado às {formatTime(selectedGroup.purchaseDate)} de {formatDate(selectedGroup.purchaseDate)} a:
                    </p>
                    {user && (
                      <div className="mt-3">
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    )}
                  </div>
                  <div className={`ml-4 px-4 py-2 rounded-lg border ${getStatusColor(selectedGroup.tickets[0]?.status || 'ACTIVE')}`}>
                    <p className="text-xs font-medium mb-1">N° DO PEDIDO:</p>
                    <p className="text-sm font-bold">{selectedGroup.orderId}</p>
                    <p className="text-sm font-semibold mt-1">
                      {getStatusText(selectedGroup.tickets[0]?.status || 'ACTIVE')}
                    </p>
                    <p className="text-xs mt-1">R$ {formatPrice(selectedGroup.total)}</p>
                  </div>
                </div>
              </div>

              {/* Ingressos comprados */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Ingressos comprados neste pedido</h3>
                
                <div className="space-y-4 mb-6">
                  {selectedGroup.tickets.map((ticket) => (
                    <div key={ticket.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="mb-3">
                            <p className="text-xs text-gray-600 mb-1">N° DO INGRESSO:</p>
                            <p className="text-sm font-bold text-gray-900">{formatTicketCode(ticket.id)}</p>
                          </div>
                          <div className="mb-3">
                            <p className="text-sm text-gray-700">
                              {ticket.categoryName} - de R$ {formatPrice(typeof ticket.price === 'string' ? parseFloat(ticket.price) * 3 : ticket.price * 3)} por R$ {formatPrice(ticket.price)}
                              <Edit className="h-4 w-4 inline-block ml-2 text-gray-400 cursor-pointer hover:text-gray-600" />
                            </p>
                          </div>
                          <div className="mt-3">
                            <p className="text-sm font-semibold text-gray-900">
                              {getParticipantName(ticket)}
                            </p>
                            <p className="text-sm text-gray-600">{getParticipantEmail(ticket)}</p>
                            <button className="text-sm text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              Ver formulário
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resumo da compra */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Resumo da compra</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Nº ingresso</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Participante</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">E-mail</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Tipo</th>
                          <th className="text-right py-2 px-4 text-sm font-medium text-gray-700">Valor do ingresso</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedGroup.tickets.map((ticket) => (
                          <tr key={ticket.id} className="border-b border-gray-100">
                            <td className="py-3 px-4 text-sm text-gray-900">
                              <div className="flex items-center gap-2">
                                {formatTicketCode(ticket.id)}
                                <Edit className="h-3 w-3 text-gray-400 cursor-pointer hover:text-gray-600" />
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900">{getParticipantName(ticket)}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{getParticipantEmail(ticket)}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{ticket.categoryName}</td>
                            <td className="py-3 px-4 text-sm text-gray-900 text-right">
                              R$ {formatPrice(ticket.price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={4} className="py-3 px-4 text-right text-sm font-semibold text-gray-900">
                            Total do pedido
                          </td>
                          <td className="py-3 px-4 text-right text-sm font-bold text-gray-900">
                            R$ {formatPrice(selectedGroup.total)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
