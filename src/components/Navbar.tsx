import { FC } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navbar: FC = () => {
  const { currentUser, logout } = useAuth()

  return (
    <nav className='navbar'>
      <div className='navbar-brand'>
        <img src='/fesclogo.png' alt='FESC Logo' className='navbar-logo' />
        <div>
          <div className='navbar-title'>SIGEU</div>
          <div className='navbar-subtitle'>Sistema de Gestión de Eventos Universitarios</div>
        </div>
      </div>
      <ul className='navbar-links'>
        <li>
          <Link to={currentUser?.rol === 'administrativo' ? '/admin' : '/estudiante'}>
            {currentUser?.rol === 'administrativo' ? '🛠️ Panel de Admin' : '📚 Mi Dashboard'}
          </Link>
        </li>
        {currentUser?.rol === 'administrativo' && (
          <li>
            <Link to='/estudiante'>Ver como Estudiante</Link>
          </li>
        )}
        <li className='navbar-user'>
          <span>👤 {currentUser?.nombre}</span>
          <span className='user-badge'>{currentUser?.rol === 'administrativo' ? '🔑 Admin' : '👥 Estudiante'}</span>
        </li>
        <li>
          <button className='btn-logout' onClick={logout}>
            Cerrar Sesión
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
