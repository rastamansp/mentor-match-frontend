import React, { memo } from 'react'
import { Link } from 'react-router-dom'
import { Event } from '../../../domain/entities/Event.entity'
import { Calendar, MapPin, Users } from 'lucide-react'

interface EventCardProps {
  event: Event
  className?: string
}

export const EventCard: React.FC<EventCardProps> = memo(({ event, className = '' }) => {
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

  return (
    <Link
      to={`/events/${event.id}`}
      className={`block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow ${className}`}
    >
      <img
        src={event.image}
        alt={event.title}
        className="w-full h-48 object-cover rounded-t-lg"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
        <p className="text-gray-600 line-clamp-2 mb-3">{event.description}</p>
        
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
          <span className="text-sm font-medium text-gray-500">
            {event.status}
          </span>
        </div>
      </div>
    </Link>
  )
})

EventCard.displayName = 'EventCard'
