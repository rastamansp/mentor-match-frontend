import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { eventsApi, ticketsApi, paymentsApi } from '../services/api'
import { Event, TicketCategory, Ticket, Payment } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { Calendar, MapPin, Users, Clock, CreditCard, QrCode } from 'lucide-react'

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return
      
      try {
        const [eventData, categoriesData] = await Promise.all([
          eventsApi.getById(id),
          eventsApi.getTicketCategories(id)
        ])
        setEvent(eventData)
        setTicketCategories(categoriesData)
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0])
        }
      } catch (error) {
        console.error('Erro ao carregar evento:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [id])

  const handlePurchase = async () => {
    if (!user || !selectedCategory || !event) return

    setPurchasing(true)
    try {
      // Criar ingresso
      const ticketData = {
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        price: selectedCategory.price * quantity,
      }

      const ticket = await ticketsApi.create(ticketData)

      // Criar pagamento
      const paymentData = {
        ticketId: ticket.id,
        userId: user.id,
        amount: selectedCategory.price * quantity,
        method: 'PIX',
      }

      const payment = await paymentsApi.create(paymentData)

      // Simular aprovação do pagamento
      await paymentsApi.approve(payment.id)

      alert('Ingresso comprado com sucesso!')
    } catch (error) {
      console.error('Erro ao comprar ingresso:', error)
      alert('Erro ao comprar ingresso')
    } finally {
      setPurchasing(false)
    }
  }

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

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Evento não encontrado</h2>
        <p className="text-gray-600">O evento que você está procurando não existe.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Event Header */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
            <p className="text-gray-600 text-lg">{event.description}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-3" />
              <span className="text-lg">{formatDate(event.date)} às {formatTime(event.date)}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-3" />
              <span className="text-lg">{event.location}, {event.city} - {event.state}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-3" />
              <span className="text-lg">{event.soldTickets} de {event.maxCapacity} ingressos vendidos</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-5 w-5 mr-3" />
              <span className="text-lg">Organizado por {event.organizerName}</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              {event.category}
            </span>
          </div>
        </div>
      </div>

      {/* Ticket Categories */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Escolha seu ingresso</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {ticketCategories.map((category) => (
            <div
              key={category.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                selectedCategory?.id === category.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                <span className="text-xl font-bold text-blue-600">
                  R$ {category.price.toFixed(2)}
                </span>
              </div>
              <p className="text-gray-600 mb-3">{category.description}</p>
              <div className="space-y-1">
                {category.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    {benefit}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-gray-500">
                {category.soldQuantity} de {category.maxQuantity} vendidos
              </div>
            </div>
          ))}
        </div>

        {selectedCategory && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo da compra</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Quantidade:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedCategory.maxQuantity - selectedCategory.soldQuantity, quantity + 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Preço unitário:</span>
                <span className="font-medium">R$ {selectedCategory.price.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">R$ {(selectedCategory.price * quantity).toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-blue-600">
                    R$ {(selectedCategory.price * quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {user ? (
              <button
                onClick={handlePurchase}
                disabled={purchasing || selectedCategory.soldQuantity >= selectedCategory.maxQuantity}
                className="w-full mt-6 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {purchasing ? 'Processando...' : 'Comprar Ingresso'}
              </button>
            ) : (
              <div className="mt-6 text-center">
                <p className="text-gray-600 mb-4">Faça login para comprar ingressos</p>
                <a href="/login" className="btn-primary">
                  Fazer Login
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventDetail
