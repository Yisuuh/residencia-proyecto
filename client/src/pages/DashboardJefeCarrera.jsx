import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import axios from "axios";

const menuItems = [
  { name: "Inicio", path: "/dashboard/jefe/", icon: "ri-home-line" },
  { name: "Gestión de Usuarios", path: "/dashboard/jefe/usuarios", icon: "ri-user-settings-line" },
  { name: "Banco de Proyectos", path: "/dashboard/jefe/banco", icon: "ri-database-2-line" },
  { name: "Gestión de Proyectos", path: "/dashboard/jefe/gestion-proyectos", icon: "ri-briefcase-4-line" },
  { name: "Configuración", path: "/dashboard/jefe/configuracion", icon: "ri-settings-3-line" },
  { name: "Reportes", path: "/dashboard/jefe/reportes", icon: "ri-bar-chart-2-line" },
  { name: "Expedientes", path: "/dashboard/jefe/expedientes", icon: "ri-folder-line" },
];

const DashboardJefeCarrera = () => {
  const [user, setUser] = useState({ name: "", email: "", photo: "" });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get("/api/users/me/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <>
      <h1>Bienvenido, {user.nombres || user.name}</h1>
      <p>Tu correo electrónico es: {user.email}</p>
      <p>Selecciona una opción del menú para continuar.</p>
      {/* Aquí puedes agregar widgets, estadísticas o accesos rápidos para el jefe de carrera */}
    </>
  );
};

export default DashboardJefeCarrera;