import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ConfiguracionSistemaJefe.css";
import CustomAlert from "../components/CustomAlert";

const ConfiguracionSistemaJefe = () => {
  const [tabActiva, setTabActiva] = useState("especialidades");
  const [especialidades, setEspecialidades] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Alert
  const [alert, setAlert] = useState({ show: false, type: "", title: "", message: "" });

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    cargarDatos();
  }, [tabActiva]);

  const showAlert = (type, title, message) => {
    setAlert({ show: true, type, title, message });
  };

  const closeAlert = () => {
    setAlert({ show: false, type: "", title: "", message: "" });
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      let url = "";

      switch (tabActiva) {
        case "especialidades":
          url = "/api/configuracion/especialidades/";
          break;
        case "modalidades":
          url = "/api/configuracion/modalidades/";
          break;
        case "documentos":
          url = "/api/configuracion/tipos-documento/";
          break;
        case "periodos":
          url = "/api/configuracion/periodos/";
          break;
        default:
          return;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      switch (tabActiva) {
        case "especialidades":
          setEspecialidades(res.data);
          break;
        case "modalidades":
          setModalidades(res.data);
          break;
        case "documentos":
          setTiposDocumento(res.data);
          break;
        case "periodos":
          setPeriodos(res.data);
          break;
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      showAlert("error", "Error", "No se pudieron cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (item = null) => {
    setItemEditando(item);
    if (item) {
      setFormData({ ...item });
    } else {
      // Valores por defecto según la tab
      switch (tabActiva) {
        case "especialidades":
          setFormData({ codigo: "", nombre: "", activa: true, orden: 0 });
          break;
        case "modalidades":
          setFormData({ codigo: "", nombre: "", descripcion: "", activa: true, orden: 0 });
          break;
        case "documentos":
          setFormData({ nombre: "", descripcion: "", requerido: true, dias_plazo: 30, activo: true, orden: 0 });
          break;
        case "periodos":
          setFormData({ nombre: "", fecha_inicio: "", fecha_fin: "", activo: false });
          break;
      }
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setItemEditando(null);
    setFormData({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      let url = "";

      switch (tabActiva) {
        case "especialidades":
          url = "/api/configuracion/especialidades/";
          break;
        case "modalidades":
          url = "/api/configuracion/modalidades/";
          break;
        case "documentos":
          url = "/api/configuracion/tipos-documento/";
          break;
        case "periodos":
          url = "/api/configuracion/periodos/";
          break;
      }

      if (itemEditando) {
        await axios.put(`${url}${itemEditando.id}/`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showAlert("success", "¡Actualizado!", "El elemento se actualizó correctamente");
      } else {
        await axios.post(url, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showAlert("success", "¡Creado!", "El elemento se creó correctamente");
      }

      cerrarModal();
      cargarDatos();
    } catch (error) {
      console.error("Error al guardar:", error);
      showAlert("error", "Error", error.response?.data?.detail || "No se pudo guardar");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este elemento?")) return;

    try {
      const token = localStorage.getItem("access_token");
      let url = "";

      switch (tabActiva) {
        case "especialidades":
          url = `/api/configuracion/especialidades/${id}/`;
          break;
        case "modalidades":
          url = `/api/configuracion/modalidades/${id}/`;
          break;
        case "documentos":
          url = `/api/configuracion/tipos-documento/${id}/`;
          break;
        case "periodos":
          url = `/api/configuracion/periodos/${id}/`;
          break;
      }

      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showAlert("success", "¡Eliminado!", "El elemento se eliminó correctamente");
      cargarDatos();
    } catch (error) {
      console.error("Error al eliminar:", error);
      showAlert("error", "Error", "No se pudo eliminar el elemento");
    }
  };

  const handleToggle = async (item) => {
    try {
      const token = localStorage.getItem("access_token");
      let url = "";
      let campo = "";

      switch (tabActiva) {
        case "especialidades":
          url = `/api/configuracion/especialidades/${item.id}/toggle_activa/`;
          campo = "activa";
          break;
        case "modalidades":
          url = `/api/configuracion/modalidades/${item.id}/toggle_activa/`;
          campo = "activa";
          break;
        case "documentos":
          url = `/api/configuracion/tipos-documento/${item.id}/toggle_activo/`;
          campo = "activo";
          break;
      }

      await axios.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showAlert("success", "¡Actualizado!", `Estado cambiado correctamente`);
      cargarDatos();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      showAlert("error", "Error", "No se pudo cambiar el estado");
    }
  };

  const handleActivarPeriodo = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(`/api/configuracion/periodos/${id}/activar/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showAlert("success", "¡Activado!", "Periodo académico activado");
      cargarDatos();
    } catch (error) {
      console.error("Error al activar periodo:", error);
      showAlert("error", "Error", "No se pudo activar el periodo");
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="config-loading">
          <i className="ri-loader-4-line"></i>
          <p>Cargando...</p>
        </div>
      );
    }

    switch (tabActiva) {
      case "especialidades":
        return renderEspecialidades();
      case "modalidades":
        return renderModalidades();
      case "documentos":
        return renderDocumentos();
      case "periodos":
        return renderPeriodos();
      default:
        return null;
    }
  };

  const renderEspecialidades = () => (
    <div className="config-content">
      <div className="config-header">
        <h3>
          <i className="ri-bookmark-line"></i>
          Especialidades Disponibles
        </h3>
        <button className="config-btn-agregar" onClick={() => abrirModal()}>
          <i className="ri-add-line"></i>
          Agregar Especialidad
        </button>
      </div>

      {especialidades.length === 0 ? (
        <div className="config-empty">
          <i className="ri-bookmark-line"></i>
          <p>No hay especialidades registradas</p>
        </div>
      ) : (
        <div className="config-table-container">
          <table className="config-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Orden</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {especialidades.map((esp) => (
                <tr key={esp.id}>
                  <td className="config-td-codigo">{esp.codigo}</td>
                  <td className="config-td-nombre">{esp.nombre}</td>
                  <td>
                    <span className={`config-badge ${esp.activa ? "config-badge-activo" : "config-badge-inactivo"}`}>
                      {esp.activa ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="config-td-orden">{esp.orden}</td>
                  <td className="config-td-acciones">
                    <button
                      className="config-btn-accion config-btn-editar"
                      onClick={() => abrirModal(esp)}
                      title="Editar"
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button
                      className="config-btn-accion config-btn-toggle"
                      onClick={() => handleToggle(esp)}
                      title={esp.activa ? "Desactivar" : "Activar"}
                    >
                      <i className={esp.activa ? "ri-eye-off-line" : "ri-eye-line"}></i>
                    </button>
                    <button
                      className="config-btn-accion config-btn-eliminar"
                      onClick={() => handleEliminar(esp.id)}
                      title="Eliminar"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderModalidades = () => (
    <div className="config-content">
      <div className="config-header">
        <h3>
          <i className="ri-file-list-line"></i>
          Modalidades de Proyecto
        </h3>
        <button className="config-btn-agregar" onClick={() => abrirModal()}>
          <i className="ri-add-line"></i>
          Agregar Modalidad
        </button>
      </div>

      {modalidades.length === 0 ? (
        <div className="config-empty">
          <i className="ri-file-list-line"></i>
          <p>No hay modalidades registradas</p>
        </div>
      ) : (
        <div className="config-table-container">
          <table className="config-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Orden</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {modalidades.map((mod) => (
                <tr key={mod.id}>
                  <td className="config-td-codigo">{mod.codigo}</td>
                  <td className="config-td-nombre">{mod.nombre}</td>
                  <td className="config-td-descripcion">{mod.descripcion || "-"}</td>
                  <td>
                    <span className={`config-badge ${mod.activa ? "config-badge-activo" : "config-badge-inactivo"}`}>
                      {mod.activa ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="config-td-orden">{mod.orden}</td>
                  <td className="config-td-acciones">
                    <button
                      className="config-btn-accion config-btn-editar"
                      onClick={() => abrirModal(mod)}
                      title="Editar"
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button
                      className="config-btn-accion config-btn-toggle"
                      onClick={() => handleToggle(mod)}
                      title={mod.activa ? "Desactivar" : "Activar"}
                    >
                      <i className={mod.activa ? "ri-eye-off-line" : "ri-eye-line"}></i>
                    </button>
                    <button
                      className="config-btn-accion config-btn-eliminar"
                      onClick={() => handleEliminar(mod.id)}
                      title="Eliminar"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderDocumentos = () => (
    <div className="config-content">
      <div className="config-header">
        <h3>
          <i className="ri-file-text-line"></i>
          Tipos de Documento
        </h3>
        <button className="config-btn-agregar" onClick={() => abrirModal()}>
          <i className="ri-add-line"></i>
          Agregar Tipo de Documento
        </button>
      </div>

      {tiposDocumento.length === 0 ? (
        <div className="config-empty">
          <i className="ri-file-text-line"></i>
          <p>No hay tipos de documento registrados</p>
        </div>
      ) : (
        <div className="config-table-container">
          <table className="config-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Requerido</th>
                <th>Días Plazo</th>
                <th>Estado</th>
                <th>Orden</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tiposDocumento.map((doc) => (
                <tr key={doc.id}>
                  <td className="config-td-nombre">{doc.nombre}</td>
                  <td className="config-td-descripcion">{doc.descripcion || "-"}</td>
                  <td>
                    <span className={`config-badge ${doc.requerido ? "config-badge-requerido" : "config-badge-opcional"}`}>
                      {doc.requerido ? "Requerido" : "Opcional"}
                    </span>
                  </td>
                  <td className="config-td-orden">{doc.dias_plazo} días</td>
                  <td>
                    <span className={`config-badge ${doc.activo ? "config-badge-activo" : "config-badge-inactivo"}`}>
                      {doc.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="config-td-orden">{doc.orden}</td>
                  <td className="config-td-acciones">
                    <button
                      className="config-btn-accion config-btn-editar"
                      onClick={() => abrirModal(doc)}
                      title="Editar"
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button
                      className="config-btn-accion config-btn-toggle"
                      onClick={() => handleToggle(doc)}
                      title={doc.activo ? "Desactivar" : "Activar"}
                    >
                      <i className={doc.activo ? "ri-eye-off-line" : "ri-eye-line"}></i>
                    </button>
                    <button
                      className="config-btn-accion config-btn-eliminar"
                      onClick={() => handleEliminar(doc.id)}
                      title="Eliminar"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderPeriodos = () => (
    <div className="config-content">
      <div className="config-header">
        <h3>
          <i className="ri-calendar-line"></i>
          Periodos Académicos
        </h3>
        <button className="config-btn-agregar" onClick={() => abrirModal()}>
          <i className="ri-add-line"></i>
          Agregar Periodo
        </button>
      </div>

      {periodos.length === 0 ? (
        <div className="config-empty">
          <i className="ri-calendar-line"></i>
          <p>No hay periodos académicos registrados</p>
        </div>
      ) : (
        <div className="config-table-container">
          <table className="config-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {periodos.map((per) => (
                <tr key={per.id}>
                  <td className="config-td-nombre">{per.nombre}</td>
                  <td className="config-td-fecha">{per.fecha_inicio}</td>
                  <td className="config-td-fecha">{per.fecha_fin}</td>
                  <td>
                    <span className={`config-badge ${per.activo ? "config-badge-activo" : "config-badge-inactivo"}`}>
                      {per.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="config-td-acciones">
                    <button
                      className="config-btn-accion config-btn-editar"
                      onClick={() => abrirModal(per)}
                      title="Editar"
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    {!per.activo && (
                      <button
                        className="config-btn-accion config-btn-activar"
                        onClick={() => handleActivarPeriodo(per.id)}
                        title="Activar"
                      >
                        <i className="ri-check-line"></i>
                      </button>
                    )}
                    <button
                      className="config-btn-accion config-btn-eliminar"
                      onClick={() => handleEliminar(per.id)}
                      title="Eliminar"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderFormulario = () => {
    switch (tabActiva) {
      case "especialidades":
        return (
          <>
            <div className="config-form-group">
              <label>Código *</label>
              <input
                type="text"
                value={formData.codigo || ""}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="Ej: ISC, IM, IE"
                required
              />
            </div>
            <div className="config-form-group">
              <label>Nombre *</label>
              <input
                type="text"
                value={formData.nombre || ""}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Ingeniería en Sistemas Computacionales"
                required
              />
            </div>
            <div className="config-form-group">
              <label>Orden</label>
              <input
                type="number"
                value={formData.orden || 0}
                onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
                min="0"
              />
            </div>
            <div className="config-form-group-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.activa || false}
                  onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                />
                <span>Activa</span>
              </label>
            </div>
          </>
        );

      case "modalidades":
        return (
          <>
            <div className="config-form-group">
              <label>Código *</label>
              <input
                type="text"
                value={formData.codigo || ""}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="Ej: RES, EST, DUAL"
                required
              />
            </div>
            <div className="config-form-group">
              <label>Nombre *</label>
              <input
                type="text"
                value={formData.nombre || ""}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Residencia Profesional"
                required
              />
            </div>
            <div className="config-form-group">
              <label>Descripción</label>
              <textarea
                value={formData.descripcion || ""}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción de la modalidad"
                rows={3}
              />
            </div>
            <div className="config-form-group">
              <label>Orden</label>
              <input
                type="number"
                value={formData.orden || 0}
                onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
                min="0"
              />
            </div>
            <div className="config-form-group-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.activa || false}
                  onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                />
                <span>Activa</span>
              </label>
            </div>
          </>
        );

      case "documentos":
        return (
          <>
            <div className="config-form-group">
              <label>Nombre *</label>
              <input
                type="text"
                value={formData.nombre || ""}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Carta de Presentación"
                required
              />
            </div>
            <div className="config-form-group">
              <label>Descripción</label>
              <textarea
                value={formData.descripcion || ""}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción del documento"
                rows={3}
              />
            </div>
            <div className="config-form-group">
              <label>Días de Plazo</label>
              <input
                type="number"
                value={formData.dias_plazo || 30}
                onChange={(e) => setFormData({ ...formData, dias_plazo: parseInt(e.target.value) })}
                min="1"
              />
              <small>Días desde el inicio del proyecto</small>
            </div>
            <div className="config-form-group">
              <label>Orden</label>
              <input
                type="number"
                value={formData.orden || 0}
                onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
                min="0"
              />
            </div>
            <div className="config-form-group-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.requerido || false}
                  onChange={(e) => setFormData({ ...formData, requerido: e.target.checked })}
                />
                <span>Requerido</span>
              </label>
            </div>
            <div className="config-form-group-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.activo || false}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                />
                <span>Activo</span>
              </label>
            </div>
          </>
        );

      case "periodos":
        return (
          <>
            <div className="config-form-group">
              <label>Nombre *</label>
              <input
                type="text"
                value={formData.nombre || ""}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Agosto-Diciembre 2025"
                required
              />
            </div>
            <div className="config-form-group">
              <label>Fecha Inicio *</label>
              <input
                type="date"
                value={formData.fecha_inicio || ""}
                onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                required
              />
            </div>
            <div className="config-form-group">
              <label>Fecha Fin *</label>
              <input
                type="date"
                value={formData.fecha_fin || ""}
                onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                required
              />
            </div>
            <div className="config-form-group-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.activo || false}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                />
                <span>Activo (desactivará los demás periodos)</span>
              </label>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="config-sistema-container">
      <CustomAlert
        show={alert.show}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={closeAlert}
      />

      <div className="config-sistema-header">
        <h2>
          <i className="ri-settings-3-line"></i>
          Configuración del Sistema
        </h2>
        <p className="config-sistema-subtitle">
          Administra las opciones dinámicas del sistema
        </p>
      </div>

      <div className="config-tabs">
        <button
          className={`config-tab ${tabActiva === "especialidades" ? "config-tab-active" : ""}`}
          onClick={() => setTabActiva("especialidades")}
        >
          <i className="ri-bookmark-line"></i>
          Especialidades
        </button>
        <button
          className={`config-tab ${tabActiva === "modalidades" ? "config-tab-active" : ""}`}
          onClick={() => setTabActiva("modalidades")}
        >
          <i className="ri-file-list-line"></i>
          Modalidades
        </button>
        <button
          className={`config-tab ${tabActiva === "documentos" ? "config-tab-active" : ""}`}
          onClick={() => setTabActiva("documentos")}
        >
          <i className="ri-file-text-line"></i>
          Documentos
        </button>
        <button
          className={`config-tab ${tabActiva === "periodos" ? "config-tab-active" : ""}`}
          onClick={() => setTabActiva("periodos")}
        >
          <i className="ri-calendar-line"></i>
          Periodos
        </button>
      </div>

      <div className="config-tab-content">{renderTabContent()}</div>

      {/* Modal */}
      {modalAbierto && (
        <div className="config-modal-overlay" onClick={cerrarModal}>
          <div className="config-modal" onClick={(e) => e.stopPropagation()}>
            <div className="config-modal-header">
              <h3>
                <i className="ri-edit-box-line"></i>
                {itemEditando ? "Editar" : "Agregar"}{" "}
                {tabActiva === "especialidades" && "Especialidad"}
                {tabActiva === "modalidades" && "Modalidad"}
                {tabActiva === "documentos" && "Tipo de Documento"}
                {tabActiva === "periodos" && "Periodo Académico"}
              </h3>
              <button className="config-modal-close" onClick={cerrarModal}>
                <i className="ri-close-line"></i>
              </button>
            </div>

            <form className="config-modal-body" onSubmit={handleSubmit}>
              {renderFormulario()}

              <div className="config-modal-footer">
                <button type="submit" className="config-btn-guardar">
                  <i className="ri-save-line"></i>
                  Guardar
                </button>
                <button type="button" className="config-btn-cancelar" onClick={cerrarModal}>
                  <i className="ri-close-circle-line"></i>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfiguracionSistemaJefe;