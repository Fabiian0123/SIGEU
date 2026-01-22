import { httpJson } from "./http";
import type { Event } from "../types/Event";

type CrearEventoResponse = {
  ok: boolean;
  message: string;
  data: any;
};

function toISODate(dateStr: string) {
  // Tu form ya trae yyyy-mm-dd, así que lo dejamos igual
  return dateStr;
}

// ⚠️ Ajusta estos IDs según tu BD
const TIPO_EVENTO_POR_CATEGORIA: Record<string, number> = {
  conferencia: 1,
  taller: 2,
  seminario: 3,
  social: 4,
  competencia: 5,
  otro: 6,
};

// ⚠️ Ajusta sala si la manejas por id. Por ahora lo dejo fijo.
const DEFAULT_SALA_ID = 1;

// ⚠️ Si en tu API el estado se asigna en back, puedes omitir id_estado.
// Si toca mandarlo, define el default (ej: "CREADO" = 1)
const DEFAULT_ESTADO_ID = 1;

export async function crearEvento(event: Event) {
  // Si tienes auth, acá meterías el token en headers.

  const payload = {
    titulo_evento: event.title,
    descripcion: event.description,
    fecha_inicio: toISODate(event.date),
    fecha_fin: toISODate(event.dateEnd),
    capacidad: event.capacity,
    observaciones: event.observaciones ?? "",

    // Estos probablemente sean FK en tu modelo:
    id_tipo_evento: TIPO_EVENTO_POR_CATEGORIA[event.category] ?? TIPO_EVENTO_POR_CATEGORIA.otro,
    id_salas: DEFAULT_SALA_ID,
    id_estado: DEFAULT_ESTADO_ID,
    id_carrera: event.carrera,   

    id_semestre: Number(event.semestre), 

    creado_por: event.organizer,
  };

  return httpJson<CrearEventoResponse>("/eventos/crear/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
