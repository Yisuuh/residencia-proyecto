import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import CompleteProfileForm from "../components/CompleteProfileForm";
import axios from "axios";

const DashboardAlumno = () => {
  const [user, setUser] = useState({ name: "", email: "", photo: "", is_profile_complete: false });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get("https://residencia-proyecto.onrender.com/api/users/me/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
        setShowForm(!response.data.is_profile_complete); // Muestra el formulario si el perfil no está completo
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileComplete = async (formData) => {
    try {
      const token = localStorage.getItem("access_token");
      const data = new FormData();
      data.append("matricula", formData.matricula);
      data.append("especialidad", formData.especialidad);
      data.append("ingreso", formData.ingreso);
      data.append("telefono", formData.telefono);
      data.append("foto", formData.foto);

      await axios.put("https://residencia-proyecto.onrender.com/api/users/completar-perfil/", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser({ ...user, is_profile_complete: true }); // Actualiza el estado del usuario
      setShowForm(false); // Oculta el formulario
    } catch (error) {
      console.error("Error al completar el perfil:", error);
    }
  };

  const menuItems = [
    { name: "Inicio", path: "/dashboard/alumno/", icon: "ri-home-line" },
    { name: "Estado del Proyecto", path: "/dashboard/alumno/estado", icon: "ri-file-list-line" },
    { name: "Banco de Proyectos", path: "/dashboard/alumno/banco", icon: "ri-database-2-line" },
    { name: "Expediente", path: "/dashboard/alumno/expediente", icon: "ri-folder-line" },
  ];

  return (
    <Layout menuItems={menuItems} user={user}>
      <h1>Bienvenido, {user.name}</h1>
      <p>Tu correo electrónico es: {user.email}</p>
      <p>Selecciona una opción del menú para continuar.</p>

      {showForm && <CompleteProfileForm onSubmit={handleProfileComplete} />}
    </Layout>
  );
};

export default DashboardAlumno;