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

  const mapApiToEvent = (e: any): any => {
    const toDate10 = (v: any) => (v ? String(v).slice(0, 10) : '')

    return {
      id: String(e?.id_evento ?? e?.id ?? ''),
      title: e?.titulo_evento ?? e?.title ?? '',
      description: e?.descripcion ?? e?.description ?? '',
      date: toDate10(e?.fecha_inicio ?? e?.date),
      dateEnd: toDate10(e?.fecha_fin ?? e?.dateEnd),
      time: e?.hora ?? e?.time ?? '',
      location: e?.location ?? '',

      capacity: Number(e?.capacidad ?? e?.capacity ?? 0),
      attendees: Number(e?.attendees ?? 0),

      observaciones: e?.observaciones ?? '',
      fechaCreacion: toDate10(e?.fecha_creacion ?? e?.fechaCreacion),
      organizer: e?.creado_por ?? e?.organizer ?? '',

      // ✅ IDs necesarios para los SELECTS del formulario
      id_tipo_evento: e?.id_tipo_evento == null || e?.id_tipo_evento === '' ? '' : Number(e.id_tipo_evento),
      id_salas: e?.id_salas == null || e?.id_salas === '' ? '' : Number(e.id_salas),
      id_carrera: e?.id_carrera == null || e?.id_carrera === '' ? '' : Number(e.id_carrera),
      id_semestre: e?.id_semestre == null || e?.id_semestre === '' ? '' : Number(e.id_semestre),
      id_estado: e?.id_estado == null || e?.id_estado === '' ? '' : Number(e.id_estado),

      // nombres (por si los quieres mostrar en alguna parte)
      nombre_evento: e?.nombre_evento,
      nombre_salas: e?.nombre_salas,
      nombre_carrera: e?.nombre_carrera,
      nombre_semestre: e?.nombre_semestre,
      nombre_estado: e?.nombre_estado,

      // si tu UI usa status string en algunos filtros, lo dejamos
      // (puede venir vacío si no lo usas)
      status: e?.nombre_estado ?? (e as any)?.status ?? '',
      category: (e as any)?.category ?? '',
      image: (e as any)?.image,
    }
  }

  // Cargar eventos desde API
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true)
        setError('')
        const resp: any = await eventosAPI.getAll()

        // resp puede ser:
        // - array directo
        // - { ok, data: [...] }
        setEvents(Array.isArray(resp) ? resp : (resp?.data ?? []))
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
    let filtered = Array.isArray(events) ? events : []

    if (filterStatus !== 'todos') {
      filtered = filtered.filter(e => String((e as any).id_estado) === String(filterStatus))
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
      const created = await eventosAPI.create(newEvent)

      setEvents([...(Array.isArray(events) ? events : []), created])
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
      const updatedId = String((updatedEvent as any).id ?? (updatedEvent as any).id_evento ?? '')
      const resp = await eventosAPI.update(updatedId, updatedEvent)

      // algunos backends retornan el evento actualizado, otros no
      const updatedMapped = resp ? resp : updatedEvent

      const updatedEvents = (Array.isArray(events) ? events : []).map(e => {
        const eid = String((e as any).id ?? (e as any).id_evento ?? '')
        return eid === updatedId ? updatedMapped : e
      })

      setEvents(updatedEvents)

      const fresh: any = await eventosAPI.getAll()
      setEvents(Array.isArray(fresh) ? fresh : (fresh?.data ?? []))

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

        const updatedEvents = (Array.isArray(events) ? events : []).map(e => {
          const eid = String((e as any).id ?? (e as any).id_evento ?? '')
          if (eid !== String(eventId)) return e

          // ✅ NO borrar del array: solo marcar como cancelado
          return {
            ...(e as any),
            status: 'cancelado',
            id_estado: 5,
            nombre_estado: 'Cancelado',
          } as any
        })

        setEvents(updatedEvents)
        setSelectedEvent(undefined)
        alert('✓ Evento cancelado correctamente')
      } catch (err) {
        console.error('Error deleting evento:', err)
        alert('Error al cancelar el evento')
      }
    }
  }

  const handleEditEvent = async (event: Event) => {
    try {
      const id = String((event as any).id ?? (event as any).id_evento ?? "")
      const fresh = await eventosAPI.getById(id)   // <- garantiza ubicacion
      setEditingEvent(fresh)
    } catch (err) {
      // fallback: si falla el GET por id, usa el que ya tienes
      setEditingEvent(event)
    }

    setShowForm(true)
    setViewMode("crear")
  }

  // Estadísticas
  const stats = {
    totalEventos: (Array.isArray(events) ? events : []).length,
    eventosActivos: (Array.isArray(events) ? events : []).filter(e => Number((e as any).id_estado) === 1).length,
    eventosFinalizados: (Array.isArray(events) ? events : []).filter(e => Number((e as any).id_estado) === 2).length,
    eventosPostpuestos: (Array.isArray(events) ? events : []).filter(e => Number((e as any).id_estado) === 3).length,
    eventosPausados: (Array.isArray(events) ? events : []).filter(e => Number((e as any).id_estado) === 4).length,
    eventosCancelados: (Array.isArray(events) ? events : []).filter(e => Number((e as any).id_estado) === 5).length,
    lugaresDisponibles: (Array.isArray(events) ? events : []).reduce((total, e) => total + (e.capacity - e.attendees), 0),
    asistentesTotales: (Array.isArray(events) ? events : []).reduce((total, e) => total + e.attendees, 0),
    eventoLlenoCount: (Array.isArray(events) ? events : []).filter(e => e.attendees >= e.capacity).length,
    proximoEvento: (Array.isArray(events) ? events : [])
      .filter(e => Number((e as any).id_estado) === 1)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0],
  }

  const categoryStats = (Array.isArray(events) ? events : []).reduce((acc, e) => {
    acc[(e as any).category] = (acc[(e as any).category] || 0) + 1
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
          📋 Eventos ({(Array.isArray(events) ? events : []).length})
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
                <option value='1'>Creado</option>
                <option value='2'>Finalizado</option>
                <option value='3'>Postpuesto</option>
                <option value='4'>Pausado</option>
                <option value='5'>Cancelado</option>
                <option value='6'>En Curso</option>
              </select>
            </div>
          </div>

          {/* Tabla de eventos */}
          <div className='events-table-container'>
            {filteredEvents.length > 0 ? (
              <div className='events-admin-grid'>
                {filteredEvents.map(event => {
                  const eventId = String((event as any).id ?? (event as any).id_evento ?? `${event.title}-${event.date}-${event.time}`)
                  const selectedId = selectedEvent ? String((selectedEvent as any).id ?? (selectedEvent as any).id_evento ?? '') : ''
                  return (
                    <div
                      key={eventId}
                      className={`admin-event-card ${(event as any).status}`}
                      onClick={() => setSelectedEvent(selectedId === eventId ? undefined : event)}
                    >
                      <div className='admin-event-header'>
                        <h3>{event.title}</h3>
                        <span className={`status-badge ${(event as any).status}`}>{(event as any).status}</span>
                      </div>

                      <div className='admin-event-info'>
                        <p>📅 {event.date} a las {event.time}</p>
                        <p>📍 {event.location}</p>
                        <p>🏷️ {(event as any).category}</p>
                        <p>🎓 Carrera: {(event as any).carrera || (event as any).nombre_carrera || 'No disponible'}</p>
                        <p>📚 Semestre: {(event as any).semestre || (event as any).nombre_semestre || 'No disponible'}</p>
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

                      {selectedId === eventId && (
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
                              handleDeleteEvent(eventId)
                            }}
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
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
              <div className='stat-label'>Eventos Creados</div>
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
          <button className="btn-cerrar" onClick={() => setViewMode("lista")}>
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




