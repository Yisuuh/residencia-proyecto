import React from "react";
import "../pages/ResidenteEmpresa.css";

const ResidenteCard = ({ aplicacion, onVerMas, hideActions }) => (
  <div className="residente-card">
    <img
      src={aplicacion.alumno.foto || "/default-user.png"}
      alt={aplicacion.alumno.nombre}
      className="residente-img"
    />
    <div className="residente-info">
      <h4>{aplicacion.alumno.nombre}</h4>
      <p><strong>Correo:</strong> {aplicacion.alumno.email}</p>
      <p><strong>Especialidad:</strong> {aplicacion.alumno.especialidad || "N/A"}</p>
      <p><strong>Contacto:</strong> {aplicacion.alumno.telefono || "N/A"}</p>
      <button className="btn-ver-mas" onClick={() => onVerMas(aplicacion)}>
        Ver más
      </button>
    </div>
    {!hideActions && (
      <div className="acciones-residente">
        {/* Aquí puedes agregar los botones de aceptar/rechazar */}
      </div>
    )}
  </div>
);

export default ResidenteCard;