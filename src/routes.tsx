import { RouteObject } from 'react-router-dom'
import App from './App'
import HomeAdmin from './admin/HomeAdmin'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/admin',
        element: <HomeAdmin />,
      },
    ],
  },
]

