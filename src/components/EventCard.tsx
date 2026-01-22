import { FC, useState } from 'react'
import { Event } from '../types/Event'
import '../styles/EventCard.css'

interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  onRegister?: (eventId: string) => void;
}

const EventCard: FC<EventCardProps> = ({ event, onEdit, onDelete, onRegister }) => {
  const [isHovered, setIsHovered] = useState(false)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planeado':
        return '#3498db'
      case 'en_progreso':
        return '#f39c12'
      case 'finalizado':
        return '#27ae60'
      case 'cancelado':
        return '#e74c3c'
      default:
        return '#95a5a6'
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      conferencia: 'Conferencia',
      taller: 'Taller',
      seminario: 'Seminario',
      social: 'Evento Social',
      otro: 'Otro',
    }
    return labels[category] || category
  }

  return (
    <div
      className='event-card'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {event.image && <img src={event.image} alt={event.title} className='event-card-image' />}
      <div className='event-card-content'>
        <div className='event-card-header'>
          <h3 className='event-card-title'>{event.title}</h3>
          <span
            className='event-card-status'
            style={{ backgroundColor: getStatusColor(event.status) }}
          >
            {event.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <p className='event-card-category'>{getCategoryLabel(event.category)}</p>
        <p className='event-card-description'>{event.description}</p>

        <div className='event-card-details'>
          <div className='detail-item'>
            <strong>� Ubicación:</strong>
            <span>{event.location}</span>
          </div>
          <div className='detail-item'>
            <strong>📅 Fecha:</strong>
            <span>{formatDate(event.date)}</span>
          </div>
          <div className='detail-item'>
            <strong>🕐 Hora:</strong>
            <span>{event.time}</span>
          </div>
          <div className='detail-item'>
            <strong>👥 Asistentes:</strong>
            <span>
              {event.attendees}/{event.capacity}
            </span>
          </div>
          <div className='detail-item'>
            <strong>👤 Organizador:</strong>
            <span>{event.organizer}</span>
          </div>
        </div>

        {isHovered && (
          <div className='event-card-actions'>
            {onRegister && (
              <button
                onClick={() => onRegister(event.id)}
                className='btn-register'
                disabled={event.attendees >= event.capacity}
              >
                {event.attendees >= event.capacity ? 'Evento Lleno' : 'Registrarse'}
              </button>
            )}
            {onEdit && (
              <button onClick={() => onEdit(event)} className='btn-edit'>
                Editar
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(event.id)} className='btn-delete'>
                Eliminar
              </button>
            )}
          </div>
        )}

        <div className='event-card-capacity-bar'>
          <div
            className='capacity-fill'
            style={{
              width: `${(event.attendees / event.capacity) * 100}%`,
              backgroundColor: event.attendees >= event.capacity ? '#e74c3c' : '#d42026',
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default EventCard
