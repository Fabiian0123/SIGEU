import { FC, useState, useEffect } from 'react'
import { Event } from '../types/Event'
import EventForm from '../components/EventForm'
import EventCard from '../components/EventCard'
import '../styles/AdminPage.css'

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
    const updatedEvents = [...events, newEvent]
    setEvents(updatedEvents)
    localStorage.setItem('events', JSON.stringify(updatedEvents))
    setShowForm(false)
    alert('¡Evento creado exitosamente!')
  }

  const handleUpdateEvent = (updatedEvent: Event) => {
    const updatedEvents = events.map(e => (e.id === updatedEvent.id ? updatedEvent : e))
    setEvents(updatedEvents)
    localStorage.setItem('events', JSON.stringify(updatedEvents))
    setEditingEvent(undefined)
    setShowForm(false)
    alert('¡Evento actualizado exitosamente!')
  }

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      const updatedEvents = events.filter(e => e.id !== eventId)
      setEvents(updatedEvents)
      localStorage.setItem('events', JSON.stringify(updatedEvents))
      alert('¡Evento eliminado!')
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
    filterStatus === 'todos' ? events : events.filter(e => e.status === filterStatus)

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
          <EventForm
            onSubmit={handleSubmitForm}
            initialEvent={editingEvent}
          />
          <button className='btn-close-form' onClick={handleCloseForm}>
            Cerrar
          </button>
        </div>
      )}

      <div className='admin-filters'>
        <label>Filtrar por Estado:</label>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className='filter-select'
        >
          <option value='todos'>Todos</option>
          <option value='planeado'>Planeado</option>
          <option value='en_progreso'>En Progreso</option>
          <option value='finalizado'>Finalizado</option>
          <option value='cancelado'>Cancelado</option>
        </select>
      </div>

      <div className='admin-events-section'>
        <h2>Eventos ({filteredEvents.length})</h2>
        {filteredEvents.length > 0 ? (
          <div className='admin-events-grid'>
            {filteredEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
              />
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
            <strong>Planeados:</strong> {events.filter(e => e.status === 'planeado').length}
          </p>
          <p>
            <strong>En Progreso:</strong> {events.filter(e => e.status === 'en_progreso').length}
          </p>
          <p>
            <strong>Finalizados:</strong> {events.filter(e => e.status === 'finalizado').length}
          </p>
          <p>
            <strong>Cancelados:</strong> {events.filter(e => e.status === 'cancelado').length}
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
