import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useDashboardData } from '../hooks/useDashboardData'
import { Calendar, Users, CreditCard, TrendingUp, Eye, Plus } from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data, loading, error } = useDashboardData(user?.id)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    })
  }

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice.toFixed(2)
  }

  const totalSpent = data.payments
    .filter(p => p.status === 'APPROVED')
    .reduce((sum, p) => sum + p.amount, 0)

  const upcomingEvents = data.events.filter(event => 
    new Date(event.date) > new Date()
  ).slice(0, 3)

  const recentTickets = data.tickets.slice(0, 5)

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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar dashboard</h2>
        <p className="text-gray-600">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Bem-vindo de volta, {user?.name}!</p>
        </div>
        <button
          onClick={() => navigate('/events/create')}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Criar Evento</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Eventos Participados</p>
              <p className="text-2xl font-bold text-gray-900">{data.tickets.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ingressos Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.tickets.filter(t => t.status === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Gasto</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {totalSpent.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Próximos Eventos</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingEvents.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Próximos Eventos</h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-600">Nenhum evento próximo encontrado.</p>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
                  </div>
                  <a
                    href={`/events/${event.id}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tickets */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ingressos Recentes</h2>
          {recentTickets.length === 0 ? (
            <p className="text-gray-600">Nenhum ingresso encontrado.</p>
          ) : (
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{ticket.eventTitle}</h3>
                    <p className="text-sm text-gray-600">{ticket.categoryName}</p>
                    <p className="text-xs text-gray-500">{formatDate(ticket.purchaseDate)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ticket.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      ticket.status === 'USED' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {ticket.status === 'ACTIVE' ? 'Ativo' :
                       ticket.status === 'USED' ? 'Usado' : ticket.status}
                    </span>
                    <p className="text-sm font-medium text-blue-600 mt-1">
                      R$ {formatPrice(ticket.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/events" className="btn-primary text-center">
            Explorar Eventos
          </a>
          <a href="/my-tickets" className="btn-secondary text-center">
            Meus Ingressos
          </a>
          <a href="/events" className="btn-secondary text-center">
            Criar Evento
          </a>
        </div>
      </div>
    </div>
  )
}
