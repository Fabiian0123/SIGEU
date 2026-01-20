import { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, UserRole } from '../contexts/AuthContext'
import '../styles/AuthPage.css'

const AuthPage: FC = () => {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [rol, setRol] = useState<UserRole>('estudiante')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email || !password) {
      setError('Por favor completa todos los campos')
      return
    }

    if (isLogin) {
      if (login(email, password)) {
        setSuccess('¡Inicio de sesión exitoso!')
        setTimeout(() => {
          const user = JSON.parse(localStorage.getItem('sigeu_current_user') || '{}')
          if (user.rol === 'administrativo') {
            navigate('/admin')
          } else {
            navigate('/estudiante')
          }
        }, 500)
      } else {
        setError('Email o contraseña incorrectos')
      }
    } else {
      if (!nombre) {
        setError('Por favor ingresa tu nombre')
        return
      }

      if (register(email, password, nombre, rol)) {
        setSuccess('¡Registro exitoso! Iniciando sesión...')
        setTimeout(() => {
          if (rol === 'administrativo') {
            navigate('/admin')
          } else {
            navigate('/estudiante')
          }
        }, 500)
      } else {
        setError('El email ya está registrado')
      }
    }
  }

  return (
    <div className='auth-container'>
      <div className='auth-card'>
        <div className='auth-header'>
          <img src='/fesclogo.png' alt='FESC Logo' className='auth-logo' />
          <h1>SIGEU</h1>
          <p className='auth-subtitle'>Sistema de Gestión de Eventos Universitarios</p>
        </div>

        <form className='auth-form' onSubmit={handleSubmit}>
          <h2>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>

          {error && <div className='auth-error'>{error}</div>}
          {success && <div className='auth-success'>{success}</div>}

          <div className='form-group'>
            <label>Email</label>
            <input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='tu@email.com'
            />
          </div>

          {!isLogin && (
            <div className='form-group'>
              <label>Nombre Completo</label>
              <input
                type='text'
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder='Tu nombre'
              />
            </div>
          )}

          <div className='form-group'>
            <label>Contraseña</label>
            <input
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='••••••••'
            />
          </div>

          {!isLogin && (
            <div className='form-group'>
              <label>Tipo de Usuario</label>
              <div className='role-options'>
                <label className='role-label'>
                  <input
                    type='radio'
                    name='rol'
                    value='estudiante'
                    checked={rol === 'estudiante'}
                    onChange={e => setRol(e.target.value as UserRole)}
                  />
                  <span>👤 Estudiante</span>
                </label>
                <label className='role-label'>
                  <input
                    type='radio'
                    name='rol'
                    value='administrativo'
                    checked={rol === 'administrativo'}
                    onChange={e => setRol(e.target.value as UserRole)}
                  />
                  <span>🔑 Administrativo</span>
                </label>
              </div>
            </div>
          )}

          <button type='submit' className='auth-button'>
            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </button>

          <div className='auth-toggle'>
            <p>
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              <button
                type='button'
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                  setSuccess('')
                }}
              >
                {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
              </button>
            </p>
          </div>
        </form>

        <div className='auth-footer'>
          <p>FESC - Fundación de Educación Superior Confanorte</p>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
