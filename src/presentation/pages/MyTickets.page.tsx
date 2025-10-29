import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { useTickets } from '../hooks/useTickets'
import { useCheckIn } from '../hooks/useCheckIn'
import { Calendar, MapPin, QrCode, Download, Share2, RefreshCw } from 'lucide-react'
import { container } from '../../shared/di/container'

export const MyTicketsPage: React.FC = () => {
  const { user } = useAuth()
  const { tickets, loading, error, refetch } = useTickets()
  const { checkIn, loading: checkingIn } = useCheckIn()
  const [generatingQR, setGeneratingQR] = useState<string | null>(null)
  
  console.log('🎫 MyTicketsPage - User:', user)
  console.log('🎫 MyTicketsPage - Tickets:', tickets)
  console.log('🎫 MyTicketsPage - Loading:', loading)
  console.log('🎫 MyTicketsPage - Error:', error)

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

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice.toFixed(2)
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

  const handleGenerateQR = async (ticketId: string) => {
    try {
      setGeneratingQR(ticketId)
      await container.ticketRepository.generateQRCode(ticketId)
      container.logger.info('QR code generated successfully', { ticketId })
      // Recarregar ingressos para exibir novo QR code
      await refetch()
      toast.success('QR code gerado com sucesso!')
    } catch (err) {
      container.logger.error('Error generating QR code', err as Error, { ticketId })
      toast.error('Erro ao gerar QR code. Tente novamente.')
    } finally {
      setGeneratingQR(null)
    }
  }

  const handleCheckIn = async (ticketId: string) => {
    try {
      const result = await checkIn(ticketId)
      if (result) {
        toast.success('Check-in realizado com sucesso!')
        await refetch()
      } else {
        toast.error('Erro ao fazer check-in')
      }
    } catch (err) {
      container.logger.error('Error during check-in', err as Error, { ticketId })
      toast.error('Erro ao fazer check-in')
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
        <p className="text-gray-600 mb-4">{error.message}</p>
        <div className="max-w-2xl mx-auto mt-4 p-4 bg-gray-100 rounded">
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
        <button 
          onClick={() => refetch()} 
          className="mt-4 btn-primary"
        >
          Tentar Novamente
        </button>
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
                  {ticket.qrCode ? (
                    <img
                      src={ticket.qrCode.startsWith('data:image') ? ticket.qrCode : `data:image/png;base64,${ticket.qrCode}`}
                      alt="QR Code"
                      className="w-24 h-24 mx-auto mb-2"
                    />
                  ) : (
                    <QrCode className="w-24 h-24 mx-auto mb-2 text-gray-400" />
                  )}
                  <p className="text-xs text-gray-600 mb-2">
                    {ticket.qrCode ? 'Apresente este QR Code na entrada' : 'QR Code não disponível'}
                  </p>
                  {!ticket.qrCode && ticket.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleGenerateQR(ticket.id)}
                      disabled={generatingQR === ticket.id}
                      className="text-xs btn-secondary px-3 py-1"
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 inline ${generatingQR === ticket.id ? 'animate-spin' : ''}`} />
                      Gerar QR Code
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Comprado em:</p>
                  <p className="text-sm font-medium">{formatDate(ticket.purchaseDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Valor:</p>
                  <p className="text-sm font-bold text-blue-600">R$ {formatPrice(ticket.price)}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col space-y-2">
                {ticket.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleCheckIn(ticket.id)}
                    disabled={checkingIn}
                    className="w-full btn-primary text-sm"
                  >
                    {checkingIn ? 'Fazendo check-in...' : 'Fazer Check-in'}
                  </button>
                )}
                <div className="flex space-x-2">
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
