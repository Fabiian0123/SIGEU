import { FC, useState, useEffect } from 'react'
import { Event } from '../types/Event'
import EventCard from '../components/EventCard'
import { eventosAPI } from '../services/eventosService'
import '../styles/HomePage.css'

const HomePage: FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>('todos')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [searchTerm, setSearchTerm] = useState<string>('')
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

    if (categoryFilter !== 'todos') {
      filtered = filtered.filter(e => e.category === categoryFilter)
    }

    if (statusFilter !== 'todos') {
      filtered = filtered.filter(e => e.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        e =>
          e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredEvents(filtered)
  }, [events, categoryFilter, statusFilter, searchTerm])

  const handleRegister = async (eventId: string) => {
    try {
      const event = events.find(e => e.id === eventId)
      if (!event) return

      const updatedEvent = {
        ...event,
        attendees: event.attendees + 1,
      }
      await eventosAPI.update(eventId, updatedEvent)

      const updatedEvents = events.map(e =>
        e.id === eventId ? updatedEvent : e
      )
      setEvents(updatedEvents)

      alert('¡Registrado exitosamente en el evento!')
    } catch (err) {
      console.error('Error al registrar:', err)
      alert('Error al registrarse en el evento')
    }
  }

  // Si hay error
  if (error) {
    return (
      <div className='home-page'>
        <div className='hero-section'>
          <h1>Bienvenido al Sistema de Gestión de Eventos</h1>
          <p>Descubre, participa y disfruta de los mejores eventos universitarios</p>
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
      <div className='home-page'>
        <div className='hero-section'>
          <h1>Bienvenido al Sistema de Gestión de Eventos</h1>
          <p>Descubre, participa y disfruta de los mejores eventos universitarios</p>
        </div>
        <div className='loading-container'>
          <div className='spinner'></div>
          <p>Cargando eventos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='home-page'>
      <div className='hero-section'>
        <h1>Bienvenido al Sistema de Gestión de Eventos</h1>
        <p>Descubre, participa y disfruta de los mejores eventos universitarios</p>
      </div>

      <div className='filters-section'>
        <div className='search-box'>
          <input
            type='text'
            placeholder='🔍 Buscar eventos...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='search-input'
          />
        </div>

        <div className='filter-controls'>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className='filter-select'
          >
            <option value='todos'>Todas las Categorías</option>
            <option value='conferencia'>Conferencia</option>
            <option value='taller'>Taller</option>
            <option value='seminario'>Seminario</option>
            <option value='social'>Evento Social</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className='filter-select'
          >
            <option value='todos'>Todos los Estados</option>
            <option value='planeado'>Planeado</option>
            <option value='en_progreso'>En Progreso</option>
            <option value='finalizado'>Finalizado</option>
            <option value='cancelado'>Cancelado</option>
          </select>
        </div>
      </div>

      <div className='events-section'>
        <h2>Eventos Disponibles</h2>
        {filteredEvents.length > 0 ? (
          <div className='events-grid'>
            {filteredEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onRegister={handleRegister}
              />
            ))}
          </div>
        ) : (
          <div className='no-events'>
            <p>No hay eventos que coincidan con tu búsqueda.</p>
          </div>
        )}
      </div>

      <div className='stats-section'>
        <div className='stat-card'>
          <div className='stat-number'>{events.length}</div>
          <div className='stat-label'>Eventos Totales</div>
        </div>
        <div className='stat-card'>
          <div className='stat-number'>{events.filter(e => e.status === 'planeado').length}</div>
          <div className='stat-label'>Por Venir</div>
        </div>
        <div className='stat-card'>
          <div className='stat-number'>
            {events.reduce((sum, e) => sum + e.attendees, 0)}
          </div>
          <div className='stat-label'>Asistentes Registrados</div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
