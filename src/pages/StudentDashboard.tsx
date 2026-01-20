import { FC, useState, useEffect } from 'react'
import { Event } from '../types/Event'
import EventCard from '../components/EventCard'
import { useAuth } from '../contexts/AuthContext'
import { eventosAPI } from '../services/eventosService'
import '../styles/StudentDashboard.css'

const StudentDashboard: FC = () => {
  const { currentUser } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>('todos')
  const [statusFilter, setStatusFilter] = useState<string>('disponibles')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'explorar' | 'registrados'>('explorar')
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

  // Cargar eventos en los que el estudiante está registrado
  useEffect(() => {
    const registrations = localStorage.getItem(`registrations_${currentUser?.id}`)
    if (registrations) {
      setRegisteredEvents(JSON.parse(registrations))
    }
  }, [currentUser])

  // Filtrar eventos
  useEffect(() => {
    let filtered = events

    // Filtrar por categoría
    if (categoryFilter !== 'todos') {
      filtered = filtered.filter(e => e.category === categoryFilter)
    }

    // Filtrar por estado
    if (statusFilter === 'disponibles') {
      filtered = filtered.filter(e => e.attendees < e.capacity)
    } else if (statusFilter === 'llenos') {
      filtered = filtered.filter(e => e.attendees >= e.capacity)
    }

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        e =>
          e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredEvents(filtered)
  }, [events, categoryFilter, statusFilter, searchTerm])

  const handleRegisterEvent = async (eventId: string) => {
    try {
      const event = events.find(e => e.id === eventId)
      if (!event) return

      // Actualizar el evento en la API
      const updatedEvent = {
        ...event,
        attendees: event.attendees + 1,
      }
      await eventosAPI.update(eventId, updatedEvent)

      // Actualizar estado local
      const newRegistrations = [...registeredEvents, eventId]
      setRegisteredEvents(newRegistrations)
      localStorage.setItem(`registrations_${currentUser?.id}`, JSON.stringify(newRegistrations))

      // Actualizar la lista de eventos
      const updatedEvents = events.map(e =>
        e.id === eventId ? updatedEvent : e
      )
      setEvents(updatedEvents)

      alert('¡Te has registrado en el evento!')
    } catch (err) {
      console.error('Error al registrar:', err)
      alert('Error al registrarse en el evento')
    }
  }

  const handleCancelRegistration = async (eventId: string) => {
    if (confirm('¿Seguro que quieres cancelar tu registro?')) {
      try {
        const event = events.find(e => e.id === eventId)
        if (!event) return

        // Actualizar el evento en la API
        const updatedEvent = {
          ...event,
          attendees: Math.max(0, event.attendees - 1),
        }
        await eventosAPI.update(eventId, updatedEvent)

        // Actualizar estado local
        const newRegistrations = registeredEvents.filter(id => id !== eventId)
        setRegisteredEvents(newRegistrations)
        localStorage.setItem(`registrations_${currentUser?.id}`, JSON.stringify(newRegistrations))

        // Actualizar la lista de eventos
        const updatedEvents = events.map(e =>
          e.id === eventId ? updatedEvent : e
        )
        setEvents(updatedEvents)

        alert('Tu registro ha sido cancelado')
      } catch (err) {
        console.error('Error al cancelar:', err)
        alert('Error al cancelar el registro')
      }
    }
  }

  const registeredEventsList = events.filter(e => registeredEvents.includes(e.id))

  // Si hay error
  if (error) {
    return (
      <div className='student-dashboard'>
        <div className='dashboard-header'>
          <h1>Mi Dashboard de Eventos</h1>
          <p>Bienvenido, {currentUser?.nombre} 👋</p>
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
      <div className='student-dashboard'>
        <div className='dashboard-header'>
          <h1>Mi Dashboard de Eventos</h1>
          <p>Bienvenido, {currentUser?.nombre} 👋</p>
        </div>
        <div className='loading-container'>
          <div className='spinner'></div>
          <p>Cargando eventos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='student-dashboard'>
      <div className='dashboard-header'>
        <h1>Mi Dashboard de Eventos</h1>
        <p>Bienvenido, {currentUser?.nombre} 👋</p>
      </div>

      {/* Estadísticas */}
      <div className='stats-container'>
        <div className='stat-card'>
          <div className='stat-number'>{events.length}</div>
          <div className='stat-label'>Eventos Disponibles</div>
        </div>
        <div className='stat-card'>
          <div className='stat-number'>{registeredEvents.length}</div>
          <div className='stat-label'>Eventos Registrados</div>
        </div>
        <div className='stat-card'>
          <div className='stat-number'>{events.filter(e => e.attendees >= e.capacity).length}</div>
          <div className='stat-label'>Eventos Llenos</div>
        </div>
      </div>

      {/* Tabs */}
      <div className='view-tabs'>
        <button
          className={`tab-button ${viewMode === 'explorar' ? 'active' : ''}`}
          onClick={() => setViewMode('explorar')}
        >
          📚 Explorar Eventos
        </button>
        <button
          className={`tab-button ${viewMode === 'registrados' ? 'active' : ''}`}
          onClick={() => setViewMode('registrados')}
        >
          ✅ Mis Registros ({registeredEvents.length})
        </button>
      </div>

      {viewMode === 'explorar' ? (
        <>
          {/* Filtros */}
          <div className='filters-container'>
            <div className='filter-group'>
              <label>🔍 Buscar</label>
              <input
                type='text'
                placeholder='Busca un evento...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='search-input'
              />
            </div>

            <div className='filter-group'>
              <label>📂 Categoría</label>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className='filter-select'
              >
                <option value='todos'>Todas las categorías</option>
                <option value='conferencia'>Conferencia</option>
                <option value='taller'>Taller</option>
                <option value='seminario'>Seminario</option>
                <option value='social'>Social</option>
                <option value='competencia'>Competencia</option>
              </select>
            </div>

            <div className='filter-group'>
              <label>📍 Estado</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className='filter-select'
              >
                <option value='disponibles'>Disponibles</option>
                <option value='llenos'>Llenos</option>
                <option value='todos'>Todos</option>
              </select>
            </div>
          </div>

          {/* Lista de eventos */}
          <div className='events-grid'>
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <div key={event.id} className='event-wrapper'>
                  <EventCard event={event} />
                  <div className='student-actions'>
                    {registeredEvents.includes(event.id) ? (
                      <>
                        <span className='registered-badge'>✓ Registrado</span>
                        <button
                          className='btn btn-danger'
                          onClick={() => handleCancelRegistration(event.id)}
                        >
                          Cancelar Registro
                        </button>
                      </>
                    ) : event.attendees >= event.capacity ? (
                      <button className='btn btn-disabled' disabled>
                        Evento Lleno
                      </button>
                    ) : (
                      <button
                        className='btn btn-primary'
                        onClick={() => handleRegisterEvent(event.id)}
                      >
                        Registrarme
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className='no-events'>
                <p>No se encontraron eventos que coincidan con tu búsqueda</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Mis Registros */}
          <div className='events-grid'>
            {registeredEventsList.length > 0 ? (
              registeredEventsList.map(event => (
                <div key={event.id} className='event-wrapper'>
                  <EventCard event={event} />
                  <div className='student-actions'>
                    <span className='registered-badge'>✓ Registrado</span>
                    <button
                      className='btn btn-danger'
                      onClick={() => handleCancelRegistration(event.id)}
                    >
                      Cancelar Registro
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className='no-events'>
                <p>No te has registrado en ningún evento aún</p>
                <button
                  className='btn btn-primary'
                  onClick={() => setViewMode('explorar')}
                >
                  Explorar Eventos
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default StudentDashboard
