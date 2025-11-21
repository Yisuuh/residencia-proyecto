import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAlert } from "../hooks/useAlert";
import CustomAlert from "../components/CustomAlert";
import "./SolicitudesAlumno.css";

const SolicitudesAlumno = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { alert, closeAlert, showSuccess, showError, showConfirm } = useAlert();

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get("/api/banco_proyectos/alumno/solicitudes-aceptadas/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("📨 Solicitudes aceptadas:", res.data);
      setSolicitudes(res.data.solicitudes || []);
      
    } catch (error) {
      console.error("❌ Error al cargar solicitudes:", error);
      showError("Error", "No se pudieron cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = async (aplicacionId, nombreProyecto, nombreEmpresa) => {
    showConfirm(
      "⚠️ Confirmación importante",
      `¿Estás seguro que deseas confirmar el proyecto "${nombreProyecto}" de ${nombreEmpresa}?\n\nAl confirmar, se rechazarán automáticamente todas tus demás postulaciones.`,
      async () => {
        try {
          const token = localStorage.getItem("access_token");
          const res = await axios.post(
            "/api/banco_proyectos/alumno/confirmar-proyecto/",
            { aplicacion_id: aplicacionId },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          showSuccess("✅ ¡Proyecto confirmado!", `Has confirmado el proyecto: ${nombreProyecto}`);
          
          // Recargar solicitudes (debería estar vacío)
          setTimeout(() => {
            window.location.href = "/dashboard/alumno/estado-proyecto";
          }, 2000);
          
        } catch (error) {
          console.error("❌ Error al confirmar:", error);
          showError("Error", error.response?.data?.error || "No se pudo confirmar el proyecto");
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="solicitudes-container">
        <div className="solicitudes-header">
          <h1>Cargando...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="solicitudes-container">
      {/* ✅ Header con campanita */}
      <div className="solicitudes-header">
        <h1>Solicitudes Pendientes</h1>
        <p>Las siguientes empresas han aceptado tu postulación. Debes elegir una para confirmar tu proyecto.</p>
      </div>

      {solicitudes.length === 0 ? (
        <div className="no-solicitudes">
          <p>No tienes solicitudes pendientes de confirmación</p>
        </div>
      ) : (
        <div className="solicitudes-list">
          {solicitudes.map((solicitud) => (
            <div key={solicitud.id} className="solicitud-card">
              {/* ✅ Header de la card */}
              <div className="solicitud-header">
                <div className="solicitud-empresa">
                  {solicitud.proyecto.imagen && (
                    <img 
                      src={solicitud.proyecto.imagen} 
                      alt="Logo empresa"
                      className="empresa-logo"
                    />
                  )}
                  <div>
                    <h3>{solicitud.proyecto.nombre_empresa}</h3>
                    <span className="badge-aceptado">Aceptado</span>
                  </div>
                </div>
                <div className="solicitud-fecha">
                  <i className="ri-time-line"></i>
                  <span>{new Date(solicitud.fecha_actualizacion).toLocaleDateString()}</span>
                </div>
              </div>

              {/* ✅ Body de la card */}
              <div className="solicitud-body">
                <h4>{solicitud.proyecto.nombre_proyecto}</h4>
                
                <div className="proyecto-info">
                  <div className="info-item">
                    <i className="ri-map-pin-line"></i>
                    <span>{solicitud.proyecto.modalidad_display || 'Presencial'}</span>
                  </div>
                  <div className="info-item">
                    <i className="ri-calendar-line"></i>
                    <span>{solicitud.proyecto.periodo_display || 'Periodo actual'}</span>
                  </div>
                  <div className="info-item">
                    <i className="ri-book-line"></i>
                    <span>{solicitud.proyecto.especialidad_display || 'Todas'}</span>
                  </div>
                </div>

                <div className="proyecto-descripcion">
                  <p><strong>Responsable:</strong> <span>{solicitud.proyecto.nombre_responsable}</span></p>
                  <p><strong>Contacto:</strong> <span>{solicitud.proyecto.correo}</span></p>
                  <p><strong>Teléfono:</strong> <span>{solicitud.proyecto.telefono}</span></p>
                </div>
              </div>

              {/* ✅ Footer de la card */}
              <div className="solicitud-footer">
                <button 
                  className="btn-confirmar"
                  onClick={() => handleConfirmar(
                    solicitud.id,
                    solicitud.proyecto.nombre_proyecto,
                    solicitud.proyecto.nombre_empresa
                  )}
                >
                  <i className="ri-check-line"></i>
                  <span>Confirmar este proyecto</span>
                </button>
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
  );
};

export default SolicitudesAlumno;