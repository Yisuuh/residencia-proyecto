import React, { useState, useEffect } from "react";
import axios from "axios";
import CustomAlert from "./CustomAlert";
import "./ProyectoDetallesModalJefe.css";

const ProyectoDetallesModalJefe = ({ proyecto, onClose, onProyectoActualizado }) => {
  const [alumnos, setAlumnos] = useState([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(true);
  const [showBuscador, setShowBuscador] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [loadingBusqueda, setLoadingBusqueda] = useState(false);
  const [proyectoActual, setProyectoActual] = useState(proyecto); // ✅ Estado local del proyecto

  // ✅ Estados para CustomAlert (usando isOpen)
  const [alert, setAlert] = useState({
    isOpen: false,
    type: "",
    title: "",
    message: "",
    onConfirm: null,
  });

  const showAlert = (type, title, message, onConfirm = null) => {
    setAlert({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
    });
  };

  const closeAlert = () => {
    setAlert({
      isOpen: false,
      type: "",
      title: "",
      message: "",
      onConfirm: null,
    });
  };

  const fetchAlumnos = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get(
        `/api/banco_proyectos/formulario_proyecto/${proyectoActual.id}/alumnos/`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log("✅ Alumnos del proyecto:", res.data);
      setAlumnos(res.data.alumnos || []);
    } catch (error) {
      console.error("❌ Error al cargar alumnos:", error);
      setAlumnos([]);
    } finally {
      setLoadingAlumnos(false);
    }
  };

  useEffect(() => {
    if (proyectoActual?.id) {
      fetchAlumnos();
    }
  }, [proyectoActual]);

  // Buscar alumnos
  useEffect(() => {
    const buscarAlumnos = async () => {
      if (busqueda.trim().length < 2) {
        setResultadosBusqueda([]);
        return;
      }

      setLoadingBusqueda(true);
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(
          `/api/banco_proyectos/formulario_proyecto/${proyectoActual.id}/buscar-alumnos/?q=${encodeURIComponent(busqueda)}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setResultadosBusqueda(res.data.alumnos || []);
      } catch (error) {
        console.error("❌ Error al buscar alumnos:", error);
        setResultadosBusqueda([]);
      } finally {
        setLoadingBusqueda(false);
      }
    };

    const timer = setTimeout(buscarAlumnos, 300);
    return () => clearTimeout(timer);
  }, [busqueda, proyectoActual.id]);

  const agregarAlumno = async (alumnoId, alumnoNombre) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.post(
        `/api/banco_proyectos/formulario_proyecto/${proyectoActual.id}/agregar-alumno/`,
        { alumno_id: alumnoId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log("✅ Alumno agregado:", res.data);
      
      showAlert(
        "success",
        "¡Alumno Agregado!",
        `${alumnoNombre} ha sido agregado exitosamente al proyecto.`
      );
      
      await fetchAlumnos();
      setBusqueda("");
      setShowBuscador(false);
    } catch (error) {
      console.error("❌ Error al agregar alumno:", error);
      
      showAlert(
        "error",
        "Error al Agregar",
        error.response?.data?.error || "No se pudo agregar el alumno al proyecto."
      );
    }
  };

  const quitarAlumno = async (alumnoId, alumnoNombre) => {
    showAlert(
      "warning",
      "¿Confirmar Eliminación?",
      `¿Estás seguro de quitar a ${alumnoNombre} del proyecto? Esta acción no se puede deshacer.`,
      async () => {
        try {
          const token = localStorage.getItem("access_token");
          const res = await axios.post(
            `/api/banco_proyectos/formulario_proyecto/${proyectoActual.id}/quitar-alumno/`,
            { alumno_id: alumnoId },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          console.log("✅ Alumno eliminado:", res.data);
          
          showAlert(
            "success",
            "¡Alumno Eliminado!",
            `${alumnoNombre} ha sido removido del proyecto exitosamente.`
          );
          
          await fetchAlumnos();
        } catch (error) {
          console.error("❌ Error al quitar alumno:", error);
          
          showAlert(
            "error",
            "Error al Eliminar",
            error.response?.data?.error || "No se pudo eliminar el alumno del proyecto."
          );
        }
      }
    );
  };

  // ✅ NUEVA FUNCIÓN: Terminar proyecto
  const terminarProyecto = () => {
    showAlert(
      "warning",
      "¿Terminar Proyecto?",
      `¿Estás seguro de marcar el proyecto "${proyectoActual.nombre_proyecto}" como terminado? Esta acción no se puede deshacer.`,
      async () => {
        try {
          const token = localStorage.getItem("access_token");
          const res = await axios.post(
            `/api/banco_proyectos/formulario_proyecto/${proyectoActual.id}/terminar/`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          console.log("✅ Proyecto terminado:", res.data);
          
          // ✅ Actualizar estado local
          setProyectoActual({
            ...proyectoActual,
            estado: 'terminado'
          });

          // ✅ Notificar al componente padre para actualizar la lista
          if (onProyectoActualizado) {
            onProyectoActualizado();
          }
          
          showAlert(
            "success",
            "¡Proyecto Terminado!",
            `El proyecto ha sido marcado como terminado exitosamente.`
          );
        } catch (error) {
          console.error("❌ Error al terminar proyecto:", error);
          
          showAlert(
            "error",
            "Error al Terminar",
            error.response?.data?.error || "No se pudo terminar el proyecto."
          );
        }
      }
    );
  };

  return (
    <>
      {/* ✅ CustomAlert con isOpen */}
      <CustomAlert
        isOpen={alert.isOpen}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={closeAlert}
        onConfirm={alert.onConfirm}
      />

      <div className="proyecto-modal-overlay" onClick={onClose}>
        <div className="proyecto-modal-content" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="proyecto-modal-header">
            <h2>
              <i className="ri-briefcase-4-line"></i>
              {proyectoActual.nombre_proyecto}
            </h2>
            <button className="proyecto-modal-close" onClick={onClose}>
              <i className="ri-close-line"></i>
            </button>
          </div>

          {/* Body */}
          <div className="proyecto-modal-body">
            {/* Información General */}
            <section className="proyecto-seccion">
              <h3>
                <i className="ri-information-line"></i>
                Información General
              </h3>
              <div className="proyecto-info-grid">
                <div className="info-item">
                  <strong>Empresa/Institución:</strong>
                  <span>{proyectoActual.nombre_empresa || proyectoActual.nombre_institucion || "N/A"}</span>
                </div>
                <div className="info-item">
                  <strong>Tipo de Entidad:</strong>
                  <span>{proyectoActual.tipo_entidad_display || "N/A"}</span>
                </div>
                <div className="info-item">
                  <strong>Modalidad:</strong>
                  <span className="tag-modal-info">{proyectoActual.modalidad_display || proyectoActual.modalidad}</span>
                </div>
                <div className="info-item">
                  <strong>Período:</strong>
                  <span>{proyectoActual.periodo_display || proyectoActual.periodo}</span>
                </div>
                <div className="info-item">
                  <strong>Especialidad:</strong>
                  <span>{proyectoActual.especialidad_display || proyectoActual.especialidad}</span>
                </div>
                <div className="info-item">
                  <strong>Estado:</strong>
                  <span className={`estado-badge-modal estado-${proyectoActual.estado || 'activo'}`}>
                    {proyectoActual.estado === "terminado" ? "Terminado" : "Activo"}
                  </span>
                </div>
              </div>
            </section>

            {/* Contacto */}
            <section className="proyecto-seccion">
              <h3>
                <i className="ri-contacts-line"></i>
                Información de Contacto
              </h3>
              <div className="proyecto-info-grid">
                <div className="info-item">
                  <strong>Responsable:</strong>
                  <span>{proyectoActual.nombre_responsable || "N/A"}</span>
                </div>
                <div className="info-item">
                  <strong>Correo:</strong>
                  <span>{proyectoActual.correo}</span>
                </div>
                <div className="info-item">
                  <strong>Teléfono:</strong>
                  <span>{proyectoActual.telefono || "N/A"}</span>
                </div>
                {proyectoActual.pagina_web && (
                  <div className="info-item">
                    <strong>Página Web:</strong>
                    <a href={proyectoActual.pagina_web} target="_blank" rel="noopener noreferrer">
                      {proyectoActual.pagina_web}
                    </a>
                  </div>
                )}
              </div>
            </section>

            {/* Descripción del Proyecto */}
            <section className="proyecto-seccion">
              <h3>
                <i className="ri-file-text-line"></i>
                Descripción del Proyecto
              </h3>
              <div className="proyecto-descripcion">
                <div className="desc-item">
                  <strong>Objetivo:</strong>
                  <p>{proyectoActual.objetivo}</p>
                </div>
                <div className="desc-item">
                  <strong>Problema a Resolver:</strong>
                  <p>{proyectoActual.problema}</p>
                </div>
                <div className="desc-item">
                  <strong>Justificación:</strong>
                  <p>{proyectoActual.justificacion}</p>
                </div>
                {proyectoActual.observaciones && (
                  <div className="desc-item">
                    <strong>Observaciones:</strong>
                    <p>{proyectoActual.observaciones}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Alumnos Asignados */}
            <section className="proyecto-seccion">
              <div className="alumnos-header">
                <h3>
                  <i className="ri-group-line"></i>
                  Alumnos Asignados ({alumnos.length} / {proyectoActual.numero_estudiantes})
                </h3>
                <button
                  className="btn-agregar-alumno-mini"
                  onClick={() => setShowBuscador(!showBuscador)}
                  disabled={alumnos.length >= proyectoActual.numero_estudiantes || proyectoActual.estado === 'terminado'}
                  title={
                    proyectoActual.estado === 'terminado' 
                      ? "Proyecto terminado" 
                      : alumnos.length >= proyectoActual.numero_estudiantes 
                      ? "Cupo completo" 
                      : "Agregar alumno"
                  }
                >
                  <i className={showBuscador ? "ri-close-line" : "ri-user-add-line"}></i>
                  {showBuscador ? "Cancelar" : "Agregar"}
                </button>
              </div>

              {/* Buscador de alumnos */}
              {showBuscador && proyectoActual.estado !== 'terminado' && (
                <div className="buscador-alumnos">
                  <div className="buscador-input-wrapper">
                    <i className="ri-search-line"></i>
                    <input
                      type="text"
                      className="input-buscar-alumno"
                      placeholder="Buscar por nombre, matrícula o correo..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      autoFocus
                    />
                    {loadingBusqueda && <i className="ri-loader-4-line loading-icon"></i>}
                  </div>

                  {busqueda.length >= 2 && (
                    <div className="resultados-busqueda">
                      {resultadosBusqueda.length > 0 ? (
                        resultadosBusqueda.map((alumno) => (
                          <div key={alumno.id} className="resultado-item">
                            <div className="resultado-info">
                              <strong>{alumno.nombre}</strong>
                              <span>{alumno.matricula}</span>
                              <span className="resultado-correo">{alumno.correo}</span>
                            </div>
                            <button
                              className="btn-agregar-resultado"
                              onClick={() => agregarAlumno(alumno.id, alumno.nombre)}
                            >
                              <i className="ri-add-line"></i>
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="no-resultados">
                          <i className="ri-user-search-line"></i>
                          <p>No se encontraron alumnos</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {loadingAlumnos ? (
                <div className="alumnos-loading">
                  <i className="ri-loader-4-line"></i>
                  <p>Cargando alumnos...</p>
                </div>
              ) : alumnos.length > 0 ? (
                <div className="alumnos-lista">
                  {alumnos.map((alumno, index) => (
                    <div key={index} className="alumno-card-mini">
                      <div className="alumno-avatar">
                        <i className="ri-user-3-line"></i>
                      </div>
                      <div className="alumno-info-mini">
                        <strong>{alumno.nombre || "Sin nombre"}</strong>
                        <span>{alumno.matricula || "Sin matrícula"}</span>
                        <span className="alumno-email">{alumno.correo || "Sin correo"}</span>
                      </div>
                      {proyectoActual.estado !== 'terminado' && (
                        <button
                          className="btn-quitar-alumno"
                          onClick={() => quitarAlumno(alumno.id, alumno.nombre)}
                          title="Quitar alumno"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alumnos-empty">
                  <i className="ri-user-unfollow-line"></i>
                  <p>No hay alumnos asignados a este proyecto</p>
                </div>
              )}
            </section>
          </div>

          {/* Footer */}
          <div className="proyecto-modal-footer">
            {/* ✅ Botón para terminar proyecto */}
            {proyectoActual.estado !== 'terminado' && (
              <button 
                className="btn-terminar-proyecto" 
                onClick={terminarProyecto}
              >
                <i className="ri-checkbox-circle-line"></i>
                Marcar como Terminado
              </button>
            )}
            
            <button className="btn-cerrar-modal" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProyectoDetallesModalJefe;