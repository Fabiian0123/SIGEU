import { FC, useState, useEffect } from 'react'
import { Event } from '../types/Event'
import EventForm from '../components/EventForm'
import EventCard from '../components/EventCard'
import '../styles/AdminPage.css'

const ESTADOS = {
  CREADO: 1,
  FINALIZADO: 2,
  POSTPUESTO: 3,
  PAUSADO: 4,
  CANCELADO: 5,
} as const

const AdminPage: FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined)
  const [filterStatus, setFilterStatus] = useState<string>('todos')

  // Cargar eventos
  useEffect(() => {
    const savedEvents = localStorage.getItem('events')
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents))
    }
  }, [])

  const handleAddEvent = (newEvent: Event) => {
    const updatedEvents = [
      ...events,
      {
        ...newEvent,

        // ✅ asegurar que queden persistidos los campos "adicionales"
        // (si ya vienen, no los pisa)
        ...(newEvent as any),
        id_tipo_evento: (newEvent as any).id_tipo_evento ?? '',
        id_salas: (newEvent as any).id_salas ?? '',
        id_carrera: (newEvent as any).id_carrera ?? '',
        id_semestre: (newEvent as any).id_semestre ?? '',
        id_estado: (newEvent as any).id_estado ?? ESTADOS.CREADO,

        // labels para el card
        nombre_evento: (newEvent as any).nombre_evento ?? (newEvent as any).tipo_evento_label ?? '',
        nombre_carrera: (newEvent as any).nombre_carrera ?? (newEvent as any).carrera ?? '',
        nombre_semestre: (newEvent as any).nombre_semestre ?? (newEvent as any).semestre ?? '',
        fecha_creacion: (newEvent as any).fecha_creacion ?? (newEvent as any).fechaCreacion ?? '',
      } as any,
    ]

    setEvents(updatedEvents)
    localStorage.setItem('events', JSON.stringify(updatedEvents))
    setShowForm(false)
    alert('¡Evento creado exitosamente!')
  }

  const handleUpdateEvent = (updatedEvent: Event) => {
    const updatedEvents = events.map(e =>
      e.id === updatedEvent.id
        ? ({
            ...e,
            ...updatedEvent,

            // ✅ conservar / asegurar extras en edición
            id_tipo_evento: (updatedEvent as any).id_tipo_evento ?? (e as any).id_tipo_evento ?? '',
            id_salas: (updatedEvent as any).id_salas ?? (e as any).id_salas ?? '',
            id_carrera: (updatedEvent as any).id_carrera ?? (e as any).id_carrera ?? '',
            id_semestre: (updatedEvent as any).id_semestre ?? (e as any).id_semestre ?? '',
            id_estado: (updatedEvent as any).id_estado ?? (e as any).id_estado ?? ESTADOS.CREADO,

            nombre_evento: (updatedEvent as any).nombre_evento ?? (e as any).nombre_evento ?? '',
            nombre_carrera: (updatedEvent as any).nombre_carrera ?? (e as any).nombre_carrera ?? '',
            nombre_semestre: (updatedEvent as any).nombre_semestre ?? (e as any).nombre_semestre ?? '',
            fecha_creacion: (updatedEvent as any).fecha_creacion ?? (e as any).fecha_creacion ?? '',
          } as any)
        : e
    )

    setEvents(updatedEvents)
    localStorage.setItem('events', JSON.stringify(updatedEvents))
    setEditingEvent(undefined)
    setShowForm(false)
    alert('¡Evento actualizado exitosamente!')
  }

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      const updatedEvents = events.map(e => {
        if (String(e.id) !== String(eventId)) return e

        // ✅ NO borrar: marcar cancelado
        return {
          ...(e as any),
          id_estado: ESTADOS.CANCELADO,
          nombre_estado: 'Cancelado',
          status: 'cancelado',
        } as any
      })

      setEvents(updatedEvents)
      localStorage.setItem('events', JSON.stringify(updatedEvents))
      alert('¡Evento cancelado!')
    }
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setShowForm(true)
  }

  const handleSubmitForm = (event: Event) => {
    if (editingEvent) {
      handleUpdateEvent(event)
    } else {
      handleAddEvent(event)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingEvent(undefined)
  }

  const filteredEvents =
    filterStatus === 'todos'
      ? events
      : events.filter(e => String((e as any).id_estado ?? '') === String(filterStatus))

  return (
    <div className='admin-page'>
      <div className='admin-header'>
        <h1>Panel de Administración</h1>
        <button className='btn-create' onClick={() => setShowForm(!showForm)}>
          {showForm ? '❌ Cancelar' : '✨ Crear Nuevo Evento'}
        </button>
      </div>

      {showForm && (
        <div className='form-container'>
          <h2>{editingEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}</h2>
          <EventForm onSubmit={handleSubmitForm} initialEvent={editingEvent} />
          <button className='btn-close-form' onClick={handleCloseForm}>
            Cerrar
          </button>
        </div>
      )}

      <div className='admin-filters'>
        <label>Filtrar por Estado:</label>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className='filter-select'>
          <option value='todos'>Todos</option>
          <option value={String(ESTADOS.CREADO)}>Creado</option>
          <option value={String(ESTADOS.FINALIZADO)}>Finalizado</option>
          <option value={String(ESTADOS.POSTPUESTO)}>Postpuesto</option>
          <option value={String(ESTADOS.PAUSADO)}>Pausado</option>
          <option value={String(ESTADOS.CANCELADO)}>Cancelado</option>
        </select>
      </div>

      <div className='admin-events-section'>
        <h2>Eventos ({filteredEvents.length})</h2>
        {filteredEvents.length > 0 ? (
          <div className='admin-events-grid'>
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} onEdit={handleEditEvent} onDelete={handleDeleteEvent} />
            ))}
          </div>
        ) : (
          <div className='no-events'>
            <p>No hay eventos en este estado.</p>
          </div>
        )}
      </div>

      <div className='admin-stats'>
        <div className='stat-box'>
          <h3>Estadísticas Generales</h3>
          <p>
            <strong>Total de Eventos:</strong> {events.length}
          </p>
          <p>
            <strong>Creados:</strong> {events.filter(e => Number((e as any).id_estado) === ESTADOS.CREADO).length}
          </p>
          <p>
            <strong>Finalizados:</strong> {events.filter(e => Number((e as any).id_estado) === ESTADOS.FINALIZADO).length}
          </p>
          <p>
            <strong>Postpuestos:</strong> {events.filter(e => Number((e as any).id_estado) === ESTADOS.POSTPUESTO).length}
          </p>
          <p>
            <strong>Pausados:</strong> {events.filter(e => Number((e as any).id_estado) === ESTADOS.PAUSADO).length}
          </p>
          <p>
            <strong>Cancelados:</strong> {events.filter(e => Number((e as any).id_estado) === ESTADOS.CANCELADO).length}
          </p>
          <p>
            <strong>Asistentes Totales:</strong> {events.reduce((sum, e) => sum + e.attendees, 0)}
          </p>
          <p>
            <strong>Capacidad Total:</strong> {events.reduce((sum, e) => sum + e.capacity, 0)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminPage


