import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAlert } from "../hooks/useAlert";
import CustomAlert from "./CustomAlert";
import "./GestionProyectosDetalles.css";

const GestionProyectosDetalles = ({ 
  proyecto, 
  onClose, 
  user, 
  showDetalles, 
  proyectoSeleccionado,
  onProyectoActualizado,
  onTerminar // ✅ NUEVO PROP
}) => {
  console.log("🔍 GestionProyectosDetalles - Props recibidos:");
  console.log("  👤 user:", user);
  console.log("  👤 user?.role:", user?.role);
  console.log("  📦 proyecto:", proyecto?.nombre_proyecto);
  console.log("  🔧 onTerminar:", typeof onTerminar);

  const [yaAplico, setYaAplico] = useState(false);
  const [tieneProyectoAprobado, setTieneProyectoAprobado] = useState(false);
  const [aplicacionesActivas, setAplicacionesActivas] = useState(0);
  const [aplicaciones, setAplicaciones] = useState([]);
  const { alert, closeAlert, showSuccess, showError } = useAlert();
  
  const estudiantes_aceptados = proyecto?.estudiantes_aceptados || 0;
  const numero_estudiantes = proyecto?.numero_estudiantes || 1;
  const vacantes_disponibles = proyecto?.vacantes_disponibles || 0;
  const hayVacantes = vacantes_disponibles > 0;

  useEffect(() => {
    if (showDetalles) {
      document.body.classList.add('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showDetalles]);

  const verificarEstadoAlumno = async () => {
    if (!user || user.role !== "alumno") return;
    
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get("/api/banco_proyectos/alumno/mis-aplicaciones/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("📊 Mis aplicaciones:", res.data);
      
      setTieneProyectoAprobado(res.data.tiene_proyecto_aprobado || false);
      setAplicacionesActivas(res.data.aplicaciones_activas || 0);
      
      const yaAplicoAEsteProyecto = res.data.aplicaciones?.some(
        app => app.proyecto_id === proyecto.id
      );
      setYaAplico(yaAplicoAEsteProyecto || false);
      
    } catch (error) {
      console.error("❌ Error verificando estado:", error);
    }
  };

  const cargarAplicaciones = async () => {
    if (!user || user.role !== "empresa") return;
    
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get(
        `/api/banco_proyectos/empresa/proyecto/${proyecto.id}/aplicaciones/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("📋 Aplicaciones del proyecto:", res.data);
      setAplicaciones(res.data);
      
    } catch (error) {
      console.error("❌ Error cargando aplicaciones:", error);
      setAplicaciones([]);
    }
  };

  const handleAplicar = async (proyectoId) => {
    if (tieneProyectoAprobado) {
      showError("❌ Error", "Ya tienes un proyecto aceptado. No puedes postularte a otros proyectos.");
      return;
    }
    
    if (aplicacionesActivas >= 3) {
      showError("❌ Error", "Has alcanzado el límite máximo de 3 postulaciones activas.");
      return;
    }
    
    if (!hayVacantes) {
      showError("❌ Error", "Este proyecto ya no tiene vacantes disponibles.");
      return;
    }
    
    const token = localStorage.getItem("access_token");
    try {
      const response = await axios.post(
        "/api/banco_proyectos/aplicar/",
        { proyecto_id: proyectoId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("✅ Aplicación exitosa:", response.data);
      
      setYaAplico(true);
      
      const aplicacionesRestantes = response.data.aplicaciones_restantes || 2;
      showSuccess(
        "✅ ¡Éxito!", 
        `¡Aplicación enviada correctamente!\n\nTe quedan ${aplicacionesRestantes} postulaciones disponibles.`
      );
      
      setAplicacionesActivas(prev => prev + 1);
      
    } catch (error) {
      console.error("❌ Error al aplicar:", error);
      
      if (error.response?.data?.tipo_error) {
        switch (error.response.data.tipo_error) {
          case 'proyecto_aprobado':
            showError("❌ Error", "Ya tienes un proyecto aceptado.");
            setTieneProyectoAprobado(true);
            break;
          case 'limite_aplicaciones':
            showError("❌ Error", `Límite de 3 postulaciones alcanzado.\n\nAplicaciones activas: ${error.response.data.aplicaciones_activas || 3}`);
            setAplicacionesActivas(3);
            break;
          case 'aplicacion_duplicada':
            showError("❌ Atención", "Ya te has postulado a este proyecto.");
            setYaAplico(true);
            break;
          default:
            showError("❌ Error", error.response.data.error || 'Error al enviar la aplicación');
        }
      } else {
        showError("❌ Error", "Error al aplicar. Intenta nuevamente.");
      }
    }
  };

  const handleEstadoChange = async (aplicacionId, nuevoEstado) => {
    try {
      const token = localStorage.getItem("access_token");
      
      console.log(`🔄 Actualizando aplicación ${aplicacionId} a ${nuevoEstado}`);
      
      await axios.patch(
        `/api/banco_proyectos/aplicacion/${aplicacionId}/`,
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const proyectoRes = await axios.get(
        `/api/banco_proyectos/formulario_proyecto/${proyecto.id}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("📊 Proyecto actualizado:", proyectoRes.data);
      
      await cargarAplicaciones();
      
      if (onProyectoActualizado) {
        onProyectoActualizado(proyectoRes.data);
      }
      
      showSuccess(
        "✅ Estado actualizado",
        `Aplicación ${nuevoEstado === 'aceptado' ? 'aceptada' : 'rechazada'} exitosamente`
      );
      
    } catch (err) {
      console.error("❌ Error al actualizar estado:", err);
      showError(
        "❌ Error",
        err.response?.data?.detail || "No se pudo actualizar el estado"
      );
    }
  };

  useEffect(() => {
    if (showDetalles && proyectoSeleccionado) {
      if (user?.role === "alumno") {
        verificarEstadoAlumno();
      } else if (user?.role === "empresa") {
        cargarAplicaciones();
      }
    }
  }, [showDetalles, proyectoSeleccionado, user]);

  if (!proyecto) {
    return null;
  }

  console.log("📊 Detalles del proyecto:", {
    estudiantes_aceptados,
    numero_estudiantes,
    vacantes_disponibles,
    hayVacantes,
    tieneProyectoAprobado,
    aplicacionesActivas,
    yaAplico
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
          <div style={{ flex: 1 }}>
            <h2>{proyecto.nombre_proyecto}</h2>
          </div>
          
          {/* ✅ BOTONES SEGÚN ROL */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* ✅ BOTÓN PARA ALUMNOS */}
            {user?.role === "alumno" && (
              <div>
                {tieneProyectoAprobado ? (
                  <button className="btn-aplicar-ahora" disabled>
                    Ya tienes proyecto aprobado
                  </button>
                ) : aplicacionesActivas >= 3 ? (
                  <button className="btn-aplicar-ahora" disabled>
                    Límite de aplicaciones alcanzado ({aplicacionesActivas}/3)
                  </button>
                ) : yaAplico ? (
                  <button className="btn-aplicar-ahora" disabled>
                    Ya aplicado
                  </button>
                ) : !hayVacantes ? (
                  <button className="btn-aplicar-ahora" disabled>
                    Sin vacantes disponibles
                  </button>
                ) : (
                  <button className="btn-aplicar-ahora" onClick={() => handleAplicar(proyecto.id)}>
                    Aplicar ahora
                  </button>
                )}
                
                {/* ✅ CONTADOR DE APLICACIONES */}
                {!tieneProyectoAprobado && (
                  <div style={{ fontSize: '0.9rem', color: '#7E122A', marginTop: '8px' }}>
                    📊 Postulaciones activas: {aplicacionesActivas}/3
                  </div>
                )}
              </div>
            )}

            {/* ✅ BOTÓN TERMINAR PARA EMPRESAS */}
            {user?.role === "empresa" && onTerminar && (
              <button 
                className="btn-terminar-proyecto-modal"
                onClick={() => {
                  onTerminar(proyecto);
                  onClose(); // Cerrar modal después de confirmar
                }}
                style={{
                  background: 'linear-gradient(135deg, #dc3545, #e85d75)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #c82333, #dc3545)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #dc3545, #e85d75)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.3)';
                }}
              >
                <i className="ri-check-double-line"></i>
                <span>Terminar Proyecto</span>
              </button>
            )}
          </div>
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
                Solicita: <strong>{numero_estudiantes}</strong> estudiantes
              </div>
              <div style={{ 
                color: vacantes_disponibles === 0 ? '#dc3545' : '#28a745',
                fontWeight: 'bold'
              }}>
                Aceptados: <strong>{estudiantes_aceptados}</strong> / <strong>{numero_estudiantes}</strong>
              </div>
              <div style={{ 
                color: vacantes_disponibles === 0 ? '#dc3545' : '#28a745'
              }}>
                Vacantes: <strong>{vacantes_disponibles}</strong>
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
        
        {/* ✅ LISTA DE APLICACIONES (SOLO PARA EMPRESAS) */}
        {user?.role === "empresa" && aplicaciones.length > 0 && (
          <div className="aplicaciones-list" style={{ marginTop: '20px' }}>
            <h3>Aplicaciones recibidas ({aplicaciones.length})</h3>
            {aplicaciones.map((app) => (
              <div key={app.id} className="aplicacion-item" style={{
                border: '1px solid #ddd',
                padding: '15px',
                marginBottom: '10px',
                borderRadius: '8px',
                backgroundColor: app.estado === 'aceptado' ? '#d4edda' : app.estado === 'rechazado' ? '#f8d7da' : '#fff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{app.alumno?.nombres} {app.alumno?.primer_apellido}</strong>
                    <p>Matrícula: {app.alumno?.matricula}</p>
                    <p>Especialidad: {app.alumno?.especialidad}</p>
                    <p>Email: {app.alumno?.email}</p>
                    <p>Estado: <strong style={{ 
                      color: app.estado === 'aceptado' ? '#28a745' : app.estado === 'rechazado' ? '#dc3545' : '#ffc107'
                    }}>
                      {app.estado}
                    </strong></p>
                  </div>
                  {app.estado === 'pendiente' && (
                    <div>
                      <button 
                        onClick={() => handleEstadoChange(app.id, 'aceptado')}
                        style={{
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginRight: '8px'
                        }}
                        disabled={vacantes_disponibles === 0}
                      >
                        Aceptar
                      </button>
                      <button 
                        onClick={() => handleEstadoChange(app.id, 'rechazado')}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <CustomAlert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          isOpen={alert.isOpen}
          onClose={closeAlert}
          onConfirm={alert.onConfirm}
        />
      </div>
    </div>
  );
};

export default GestionProyectosDetalles;