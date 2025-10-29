import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useEventDetail } from '../hooks/useEventDetail'
import { useAuth as useAuthContext } from '../../contexts/AuthContext'
import { useTicketCategories } from '../hooks/useTicketCategories'
import { TicketCategory } from '../../domain/entities/Ticket.entity'
import { Calendar, MapPin, Users, Clock } from 'lucide-react'

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { event, loading, error } = useEventDetail(id || '')
  const { categories: ticketCategories, loading: loadingCategories } = useTicketCategories(id || '')
  
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | null>(null)
  const [quantity, setQuantity] = useState(1)

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice.toFixed(2)
  }
  
  // Selecionar primeira categoria automaticamente
  useEffect(() => {
    if (ticketCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(ticketCategories[0])
    }
  }, [ticketCategories])

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

  const handlePurchase = () => {
    if (!user) {
      toast.error('Por favor, faça login para comprar ingressos')
      navigate('/login')
      return
    }

    if (!selectedCategory || !event) {
      toast.error('Por favor, selecione uma categoria de ingresso')
      return
    }

    const categoryPrice = typeof selectedCategory.price === 'string' ? parseFloat(selectedCategory.price) : selectedCategory.price

    navigate('/checkout', {
      state: {
        eventId: event.id,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        eventTitle: event.title,
        categoryPrice,
        quantity
      }
    })
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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar evento</h2>
        <p className="text-gray-600">{error.message}</p>
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
        
        {loadingCategories ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : ticketCategories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Nenhuma categoria de ingresso disponível para este evento.</p>
          </div>
        ) : (
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
                    R$ {formatPrice(category.price)}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{category.description}</p>
                <div className="space-y-1">
                  {category.benefits.map((benefit: string, index: number) => (
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
        )}

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
                <span className="font-medium">R$ {formatPrice(selectedCategory.price)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  R$ {formatPrice((typeof selectedCategory.price === 'string' ? parseFloat(selectedCategory.price) : selectedCategory.price) * quantity)}
                </span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-blue-600">
                    R$ {formatPrice((typeof selectedCategory.price === 'string' ? parseFloat(selectedCategory.price) : selectedCategory.price) * quantity)}
                  </span>
                </div>
              </div>
            </div>

            {user ? (
              <button
                onClick={handlePurchase}
                disabled={selectedCategory.soldQuantity >= selectedCategory.maxQuantity}
                className="w-full mt-6 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Comprar Ingresso
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
