const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ?? "http://127.0.0.1:8000";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message ?? `HTTP ${res.status}`);
  return data as T;
}

type ApiListResponse<T> = { ok: boolean; total: number; data: T[] };

export type Carrera = { id_carrera: number; nombre_carrera: string };
export type EstadoManual = { id_estado: number; nombre_estado: string };
export type Semestre = { id_semestre: number; nombre_semestre: string };
export type Sala = { id_salas: number; nombre_salas: string };
export type TipoEvento = { id_tipo_evento: number; nombre_evento: string };

export const catalogosApi = {
  carreras: () => getJson<ApiListResponse<Carrera>>("/carreras/"),
  estadosManuales: () => getJson<ApiListResponse<EstadoManual>>("/eventos/estados-manuales/"),
  semestres: () => getJson<ApiListResponse<Semestre>>("/semestres/"),
  salas: () => getJson<ApiListResponse<Sala>>("/salas/"),
  tiposEvento: () => getJson<ApiListResponse<TipoEvento>>("/eventos/tipos/"),
};
