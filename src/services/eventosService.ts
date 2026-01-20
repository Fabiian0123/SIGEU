import { Event } from '../types/Event'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://10.21.189.12:8080'

// Eventos de demostración como fallback
const demoEvents: Event[] = [
  {
    id: '1',
    title: 'Conferencia de Inteligencia Artificial',
    description: 'Explora las últimas tendencias en IA y machine learning con expertos de la industria.',
    date: '2026-02-15',
    time: '10:00',
    location: 'Auditorio Principal',
    capacity: 100,
    attendees: 85,
    category: 'conferencia',
    status: 'activo',
    organizer: 'Departamento de Tecnología',
  },
  {
    id: '2',
    title: 'Taller de Desarrollo Web',
    description: 'Aprende React, Node.js y desarrolla aplicaciones web modernas.',
    date: '2026-02-20',
    time: '14:00',
    location: 'Sala de Laboratorio 3',
    capacity: 30,
    attendees: 28,
    category: 'taller',
    status: 'activo',
    organizer: 'Club de Programación',
  },
  {
    id: '3',
    title: 'Seminario de Emprendimiento',
    description: 'Conoce cómo empezar tu propio negocio y obtén consejos de emprendedores exitosos.',
    date: '2026-02-25',
    time: '15:30',
    location: 'Aula 201',
    capacity: 50,
    attendees: 42,
    category: 'seminario',
    status: 'activo',
    organizer: 'Centro de Emprendimiento',
  },
  {
    id: '4',
    title: 'Fiesta de Bienvenida de Ciclo',
    description: 'Únete a nosotros para una noche de diversión, comida y networking entre estudiantes.',
    date: '2026-02-10',
    time: '20:00',
    location: 'Explanada Principal',
    capacity: 200,
    attendees: 150,
    category: 'social',
    status: 'activo',
    organizer: 'Bienestar Estudiantil',
  },
]

export const eventosAPI = {
  // Obtener todos los eventos
  async getAll(): Promise<Event[]> {
    try {
      console.log('Intentando conectar a:', `${API_BASE_URL}/eventos`)
      const response = await fetch(`${API_BASE_URL}/eventos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      const data = await response.json()
      console.log('Eventos cargados desde API:', data)
      return data
    } catch (error) {
      console.warn('No se pudo conectar a la API, usando datos de demostración:', error)
      return demoEvents
    }
  },

  // Obtener un evento por ID
  async getById(id: string): Promise<Event> {
    try {
      const response = await fetch(`${API_BASE_URL}/eventos/${id}`)
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching evento:', error)
      throw error
    }
  },

  // Crear un nuevo evento
  async create(evento: Omit<Event, 'id'>): Promise<Event> {
    try {
      const response = await fetch(`${API_BASE_URL}/eventos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evento),
      })
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error creating evento:', error)
      throw error
    }
  },

  // Actualizar un evento
  async update(id: string, evento: Partial<Event>): Promise<Event> {
    try {
      const response = await fetch(`${API_BASE_URL}/eventos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evento),
      })
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error updating evento:', error)
      throw error
    }
  },

  // Eliminar un evento
  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/eventos/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
    } catch (error) {
      console.error('Error deleting evento:', error)
      throw error
    }
  },
}
