import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Row, Col } from "react-bootstrap";
import { Event } from "../types/Event";
import "../styles/EventForm.css";
import {
  catalogosApi,
  Carrera,
  EstadoManual,
  Sala,
  Semestre,
  TipoEvento,
} from "../api/catalogos";

interface EventFormProps {
  onSubmit: (event: Event) => void;
  initialEvent?: Event;
  isLoading?: boolean;
}

type FormState = {
  title: string;
  description: string;
  time: string; // hora inicio
  endTime: string; // ✅ hora fin
  startDate: string;
  endDate: string;
  id_tipo_evento: number | "";
  id_carrera: number | "";
  id_semestre: number | "";
  id_salas: number | "";
  id_estado: number | ""; // manual (3,4,5) opcional
  obligatorio: boolean | null; // ✅ nuevo (obligatorio)
  location: string;
  capacity: number;
  attendees: number;
  observaciones?: string;
  fechaCreacion: string;
  organizer: string;
  image?: string;
};

const EventForm: FC<EventFormProps> = ({
  onSubmit,
  initialEvent,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<FormState>(() => ({
    title: initialEvent?.title ?? "",
    description: initialEvent?.description ?? "",
    time: initialEvent?.time ?? "",
    endTime: (initialEvent as any)?.endTime ?? "",
    startDate: "",
    endDate: "",
    id_tipo_evento: "",
    id_carrera: "",
    id_semestre: "",
    id_salas: "",
    id_estado: "",
    obligatorio: (initialEvent as any)?.obligatorio ?? null, // ✅ nuevo
    location: initialEvent?.location ?? "",
    capacity: initialEvent?.capacity ?? 1,
    attendees: initialEvent?.attendees ?? 0,
    observaciones: (initialEvent as any)?.observaciones ?? "",
    fechaCreacion:
      (initialEvent as any)?.fechaCreacion ??
      new Date().toISOString().split("T")[0],
    organizer: (initialEvent as any)?.organizer ?? "",
    image: (initialEvent as any)?.image,
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
        if (ie?.[k] !== undefined && ie?.[k] !== null && ie?.[k] !== "")
          return ie[k];
      }
      return "";
    };

    const toNumOrEmpty = (v: any) =>
      v === "" || v === null || v === undefined ? "" : Number(v);

    const toDate10 = (v: any) => (v ? String(v).slice(0, 10) : "");

    setFormData((prev) => ({
      ...prev,
      title: ie?.title ?? ie?.titulo_evento ?? "",
      description: ie?.description ?? ie?.descripcion ?? "",
      startDate: toDate10(ie?.fecha_inicio ?? ie?.date),
      endDate: toDate10(ie?.fecha_fin ?? ie?.dateEnd),
      time: ie?.time ?? ie?.hora ?? "",
      endTime: ie?.endTime ?? ie?.hora_fin ?? "",
      id_tipo_evento: toNumOrEmpty(pickId("id_tipo_evento", "idTipoEvento")),
      id_salas: toNumOrEmpty(
        pickId("id_salas", "id_salas_id", "idSalas", "idSala")
      ),
      id_carrera: toNumOrEmpty(pickId("id_carrera", "idCarrera")),
      id_semestre: toNumOrEmpty(pickId("id_semestre", "idSemestre")),
      id_estado: (() => {
        const v = toNumOrEmpty(pickId("id_estado", "idEstado"));
        return v === 3 || v === 4 || v === 5 ? v : "";
      })(),
      obligatorio: ie?.obligatorio ?? null, // ✅ nuevo
      // ✅ IMPORTANTE: para edición, usa el campo real de BD
      location: (ie?.ubicacion ?? "").trim() || (ie?.location ?? "").replace(/^Salones\s+/i, "").replace(/^Convenios\s+/i, "").trim() || "",
      capacity: Number(ie?.capacity ?? ie?.capacidad ?? 1),
      attendees: Number(ie?.attendees ?? 0),
      observaciones: ie?.observaciones ?? "",
      fechaCreacion:
        toDate10(ie?.fecha_creacion ?? ie?.fechaCreacion) ||
        new Date().toISOString().split("T")[0],
      organizer: ie?.organizer ?? ie?.creado_por ?? "",
      image: ie?.image,
    }));
  }, [initialEvent]);

  const salaSeleccionada = useMemo(() => {
    if (!formData.id_salas) return null;
    return salas.find((s) => s.id_salas === formData.id_salas) ?? null;
  }, [formData.id_salas, salas]);

  const locationEnabled = formData.id_salas === 1 || formData.id_salas === 3;

  // ✅ Evita borrar ubicación al montar (especialmente en edición)
  const didMountLocationRef = useRef(false);

  useEffect(() => {
    if (!locationEnabled) {
      setFormData((prev) => {
        if (!prev.location) return prev;
        return { ...prev, location: "" };
      });

      setErrors((prev) => {
        if (!prev.location) return prev;
        const n = { ...prev };
        delete n.location;
        return n;
      });
    }
  }, [locationEnabled]);

  const today = new Date();
  const localToday =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

  const now = new Date();
  const localNowTime =
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0");

  const minTime = formData.startDate === localToday ? localNowTime : undefined;

  useEffect(() => {
    if (!formData.time || !formData.endTime) return;
    if (formData.endTime <= formData.time) {
      setFormData((prev) => ({
        ...prev,
        endTime: "",
      }));

      setErrors((prev) => ({
        ...prev,
        endTime: "La hora fin debe ser mayor a la hora inicio",
      }));
    }
  }, [formData.time]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "El título es requerido";
    if (!formData.description.trim())
      newErrors.description = "La descripción es requerida";
    if (!formData.startDate) newErrors.startDate = "La fecha es requerida";
    if (!formData.endDate) newErrors.endDate = "La fecha fin es requerida";
    if (!formData.time) newErrors.time = "La hora inicio es requerida";
    if (!formData.endTime) newErrors.endTime = "La hora fin es requerida";

    if (
      formData.startDate === localToday &&
      formData.time &&
      formData.time < localNowTime
    ) {
      newErrors.time = "La hora no puede ser anterior a la hora actual";
    }

    if (formData.time && formData.endTime && formData.endTime <= formData.time) {
      newErrors.endTime = "La hora fin debe ser mayor a la hora inicio";
    }

    if (!formData.id_tipo_evento)
      newErrors.id_tipo_evento = "El tipo de evento es requerido";
    if (!formData.id_carrera) newErrors.id_carrera = "La carrera es requerida";
    if (!formData.id_salas) newErrors.id_salas = "La sala es requerida";

    if (formData.obligatorio === null) {
      newErrors.obligatorio = "Debe seleccionar Sí o No";
    }

    if (locationEnabled && !formData.location.trim())
      newErrors.location = "La ubicación es requerida";

    if (!formData.organizer.trim())
      newErrors.organizer = "El organizador es requerido";
    if (!formData.capacity || Number(formData.capacity) < 1)
      newErrors.capacity = "La capacidad debe ser mayor a 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (


    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {

    const { name, value } = e.target;

    if (
      e.target instanceof HTMLInputElement &&
      e.target.type === "checkbox" &&
      name === "obligatorio"
    ) {
      setFormData((prev) => ({
        ...prev,
        obligatorio: value === "si",
      }));
      const { name, value } = e.target;
      console.log("✍️ handleChange", { name, value, type: (e.target as any).type });

      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
      return;
    }

    setFormData((prev) => {
      if (name === "capacity" || name === "attendees") {
        return {
          ...prev,
          [name]: value === "" ? "" : Number(value),
        };
      }

      if (
        name === "id_tipo_evento" ||
        name === "id_carrera" ||
        name === "id_semestre" ||
        name === "id_salas" ||
        name === "id_estado"
      ) {
        return { ...prev, [name]: value === "" ? "" : Number(value) };
      }

      return { ...prev, [name]: value };
    });

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  useEffect(() => {
    console.log("🧭 WATCH -> id_salas/capacity", {
      id_salas: formData.id_salas,
      capacity: formData.capacity,
    });
  }, [formData.id_salas, formData.capacity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const event: any = {
      id:
        (initialEvent as any)?.id ??
        (initialEvent as any)?.id_evento ??
        Date.now().toString(),
      title: formData.title,
      description: formData.description,
      date: formData.startDate,
      dateEnd: formData.endDate,
      time: formData.time,
      endTime: formData.endTime,
      location: formData.location,
      capacity: formData.capacity,
      attendees: formData.attendees,
      id_tipo_evento: formData.id_tipo_evento,
      id_carrera: formData.id_carrera,
      id_semestre: formData.id_semestre,
      id_salas: formData.id_salas,
      id_estado: formData.id_estado === "" ? undefined : formData.id_estado,
      obligatorio: formData.obligatorio, // ✅ nuevo
      observaciones: formData.observaciones,
      fechaCreacion: formData.fechaCreacion,
      organizer: formData.organizer,
      image: formData.image,
    };
    console.log("✅ SUBMIT FINAL", {
      id_salas: formData.id_salas,
      capacity: formData.capacity,
      attendees: formData.attendees,
    });
    // console.log("✅ SUBMIT formData.capacity:", formData.capacity, "type:", typeof formData.capacity);
    onSubmit(event);
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      {catalogoError && (
        <div className="error-message" style={{ marginBottom: 12 }}>
          {catalogoError}
        </div>
      )}

      <Row className="g-1">
        <Col xs={12}>
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
            {errors.title && (
              <span className="error-message">{errors.title}</span>
            )}
          </div>
        </Col>

        <Col xs={12}>
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
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
          </div>
        </Col>

        {/* Fechas / Horas */}
        <Row className="g-1">
          <Col md={6}>
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
              {errors.startDate && (
                <span className="error-message">{errors.startDate}</span>
              )}
            </div>
          </Col>

          <Col md={6}>
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
              {errors.endDate && (
                <span className="error-message">{errors.endDate}</span>
              )}
            </div>
          </Col>
        </Row>

        <Row className="g-1">
          <Col xs={12} md={6}>
            <div className="form-group">
              <label htmlFor="time">Hora Inicio</label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                min={minTime}
                className={errors.time ? "input-error" : ""}
              />
              {errors.time && (
                <span className="error-message">{errors.time}</span>
              )}
            </div>
          </Col>

          <Col xs={12} md={6}>
            <div className="form-group">
              <label htmlFor="endTime">Hora Fin</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                min={minTime}
                className={errors.endTime ? "input-error" : ""}
              />
              {errors.endTime && (
                <span className="error-message">{errors.endTime}</span>
              )}
            </div>
          </Col>
        </Row>

        {/* Tipo evento / Estado manual */}
        <Row className="g-1">
          <Col xs={12} md={6}>
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
                {tipos.map((t) => (
                  <option key={t.id_tipo_evento} value={t.id_tipo_evento}>
                    {t.nombre_evento}
                  </option>
                ))}
              </select>
              {errors.id_tipo_evento && (
                <span className="error-message">{errors.id_tipo_evento}</span>
              )}
            </div>
          </Col>

          <Col xs={12} md={6}>
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
                {estados.map((e) => (
                  <option key={e.id_estado} value={e.id_estado}>
                    {e.nombre_estado}
                  </option>
                ))}
              </select>
            </div>
          </Col>
        </Row>

        {/* Sala / Ubicación */}
        <Col xs={12} md={6}>
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
              {salas.map((s) => (
                <option key={s.id_salas} value={s.id_salas}>
                  {s.nombre_salas}
                </option>
              ))}
            </select>
            {errors.id_salas && (
              <span className="error-message">{errors.id_salas}</span>
            )}
          </div>
        </Col>

        <Col xs={12} md={6}>
          <div className="form-group">
            <label htmlFor="location">
              Ubicación{" "}
              {salaSeleccionada ? `(${salaSeleccionada.nombre_salas})` : ""}
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location || String((initialEvent as any)?.ubicacion ?? "").trim()}
              onChange={handleChange}
              placeholder={
                locationEnabled
                  ? "Ej: Aula 101"
                  : "Se habilita solo si la sala es Salones (id 1)"
              }
              disabled={!locationEnabled}
              className={errors.location ? "input-error" : ""}
            />
            {errors.location && (
              <span className="error-message">{errors.location}</span>
            )}
          </div>
        </Col>

        {/* Capacidad */}
        <Col xs={12} md={6}>
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
            {errors.capacity && (
              <span className="error-message">{errors.capacity}</span>
            )}
          </div>
        </Col>

        {/* Carrera / Semestre / Obligatorio */}
        <Col xs={12} md={6}>
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
              {carreras.map((c) => (
                <option key={c.id_carrera} value={c.id_carrera}>
                  {c.nombre_carrera}
                </option>
              ))}
            </select>
            {errors.id_carrera && (
              <span className="error-message">{errors.id_carrera}</span>
            )}
          </div>
        </Col>

        <Row className="g-1">
          <Col xs={12} md={6}>
            <div className="form-group">
              <label htmlFor="id_semestre">
                Semestre <span style={{ fontWeight: 400, color: '#888' }}></span>
              </label>
              <select
                id="id_semestre"
                name="id_semestre"
                value={formData.id_semestre}
                onChange={handleChange}
                disabled={loadingCatalogos}
              >
                <option value="">Selecciona un semestre</option>
                {semestres.map((s) => (
                  <option key={s.id_semestre} value={s.id_semestre}>
                    {s.nombre_semestre}
                  </option>
                ))}
              </select>
            </div>
          </Col>

          <Col xs={12} md={3} style={{ marginLeft: "100px" }}>
            <div className="form-group">
              <label>Obligatorio</label>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <label
                  style={{
                    margin: 0,
                    display: "flex",
                    gap: "6px",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="checkbox"
                    name="obligatorio"
                    value="si"
                    checked={formData.obligatorio === true}
                    onChange={handleChange}
                  />
                  Sí
                </label>

                <label
                  style={{
                    margin: 0,
                    display: "flex",
                    gap: "6px",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="checkbox"
                    name="obligatorio"
                    value="no"
                    checked={formData.obligatorio === false}
                    onChange={handleChange}
                  />
                  No
                </label>
              </div>
              {errors.obligatorio && (
                <span className="error-message">{errors.obligatorio}</span>
              )}
            </div>
          </Col>
        </Row>

        {/* Observaciones */}
        <Col xs={12}>
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
        </Col>

        {/* Fecha creación */}
        <Col xs={12} md={6}>
          <div className="form-group">
            <label htmlFor="fechaCreacion">Fecha de Creación</label>
            <input
              type="date"
              id="fechaCreacion"
              name="fechaCreacion"
              value={formData.fechaCreacion}
              disabled
            />
          </div>
        </Col>

        {/* Organizador */}
        <Col xs={12} md={12}>
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
            {errors.organizer && (
              <span className="error-message">{errors.organizer}</span>
            )}
          </div>
        </Col>

        {/* Botón */}
        <Col xs={12}>
          <button
            type="submit"
            className="btn-submit"
            disabled={isLoading || loadingCatalogos}
          >
            {loadingCatalogos
              ? "Cargando listas..."
              : isLoading
                ? "Guardando..."
                : initialEvent
                  ? "Actualizar Evento"
                  : "Crear Evento"}
          </button>
        </Col>
      </Row>
    </form>
  );
};

export default EventForm;






