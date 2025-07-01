import React, { useEffect, useState } from "react";
import axios from "axios";

const GestionProyectosDetalles = ({ proyecto, onClose, user, aceptados, onAplicar, showDetalles, proyectoSeleccionado }) => {
  const [yaAplico, setYaAplico] = useState(false);
  const cupo = proyecto.numero_estudiantes || 1;
  const hayVacantes = aceptados < cupo;

  const handleAplicar = async (proyectoId) => {
    const token = localStorage.getItem("access_token");
    try {
      await axios.post(
        "/api/banco_proyectos/aplicar/",
        { proyecto: proyectoId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setYaAplico(true);
      alert("¡Aplicación enviada!");
    } catch (error) {
      if (error.response && error.response.data.detail === "Ya aplicaste a este proyecto.") {
        setYaAplico(true);
        alert("Ya aplicaste a este proyecto.");
      } else {
        alert("Error al aplicar.");
      }
    }
  };

  // Cuando abras el modal, consulta si ya aplicó:
  useEffect(() => {
    if (showDetalles && user?.role === "alumno" && proyectoSeleccionado) {
      const checkAplicacion = async () => {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(`/api/empresa/proyecto/${proyectoSeleccionado.id}/aplicaciones/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const ya = res.data.some(a => a.alumno === user.id);
        setYaAplico(ya);
      };
      checkAplicacion();
    }
  }, [showDetalles, proyectoSeleccionado, user]);

  console.log({
    user,
    yaAplico,
    hayVacantes,
    aceptados,
    cupo,
    showDetalles,
    proyectoSeleccionado,
    proyecto
});

  return (
    <div className="modal-detalles-overlay">
      <div className="modal-detalles-content">
        <button
          className="modal-detalles-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <i className="ri-close-line"></i>
        </button>
        <div className="modal-detalles-header">
          <h2>{proyecto.nombre_proyecto}</h2>
          {user?.role === "alumno" && yaAplico && (
            <button className="btn-aplicar-ahora" disabled>
              Ya aplicado
            </button>
          )}
          {user?.role === "alumno" && !yaAplico && hayVacantes && (
            <button className="btn-aplicar-ahora" onClick={() => handleAplicar(proyecto.id)}>
              Aplicar ahora
            </button>
          )}
          {user?.role === "alumno" && !yaAplico && !hayVacantes && (
            <button className="btn-aplicar-ahora" disabled>
              Sin vacantes
            </button>
          )}
        </div>
        <div className="modal-detalles-info">
          <div className="modal-detalles-empresa">
            {proyecto.imagen_empresa || proyecto.imagen ? (
              <img
                src={proyecto.imagen_empresa || proyecto.imagen}
                alt="Empresa"
                className="empresa-img"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginBottom: 8,
                }}
              />
            ) : null}
            <div>
              <div>
                <strong>{proyecto.nombre_empresa}</strong>
              </div>
              <div>
                Solicita: <strong>{proyecto.numero_estudiantes || 1}</strong> estudiantes
              </div>
            </div>
          </div>
          <div className="modal-detalles-etiquetas">
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
        </div>
        <hr />
        <div className="modal-detalles-body">
          <p>
            <strong>Nombre del responsable:</strong> {proyecto.nombre_responsable}
          </p>
          <p>
            <strong>Correo:</strong> {proyecto.correo}
          </p>
          <p>
            <strong>Teléfono:</strong> {proyecto.telefono}
          </p>
          {proyecto.nombre_empresa && (
            <p>
              <strong>Nombre de la empresa:</strong> {proyecto.nombre_empresa}
            </p>
          )}
          {proyecto.nombre_institucion && (
            <p>
              <strong>Nombre de la institución:</strong> {proyecto.nombre_institucion}
            </p>
          )}
          <p>
            <strong>Justificación:</strong> {proyecto.justificacion}
          </p>
          <p>
            <strong>Objetivo:</strong> {proyecto.objetivo}
          </p>
          <p>
            <strong>Problema a resolver:</strong> {proyecto.problema}
          </p>
          {proyecto.tipo_entidad_display && (
            <p>
              <strong>Tipo de entidad:</strong> {proyecto.tipo_entidad_display}
            </p>
          )}
          {proyecto.giro_display && (
            <p>
              <strong>Área tecnológica:</strong> {proyecto.giro_display}
            </p>
          )}
          {proyecto.periodo_display && (
            <p>
              <strong>Periodo:</strong> {proyecto.periodo_display}
            </p>
          )}
          {proyecto.modalidad_display && (
            <p>
              <strong>Modalidad:</strong> {proyecto.modalidad_display}
            </p>
          )}
          {proyecto.es_tec_display && (
            <p>
              <strong>¿Se trata del Instituto Tecnológico de Mérida?:</strong> {proyecto.es_tec_display}
            </p>
          )}
          {proyecto.apoyo_display && (
            <p>
              <strong>¿Existe algún tipo de apoyo para el alumno?:</strong> {proyecto.apoyo_display}
            </p>
          )}
          {proyecto.tipo_apoyo && (
            <p>
              <strong>¿Qué tipo de apoyo?:</strong> {proyecto.tipo_apoyo}
            </p>
          )}
          {proyecto.estudiante_interesado === "si" && (
            <p>
              <strong>¿Existe algún estudiante interesado?:</strong> Sí
            </p>
          )}
          {proyecto.estudiante_interesado === "no" && (
            <p>
              <strong>¿Existe algún estudiante interesado?:</strong> No
            </p>
          )}
          {proyecto.nombre_estudiante_solicitado && (
            <p>
              <strong>Nombre del estudiante solicitado:</strong> {proyecto.nombre_estudiante_solicitado}
            </p>
          )}
          {proyecto.observaciones && (
            <p>
              <strong>Observaciones:</strong> {proyecto.observaciones}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GestionProyectosDetalles;