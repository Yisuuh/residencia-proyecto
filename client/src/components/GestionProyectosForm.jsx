import React, { useEffect } from "react";
import "./GestionProyectosForm.css";

const GestionProyectosForm = ({
  form,
  handleChange,
  handleSubmit,
  previewUrl,
  setShowModal,
}) => {
  // ✅ Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.classList.add('modal-open');
    
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  // ✅ Cerrar modal al hacer clic fuera
  const handleOverlayClick = (e) => {
    if (e.target.className === 'gestion-modal-overlay') {
      setShowModal(false);
    }
  };

  return (
    <div className="gestion-modal-overlay" onClick={handleOverlayClick}>
      <div className="gestion-modal-content">
        <button
          className="gestion-modal-close"
          onClick={() => setShowModal(false)}
          aria-label="Cerrar"
        >
          <i className="ri-close-line"></i>
        </button>
        
        <h3>Nuevo Proyecto</h3>
        
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-row">
            <div>
              <label>Nombre del responsable*</label>
              <input 
                type="text" 
                name="nombre_responsable" 
                value={form.nombre_responsable} 
                onChange={handleChange} 
                required 
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div>
              <label>Correo electrónico*</label>
              <input 
                type="email" 
                name="correo" 
                value={form.correo} 
                onChange={handleChange} 
                required 
                placeholder="ejemplo@empresa.com"
              />
            </div>
            <div>
              <label>Teléfono*</label>
              <input 
                type="tel" 
                name="telefono" 
                value={form.telefono} 
                onChange={handleChange} 
                required 
                placeholder="999-123-4567"
                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                title="Formato: 999-123-4567"
              />
            </div>
          </div>

          <label>Nombre del proyecto*</label>
          <input 
            type="text" 
            name="nombre_proyecto" 
            value={form.nombre_proyecto} 
            onChange={handleChange} 
            required 
            placeholder="Nombre descriptivo del proyecto"
          />

          <div className="form-row">
            <div>
              <label>Objetivo general*</label>
              <textarea 
                name="objetivo" 
                value={form.objetivo} 
                onChange={handleChange} 
                required 
                placeholder="Describe el objetivo principal del proyecto"
                rows="4"
              />
            </div>
            <div>
              <label>Justificación*</label>
              <textarea 
                name="justificacion" 
                value={form.justificacion} 
                onChange={handleChange} 
                required 
                placeholder="¿Por qué es importante este proyecto?"
                rows="4"
              />
            </div>
          </div>

          <label>Problema a resolver*</label>
          <textarea 
            name="problema" 
            value={form.problema} 
            onChange={handleChange} 
            required 
            placeholder="¿Qué problema específico resolverá este proyecto?"
            rows="4"
          />

          <div className="form-row">
            <div>
              <label>Modalidad*</label>
              <select name="modalidad" value={form.modalidad} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                <option value="virtual">Virtual</option>
                <option value="hibrido">Híbrido</option>
                <option value="presencial">Presencial</option>
              </select>
            </div>
            <div>
              <label>Tipo de entidad*</label>
              <select name="tipo_entidad" value={form.tipo_entidad} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                <option value="empresa">Empresa</option>
                <option value="institucion">Institución</option>
              </select>
            </div>
          </div>

          {/* ✅ Campos dinámicos según tipo_entidad */}
          {form.tipo_entidad === "empresa" && (
            <div className="form-row">
              <div>
                <label>Nombre de la empresa*</label>
                <input 
                  type="text" 
                  name="nombre_empresa" 
                  value={form.nombre_empresa} 
                  onChange={handleChange} 
                  required 
                  placeholder="Nombre completo de la empresa"
                />
              </div>
              <div>
                <label>RFC*</label>
                <input 
                  type="text" 
                  name="rfc" 
                  value={form.rfc} 
                  onChange={handleChange} 
                  required 
                  placeholder="XAXX010101000"
                  pattern="^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$"
                  title="RFC válido (ej: XAXX010101000)"
                />
              </div>
            </div>
          )}

          {form.tipo_entidad === "institucion" && (
            <>
              <label>¿Se trata del Instituto Tecnológico de Mérida?*</label>
              <select name="es_tec" value={form.es_tec} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
              
              {form.es_tec === "no" && (
                <>
                  <label>Nombre de la institución*</label>
                  <input 
                    type="text" 
                    name="nombre_institucion" 
                    value={form.nombre_institucion} 
                    onChange={handleChange} 
                    required 
                    placeholder="Nombre completo de la institución"
                  />
                </>
              )}
            </>
          )}

          <div className="form-row">
            <div>
              <label>Área tecnológica*</label>
              <select name="giro" value={form.giro} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                <option value="diseño">Diseño</option>
                <option value="manufactura">Manufactura</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="automatizacion">Automatización</option>
                <option value="energias">Energías Renovables</option>
                <option value="aire_acond">Aire acondicionado y refrigeración</option>
                <option value="mecanica_auto">Mecánica automotriz</option>
                <option value="investigacion">Investigación</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label>Página web</label>
              <input 
                type="url" 
                name="pagina_web" 
                value={form.pagina_web} 
                onChange={handleChange} 
                placeholder="https://www.ejemplo.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div>
              <label>Número de estudiantes solicitados*</label>
              <select name="numero_estudiantes" value={form.numero_estudiantes} onChange={handleChange} required>
                <option value="">Selecciona...</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? 'estudiante' : 'estudiantes'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Periodo*</label>
              <select name="periodo" value={form.periodo} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                <option value="enero-junio">Enero - Junio</option>
                <option value="agosto-diciembre">Agosto - Diciembre</option>
              </select>
            </div>
          </div>

          <label>¿Existe algún tipo de apoyo para el alumno?*</label>
          <select name="apoyo" value={form.apoyo} onChange={handleChange} required>
            <option value="">Seleccionar...</option>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>

          {form.apoyo === "si" && (
            <>
              <label>¿Qué tipo de apoyo?</label>
              <textarea 
                name="tipo_apoyo" 
                value={form.tipo_apoyo} 
                onChange={handleChange} 
                placeholder="Describe el tipo de apoyo (beca, comedor, transporte, habitación, etc.)"
                rows="3"
              />
            </>
          )}

          <label>¿Existe algún estudiante interesado?*</label>
          <select name="estudiante_interesado" value={form.estudiante_interesado} onChange={handleChange} required>
            <option value="">Seleccionar...</option>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>

          {form.estudiante_interesado === "si" && (
            <>
              <label>Nombre del estudiante solicitado</label>
              <input
                type="text"
                name="nombre_estudiante_solicitado"
                value={form.nombre_estudiante_solicitado}
                onChange={handleChange}
                placeholder="Nombre completo del estudiante"
              />
            </>
          )}

          <label>Observaciones</label>
          <textarea 
            name="observaciones" 
            value={form.observaciones} 
            onChange={handleChange} 
            placeholder="Información adicional relevante"
            rows="4"
          />

          <div className="file-input-wrapper">
            <label htmlFor="imagen" className="file-label">
              📁 Seleccionar imagen de la empresa
            </label>
            <input
              id="imagen"
              type="file"
              name="imagen"
              accept="image/*"
              onChange={handleChange}
              className="file-input"
            />
            {form.imagen && (
              <span className="file-name">✓ {form.imagen.name}</span>
            )}
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Vista previa"
                className="img-preview"
              />
            )}
          </div>

          <button type="submit">
            <i className="ri-save-line"></i> Guardar Proyecto
          </button>
        </form>
      </div>
    </div>
  );
};

export default GestionProyectosForm;