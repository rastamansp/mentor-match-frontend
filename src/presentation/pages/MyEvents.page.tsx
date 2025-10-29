import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useEvents } from '../hooks/useEvents'
import { Calendar, MapPin, Users, Edit, Eye, PlusCircle } from 'lucide-react'

export const MyEventsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // Filtrar eventos do usuário logado
  const { events, loading, error, refetch } = useEvents()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
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
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'SOLD_OUT':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativo'
      case 'INACTIVE':
        return 'Inativo'
      case 'CANCELLED':
        return 'Cancelado'
      case 'SOLD_OUT':
        return 'Esgotado'
      default:
        return status
    }
  }

  // Filtrar eventos criados pelo usuário atual
  const myEvents = events.filter(event => 
    event.organizerId === user?.id
  )

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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar eventos</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="btn-primary"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Eventos</h1>
          <p className="text-gray-600">Gerencie seus eventos criados</p>
        </div>
        <button
          onClick={() => navigate('/events/create')}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Criar Novo Evento</span>
        </button>
      </div>

      {myEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Você ainda não criou nenhum evento</h3>
          <p className="text-gray-600 mb-6">Comece criando seu primeiro evento agora mesmo!</p>
          <button
            onClick={() => navigate('/events/create')}
            className="btn-primary"
          >
            Criar Primeiro Evento
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {myEvents.map(event => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="md:flex">
                {/* Imagem do Evento */}
                {event.image && (
                  <div className="md:w-1/3">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Conteúdo */}
                <div className={`${event.image ? 'md:w-2/3' : 'w-full'} p-6`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{event.category}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      getStatusColor(event.status)
                    }`}>
                      {getStatusText(event.status)}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="text-sm">{formatDate(event.date)} às {formatTime(event.date)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="text-sm">{event.location}, {event.city}-{event.state}</span>
                    </div>
                    {event.maxCapacity && (
                      <div className="flex items-center text-gray-600">
                        <Users className="w-5 h-5 mr-2 text-gray-400" />
                        <span className="text-sm">
                          {event.soldTickets || 0} / {event.maxCapacity} ingressos vendidos
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/events/${event.id}`)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Detalhes</span>
                    </button>
                    <button
                      onClick={() => navigate(`/events/${event.id}/edit`)}
                      className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

