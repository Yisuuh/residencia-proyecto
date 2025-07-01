import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./DashboardAlumno.css"; // Reutilizamos el CSS del dashboard de alumno para mantener coherencia

const menuItems = [
  { name: "Inicio", path: "/dashboard/coordinador/", icon: "ri-home-line" },
  { name: "Expedientes", path: "/dashboard/coordinador/expedientes", icon: "ri-folder-line" },
];

const DashboardCoord = () => {
  const [user, setUser] = useState({ name: "", email: "", photo: "" });
  const navigate = useNavigate();

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

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <div className="dashboard-alumno-container">
      <div className="dashboard-alumno-header" style={{ justifyContent: "center" }}>
        <img
          src={user.photo || "/default-user.png"}
          alt="Foto de perfil"
          className="dashboard-alumno-avatar"
        />
        <div className="dashboard-alumno-info">
          <h1>Bienvenido, {user.nombres || user.name}</h1>
          <p>{user.email}</p>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 18, marginBottom: 32 }}>
        {menuItems.map(item => (
          <Link key={item.path} to={item.path} className="dashboard-empresa-menu-item">
            <i className={item.icon} style={{ fontSize: "1.3rem" }}></i>
            {item.name}
          </Link>
        ))}
        <button
          className="dashboard-empresa-menu-item"
          style={{ border: "none", background: "none", cursor: "pointer" }}
          onClick={handleLogout}
        >
          <i className="ri-logout-box-r-line" style={{ fontSize: "1.3rem" }}></i>
          Cerrar sesión
        </button>
      </div>
      <div className="dashboard-alumno-section">
        <h2>Expedientes</h2>
        <p>
          Consulta y gestiona los expedientes de los alumnos desde esta sección.
        </p>
      </div>
    </div>
  );
};

export default DashboardCoord;