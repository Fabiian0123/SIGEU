import { FC } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth, UserRole } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { currentUser, isAuthenticated } = useAuth()

  // No autenticado
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />
  }

  // Validación de rol
  if (requiredRole && currentUser?.rol !== requiredRole) {
    // ✅ permitir que el ADMIN vea la vista estudiante
    if (currentUser?.rol === 'administrativo' && requiredRole === 'estudiante') {
      return <>{children}</>
    }

    return <Navigate to='/' replace />
  }

  return <>{children}</>
}

export default ProtectedRoute

