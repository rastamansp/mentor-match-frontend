import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { eventsApi } from '../services/api'
import { Event } from '../types'
import { Calendar, MapPin, Users, Star } from 'lucide-react'

const Home: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventsApi.getAll()
        // Verificar se data é um array antes de usar slice
        const eventsArray = Array.isArray(data) ? data : []
        setEvents(eventsArray.slice(0, 6)) // Mostrar apenas os primeiros 6 eventos
      } catch (error) {
        console.error('Erro ao carregar eventos:', error)
        setEvents([]) // Definir array vazio em caso de erro
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 md:p-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Descubra Eventos Incríveis
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            A plataforma completa para criar, gerenciar e participar de eventos únicos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/events" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Explorar Eventos
            </Link>
            <Link to="/register" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Criar Conta
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Eventos em Destaque</h2>
          <Link to="/events" className="text-blue-600 hover:text-blue-700 font-medium">
            Ver todos →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="card hover:shadow-lg transition-shadow">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                <p className="text-gray-600 line-clamp-2">{event.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(event.date)} às {formatTime(event.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{event.location}, {event.city}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{event.soldTickets} de {event.maxCapacity} ingressos vendidos</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                    {event.category}
                  </span>
                  <Link
                    to={`/events/${event.id}`}
                    className="btn-primary"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Por que escolher o Gwan Shop?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Experiência Premium</h3>
            <p className="text-gray-600">
              Interface moderna e intuitiva para uma experiência única na compra de ingressos
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Comunidade Ativa</h3>
            <p className="text-gray-600">
              Conecte-se com outros participantes e descubra eventos incríveis
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Gestão Completa</h3>
            <p className="text-gray-600">
              Ferramentas completas para organizadores criarem eventos de sucesso
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
