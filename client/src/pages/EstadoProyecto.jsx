import React, { useEffect, useState } from "react";
import axios from "axios";

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

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="estado-proyecto-container">
      <h2>Mi Proyecto Aceptado</h2>
      <div className="proyecto-detalles">
        <p><strong>Nombre:</strong> {proyecto.nombre_proyecto}</p>
        <p><strong>Responsable:</strong> {proyecto.nombre_responsable}</p>
        <p><strong>Correo:</strong> {proyecto.correo}</p>
        <p><strong>Teléfono:</strong> {proyecto.telefono}</p>
        <p><strong>Descripción:</strong> {proyecto.descripcion}</p>
        {/* Agrega más campos según tu modelo */}
      </div>
    </div>
  );
};

export default EstadoProyecto;