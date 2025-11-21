import React, { useMemo } from "react";
import "./ResidenteCard.css";

const ResidenteCard = ({ aplicacion, onVerMas, onAceptar, onRechazar }) => {
  const memoizedData = useMemo(() => {
    if (!aplicacion || !aplicacion.alumno) {
      return null;
    }

    const { alumno, proyecto, estado } = aplicacion;
    
    const nombreCompleto = [
      alumno?.nombres,
      alumno?.primer_apellido,
      alumno?.segundo_apellido
    ].filter(Boolean).join(' ') || 'Sin nombre';

    return {
      alumno,
      proyecto,
      estado,
      nombreCompleto,
      fotoUrl: alumno.foto && typeof alumno.foto === 'string' ? alumno.foto : null
    };
  }, [aplicacion]);

  if (!memoizedData) {
    return (
      <div className="residente-card error">
        <p>Error: Datos de aplicación no disponibles</p>
      </div>
    );
  }

  const { alumno, proyecto, estado, nombreCompleto, fotoUrl } = memoizedData;

  return (
    <div className="residente-card">
      {/* ✅ Header con imagen y nombre */}
      <div className="residente-header">
        {fotoUrl && (
          <img 
            src={fotoUrl} 
            alt={`Foto de ${nombreCompleto}`}
            className="residente-img"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        
        <div className="residente-info">
          <h4>{nombreCompleto}</h4>
        </div>
      </div>

      {/* ✅ Información detallada */}
      <div className="residente-info">
        <p><strong>Email:</strong> <span>{alumno?.email || 'Sin email'}</span></p>
        <p><strong>Teléfono:</strong> <span>{alumno?.telefono || 'N/A'}</span></p>
        <p><strong>Especialidad:</strong> <span>{alumno?.especialidad || 'N/A'}</span></p>
        <p><strong>Proyecto:</strong> <span>{proyecto?.nombre_proyecto || 'Sin proyecto'}</span></p>
        <p>
          <strong>Estado:</strong> 
          <span className={`estado-${estado}`}>{estado}</span>
        </p>
      </div>

      {/* ✅ Acciones */}
      <div className="residente-actions">
        <button onClick={() => onVerMas(aplicacion)} className="btn-ver-mas">
          Ver más
        </button>
        
        {estado === 'pendiente' && (
          <>
            <button onClick={onAceptar} className="btn-aceptar">
              Aceptar
            </button>
            <button onClick={onRechazar} className="btn-rechazar">
              Rechazar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(ResidenteCard);