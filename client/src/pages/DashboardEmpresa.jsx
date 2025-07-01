import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { Link } from "react-router-dom";
import "./DashboardEmpresa.css";

const DashboardEmpresa = () => {
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

  const menuItems = [
    { name: "Inicio", path: "/dashboard/empresa/", icon: "ri-home-line" },
    { name: "Gestión de Proyectos", path: "/dashboard/empresa/gestion-proyectos", icon: "ri-briefcase-4-line" },
    { name: "Residentes", path: "/dashboard/empresa/aprobados", icon: "ri-group-line" },
  ];

  return (
    <div className="dashboard-empresa-bg">
      <div className="dashboard-empresa-main">
        <img
          src={user.photo || "/default-user.png"}
          alt="Foto de empresa"
          className="dashboard-empresa-avatar"
        />
        <h1>Bienvenido, {user.name}</h1>
        <p>Tu correo electrónico es: <b>{user.email}</b></p>
        <p>Selecciona una opción del menú para continuar.</p>
        <div className="dashboard-empresa-menu">
          {menuItems.map(item => (
            <Link key={item.path} to={item.path} className="dashboard-empresa-menu-item">
              <i className={item.icon} style={{ fontSize: "1.3rem" }}></i>
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardEmpresa;