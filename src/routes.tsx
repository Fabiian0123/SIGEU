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



