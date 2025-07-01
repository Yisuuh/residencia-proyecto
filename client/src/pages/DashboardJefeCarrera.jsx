import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./DashboardJefe.css";

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

  // Ejemplo de widgets (puedes reemplazar por datos reales)
  const widgets = [
    { title: "Usuarios", value: 12 },
    { title: "Proyectos", value: 8 },
    { title: "Expedientes", value: 24 },
  ];

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
    <div className="dashboard-jefe-bg">
      <div className="dashboard-jefe-main">
        <img
          src={user.photo || "/default-user.png"}
          alt="Foto de perfil"
          className="dashboard-jefe-avatar"
        />
        <h1>Bienvenido, {user.nombres || user.name}</h1>
        <p>Tu correo electrónico es: <b>{user.email}</b></p>
        <p>Selecciona una opción del menú para continuar.</p>
        <div className="dashboard-jefe-menu">
          {menuItems.map(item => (
            <Link key={item.path} to={item.path} className="dashboard-jefe-menu-item">
              <i className={item.icon} style={{ fontSize: "1.3rem" }}></i>
              {item.name}
            </Link>
          ))}
        </div>
        <div className="dashboard-jefe-widgets">
          {widgets.map(w => (
            <div className="dashboard-jefe-widget" key={w.title}>
              <div className="dashboard-jefe-widget-title">{w.title}</div>
              <div className="dashboard-jefe-widget-value">{w.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardJefeCarrera;