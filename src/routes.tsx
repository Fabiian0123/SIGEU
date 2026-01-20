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
import { RouteObject, Navigate } from "react-router-dom";
import App from "./App";
import HomeAdmin from "./admin/HomeAdmin";
import HomeUsers from "./users/HomeUsers";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="users/ver-eventos" replace /> },

      { path: "admin/crear-evento", element: <HomeAdmin /> },
      { path: "users/ver-eventos", element: <HomeUsers /> },

    
    ],
  },
];



