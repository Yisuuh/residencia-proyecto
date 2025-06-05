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
            <label>Correo</label>
            <input type="email" name="correo" value={form.correo} onChange={handleChange} required />
          </div>
          <div>
            <label>Teléfono</label>
            <input type="text" name="telefono" value={form.telefono} onChange={handleChange} required />
          </div>
        </div>

        <label>Nombre del proyecto</label>
        <input type="text" name="nombre_proyecto" value={form.nombre_proyecto} onChange={handleChange} required />

        <label>Objetivo</label>
        <textarea name="objetivo" value={form.objetivo} onChange={handleChange} required />

        <label>Justificación</label>
        <textarea name="justificacion" value={form.justificacion} onChange={handleChange} required />

        <label>Problema</label>
        <textarea name="problema" value={form.problema} onChange={handleChange} required />

        <label>Actividades</label>
        <textarea name="actividades" value={form.actividades} onChange={handleChange} required />

        <label>Stack tecnológico</label>
        <textarea name="stack" value={form.stack} onChange={handleChange} required />

        <label>Modalidad</label>
        <select name="modalidad" value={form.modalidad} onChange={handleChange}>
          <option value="virtual">Virtual</option>
          <option value="hibrido">Híbrido</option>
          <option value="presencial">Presencial</option>
        </select>

        <label>Tipo de entidad</label>
        <select name="tipo_entidad" value={form.tipo_entidad} onChange={handleChange}>
          <option value="empresa">Empresa</option>
          <option value="institucion">Institución</option>
        </select>

        <label>Nombre de la empresa</label>
        <input type="text" name="nombre_empresa" value={form.nombre_empresa} onChange={handleChange} />

        <label>RFC</label>
        <input type="text" name="rfc" value={form.rfc} onChange={handleChange} />

        <label>Giro</label>
        <select name="giro" value={form.giro} onChange={handleChange}>
          <option value="servicios">Servicios</option>
          <option value="manufactura">Manufactura</option>
          <option value="comercial">Comercial</option>
        </select>

        <label>Página web</label>
        <input type="url" name="pagina_web" value={form.pagina_web} onChange={handleChange} />

        <label>Número de estudiantes</label>
        <input type="number" name="numero_estudiantes" value={form.numero_estudiantes} onChange={handleChange} />

        <label>Especialidad</label>
        <select name="especialidad" value={form.especialidad} onChange={handleChange}>
          <option value="ciberseguridad">Ciberseguridad</option>
          <option value="ia">Inteligencia Artificial</option>
          <option value="web">Desarrollo Web</option>
        </select>

        <label>Periodo</label>
        <select name="periodo" value={form.periodo} onChange={handleChange}>
          <option value="enero-junio">Enero - Junio</option>
          <option value="agosto-diciembre">Agosto - Diciembre</option>
        </select>

        <label>Competencias</label>
        <textarea name="competencias" value={form.competencias} onChange={handleChange} />

        <label>
          ¿Requiere apoyo?
          <select
            name="apoyo"
            value={form.apoyo ? "si" : "no"}
            onChange={e => handleChange({
              target: { name: "apoyo", value: e.target.value === "si" }
            })}
          >
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </label>

        <label>Tipo de apoyo</label>
        <textarea name="tipo_apoyo" value={form.tipo_apoyo} onChange={handleChange} />

        <label>
          ¿Ya hay estudiante interesado?
          <select
            name="estudiante_interesado"
            value={form.estudiante_interesado ? "si" : "no"}
            onChange={e => handleChange({
              target: { name: "estudiante_interesado", value: e.target.value === "si" }
            })}
          >
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </label>

        <label>Nombre del estudiante solicitado</label>
        <input type="text" name="nombre_estudiante_solicitado" value={form.nombre_estudiante_solicitado} onChange={handleChange} />

        <label>
          ¿Es Tec?
          <select
            name="es_tec"
            value={form.es_tec ? "si" : "no"}
            onChange={e => handleChange({
              target: { name: "es_tec", value: e.target.value === "si" }
            })}
          >
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </label>

        <label>
          ¿Incluir asesor?
          <select
            name="incluir_asesor"
            value={form.incluir_asesor ? "si" : "no"}
            onChange={e => handleChange({
              target: { name: "incluir_asesor", value: e.target.value === "si" }
            })}
          >
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </label>

        <label>Nombre del asesor</label>
        <input type="text" name="nombre_asesor" value={form.nombre_asesor} onChange={handleChange} />

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