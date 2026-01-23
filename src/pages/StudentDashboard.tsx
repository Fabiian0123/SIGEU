import { FC, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Event } from '../types/Event'
import EventCard from '../components/EventCard'
import { useAuth } from '../contexts/AuthContext'
import { eventosAPI } from '../services/eventosService'
import '../styles/StudentDashboard.css'

const StudentDashboard: FC = () => {
  const { currentUser } = useAuth()

  const [searchParams] = useSearchParams()
  const idCarrera = searchParams.get('id_carrera')
  const idSemestre = searchParams.get('id_semestre')

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const STORAGE_KEY = `sigeu_attended_event_ids_${idCarrera ?? 'na'}_${idSemestre ?? 'na'}`

  const [attendedIds, setAttendedIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const arr = raw ? (JSON.parse(raw) as string[]) : []
      return new Set(arr.map(String))
    } catch {
      return new Set()
    }
  })

  const [attendingId, setAttendingId] = useState<string | null>(null)

  useEffect(() => {
    // recargar asistencias cuando cambie carrera/semestre
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const arr = raw ? (JSON.parse(raw) as string[]) : []
      setAttendedIds(new Set(arr.map(String)))
    } catch {
      setAttendedIds(new Set())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idCarrera, idSemestre])

  useEffect(() => {
    const loadEvents = async () => {
      if (!idCarrera || !idSemestre) {
        setEvents([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const resp = await eventosAPI.filtrarPorCarreraSemestre(
          Number(idCarrera),
          Number(idSemestre)
        )

        // ✅ resp ya es Event[]
        setEvents(resp)
      } catch (err) {
        console.error('Error cargando eventos filtrados', err)
        setError('No se pudieron cargar los eventos.')
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [idCarrera, idSemestre])

  const handleAttend = async (eventId: string) => {
    const key = String(eventId)

    if (attendedIds.has(key)) return
    if (attendingId === key) return

    try {
      const ev = events.find(e => String((e as any).id) === String(eventId))
      if (!ev) return

      const currentAtt = Number((ev as any).attendees ?? 0)
      const currentCap = Number((ev as any).capacity ?? 0)

      if (currentAtt >= currentCap) {
        alert('No hay cupos disponibles.')
        return
      }

      const updated = await eventosAPI.update(String(eventId), { attendees: currentAtt + 1 })

      setEvents(prev =>
        prev.map(e =>
          String((e as any).id) === String(eventId)
            ? ({ ...(e as any), ...(updated as any) } as any)
            : e
        )
      )

      setAttendedIds(prev => {
        const next = new Set(prev)
        next.add(key)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)))
        return next
      })
    } catch (err) {
      console.error('Error registrando asistencia:', err)
      alert('No se pudo registrar la asistencia.')
    } finally {
      setAttendingId(null)
    }
  }

  return (
    <div className='student-dashboard'>
      <div className='dashboard-header'>
        <h1>Mis Eventos</h1>
        <p>Bienvenido, {currentUser?.nombre} 👋</p>
      </div>

      {loading && <p>Cargando eventos...</p>}

      {!loading && error && <p className='error-text'>{error}</p>}

      {!loading && !error && events.length === 0 && (
        <p>No hay eventos disponibles para tu carrera y semestre.</p>
      )}

      <div className='events-grid'>
        {events.map(event => (
          <EventCard
            key={String(event.id)}
            event={event}
            onRegister={handleAttend}
            disabled={attendedIds.has(String(event.id)) || attendingId === String(event.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default StudentDashboard






