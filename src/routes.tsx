import { RouteObject } from 'react-router-dom'
import App from './App'
import StudentDashboard from './pages/StudentDashboard'
import AuthPage from './pages/AuthPage'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './pages/AdminDashboard'

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <AuthPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/estudiante',
        element: (
          <ProtectedRoute requiredRole='estudiante'>
            <StudentDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin',
        element: (
          <ProtectedRoute requiredRole='administrativo'>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
]


