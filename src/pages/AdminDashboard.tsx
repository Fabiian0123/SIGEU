import { FC, useState, useEffect } from 'react'
import { Event } from '../types/Event'
import EventForm from '../components/EventForm'
import EventCard from '../components/EventCard'
import { useAuth } from '../contexts/AuthContext'
import { eventosAPI } from '../services/eventosService'
import '../styles/AdminDashboard.css'

const AdminDashboard: FC = () => {
  const { currentUser } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined)
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [viewMode, setViewMode] = useState<'lista' | 'estadisticas' | 'crear'>('lista')
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // Cargar eventos desde API
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await eventosAPI.getAll()
        setEvents(data)
      } catch (err) {
        console.error('Error loading eventos:', err)
        setError('Error al cargar los eventos.')
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  // Filtrar eventos
  useEffect(() => {
    let filtered = events

    if (filterStatus !== 'todos') {
      filtered = filtered.filter(e => e.status === filterStatus)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        e =>
          e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredEvents(filtered)
  }, [events, filterStatus, searchTerm])

  const handleAddEvent = async (newEvent: Event) => {
    try {
      const createdEvent = await eventosAPI.create(newEvent)
      setEvents([...events, createdEvent])
      setShowForm(false)
      setViewMode('lista')
      alert('¡Evento creado exitosamente!')
    } catch (err) {
      console.error('Error creating evento:', err)
      alert('Error al crear el evento')
    }
  }

  const handleUpdateEvent = async (updatedEvent: Event) => {
    try {
      await eventosAPI.update(updatedEvent.id, updatedEvent)
      const updatedEvents = events.map(e => (e.id === updatedEvent.id ? updatedEvent : e))
      setEvents(updatedEvents)
      setEditingEvent(undefined)
      setShowForm(false)
      setViewMode('lista')
      alert('¡Evento actualizado exitosamente!')
    } catch (err) {
      console.error('Error updating evento:', err)
      alert('Error al actualizar el evento')
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('⚠️ ¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.')) {
      try {
        await eventosAPI.delete(eventId)
        const updatedEvents = events.filter(e => e.id !== eventId)
        setEvents(updatedEvents)
        setSelectedEvent(undefined)
        alert('✓ Evento eliminado correctamente')
      } catch (err) {
        console.error('Error deleting evento:', err)
        alert('Error al eliminar el evento')
      }
    }
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setShowForm(true)
    setViewMode('crear')
  }

  // Estadísticas
  const stats = {
    totalEventos: events.length,
    eventosActivos: events.filter(e => e.status === 'activo').length,
    eventosFinalizados: events.filter(e => e.status === 'finalizado').length,
    lugaresDisponibles: events.reduce((total, e) => total + (e.capacity - e.attendees), 0),
    asistentesTotales: events.reduce((total, e) => total + e.attendees, 0),
    eventoLlenoCount: events.filter(e => e.attendees >= e.capacity).length,
    proximoEvento: events
      .filter(e => e.status === 'activo')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0],
  }

  const categoryStats = events.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Si hay error
  if (error) {
    return (
      <div className='admin-dashboard'>
        <div className='dashboard-header'>
          <h1>🛠️ Panel de Administración</h1>
          <p>Gestor de Eventos - {currentUser?.nombre}</p>
        </div>
        <div className='error-container'>
          <div className='error-message'>⚠️ {error}</div>
          <p>Base URL: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}</p>
          <button onClick={() => window.location.reload()} className='btn btn-primary'>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // Si está cargando
  if (loading) {
    return (
      <div className='admin-dashboard'>
        <div className='dashboard-header'>
          <h1>🛠️ Panel de Administración</h1>
          <p>Gestor de Eventos - {currentUser?.nombre}</p>
        </div>
        <div className='loading-container'>
          <div className='spinner'></div>
          <p>Cargando eventos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='admin-dashboard'>
      <div className='dashboard-header'>
        <h1>🛠️ Panel de Administración</h1>
        <p>Gestor de Eventos - {currentUser?.nombre}</p>
      </div>

      {/* Tabs de navegación */}
      <div className='admin-tabs'>
        <button
          className={`admin-tab ${viewMode === 'lista' ? 'active' : ''}`}
          onClick={() => setViewMode('lista')}
        >
          📋 Eventos ({events.length})
        </button>
        <button
          className={`admin-tab ${viewMode === 'estadisticas' ? 'active' : ''}`}
          onClick={() => setViewMode('estadisticas')}
        >
          📊 Estadísticas
        </button>
        <button
          className={`admin-tab ${viewMode === 'crear' ? 'active' : ''}`}
          onClick={() => {
            setViewMode('crear')
            setEditingEvent(undefined)
            setShowForm(true)
          }}
        >
          ➕ Crear Evento
        </button>
      </div>

      {viewMode === 'lista' && (
        <>
          {/* Controles */}
          <div className='admin-controls'>
            <div className='control-group'>
              <input
                type='text'
                placeholder='🔍 Buscar evento...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='search-input'
              />
            </div>

            <div className='control-group'>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className='filter-select'
              >
                <option value='todos'>Todos los estados</option>
                <option value='activo'>Activos</option>
                <option value='finalizado'>Finalizados</option>
                <option value='cancelado'>Cancelados</option>
              </select>
            </div>
          </div>

          {/* Tabla de eventos */}
          <div className='events-table-container'>
            {filteredEvents.length > 0 ? (
              <div className='events-admin-grid'>
                {filteredEvents.map(event => (
                  <div
                    key={event.id}
                    className={`admin-event-card ${event.status}`}
                    onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? undefined : event)}
                  >
                    <div className='admin-event-header'>
                      <h3>{event.title}</h3>
                      <span className={`status-badge ${event.status}`}>{event.status}</span>
                    </div>

                    <div className='admin-event-info'>
                      <p>📅 {event.date} a las {event.time}</p>
                      <p>📍 {event.location}</p>
                      <p>🏷️ {event.category}</p>
                      <p>
                        👥 Asistentes: <strong>{event.attendees}/{event.capacity}</strong>
                      </p>
                      <div className='capacity-bar'>
                        <div
                          className='capacity-fill'
                          style={{
                            width: `${(event.attendees / event.capacity) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {selectedEvent?.id === event.id && (
                      <div className='admin-event-actions'>
                        <button
                          className='btn btn-primary'
                          onClick={e => {
                            e.stopPropagation()
                            handleEditEvent(event)
                          }}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className='btn btn-danger'
                          onClick={e => {
                            e.stopPropagation()
                            handleDeleteEvent(event.id)
                          }}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className='no-events'>
                <p>No se encontraron eventos</p>
              </div>
            )}
          </div>
        </>
      )}

      {viewMode === 'estadisticas' && (
        <div className='stats-view'>
          <div className='stats-grid'>
            <div className='stat-card primary'>
              <div className='stat-icon'>📊</div>
              <div className='stat-value'>{stats.totalEventos}</div>
              <div className='stat-label'>Eventos Totales</div>
            </div>

            <div className='stat-card success'>
              <div className='stat-icon'>✅</div>
              <div className='stat-value'>{stats.eventosActivos}</div>
              <div className='stat-label'>Eventos Activos</div>
            </div>

            <div className='stat-card info'>
              <div className='stat-icon'>👥</div>
              <div className='stat-value'>{stats.asistentesTotales}</div>
              <div className='stat-label'>Asistentes Totales</div>
            </div>

            <div className='stat-card warning'>
              <div className='stat-icon'>🪑</div>
              <div className='stat-value'>{stats.lugaresDisponibles}</div>
              <div className='stat-label'>Lugares Disponibles</div>
            </div>

            <div className='stat-card danger'>
              <div className='stat-icon'>⚠️</div>
              <div className='stat-value'>{stats.eventoLlenoCount}</div>
              <div className='stat-label'>Eventos Llenos</div>
            </div>

            <div className='stat-card secondary'>
              <div className='stat-icon'>🏁</div>
              <div className='stat-value'>{stats.eventosFinalizados}</div>
              <div className='stat-label'>Eventos Finalizados</div>
            </div>
          </div>

          {/* Próximo evento */}
          {stats.proximoEvento && (
            <div className='upcoming-event'>
              <h3>📅 Próximo Evento Programado</h3>
              <div className='upcoming-card'>
                <h4>{stats.proximoEvento.title}</h4>
                <p>
                  <strong>Fecha:</strong> {stats.proximoEvento.date} a las {stats.proximoEvento.time}
                </p>
                <p>
                  <strong>Ubicación:</strong> {stats.proximoEvento.location}
                </p>
                <p>
                  <strong>Asistentes:</strong> {stats.proximoEvento.attendees}/{stats.proximoEvento.capacity}
                </p>
              </div>
            </div>
          )}

          {/* Estadísticas por categoría */}
          <div className='category-stats'>
            <h3>📂 Eventos por Categoría</h3>
            <div className='category-list'>
              {Object.entries(categoryStats).map(([category, count]) => (
                <div key={category} className='category-item'>
                  <span className='category-name'>{category}</span>
                  <div className='category-bar'>
                    <div
                      className='category-fill'
                      style={{
                        width: `${(count / stats.totalEventos) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className='category-count'>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'crear' && showForm && (
        <div className='form-container'>
          <button className='btn-close' onClick={() => setViewMode('lista')}>
            ✕ Cerrar
          </button>
          <EventForm
            onSubmit={editingEvent ? handleUpdateEvent : handleAddEvent}
            initialEvent={editingEvent}
          />
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
