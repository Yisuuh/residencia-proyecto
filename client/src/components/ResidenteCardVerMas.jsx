import React, { useMemo, useEffect, useState } from "react";
import axios from "axios";
import { useAlert } from "../hooks/useAlert";
import CustomAlert from "./CustomAlert";
import "./ResidenteCardVerMas.css";

const ResidenteCardVerMas = ({ 
  aplicacion, 
  proyecto, 
  onClose, 
  showActions = false,
  onUpdate 
}) => {
  const [loading, setLoading] = useState(false);
  const { alert, closeAlert, showSuccess, showError } = useAlert();

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const handleDecision = async (nuevoEstado) => {
    if (!showActions) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      await axios.patch(
        `/api/banco_proyectos/aplicacion/${aplicacion.id}/`,
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (onUpdate) onUpdate();
      onClose();
      
      if (nuevoEstado === "aceptado") {
        showSuccess("¡Éxito!", "Residente aceptado correctamente");
      } else {
        showSuccess("Actualizado", "Residente rechazado");
      }
    } catch (error) {
      if (error.response?.status === 400) {
        showError("Atención", error.response?.data?.detail || "Ya se llenó el cupo de este proyecto.");
      } else {
        showError("Error", "Error al actualizar el estado.");
      }
    } finally {
      setLoading(false);
    }
  };

  const memoizedData = useMemo(() => {
    if (!aplicacion) return null;

    const alumno = aplicacion.alumno || {};
    const proyectoInfo = aplicacion.proyecto || proyecto || {};

    const nombreCompleto = [
      alumno.nombres,
      alumno.primer_apellido,
      alumno.segundo_apellido
    ].filter(Boolean).join(' ') || 'Sin nombre';

    return {
      alumno,
      proyectoInfo,
      nombreCompleto,
      fotoUrl: alumno.foto && typeof alumno.foto === 'string' ? alumno.foto : null
    };
  }, [aplicacion, proyecto]);

  if (!memoizedData) return null;

  const { alumno, proyectoInfo, nombreCompleto, fotoUrl } = memoizedData;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* ✅ HEADER - SIN ELEMENTOS EXTRA */}
        <div className="modal-header">
          <h2>Información Completa del Residente</h2>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            <i className="ri-close-line"></i>
          </button>
        </div>
        
        {/* ✅ BODY */}
        <div className="modal-body">
          {fotoUrl && (
            <img
              src={fotoUrl}
              alt={`Foto de ${nombreCompleto}`}
              className="residente-img-modal"
              loading="lazy"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          
          {/* Datos del Alumno */}
          <div className="info-section">
            <h3>Datos del Alumno</h3>
            <div className="alumno-info">
              <div className="info-item">
                <strong>Nombre Completo:</strong>
                <span>{nombreCompleto}</span>
              </div>
              <div className="info-item">
                <strong>Email:</strong>
                <span>{alumno.email || 'Sin email'}</span>
              </div>
              <div className="info-item">
                <strong>Teléfono:</strong>
                <span>{alumno.telefono || 'No proporcionado'}</span>
              </div>
              <div className="info-item">
                <strong>Especialidad:</strong>
                <span>{alumno.especialidad || 'No especificada'}</span>
              </div>
              {alumno.matricula && (
                <div className="info-item">
                  <strong>Matrícula:</strong>
                  <span>{alumno.matricula}</span>
                </div>
              )}
            </div>
          </div>

          <hr />

          {/* Datos del Proyecto */}
          <div className="info-section">
            <h3>Datos del Proyecto</h3>
            {proyectoInfo.nombre_proyecto ? (
              <div className="proyecto-info">
                <div className="info-item">
                  <strong>Nombre:</strong>
                  <span>{proyectoInfo.nombre_proyecto}</span>
                </div>
                {proyectoInfo.objetivo && (
                  <div className="info-item">
                    <strong>Objetivo:</strong>
                    <span>{proyectoInfo.objetivo}</span>
                  </div>
                )}
                {proyectoInfo.nombre_responsable && (
                  <div className="info-item">
                    <strong>Responsable:</strong>
                    <span>{proyectoInfo.nombre_responsable}</span>
                  </div>
                )}
                {proyectoInfo.nombre_empresa && (
                  <div className="info-item">
                    <strong>Empresa:</strong>
                    <span>{proyectoInfo.nombre_empresa}</span>
                  </div>
                )}
                {proyectoInfo.correo && (
                  <div className="info-item">
                    <strong>Contacto:</strong>
                    <span>{proyectoInfo.correo}</span>
                  </div>
                )}
                {proyectoInfo.telefono && (
                  <div className="info-item">
                    <strong>Teléfono:</strong>
                    <span>{proyectoInfo.telefono}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="info-empty">
                <p>No hay información del proyecto disponible</p>
              </div>
            )}
          </div>

          {/* Acciones (solo si showActions=true) */}
          {showActions && (
            <>
              <hr />
              <div className="info-section">
                <h3>Acciones</h3>
                <div className="modal-actions-grid">
                  <button
                    className="btn-modal-aceptar"
                    onClick={() => handleDecision("aceptado")}
                    disabled={loading}
                  >
                    <i className="ri-check-line"></i>
                    <span>Aceptar Residente</span>
                  </button>
                  <button
                    className="btn-modal-rechazar"
                    onClick={() => handleDecision("rechazado")}
                    disabled={loading}
                  >
                    <i className="ri-close-line"></i>
                    <span>Rechazar</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        
        {showActions && (
          <CustomAlert
            type={alert.type}
            title={alert.title}
            message={alert.message}
            isOpen={alert.isOpen}
            onClose={closeAlert}
            onConfirm={alert.onConfirm}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(ResidenteCardVerMas);