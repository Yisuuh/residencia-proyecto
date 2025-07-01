import React from "react";

const GestionProyectosForm = ({
  form,
  handleChange,
  handleSubmit,
  previewUrl,
  setShowModal,
}) => (
  <div className="gestion-modal-overlay">
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
            <label>Nombre del responsable</label>
            <input type="text" name="nombre_responsable" value={form.nombre_responsable} onChange={handleChange} required />
          </div>
          <div>
            <label>Correo electrónico</label>
            <input type="email" name="correo" value={form.correo} onChange={handleChange} required />
          </div>
          <div>
            <label>Teléfono</label>
            <input type="text" name="telefono" value={form.telefono} onChange={handleChange} required />
          </div>
        </div>

        <label>Nombre del proyecto</label>
        <input type="text" name="nombre_proyecto" value={form.nombre_proyecto} onChange={handleChange} required />

        <label>Objetivo general</label>
        <textarea name="objetivo" value={form.objetivo} onChange={handleChange} required />

        <label>Justificación</label>
        <textarea name="justificacion" value={form.justificacion} onChange={handleChange} required />

        <label>Problema a resolver</label>
        <textarea name="problema" value={form.problema} onChange={handleChange} required />

        <label>Modalidad</label>
        <select name="modalidad" value={form.modalidad} onChange={handleChange}>
          <option value="">Seleccionar</option>
          <option value="virtual">Virtual</option>
          <option value="hibrido">Híbrido</option>
          <option value="presencial">Presencial</option>
        </select>

        <label>Tipo de entidad</label>
        <select name="tipo_entidad" value={form.tipo_entidad} onChange={handleChange}>
          <option value="">Seleccionar</option>
          <option value="empresa">Empresa</option>
          <option value="institucion">Institución</option>
        </select>

        {/* Dinámica según tipo_entidad */}
        {form.tipo_entidad === "empresa" && (
          <>
            <label>Nombre de la empresa</label>
            <input type="text" name="nombre_empresa" value={form.nombre_empresa} onChange={handleChange} required />

            <label>RFC</label>
            <input type="text" name="rfc" value={form.rfc} onChange={handleChange} required />
          </>
        )}

        {form.tipo_entidad === "institucion" && (
          <>
            <label>
              ¿Se trata del Instituto Tecnológico de Mérida?
          <select
            name="es_tec"
            value={form.es_tec}
            onChange={handleChange}
          >
                <option value="">Seleccionar</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </label>
            {form.es_tec === "no" && (
              <>
                <label>Nombre de la institución</label>
                <input type="text" name="nombre_institucion" value={form.nombre_institucion} onChange={handleChange} required />
              </>
            )}
          </>
        )}

        {/* Flujo normal después de la rama */}
        <label>Área tecnológica</label>
        <select name="giro" value={form.giro} onChange={handleChange}>
          <option value="">Seleccionar</option>
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

        <label>Página web</label>
        <input type="url" name="pagina_web" value={form.pagina_web} onChange={handleChange} />

        <label>Número de estudiantes solicitados</label>
        <select name="numero_estudiantes" value={form.numero_estudiantes} onChange={handleChange}>
          <option value="">Seleccionar</option>
          <option value="uno">1</option>
          <option value="dos">2</option>
        </select>

        <label>Periodo</label>
        <select name="periodo" value={form.periodo} onChange={handleChange}>
          <option value="">Seleccionar</option>
          <option value="enero-junio">Enero - Junio</option>
          <option value="agosto-diciembre">Agosto - Diciembre</option>
        </select>

        <label>
          ¿Existe algún tipo de apoyo para el alumno?
          <select
            name="apoyo"
            value={form.apoyo}
            onChange={handleChange}
          >
            <option value="">Seleccionar</option>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </label>

        {form.apoyo === "si" && (
          <>
            <label>¿Qué tipo de apoyo? (beca, comedor, transporte, habitación, etc)</label>
            <textarea name="tipo_apoyo" value={form.tipo_apoyo} onChange={handleChange} />
          </>
        )}

        <label>
          ¿Existe algún estudiante interesado?
          <select
            name="estudiante_interesado"
            value={form.estudiante_interesado}
            onChange={handleChange}
          >
            <option value="">Seleccionar</option>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </label>

        {form.estudiante_interesado === "si" && (
          <>
            <label>Nombre del estudiante solicitado</label>
            <input
              type="text"
              name="nombre_estudiante_solicitado"
              value={form.nombre_estudiante_solicitado}
              onChange={handleChange}
            />
          </>
        )}

        <label>Observaciones</label>
        <textarea name="observaciones" value={form.observaciones} onChange={handleChange} />

        <div className="file-input-wrapper">
          <label htmlFor="imagen" className="file-label">
            Seleccionar imagen
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
            <span className="file-name">{form.imagen.name}</span>
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
          Guardar
        </button>
      </form>
    </div>
  </div>
);

export default GestionProyectosForm;