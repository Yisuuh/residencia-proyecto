import React from "react";
import "./ResidenteCardVerMas.css";

const ResidenteCardVerMas = ({ aplicacion, proyecto, onClose }) => {
  if (!aplicacion) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>Información del Alumno</h2>
        <img
          src={aplicacion.alumno.foto || "/default-user.png"}
          alt="Foto del alumno"
          className="residente-img"
        />
        <p><strong>Nombre:</strong> {`${aplicacion.alumno.nombres} ${aplicacion.alumno.primer_apellido} ${aplicacion.alumno.segundo_apellido}`}</p>
        <p><strong>Correo:</strong> {aplicacion.alumno.email}</p>
        <p><strong>Especialidad:</strong> {aplicacion.alumno.especialidad || "N/A"}</p>
        <p><strong>Contacto:</strong> {aplicacion.alumno.telefono || "N/A"}</p>
        {/* Agrega más campos del alumno si tienes */}

        <hr />

        <h2>Información del Proyecto</h2>
        {proyecto ? (
          <>
            <p><strong>Nombre del proyecto:</strong> {proyecto.nombre_proyecto}</p>
            <p><strong>Empresa:</strong> {proyecto.nombre_empresa || "N/A"}</p>
            <p><strong>Institución:</strong> {proyecto.nombre_institucion || "N/A"}</p>
            <p><strong>Área tecnológica:</strong> {proyecto.giro_display || proyecto.giro || "N/A"}</p>
            <p><strong>Modalidad:</strong> {proyecto.modalidad_display || proyecto.modalidad || "N/A"}</p>
            {/* Agrega más campos del proyecto si tienes */}
          </>
        ) : (
          <p>No hay información del proyecto.</p>
        )}
      </div>
    </div>
  );
};

export default ResidenteCardVerMas;