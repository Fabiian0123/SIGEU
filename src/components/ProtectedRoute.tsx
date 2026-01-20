import { FC } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth, UserRole } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { currentUser, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />
  }

  if (requiredRole && currentUser?.rol !== requiredRole) {
    return <Navigate to='/' replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
