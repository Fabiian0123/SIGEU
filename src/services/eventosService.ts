// src/services/eventosService.ts
import { Event } from '../types/Event'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

type BackendEvento = {
  id_evento: number | string
  titulo_evento: string
  descripcion: string
  id_tipo_evento?: number | null
  nombre_evento?: string | null
  fecha_inicio: string
  fecha_fin: string
  hora?: string | null
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
  hora_fin?: string | null
  ubicacion?: string | null
  obligatorio?: boolean | null
  attendees?: number | null
  asistentes?: number | null
  inscritos?: number | null
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * ✅ Lee respuesta como texto y luego intenta parsear JSON.
 * Así puedes ver errores 500 aunque el backend devuelva HTML.
 */
async function readResponse(response: Response): Promise<{ json: any; text: string }> {
  const text = await response.text()
  try {
    const json = text ? JSON.parse(text) : null
    return { json, text }
  } catch {
    return { json: null, text }
  }
}

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

const CATEGORY_BY_TIPO_ID: Record<number, Event['category']> = {
  1: 'Institucional',
  2: 'Académico',
  3: 'Recreativo y Cultural',
  4: 'Religioso',
  5: 'Deportivo',
  6: 'Eventos de Extensión y Proyección',
  7: 'Social',
  8: 'Eventos Memoriales/Solemnes',
  9: 'Eventos Administrativos',
  10: 'Eventos de Innovación, Ciencia, y Tecnología',
  11: 'Eventos Empresariales y de Empleabilidad',
}

function mapCategory(be: BackendEvento): Event['category'] {
  const id = typeof be.id_tipo_evento === 'number' ? be.id_tipo_evento : null
  if (id && CATEGORY_BY_TIPO_ID[id]) return CATEGORY_BY_TIPO_ID[id]

  const nombre = (be.nombre_evento ?? '').toLowerCase()
  if (nombre.includes('institucional')) return 'Institucional'
  if (nombre.includes('académico') || nombre.includes('academico')) return 'Académico'
  if (nombre.includes('recreativo') || nombre.includes('cultural')) return 'Recreativo y Cultural'
  if (nombre.includes('religioso')) return 'Religioso'
  if (nombre.includes('deportivo')) return 'Deportivo'
  if (
    nombre.includes('extensión') ||
    nombre.includes('extension') ||
    nombre.includes('proyección') ||
    nombre.includes('proyeccion')
  )
    return 'Eventos de Extensión y Proyección'
  if (nombre.includes('social')) return 'Social'
  if (nombre.includes('memorial') || nombre.includes('solemne')) return 'Eventos Memoriales/Solemnes'
  if (nombre.includes('administrativo')) return 'Eventos Administrativos'
  if (
    nombre.includes('innovación') ||
    nombre.includes('innovacion') ||
    nombre.includes('ciencia') ||
    nombre.includes('tecnología') ||
    nombre.includes('tecnologia')
  )
    return 'Eventos de Innovación, Ciencia, y Tecnología'
  if (nombre.includes('empresarial') || nombre.includes('empleabilidad'))
    return 'Eventos Empresariales y de Empleabilidad'

  return 'Otro'
}

function mapStatus(be: BackendEvento): any {
  const id = typeof be.id_estado === 'number' ? be.id_estado : null

  if (id === 5) return 'cancelado'
  if (id === 4) return 'pausado'
  if (id === 3) return 'postpuesto'
  if (id === 2) return 'finalizado'
  if (id === 6) return 'en_curso'
  if (id === 1) return 'creado'

  const s = String(be.nombre_estado ?? '').toLowerCase()
  if (s.includes('cancel')) return 'cancelado'
  if (s.includes('paus')) return 'pausado'
  if (s.includes('post')) return 'postpuesto'
  if (s.includes('final')) return 'finalizado'
  if (s.includes('curso')) return 'en_curso'
  if (s.includes('crea')) return 'creado'

  return 'creado'
}

function mapBackendToEvent(be: BackendEvento): Event {
  const fi = be.fecha_inicio ? String(be.fecha_inicio).slice(0, 10) : ''
  const ff = be.fecha_fin ? String(be.fecha_fin).slice(0, 10) : ''

  const salaId = typeof be.id_salas === 'number' ? be.id_salas : null
  const showUbicacion = salaId === 1 || salaId === 3

  const salaNombre = String(be.nombre_salas ?? '').trim()
  const ubic = String((be as any).ubicacion ?? '').trim()
  const lugar = `${salaNombre}${showUbicacion && ubic ? ` ${ubic}` : ''}`.trim()

  return {
    id: String(be.id_evento),
    title: be.titulo_evento ?? '',
    description: be.descripcion ?? '',
    date: fi,
    dateEnd: ff,
    time: be.hora ?? '00:00',
    // @ts-ignore
    endTime: (be as any).hora_fin ?? (be as any).endTime ?? '',
    location: lugar,
    capacity: Number(be.capacidad ?? 0),
    attendees: Number((be as any).attendees ?? (be as any).asistentes ?? (be as any).inscritos ?? 0),

    category: mapCategory(be),

    // @ts-ignore
    tipo_evento_label: be.nombre_evento ?? '',
    // @ts-ignore
    carrera: be.nombre_carrera ?? '',
    // @ts-ignore
    semestre: be.nombre_semestre ?? '',
    // @ts-ignore
    status: mapStatus(be),

    observaciones: be.observaciones ?? '',
    fechaCreacion: be.fecha_creacion ? String(be.fecha_creacion).slice(0, 10) : '',
    organizer: be.creado_por ?? '',

    // @ts-ignore
    id_tipo_evento: be.id_tipo_evento ?? '',
    // @ts-ignore
    id_salas: be.id_salas ?? '',
    // @ts-ignore
    id_carrera: be.id_carrera ?? '',
    // @ts-ignore
    id_semestre: be.id_semestre ?? '',
    // @ts-ignore
    id_estado: be.id_estado ?? '',
    // @ts-ignore
    obligatorio: (be as any).obligatorio ?? null,
    // @ts-ignore
    ubicacion: (be as any).ubicacion ?? '',
  }
}

function logHttpError(tag: string, response: Response, json: any, text: string) {
  console.error(`❌ ${tag} HTTP ${response.status} ${response.statusText} -> ${response.url}`)
  if (json !== null) {
    console.error(`❌ ${tag} JSON:`, json)
  } else {
    console.error(`❌ ${tag} TEXT/HTML:`, text)
  }
}

export const eventosAPI = {

  async getAll(): Promise<Event[]> {
    const url = `${API_BASE_URL}/eventos/`
    console.log('Intentando conectar a:', url)

    const headers: HeadersInit = {
      Accept: 'application/json',
      ...authHeaders(),
    }

    const response = await fetch(url, { method: 'GET', headers })
    const { json, text } = await readResponse(response)

    if (!response.ok) {
      logHttpError('listando eventos', response, json, text)
      throw new Error(json ? JSON.stringify(json) : `Error ${response.status}`)
    }

    const backendEvents = normalizeEventsPayload(json)
    return backendEvents.map(mapBackendToEvent)
  },

  async getById(id: string): Promise<Event> {
    const url = `${API_BASE_URL}/eventos/${id}/`
    console.log('Intentando conectar a:', url)

    const headers: HeadersInit = {
      Accept: 'application/json',
      ...authHeaders(),
    }

    const response = await fetch(url, { method: 'GET', headers })
    const { json, text } = await readResponse(response)

    if (!response.ok) {
      logHttpError('get_evento_by_id', response, json, text)
      throw new Error(json ? JSON.stringify(json) : `Error ${response.status}`)
    }

    const evento = (json as any)?.data ?? json
    return mapBackendToEvent(evento as BackendEvento)
  },

  async filtrarPorCarreraSemestre(idCarrera: number, idSemestre?: number | null): Promise<Event[]> {
    const qs = new URLSearchParams()
    qs.set('id_carrera', String(idCarrera))

    if (idSemestre !== undefined && idSemestre !== null && Number(idSemestre) > 0) {
      qs.set('id_semestre', String(idSemestre))
    }

    const url = `${API_BASE_URL}/eventos/filtrar/?${qs.toString()}`
    console.log('Intentando conectar a:', url)

    const headers: HeadersInit = {
      Accept: 'application/json',
      ...authHeaders(),
    }

    const response = await fetch(url, { method: 'GET', headers })
    const { json, text } = await readResponse(response)

    if (!response.ok) {
      logHttpError('filtrando eventos', response, json, text)
      throw new Error(json ? JSON.stringify(json) : `Error ${response.status}`)
    }

    const backendEvents = normalizeEventsPayload(json)
    return backendEvents.map(mapBackendToEvent)
  },

  async create(evento: Omit<Event, 'id'>): Promise<Event> {
    const e: any = evento

    const payload = {
      titulo_evento: evento.title,
      descripcion: evento.description,
      fecha_inicio: evento.date,
      fecha_fin: evento.dateEnd,
      hora: evento.time,

      // ✅ backend está pidiendo endTime
      endTime: e.endTime,
      // ✅ compatibilidad por si en view/SQL/model estás usando hora_fin
      hora_fin: e.endTime,

      obligatorio: e.obligatorio,
      capacidad: evento.capacity,
      observaciones: evento.observaciones ?? '',
      id_tipo_evento: e.id_tipo_evento,
      id_salas: e.id_salas,
      id_estado: e.id_estado ?? 1,
      id_carrera: e.id_carrera,
      ...(e.id_semestre !== '' && e.id_semestre !== null && e.id_semestre !== undefined
        ? { id_semestre: e.id_semestre }
        : {}),
      creado_por: evento.organizer,
      ubicacion: (e.id_salas === 1 || e.id_salas === 3) ? (evento.location ?? '') : '',
    }

    console.log('📤 Payload crear_evento:', payload)

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...authHeaders(),
    }

    const response = await fetch(`${API_BASE_URL}/eventos/crear/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    const { json, text } = await readResponse(response)

    if (!response.ok) {
      logHttpError('crear_evento', response, json, text)
      throw new Error(json ? JSON.stringify(json) : `Error ${response.status}`)
    }

    const created = (json as any)?.data ?? json
    return mapBackendToEvent(created as BackendEvento)
  },

  async update(id: string, evento: Partial<Event>): Promise<Event> {
    const e: any = evento
    const payload: any = {}

    if (evento.title !== undefined) payload.titulo_evento = evento.title
    if (evento.description !== undefined) payload.descripcion = evento.description
    if (evento.date !== undefined) payload.fecha_inicio = evento.date
    if (evento.dateEnd !== undefined) payload.fecha_fin = evento.dateEnd
    if (evento.time !== undefined) payload.hora = evento.time

    if (e.endTime !== undefined) {
      payload.endTime = e.endTime
      payload.hora_fin = e.endTime
    }

    if (e.obligatorio !== undefined) payload.obligatorio = e.obligatorio
    if (evento.capacity !== undefined) payload.capacidad = evento.capacity
    if (evento.observaciones !== undefined) payload.observaciones = evento.observaciones
    if (e.id_tipo_evento !== undefined) payload.id_tipo_evento = e.id_tipo_evento
    if (e.id_salas !== undefined) payload.id_salas = e.id_salas
    if (e.id_estado !== undefined) payload.id_estado = e.id_estado
    if (e.id_carrera !== undefined) payload.id_carrera = e.id_carrera
    if (e.id_semestre !== undefined) payload.id_semestre = e.id_semestre
    if (evento.organizer !== undefined) payload.creado_por = evento.organizer

    // ✅ FIX: Ubicación se guarda en BD como "ubicacion", pero el form envía "location".
    // Solo aplica si id_salas es 1 o 3. Si cambia a otra sala, se limpia.
    const salaId =
      e.id_salas !== undefined && e.id_salas !== null && e.id_salas !== ''
        ? Number(e.id_salas)
        : undefined

    if (salaId === 1 || salaId === 3) {
      if (evento.location !== undefined) payload.ubicacion = evento.location
      if ((evento as any).ubicacion !== undefined) payload.ubicacion = (evento as any).ubicacion
    } else if (salaId !== undefined) {
      payload.ubicacion = ''
    }

    // ✅ soportar asistentes con ambos nombres
    if ((evento as any).attendees !== undefined) {
      payload.attendees = (evento as any).attendees
      payload.asistentes = (evento as any).attendees
    }

    console.log('📤 Payload update_evento:', payload)

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...authHeaders(),
    }

    const response = await fetch(`${API_BASE_URL}/eventos/${id}/`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    })

    const { json, text } = await readResponse(response)

    if (!response.ok) {
      logHttpError('update_evento', response, json, text)
      throw new Error(json ? JSON.stringify(json) : `Error ${response.status}`)
    }

    const updated = (json as any)?.data ?? json

    // ✅ si backend NO retorna el evento completo, lo pedimos por GET
    if (!updated || !(updated as any).titulo_evento) {
      return await this.getById(id)
    }

    return mapBackendToEvent(updated as BackendEvento)
  },

  async delete(id: string): Promise<void> {
    const headers: HeadersInit = {
      Accept: 'application/json',
      ...authHeaders(),
    }

    const response = await fetch(`${API_BASE_URL}/eventos/${id}/eliminar/`, {
      method: 'DELETE',
      headers,
    })

    const { json, text } = await readResponse(response)

    if (!response.ok) {
      logHttpError('delete_evento', response, json, text)
      throw new Error(json ? JSON.stringify(json) : `Error ${response.status}`)
    }
  },
}



















