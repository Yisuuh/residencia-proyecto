import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import CompleteProfileForm from "../components/CompleteProfileForm";
import axios from "axios";
import "./DashboardAlumno.css";

const DashboardAlumno = () => {
  const [user, setUser] = useState({ name: "", email: "", photo: "", is_profile_complete: false });
  const [showForm, setShowForm] = useState(false);
  const [proyecto, setProyecto] = useState(null);
  const [porcentaje, setPorcentaje] = useState(0);

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
        setShowForm(!response.data.is_profile_complete); // Muestra el formulario si el perfil no está completo
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
      }
    };

    // NUEVO: obtener proyecto y avance
    const fetchProyectoYAvance = async () => {
      try {
        const token = localStorage.getItem("access_token");
        // Proyecto aceptado
        const proyectoRes = await axios.get(
          "/api/banco_proyectos/alumno/proyecto-aceptado/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProyecto(proyectoRes.data);

        // Documentos predefinidos
        const predefinidosResponse = await axios.get(
          "/api/expediente/documentos_predefinidos/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const documentosPredefinidos = predefinidosResponse.data;

        // Documentos del alumno
        const alumnoResponse = await axios.get(
          "/api/expediente/documentos/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const documentosAlumno = alumnoResponse.data;

        // Calcular porcentaje de avance
        const totalDocs = documentosPredefinidos.length;
        const aprobados = documentosAlumno.filter(
          (doc) => doc.estado === "aprobado"
        ).length;
        const porcentajeAvance = totalDocs > 0 ? Math.round((aprobados / totalDocs) * 100) : 0;
        setPorcentaje(porcentajeAvance);
      } catch (error) {
        console.error("Error al obtener proyecto o avance:", error);
      }
    };

    fetchUserData();
    fetchProyectoYAvance();
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

      await axios.put("/api/users/completar-perfil/", data, {
        headers:
         {
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
    <div className="dashboard-alumno-container">
      <div className="dashboard-alumno-header">
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

      <div className="dashboard-alumno-widgets">
        <div className="dashboard-alumno-widget">
          <div className="dashboard-alumno-widget-title">Proyecto asignado</div>
          <div className="dashboard-alumno-widget-value dashboard-alumno-proyecto-nombre">
            {proyecto
              ? (proyecto.nombre_proyecto.length > 38
                  ? proyecto.nombre_proyecto.slice(0, 38) + "..."
                  : proyecto.nombre_proyecto)
              : "Sin proyecto"}
          </div>
        </div>
        <div className="dashboard-alumno-widget">
          <div className="dashboard-alumno-widget-title">Avance</div>
          <div className="dashboard-alumno-widget-value">
            {porcentaje}%
          </div>
        </div>
      </div>

      <div className="dashboard-alumno-section">
        <h2>Tu Expediente</h2>
        <p>
          Aquí puedes consultar y subir los documentos requeridos para tu residencia profesional.
        </p>
      </div>

      <div className="dashboard-alumno-section">
        <h2>Banco de Proyectos</h2>
        <p>
          Consulta los proyectos disponibles y postúlate a los que más te interesen.
        </p>
      </div>

      {showForm && <CompleteProfileForm onSubmit={handleProfileComplete} />}
    </div>
  );
};

export default DashboardAlumno;