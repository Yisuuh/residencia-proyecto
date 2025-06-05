import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import axios from "axios";

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
    { name: "Residentes", path: "/dashboard/empresa/residentes", icon: "ri-group-line" },
  ];

  return (
    <>
      <h1>Bienvenido, {user.name}</h1>
      <p>Tu correo electrónico es: {user.email}</p>
      <p>Selecciona una opción del menú para continuar.</p>
    </>
  );
};

export default DashboardEmpresa;