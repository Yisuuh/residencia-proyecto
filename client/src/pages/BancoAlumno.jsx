import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import "./gestion_proyectos.css"; // Reutiliza los estilos de cards

const menuItems = [
    { name: "Inicio", path: "/dashboard/alumno/", icon: "ri-home-line" },
    { name: "Estado del Proyecto", path: "/dashboard/alumno/estado", icon: "ri-file-list-line" },
    { name: "Banco de Proyectos", path: "/dashboard/alumno/banco", icon: "ri-database-2-line" },
    { name: "Expediente", path: "/dashboard/alumno/expediente", icon: "ri-folder-line" },
];

const BancoAlumno = ({ user, menuItems }) => {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get("https://residencia-proyecto.onrender.com/api/banco_proyectos/formulario_proyecto/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProyectos(res.data);
      } catch (err) {
        setProyectos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProyectos();
  }, []);

  return (
    <Layout menuItems={menuItems} user={user}>
      <div className="gestion-header">
        <h2>Banco de Proyectos</h2>
      </div>
      <div className="gestion-cards-container">
        {loading ? (
          <p>Cargando proyectos...</p>
        ) : proyectos.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888" }}>No hay proyectos registrados.</p>
        ) : (
          proyectos.map((proy) => (
            <div className="gestion-card" key={proy.id}>
              <h4>{proy.nombre_proyecto}</h4>
              <p><strong>Responsable:</strong> {proy.nombre_responsable}</p>
              <p><strong>Especialidad:</strong> {proy.especialidad}</p>
              <p><strong>Periodo:</strong> {proy.periodo}</p>
              <p>{proy.objetivo}</p>
              {/* Agrega más campos si lo deseas */}
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default BancoAlumno;