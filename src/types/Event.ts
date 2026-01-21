// Estados que usa la UI (derivados del backend)
export type EventStatus =
  | 'activo'
  | 'finalizado'
  | 'cancelado';

// Categorías (tipos de evento)
export type EventCategory =
  | 'conferencia'
  | 'taller'
  | 'seminario'
  | 'social'
  | 'competencia'
  | 'otro';

export interface Event {
  // Identificador
  id: string;

  // Información principal
  title: string;
  description: string;

  // Fechas
  date: string;       // fecha_inicio
  dateEnd: string;    // fecha_fin
  time: string;

  // Ubicación
  location: string;

  // Capacidad
  capacity: number;
  attendees: number;

  // Clasificación
  category: EventCategory;

  // Relación académica (texto para UI)
  carrera: string;
  semestre: string;

  // Estado del evento
  status: EventStatus;

  // Observaciones
  observaciones?: string;

  // Auditoría
  fechaCreacion: string;
  organizer: string;

  // Opcional
  image?: string;
}

