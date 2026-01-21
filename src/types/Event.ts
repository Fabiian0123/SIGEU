export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  dateEnd: string;
  time: string;
  location: string;
  capacity: number;
  attendees: number;
  category: 'conferencia' | 'taller' | 'seminario' | 'social' | 'competencia' | 'otro';
  carrera: string;
  semestre: string;
  observaciones?: string;
  fechaCreacion: string;
  organizer: string;
  image?: string;
}

export type EventCategory = 'conferencia' | 'taller' | 'seminario' | 'social' | 'competencia' | 'otro';
export type EventStatus = 'activo' | 'planeado' | 'en_progreso' | 'finalizado' | 'cancelado';
