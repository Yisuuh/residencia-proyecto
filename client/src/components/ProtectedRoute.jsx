import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        // Verifica si el token de acceso es válido
        await axios.get("http://127.0.0.1:8000/api/users/me/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsAuthenticated(true);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          // Si el token ha expirado, intenta renovarlo
          const refreshToken = localStorage.getItem("refresh_token");
          if (refreshToken) {
            try {
              const response = await axios.post(
                "http://127.0.0.1:8000/api/token/refresh/",
                { refresh: refreshToken }
              );
              localStorage.setItem("access_token", response.data.access);
              setIsAuthenticated(true);
            } catch (refreshError) {
              // Si el token de refresco también es inválido, redirige al login
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              setIsAuthenticated(false);
            }
          } else {
            // Si no hay token de refresco, redirige al login
            localStorage.removeItem("access_token");
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      }
    };

    verifyToken();
  }, []);

  if (isAuthenticated === null) {
    return <div>Cargando...</div>; // Muestra un indicador de carga mientras se verifica el token
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;