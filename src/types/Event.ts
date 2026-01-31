// src/types/Event.ts

export type EventStatus =
  | 'creado'
  | 'finalizado'
  | 'postpuesto'
  | 'pausado'
  | 'cancelado';

export type EventCategory =
  | 'Institucional'
  | 'Académico'
  | 'Recreativo y Cultural'
  | 'Religioso'
  | 'Deportivo'
  | 'Eventos de Extensión y Proyección'
  | 'Social'
  | 'Eventos Memoriales/Solemnes'
  | 'Eventos Administrativos'
  | 'Eventos de Innovación, Ciencia, y Tecnología'
  | 'Eventos Empresariales y de Empleabilidad'
  | 'Otro';

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

  category: EventCategory;

  carrera: string;
  semestre: string;

  status: EventStatus;

  observaciones?: string;

  fechaCreacion: string;
  organizer: string;

  image?: string;

  tipo_evento_label?: string;

  id_tipo_evento?: number | '';
  id_salas?: number | '';
  id_carrera?: number | '';
  id_semestre?: number | '';
  id_estado?: number | '';
}
