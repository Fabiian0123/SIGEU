import { RouteObject } from 'react-router-dom'
import App from './App'
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'estudiante',
        element: <StudentDashboard />,
      },
      {
        path: 'administrativo/eventos',
        element: <AdminDashboard />,
      },
    ],
  },
]


