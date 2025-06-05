import React, { useState } from "react";
import axios from "axios";
import "../pages/ResidenteEmpresa.css";

const ResidenteDetallesModal = ({ aplicacion, onClose, onEstadoActualizado }) => {
  const [loading, setLoading] = useState(false);

  const handleDecision = async (estado) => {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    try {
      const res = await axios.patch(
        `/api/banco_proyectos/aplicacion/${aplicacion.id}/`,
        { estado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onEstadoActualizado) onEstadoActualizado(aplicacion.id, estado);
      onClose();
      if (estado === "aceptado") {
        alert("¡Alumno aceptado!");
      } else {
        alert("Alumno rechazado.");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data.detail === "Ya se llenó el cupo de este proyecto."
      ) {
        alert("Ya se llenó el cupo de este proyecto.");
      } else {
        alert("Error al actualizar el estado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="residente-modal-overlay">
      <div className="residente-modal-content">
        <button className="residente-modal-close" onClick={onClose}>
          <i className="ri-close-line"></i>
        </button>
        <div className="residente-modal-header">
          <img
            src={aplicacion.alumno.foto || "/default-user.png"}
            alt={aplicacion.alumno.nombre}
            className="residente-img-modal"
          />
          <h3>{aplicacion.alumno.nombre}</h3>
        </div>
        <hr />
        <div className="residente-modal-body">
          <p><strong>Proyecto:</strong> {aplicacion.proyecto.nombre_proyecto}</p>
          <p><strong>Especialidad:</strong> {aplicacion.alumno.especialidad || "N/A"}</p>
          <p><strong>Correo:</strong> {aplicacion.alumno.email}</p>
          <p><strong>Contacto:</strong> {aplicacion.alumno.telefono || "N/A"}</p>
          {/* Más info académica y de proyecto aquí */}
        </div>
        <div className="residente-modal-actions">
          <button
            className="btn-aceptar"
            onClick={() => handleDecision("aceptado")}
            disabled={loading}
          >
            Aceptar
          </button>
          <button
            className="btn-rechazar"
            onClick={() => handleDecision("rechazado")}
            disabled={loading}
          >
            Rechazar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResidenteDetallesModal;