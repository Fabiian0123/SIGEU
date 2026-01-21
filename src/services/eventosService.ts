// src/services/eventosService.ts
import { Event } from '../types/Event'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

/**
 * Respuesta típica del backend (según tu SQL en crear_evento).
 * OJO: en listar puede venir igual o muy parecido.
 */
type BackendEvento = {
  id_evento: number | string
  titulo_evento: string
  descripcion: string

  id_tipo_evento?: number | null
  nombre_evento?: string | null

  fecha_inicio: string
  fecha_fin: string

  id_salas?: number | null
  nombre_salas?: string | null

  capacidad: number

  id_estado?: number | null
  nombre_estado?: string | null

  id_carrera?: number | null
  nombre_carrera?: string | null

  id_semestre?: number | null
  nombre_semestre?: string | null

  creado_por?: string | null
  fecha_creacion?: string | null
  observaciones?: string | null
}

/**
 * Normaliza la respuesta para que SIEMPRE sea un array.
 * Soporta:
 *  - Array directo: [...]
 *  - DRF paginado: { results: [...] }
 *  - Envoltorios: { eventos: [...] } | { data: [...] }
 */
function normalizeEventsPayload(payload: unknown): BackendEvento[] {
  if (Array.isArray(payload)) return payload as BackendEvento[]

  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>

    if (Array.isArray(obj.results)) return obj.results as BackendEvento[]
    if (Array.isArray(obj.eventos)) return obj.eventos as BackendEvento[]
    if (Array.isArray(obj.data)) return obj.data as BackendEvento[]
  }

  console.warn('Respuesta inesperada al listar eventos:', payload)
  return []
}

/**
 * Mapea id_tipo_evento (o nombre_evento) a tu category del front.
 * Ajusta IDs según tu BD si es necesario.
 */
const CATEGORY_BY_TIPO_ID: Record<number, Event['category']> = {
  1: 'conferencia',
  2: 'taller',
  3: 'seminario',
  4: 'social',
  5: 'competencia',
  6: 'otro',
}

function mapCategory(be: BackendEvento): Event['category'] {
  const id = typeof be.id_tipo_evento === 'number' ? be.id_tipo_evento : null
  if (id && CATEGORY_BY_TIPO_ID[id]) return CATEGORY_BY_TIPO_ID[id]

  const nombre = (be.nombre_evento ?? '').toLowerCase()
  if (nombre.includes('confer')) return 'conferencia'
  if (nombre.includes('taller')) return 'taller'
  if (nombre.includes('semin')) return 'seminario'
  if (nombre.includes('social')) return 'social'
  if (nombre.includes('compet')) return 'competencia'

  return 'otro'
}

/**
 * Mapea nombre_estado backend -> status front.
 * Ajusta si tus nombres son distintos.
 */
function mapStatus(be: BackendEvento): any {
  const s = (be.nombre_estado ?? '').toLowerCase()

  if (s.includes('final')) return 'finalizado'
  if (s.includes('cancel')) return 'cancelado'
  if (s.includes('progreso')) return 'en_progreso'
  if (s.includes('plane')) return 'planeado'

  // default
  return 'activo'
}

/**
 * Backend -> Event (frontend)
 * Nota: tu backend no manda `time` ni `attendees`, así que ponemos defaults seguros.
 */
function mapBackendToEvent(be: BackendEvento): Event {
  return {
    id: String(be.id_evento),
    title: be.titulo_evento ?? '',
    description: be.descripcion ?? '',
    date: be.fecha_inicio ?? '',
    dateEnd: be.fecha_fin ?? '',
    time: '00:00',
    location: be.nombre_salas ?? '',
    capacity: Number(be.capacidad ?? 0),
    attendees: 0,
    category: mapCategory(be),
    carrera: be.nombre_carrera ?? '',
    semestre: be.nombre_semestre ?? '',
    // @ts-ignore (por si tu Event ya tiene status)
    status: mapStatus(be),
    observaciones: be.observaciones ?? '',
    fechaCreacion: be.fecha_creacion ? String(be.fecha_creacion).slice(0, 10) : '',
    organizer: be.creado_por ?? '',
  }
}

export const eventosAPI = {
  // ===============================
  // LISTAR EVENTOS (BD REAL)
  // ===============================
  async getAll(): Promise<Event[]> {
    const url = `${API_BASE_URL}/eventos/`
    console.log('Intentando conectar a:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      console.error('❌ Error backend listando eventos:', data)
      throw new Error(data ? JSON.stringify(data) : `Error ${response.status}`)
    }

    const backendEvents = normalizeEventsPayload(data)
    return backendEvents.map(mapBackendToEvent)
  },

  // ===============================
  // OBTENER EVENTO POR ID
  // ===============================
  async getById(id: string): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/eventos/${id}/`, {
      headers: { Accept: 'application/json' },
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      console.error('❌ Error backend getById:', data)
      throw new Error(data ? JSON.stringify(data) : `Error ${response.status}`)
    }

    return mapBackendToEvent(data as BackendEvento)
  },

  // ===============================
  // CREAR EVENTO (UI -> payload backend)
  // ===============================
  async create(evento: Omit<Event, 'id'>): Promise<Event> {
    const e: any = evento

    const payload = {
      titulo_evento: evento.title,
      descripcion: evento.description,
      fecha_inicio: evento.date,
      fecha_fin: evento.dateEnd,

      hora: evento.time, // ✅ se agrega la hora

      capacidad: evento.capacity,
      observaciones: evento.observaciones ?? '',

      // Estos IDs deben venir del EventForm (id_*):
      id_tipo_evento: e.id_tipo_evento,
      id_salas: e.id_salas,
      id_estado: e.id_estado ?? 1,

      id_carrera: e.id_carrera,
      id_semestre: e.id_semestre,

      creado_por: evento.organizer,
    }

    console.log('📤 Payload crear_evento:', payload)

    const response = await fetch(`${API_BASE_URL}/eventos/crear/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      console.error('❌ Error backend crear_evento:', data)
      throw new Error(data ? JSON.stringify(data) : `Error ${response.status}`)
    }

    // El backend devuelve { ok, message, data }
    // Aquí tomamos el "data" interno (el evento creado)
    const created = (data as any)?.data ?? data

    // Lo mapeamos a Event para tu UI.
    return mapBackendToEvent(created as BackendEvento)
  },


  // ===============================
  // ACTUALIZAR EVENTO
  // ===============================
  async update(id: string, evento: Partial<Event>): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/eventos/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(evento),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      console.error('❌ Error backend update:', data)
      throw new Error(data ? JSON.stringify(data) : `Error ${response.status}`)
    }

    // Si el backend devuelve backend shape, lo mapeamos.
    // Si ya devuelve shape UI, igual no se rompe.
    return (data && (data as any).titulo_evento) ? mapBackendToEvent(data as BackendEvento) : (data as Event)
  },

  // ===============================
  // ELIMINAR EVENTO
  // ===============================
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/eventos/${id}/eliminar/`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      console.error('❌ Error backend delete:', data)
      throw new Error(data ? JSON.stringify(data) : `Error ${response.status}`)
    }
  },
}



