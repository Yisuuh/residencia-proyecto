import React from "react";

const GestionProyectosCard = ({ proyecto, onDetalles }) => (
  <div className="gestion-card">
    {/* Fecha y logo */}
    <div className="card-header">
      <span className="card-fecha">
        {proyecto.fecha_subida
          ? new Date(proyecto.fecha_subida).toLocaleDateString()
          : "Sin fecha"}
      </span>
      {proyecto.imagen_empresa || proyecto.imagen ? (
        <img
          src={proyecto.imagen_empresa || proyecto.imagen}
          alt="Empresa"
          className="empresa-img"
        />
      ) : null}
    </div>
    {/* Empresa y estudiantes */}
    <div className="card-empresa-estudiantes">
      <span>
        <strong>{proyecto.nombre_empresa}</strong>
      </span>
      <span>
        Estudiantes: <strong>{proyecto.numero_estudiantes || 1}</strong>
      </span>
    </div>
    {/* Título */}
    <h3 className="card-titulo">{proyecto.nombre_proyecto}</h3>
    {/* Etiquetas */}
    <div className="card-etiquetas">
      <span className={`etiqueta tag-especialidad`}>
        {proyecto.especialidad}
      </span>
      <span
        className={`etiqueta ${
          proyecto.modalidad === "presencial"
            ? "tag-modalidad-presencial"
            : "tag-modalidad-otro"
        }`}
      >
        {proyecto.modalidad}
      </span>
      <span
        className={`etiqueta ${
          proyecto.apoyo === true ||
          proyecto.apoyo === "si" ||
          proyecto.apoyo === "Sí"
            ? "tag-apoyo-si"
            : "tag-apoyo-no"
        }`}
      >
        {proyecto.apoyo === true ||
        proyecto.apoyo === "si" ||
        proyecto.apoyo === "Sí"
          ? "Con apoyo"
          : "Sin apoyo"}
      </span>
    </div>
    {/* Botón detalles */}
    <button className="btn-detalles" onClick={() => onDetalles(proyecto)}>
      Detalles
    </button>
  </div>
);

export default GestionProyectosCard;