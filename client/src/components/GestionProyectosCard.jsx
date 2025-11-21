import React from "react";

const GestionProyectosCard = ({ proyecto, onDetalles, onTerminar, user }) => {
  console.log("📊 Card proyecto:", proyecto);
  console.log("🎴 GestionProyectosCard - Props recibidos:");
  console.log("  👤 user:", user);
  console.log("  👤 user?.role:", user?.role);
  console.log("  📦 proyecto:", proyecto.nombre_proyecto);
  return (
    <div className="gestion-card">
      {/* Fecha y logo */}
      <div className="card-header">
        <span className="card-fecha">a
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
          Aceptados: <strong>{proyecto.estudiantes_aceptados || 0}</strong> / <strong>{proyecto.numero_estudiantes || 1}</strong>
        </span>
      </div>
      
      {/* Título */}
      <h3 className="card-titulo">{proyecto.nombre_proyecto}</h3>
      
      {/* Estadísticas */}
      <div style={{ 
        fontSize: '0.85rem', 
        color: '#666', 
        marginBottom: '10px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px'
      }}>
        <div style={{ marginBottom: '5px' }}>
          📊 <strong>Vacantes:</strong> {proyecto.vacantes_disponibles || 0}
        </div>
        <div style={{ marginBottom: '5px' }}>
          📋 <strong>Aplicaciones:</strong> {proyecto.total_aplicaciones || 0}
        </div>
        <div>
          ⏳ <strong>Pendientes:</strong> {proyecto.aplicaciones_pendientes || 0}
        </div>
      </div>
      
      {/* Etiquetas */}
      <div className="card-etiquetas">
        <span className="etiqueta tag-especialidad">
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
      
      {/* ✅ BOTONES: Detalles y Terminar */}
      <div className="card-actions" style={{ 
        display: 'flex', 
        gap: '10px',
        marginTop: '15px'
      }}>
        <button 
          className="btn-detalles" 
          onClick={() => onDetalles(proyecto)}
          style={{ flex: 1 }}
        >
          <i className="ri-eye-line"></i>
          Detalles
        </button>
        
        {/* ✅ BOTÓN TERMINAR (solo para empresas) */}
        {user?.role === 'empresa' && (
          <button 
            className="btn-terminar-proyecto"
            onClick={() => onTerminar(proyecto)}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #dc3545, #e85d75)',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #c82333, #dc3545)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #dc3545, #e85d75)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <i className="ri-check-double-line"></i>
            Terminar
          </button>
        )}
      </div>
    </div>
  );
};

export default GestionProyectosCard;