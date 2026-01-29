import { FC, useState } from 'react'
import { Event } from '../types/Event'
import '../styles/EventCard.css'

interface EventCardProps {
  event: Event
  onEdit?: (event: Event) => void
  onDelete?: (eventId: string) => void
  onRegister?: (eventId: string) => void
  disabled?: boolean
  buttonText?: string
}

const EventCard: FC<EventCardProps> = ({ event, onEdit, onDelete, onRegister, disabled, buttonText }) => {
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
      case 'creado':
        return '#3498db'
      case 'finalizado':
        return '#27ae60'
      case 'postpuesto':
        return '#f39c12'
      case 'pausado':
        return '#9b59b6'
      case 'cancelado':
        return '#e74c3c'
      default:
        return '#95a5a6'
    }
  }

  const tipoEventoLabel =
    String(
      (event as any)?.tipo_evento_label ??
      (event as any)?.nombre_evento ??
      event.category ??
      ''
    ).trim()

  const isFull = event.attendees >= event.capacity
  const isDisabled = Boolean(disabled) || isFull

  return (
    <div
      className='event-card'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {(event as any).image && (
        <img
          src={(event as any).image}
          alt={event.title}
          className='event-card-image'
        />
      )}

      <div className='event-card-content'>
        <div className='event-card-header'>
          <h3 className='event-card-title'>{event.title}</h3>
          <span
            className='event-card-status'
            style={{ backgroundColor: getStatusColor(String((event as any).status ?? '')) }}
          >
            {String((event as any).status ?? '').replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <p className='event-card-category'>{tipoEventoLabel || 'Sin tipo'}</p>

        <p className='event-card-description'>{event.description}</p>

        <div className='event-card-details'>
          <div className='detail-item'>
            <strong>📅 Fecha:</strong>
            <span>{event.date ? formatDate(event.date) : ''}</span>
          </div>

          <div className='detail-item'>
            <strong>🕐 Hora:</strong>
            <span>{event.time}</span>
          </div>

          <div className='detail-item'>
            <strong>📍 Sala/Lugar:</strong>
            <span>{event.location}</span>
          </div>

          <div className='detail-item'>
            <strong>🎓 Carrera:</strong>
            <span>{(event as any).carrera ?? ''}</span>
          </div>

          <div className='detail-item'>
            <strong>📚 Semestre:</strong>
            <span>{(event as any).semestre ?? ''}</span>
          </div>

          <div className='detail-item'>
            <strong>👥 Asistentes:</strong>
            <span>
              {event.attendees}/{event.capacity}
            </span>
          </div>
        </div>

        {isHovered && (
          <div className='event-card-actions'>
            {onRegister && (
              <button
                onClick={() => onRegister(event.id)}
                className='btn-register'
                disabled={isDisabled}
              >
                {isFull
                  ? 'Evento Lleno'
                  : isDisabled
                    ? buttonText ?? 'Ya estás registrado'
                    : 'Asistiré'}
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
              width: `${event.capacity ? (event.attendees / event.capacity) * 100 : 0}%`,
              backgroundColor: event.attendees >= event.capacity ? '#e74c3c' : '#d42026',
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default EventCard





