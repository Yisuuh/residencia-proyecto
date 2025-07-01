import React, { useEffect, useState } from "react";
import axios from "axios";
import "./EstadoProyecto.css";

const camposProyecto = [
  { key: "nombre_proyecto", label: "Nombre del Proyecto" },
  { key: "nombre_responsable", label: "Responsable" },
  { key: "correo", label: "Correo" },
  { key: "telefono", label: "Teléfono" },
  { key: "descripcion", label: "Descripción" },
  { key: "nombre_empresa", label: "Empresa" },
  { key: "nombre_institucion", label: "Institución" },
  { key: "giro", label: "Área tecnológica" },
  { key: "modalidad", label: "Modalidad" },
  { key: "objetivo_general", label: "Objetivo General" },
  { key: "objetivos_especificos", label: "Objetivos Específicos" },
  { key: "actividades", label: "Actividades" },
  { key: "productos", label: "Productos" },
  { key: "recursos", label: "Recursos" },
  { key: "fecha_inicio", label: "Fecha de Inicio" },
  { key: "fecha_fin", label: "Fecha de Fin" },
  // Agrega aquí más campos si tu modelo tiene más
];

const EstadoProyecto = () => {
  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProyecto = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get("/api/banco_proyectos/alumno/proyecto-aceptado/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProyecto(res.data);
      } catch (err) {
        setError("No tienes un proyecto aceptado.");
      } finally {
        setLoading(false);
      }
    };
    fetchProyecto();
  }, []);

  if (loading) return <div className="estado-proyecto-container"><div className="proyecto-card">Cargando...</div></div>;
  if (error) return <div className="estado-proyecto-container"><div className="proyecto-card error">{error}</div></div>;

  return (
    <div className="estado-proyecto-container">
      <h2>Mi Proyecto Aceptado</h2>
      <div className="proyecto-card">
        {camposProyecto.map(({ key, label }) =>
          proyecto[key] && (
            <div className="proyecto-campo" key={key}>
              <span className="proyecto-label">{label}:</span>
              <span className="proyecto-valor">{proyecto[key]}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default EstadoProyecto;