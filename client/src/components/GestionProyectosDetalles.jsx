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
          <p>
            <strong>Justificación:</strong> {proyecto.justificacion}
          </p>
          <p>
            <strong>Objetivo:</strong> {proyecto.objetivo}
          </p>
          <p>
            <strong>Problema:</strong> {proyecto.problema}
          </p>
          <p>
            <strong>Actividades:</strong> {proyecto.actividades}
          </p>
          <p>
            <strong>Stack tecnológico:</strong> {proyecto.stack}
          </p>
          <p>
            <strong>Tipo de entidad:</strong> {proyecto.tipo_entidad}
          </p>
          <p>
            <strong>RFC:</strong> {proyecto.rfc}
          </p>
          <p>
            <strong>Giro:</strong> {proyecto.giro}
          </p>
          <p>
            <strong>Página web:</strong> {proyecto.pagina_web}
          </p>
          <p>
            <strong>Periodo:</strong> {proyecto.periodo}
          </p>
          <p>
            <strong>Competencias:</strong> {proyecto.competencias}
          </p>
          <p>
            <strong>Tipo de apoyo:</strong> {proyecto.tipo_apoyo}
          </p>
          <p>
            <strong>¿Ya hay estudiante interesado?:</strong>{" "}
            {proyecto.estudiante_interesado ? "Sí" : "No"}
          </p>
          <p>
            <strong>Nombre del estudiante solicitado:</strong>{" "}
            {proyecto.nombre_estudiante_solicitado}
          </p>
          <p>
            <strong>¿Es Tec?:</strong> {proyecto.es_tec ? "Sí" : "No"}
          </p>
          <p>
            <strong>¿Incluir asesor?:</strong> {proyecto.incluir_asesor ? "Sí" : "No"}
          </p>
          <p>
            <strong>Nombre del asesor:</strong> {proyecto.nombre_asesor}
          </p>
          <p>
            <strong>Observaciones:</strong> {proyecto.observaciones}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GestionProyectosDetalles;