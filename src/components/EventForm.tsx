import { FC, useState } from 'react'
import { Event, EventCategory, EventStatus } from '../types/Event'
import '../styles/EventForm.css'

interface EventFormProps {
  onSubmit: (event: Event) => void;
  initialEvent?: Event;
  isLoading?: boolean;
}

const EventForm: FC<EventFormProps> = ({ onSubmit, initialEvent, isLoading = false }) => {
  const [formData, setFormData] = useState<Partial<Event>>(
    initialEvent || {
      title: '',
      description: '',
      date: '',
      dateEnd: '',
      time: '',
      location: '',
      capacity: 50,
      attendees: 0,
      category: 'conferencia',
      carrera: '',
      semestre: '',
      observaciones: '',
      fechaCreacion: new Date().toISOString().split('T')[0],
      organizer: '',
    }
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title?.trim()) newErrors.title = 'El título es requerido'
    if (!formData.description?.trim()) newErrors.description = 'La descripción es requerida'
    if (!formData.date) newErrors.date = 'La fecha es requerida'
    if (!formData.dateEnd) newErrors.dateEnd = 'La fecha fin es requerida'
    if (!formData.time) newErrors.time = 'La hora es requerida'
    if (!formData.location?.trim()) newErrors.location = 'La ubicación es requerida'
    if (!formData.carrera?.trim()) newErrors.carrera = 'La carrera es requerida'
    if (!formData.semestre?.trim()) newErrors.semestre = 'El semestre es requerido'
    if (!formData.organizer?.trim()) newErrors.organizer = 'El organizador es requerido'
    if (!formData.capacity || formData.capacity < 1)
      newErrors.capacity = 'La capacidad debe ser mayor a 0'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' || name === 'attendees' ? parseInt(value) : value,
    }))
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const event: Event = {
      id: initialEvent?.id || Date.now().toString(),
      title: formData.title!,
      description: formData.description!,
      date: formData.date!,
      dateEnd: formData.dateEnd!,
      time: formData.time!,
      location: formData.location!,
      capacity: formData.capacity || 50,
      attendees: formData.attendees || 0,
      category: (formData.category as EventCategory) || 'conferencia',
      carrera: formData.carrera!,
      semestre: formData.semestre!,
      observaciones: formData.observaciones,
      fechaCreacion: formData.fechaCreacion || new Date().toISOString().split('T')[0],
      organizer: formData.organizer!,
      image: formData.image,
    }

    onSubmit(event)
  }

  return (
    <form className='event-form' onSubmit={handleSubmit}>
      <div className='form-group'>
        <label htmlFor='title'>Título del Evento</label>
        <input
          type='text'
          id='title'
          name='title'
          value={formData.title || ''}
          onChange={handleChange}
          placeholder='Ej: Conferencia de Tecnología'
          className={errors.title ? 'input-error' : ''}
        />
        {errors.title && <span className='error-message'>{errors.title}</span>}
      </div>

      <div className='form-group'>
        <label htmlFor='description'>Descripción</label>
        <textarea
          id='description'
          name='description'
          value={formData.description || ''}
          onChange={handleChange}
          placeholder='Describe el evento...'
          rows={4}
          className={errors.description ? 'input-error' : ''}
        />
        {errors.description && <span className='error-message'>{errors.description}</span>}
      </div>

      <div className='form-row'>
        <div className='form-group'>
          <label htmlFor='date'>Fecha</label>
          <input
            type='date'
            id='date'
            name='date'
            value={formData.date || ''}
            onChange={handleChange}
            className={errors.date ? 'input-error' : ''}
          />
          {errors.date && <span className='error-message'>{errors.date}</span>}
        </div>

        <div className='form-group'>
          <label htmlFor='dateEnd'>Fecha Fin</label>
          <input
            type='date'
            id='dateEnd'
            name='dateEnd'
            value={formData.dateEnd || ''}
            onChange={handleChange}
            className={errors.dateEnd ? 'input-error' : ''}
          />
          {errors.dateEnd && <span className='error-message'>{errors.dateEnd}</span>}
        </div>

        <div className='form-group'>
          <label htmlFor='time'>Hora</label>
          <input
            type='time'
            id='time'
            name='time'
            value={formData.time || ''}
            onChange={handleChange}
            className={errors.time ? 'input-error' : ''}
          />
          {errors.time && <span className='error-message'>{errors.time}</span>}
        </div>
      </div>

      <div className='form-group'>
        <label htmlFor='location'>Ubicación</label>
        <input
          type='text'
          id='location'
          name='location'
          value={formData.location || ''}
          onChange={handleChange}
          placeholder='Ej: Aula 101'
          className={errors.location ? 'input-error' : ''}
        />
        {errors.location && <span className='error-message'>{errors.location}</span>}
      </div>

      <div className='form-row'>
        <div className='form-group'>
          <label htmlFor='capacity'>Capacidad</label>
          <input
            type='number'
            id='capacity'
            name='capacity'
            value={formData.capacity || 50}
            onChange={handleChange}
            min='1'
            className={errors.capacity ? 'input-error' : ''}
          />
          {errors.capacity && <span className='error-message'>{errors.capacity}</span>}
        </div>

        <div className='form-group'>
          <label htmlFor='category'>Categoría</label>
          <select
            id='category'
            name='category'
            value={formData.category || 'conferencia'}
            onChange={handleChange}
          >
            <option value='conferencia'>Conferencia</option>
            <option value='taller'>Taller</option>
            <option value='seminario'>Seminario</option>
            <option value='social'>Evento Social</option>
            <option value='competencia'>Competencia</option>
            <option value='otro'>Otro</option>
          </select>
        </div>
      </div>

      <div className='form-row'>
        <div className='form-group'>
          <label htmlFor='carrera'>Carrera</label>
          <select
            id='carrera'
            name='carrera'
            value={formData.carrera || ''}
            onChange={handleChange}
            className={errors.carrera ? 'input-error' : ''}
          >
            <option value=''>Selecciona una carrera</option>
            <option value='Ingeniería en Sistemas'>Ingeniería en Sistemas</option>
            <option value='Ingeniería Industrial'>Ingeniería Industrial</option>
            <option value='Administración'>Administración</option>
            <option value='Contabilidad'>Contabilidad</option>
            <option value='Derecho'>Derecho</option>
          </select>
          {errors.carrera && <span className='error-message'>{errors.carrera}</span>}
        </div>

        <div className='form-group'>
          <label htmlFor='semestre'>Semestre</label>
          <select
            id='semestre'
            name='semestre'
            value={formData.semestre || ''}
            onChange={handleChange}
            className={errors.semestre ? 'input-error' : ''}
          >
            <option value=''>Selecciona un semestre</option>
            <option value='1'>1</option>
            <option value='2'>2</option>
            <option value='3'>3</option>
            <option value='4'>4</option>
            <option value='5'>5</option>
            <option value='6'>6</option>
            <option value='7'>7</option>
            <option value='8'>8</option>
            <option value='9'>9</option>
            <option value='10'>10</option>
          </select>
          {errors.semestre && <span className='error-message'>{errors.semestre}</span>}
        </div>
      </div>

      <div className='form-group'>
        <label htmlFor='observaciones'>Observaciones</label>
        <textarea
          id='observaciones'
          name='observaciones'
          value={formData.observaciones || ''}
          onChange={handleChange}
          placeholder='Agregar observaciones adicionales'
          rows={3}
        />
      </div>

      <div className='form-row'>
        <div className='form-group'>
          <label htmlFor='fechaCreacion'>Fecha de Creación</label>
          <input
            type='date'
            id='fechaCreacion'
            name='fechaCreacion'
            value={formData.fechaCreacion || new Date().toISOString().split('T')[0]}
            disabled
          />
        </div>
      </div>

      <div className='form-group'>
        <label htmlFor='organizer'>Organizador</label>
        <input
          type='text'
          id='organizer'
          name='organizer'
          value={formData.organizer || ''}
          onChange={handleChange}
          placeholder='Nombre del organizador'
          className={errors.organizer ? 'input-error' : ''}
        />
        {errors.organizer && <span className='error-message'>{errors.organizer}</span>}
      </div>

      <button type='submit' className='btn-submit' disabled={isLoading}>
        {isLoading ? 'Guardando...' : initialEvent ? 'Actualizar Evento' : 'Crear Evento'}
      </button>
    </form>
  )
}

export default EventForm
