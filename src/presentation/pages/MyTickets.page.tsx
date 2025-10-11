import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTickets } from '../hooks/useTickets'
import { Calendar, MapPin, QrCode, Download, Share2 } from 'lucide-react'

export const MyTicketsPage: React.FC = () => {
  const { user } = useAuth()
  const { tickets, loading, error } = useTickets({ userId: user?.id })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'USED':
        return 'bg-blue-100 text-blue-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'TRANSFERRED':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativo'
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar ingressos</h2>
        <p className="text-gray-600">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Ingressos</h1>
        <p className="text-gray-600">Gerencie seus ingressos e acesse-os facilmente</p>
      </div>

      {tickets.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{ticket.eventTitle}</h3>
                  <p className="text-sm text-gray-600">{ticket.categoryName}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                  {getStatusText(ticket.status)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm">{formatDate(ticket.eventDate)} às {formatTime(ticket.eventDate)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">{ticket.eventLocation}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <img
                    src={ticket.qrCode}
                    alt="QR Code"
                    className="w-24 h-24 mx-auto mb-2"
                  />
                  <p className="text-xs text-gray-600">Apresente este QR Code na entrada</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Comprado em:</p>
                  <p className="text-sm font-medium">{formatDate(ticket.purchaseDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Valor:</p>
                  <p className="text-sm font-bold text-blue-600">R$ {ticket.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button className="flex-1 btn-secondary text-sm">
                  <Download className="h-4 w-4 mr-1" />
                  Baixar
                </button>
                <button className="flex-1 btn-secondary text-sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  Compartilhar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
