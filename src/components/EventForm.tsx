import { FC, useEffect, useMemo, useState } from "react";
import { Event } from "../types/Event";
import "../styles/EventForm.css";
import { catalogosApi, Carrera, EstadoManual, Sala, Semestre, TipoEvento } from "../api/catalogos";

interface EventFormProps {
  onSubmit: (event: Event) => void;
  initialEvent?: Event;
  isLoading?: boolean;
}

type FormState = {
  title: string;
  description: string;

  time: string;
  startDate: string;
  endDate: string;

  // Nuevo: ids
  id_tipo_evento: number | "";
  id_carrera: number | "";
  id_semestre: number | "";
  id_salas: number | "";
  id_estado: number | ""; // manual (3,4,5) opcional

  // Ubicación (solo si sala=1)
  location: string;

  capacity: number;
  attendees: number;

  observaciones?: string;
  fechaCreacion: string;
  organizer: string;
  image?: string;
};

const EventForm: FC<EventFormProps> = ({ onSubmit, initialEvent, isLoading = false }) => {
  const [formData, setFormData] = useState<FormState>(() => ({
    title: initialEvent?.title ?? "",
    description: initialEvent?.description ?? "",

    time: initialEvent?.time ?? "",
    startDate: "",
    endDate: "",

    // defaults (vacíos)
    id_tipo_evento: "",
    id_carrera: "",
    id_semestre: "",
    id_salas: "",
    id_estado: "",

    location: initialEvent?.location ?? "",

    capacity: initialEvent?.capacity ?? 50,
    attendees: initialEvent?.attendees ?? 0,

    observaciones: initialEvent?.observaciones ?? "",
    fechaCreacion: initialEvent?.fechaCreacion ?? new Date().toISOString().split("T")[0],
    organizer: initialEvent?.organizer ?? "",
    image: initialEvent?.image,
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Catálogos
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [estados, setEstados] = useState<EstadoManual[]>([]);
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [tipos, setTipos] = useState<TipoEvento[]>([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [catalogoError, setCatalogoError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoadingCatalogos(true);
        setCatalogoError(null);

        const [car, est, sem, sal, tip] = await Promise.all([
          catalogosApi.carreras(),
          catalogosApi.estadosManuales(),
          catalogosApi.semestres(),
          catalogosApi.salas(),
          catalogosApi.tiposEvento(),
        ]);

        if (!mounted) return;

        setCarreras(car.data ?? []);
        setEstados(est.data ?? []);
        setSemestres(sem.data ?? []);
        setSalas(sal.data ?? []);
        setTipos(tip.data ?? []);
      } catch (e: any) {
        if (!mounted) return;
        setCatalogoError(e?.message ?? "Error cargando catálogos");
      } finally {
        if (mounted) setLoadingCatalogos(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!initialEvent) return;

    const ie: any = initialEvent;

    const pickId = (...keys: string[]) => {
      for (const k of keys) {
        if (ie?.[k] !== undefined && ie?.[k] !== null && ie?.[k] !== "") return ie[k];
      }
      return "";
    };

    const toNumOrEmpty = (v: any) => (v === "" || v === null || v === undefined ? "" : Number(v));
    const toDate10 = (v: any) => (v ? String(v).slice(0, 10) : "");

    setFormData(prev => ({
      ...prev,
      title: ie?.title ?? ie?.titulo_evento ?? "",
      description: ie?.description ?? ie?.descripcion ?? "",

      startDate: toDate10(ie?.fecha_inicio ?? ie?.date),
      endDate: toDate10(ie?.fecha_fin ?? ie?.dateEnd),
      time: ie?.time ?? ie?.hora ?? "",

      id_tipo_evento: toNumOrEmpty(pickId("id_tipo_evento", "idTipoEvento")),
      id_salas: toNumOrEmpty(pickId("id_salas", "id_salas_id", "idSalas", "idSala")),
      id_carrera: toNumOrEmpty(pickId("id_carrera", "idCarrera")),
      id_semestre: toNumOrEmpty(pickId("id_semestre", "idSemestre")),
      id_estado: (() => {
        const v = toNumOrEmpty(pickId("id_estado", "idEstado"));
        return v === 3 || v === 4 || v === 5 ? v : "";
      })(),
      location: ie?.location ?? "",
      capacity: Number(ie?.capacity ?? ie?.capacidad ?? 50),
      attendees: Number(ie?.attendees ?? 0),

      observaciones: ie?.observaciones ?? "",
      fechaCreacion: toDate10(ie?.fecha_creacion ?? ie?.fechaCreacion) || new Date().toISOString().split("T")[0],
      organizer: ie?.organizer ?? ie?.creado_por ?? "",
      image: ie?.image,
    }));
  }, [initialEvent]);

  const salaSeleccionada = useMemo(() => {
    if (!formData.id_salas) return null;
    return salas.find(s => s.id_salas === formData.id_salas) ?? null;
  }, [formData.id_salas, salas]);

  const locationEnabled = formData.id_salas === 1;

  // Regla: si NO es sala 1, deshabilitar y limpiar ubicación
  useEffect(() => {
    if (!locationEnabled && formData.location) {
      setFormData(prev => ({ ...prev, location: "" }));
      setErrors(prev => {
        const n = { ...prev };
        delete n.location;
        return n;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationEnabled]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const now = new Date();
    const localNowTime = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");

    if (!formData.title.trim()) newErrors.title = "El título es requerido";
    if (!formData.description.trim()) newErrors.description = "La descripción es requerida";
    if (!formData.startDate) newErrors.startDate = "La fecha es requerida";
    if (!formData.endDate) newErrors.endDate = "La fecha fin es requerida";
    if (!formData.time) newErrors.time = "La hora es requerida";

    if (formData.startDate === localToday && formData.time && formData.time < localNowTime) {
      newErrors.time = "La hora no puede ser anterior a la hora actual";
    }

    if (!formData.id_tipo_evento) newErrors.id_tipo_evento = "El tipo de evento es requerido";
    if (!formData.id_carrera) newErrors.id_carrera = "La carrera es requerida";
    if (!formData.id_semestre) newErrors.id_semestre = "El semestre es requerido";
    if (!formData.id_salas) newErrors.id_salas = "La sala es requerida";

    // Ubicación SOLO si sala = 1
    if (locationEnabled && !formData.location.trim()) newErrors.location = "La ubicación es requerida";

    if (!formData.organizer.trim()) newErrors.organizer = "El organizador es requerido";
    if (!formData.capacity || formData.capacity < 1) newErrors.capacity = "La capacidad debe ser mayor a 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      // Campos numéricos
      if (name === "capacity" || name === "attendees") {
        return { ...prev, [name]: value };
      }

      // IDs numéricos (selects)
      if (name === "id_tipo_evento" || name === "id_carrera" || name === "id_semestre" || name === "id_salas" || name === "id_estado") {
        return { ...prev, [name]: value === "" ? "" : Number(value) };
      }

      return { ...prev, [name]: value };
    });

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // OJO: acá seguimos devolviendo el "Event" que tu app usa,
    // pero ya viene con IDs (si ajustas tu type, mejor).
    const event: any = {
      id: (initialEvent as any)?.id ?? (initialEvent as any)?.id_evento ?? Date.now().toString(),
      title: formData.title,
      description: formData.description,
      date: formData.startDate,
      dateEnd: formData.endDate,
      time: formData.time,
      location: formData.location,

      capacity: formData.capacity,
      attendees: formData.attendees,

      // IDs (para enviar al backend después)
      id_tipo_evento: formData.id_tipo_evento,
      id_carrera: formData.id_carrera,
      id_semestre: formData.id_semestre,
      id_salas: formData.id_salas,
      id_estado: formData.id_estado === "" ? undefined : formData.id_estado,

      observaciones: formData.observaciones,
      fechaCreacion: formData.fechaCreacion,
      organizer: formData.organizer,
      image: formData.image,
    };

    onSubmit(event);
  };

  const today = new Date();
  const localToday =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

  const now = new Date();
  const localNowTime =
    String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
  const minTime = formData.startDate === localToday ? localNowTime : undefined;

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      {catalogoError && <div className="error-message" style={{ marginBottom: 12 }}>{catalogoError}</div>}

      <div className="form-group">
        <label htmlFor="title">Título del Evento</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ej: Conferencia de Tecnología"
          className={errors.title ? "input-error" : ""}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Descripción</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe el evento..."
          rows={4}
          className={errors.description ? "input-error" : ""}
        />
        {errors.description && <span className="error-message">{errors.description}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate">Fecha Inicio</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            min={localToday}
            className={errors.startDate ? "input-error" : ""}
          />
          {errors.startDate && <span className="error-message">{errors.startDate}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="endDate">Fecha Fin</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            min={formData.startDate || localToday}
            disabled={!formData.startDate}
            className={errors.endDate ? "input-error" : ""}
          />
          {errors.endDate && <span className="error-message">{errors.endDate}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="time">Hora</label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            min={minTime}
            className={errors.time ? "input-error" : ""}
          />
          {errors.time && <span className="error-message">{errors.time}</span>}
        </div>
      </div>

      {/* Tipos de evento */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="id_tipo_evento">Tipo de Evento</label>
          <select
            id="id_tipo_evento"
            name="id_tipo_evento"
            value={formData.id_tipo_evento}
            onChange={handleChange}
            className={errors.id_tipo_evento ? "input-error" : ""}
            disabled={loadingCatalogos}
          >
            <option value="">Selecciona un tipo</option>
            {tipos.map(t => (
              <option key={t.id_tipo_evento} value={t.id_tipo_evento}>
                {t.nombre_evento}
              </option>
            ))}
          </select>
          {errors.id_tipo_evento && <span className="error-message">{errors.id_tipo_evento}</span>}
        </div>

        {/* Estados manuales (3,4,5) - opcional */}
        <div className="form-group">
          <label htmlFor="id_estado">Estado (manual)</label>
          <select
            id="id_estado"
            name="id_estado"
            value={formData.id_estado}
            onChange={handleChange}
            disabled={loadingCatalogos || !initialEvent}
          >
            <option value="">(Opcional) Selecciona estado</option>
            {estados.map(e => (
              <option key={e.id_estado} value={e.id_estado}>
                {e.nombre_estado}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sala + Ubicación */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="id_salas">Sala</label>
          <select
            id="id_salas"
            name="id_salas"
            value={formData.id_salas}
            onChange={handleChange}
            className={errors.id_salas ? "input-error" : ""}
            disabled={loadingCatalogos}
          >
            <option value="">Selecciona una sala</option>
            {salas.map(s => (
              <option key={s.id_salas} value={s.id_salas}>
                {s.nombre_salas}
              </option>
            ))}
          </select>
          {errors.id_salas && <span className="error-message">{errors.id_salas}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="location">Ubicación {salaSeleccionada ? `(${salaSeleccionada.nombre_salas})` : ""}</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder={locationEnabled ? "Ej: Aula 101" : "Se habilita solo si la sala es Salones (id 1)"}
            disabled={!locationEnabled}
            className={errors.location ? "input-error" : ""}
          />
          {errors.location && <span className="error-message">{errors.location}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="capacity">Capacidad</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            min="1"
            className={errors.capacity ? "input-error" : ""}
          />
          {errors.capacity && <span className="error-message">{errors.capacity}</span>}
        </div>
      </div>

      {/* Carrera + Semestre */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="id_carrera">Carrera</label>
          <select
            id="id_carrera"
            name="id_carrera"
            value={formData.id_carrera}
            onChange={handleChange}
            className={errors.id_carrera ? "input-error" : ""}
            disabled={loadingCatalogos}
          >
            <option value="">Selecciona una carrera</option>
            {carreras.map(c => (
              <option key={c.id_carrera} value={c.id_carrera}>
                {c.nombre_carrera}
              </option>
            ))}
          </select>
          {errors.id_carrera && <span className="error-message">{errors.id_carrera}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="id_semestre">Semestre</label>
          <select
            id="id_semestre"
            name="id_semestre"
            value={formData.id_semestre}
            onChange={handleChange}
            className={errors.id_semestre ? "input-error" : ""}
            disabled={loadingCatalogos}
          >
            <option value="">Selecciona un semestre</option>
            {semestres.map(s => (
              <option key={s.id_semestre} value={s.id_semestre}>
                {s.nombre_semestre}
              </option>
            ))}
          </select>
          {errors.id_semestre && <span className="error-message">{errors.id_semestre}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="observaciones">Observaciones</label>
        <textarea
          id="observaciones"
          name="observaciones"
          value={formData.observaciones ?? ""}
          onChange={handleChange}
          placeholder="Agregar observaciones adicionales"
          rows={3}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="fechaCreacion">Fecha de Creación</label>
          <input type="date" id="fechaCreacion" name="fechaCreacion" value={formData.fechaCreacion} disabled />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="organizer">Organizador</label>
        <input
          type="text"
          id="organizer"
          name="organizer"
          value={formData.organizer}
          onChange={handleChange}
          placeholder="Nombre del organizador"
          className={errors.organizer ? "input-error" : ""}
        />
        {errors.organizer && <span className="error-message">{errors.organizer}</span>}
      </div>

      <button type="submit" className="btn-submit" disabled={isLoading || loadingCatalogos}>
        {loadingCatalogos ? "Cargando listas..." : isLoading ? "Guardando..." : initialEvent ? "Actualizar Evento" : "Crear Evento"}
      </button>
    </form>
  );
};

export default EventForm;




