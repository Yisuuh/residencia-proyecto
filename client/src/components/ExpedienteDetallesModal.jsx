import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ExpedienteDetallesModal.css";

const ExpedienteDetallesModal = ({ alumnoId, onClose }) => {
  const [documentos, setDocumentos] = useState([]);
  const [alumnoInfo, setAlumnoInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalObs, setModalObs] = useState({ open: false, docId: null, texto: "" });

  useEffect(() => {
    const fetchDocumentos = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(`/api/expediente/documentos/?alumno_id=${alumnoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDocumentos(res.data);
        
        // Obtener info del alumno
        if (res.data.length > 0) {
          setAlumnoInfo({
            nombre: res.data[0].alumno_nombre || "Alumno",
            matricula: res.data[0].alumno_matricula || "N/A"
          });
        }
      } catch (error) {
        console.error("Error al cargar documentos:", error);
        setDocumentos([]);
      } finally {
        setLoading(false);
      }
    };
    if (alumnoId) fetchDocumentos();
  }, [alumnoId]);

  const actualizarDocumento = async (docId, data) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.patch(`/api/expediente/documentos/${docId}/`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresca la lista
      const res = await axios.get(`/api/expediente/documentos/?alumno_id=${alumnoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocumentos(res.data);
    } catch (error) {
      console.error("Error al actualizar documento:", error);
    }
  };

  const handleAprobar = (docId) => actualizarDocumento(docId, { estado: "aprobado" });
  const handleRechazar = (docId) => actualizarDocumento(docId, { estado: "rechazado" });

  const abrirModalObs = (docId, textoActual) => {
    setModalObs({ open: true, docId, texto: textoActual || "" });
  };

  const cerrarModalObs = () => {
    setModalObs({ open: false, docId: null, texto: "" });
  };

  const guardarObservacion = async () => {
    await actualizarDocumento(modalObs.docId, { observaciones: modalObs.texto });
    cerrarModalObs();
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      pendiente: { text: "Pendiente", class: "estado-pendiente" },
      aprobado: { text: "Aprobado", class: "estado-aprobado" },
      rechazado: { text: "Rechazado", class: "estado-rechazado" },
      enviado: { text: "Enviado", class: "estado-enviado" }
    };
    return estados[estado] || { text: estado, class: "" };
  };

  if (!alumnoId) return null;

  return (
    <>
      <div className="expediente-modal-overlay" onClick={onClose}>
        <div className="expediente-modal-container" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="expediente-modal-header">
            <div className="expediente-modal-header-content">
              <i className="ri-folder-user-line expediente-modal-icon"></i>
              <div className="expediente-modal-header-text">
                <h2>Expediente del Alumno</h2>
              </div>
            </div>
            <button
              className="expediente-modal-close-btn"
              onClick={onClose}
              title="Cerrar"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>

          {/* Body */}
          <div className="expediente-modal-body">
            {loading ? (
              <div className="expediente-modal-loading">
                <i className="ri-loader-4-line"></i>
                <p>Cargando documentos...</p>
              </div>
            ) : documentos.length === 0 ? (
              <div className="expediente-modal-empty">
                <i className="ri-file-list-3-line"></i>
                <p>No hay documentos registrados</p>
              </div>
            ) : (
              <div className="expediente-modal-table-container">
                <table className="expediente-modal-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Documento</th>
                      <th>Estado</th>
                      <th>Fecha Programada</th>
                      <th>Fecha Envío</th>
                      <th>Archivo</th>
                      <th>Acciones</th>
                      <th>Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentos.map((doc, idx) => {
                      const estadoInfo = getEstadoBadge(doc.estado);
                      return (
                        <tr key={doc.id}>
                          <td className="expediente-modal-td-numero">{idx + 1}</td>
                          <td className="expediente-modal-td-documento">
                            {doc.documento_predefinido_nombre || doc.documento_predefinido?.nombre || "Sin nombre"}
                          </td>
                          <td>
                            <span className={`expediente-modal-badge ${estadoInfo.class}`}>
                              {estadoInfo.text}
                            </span>
                          </td>
                          <td className="expediente-modal-td-fecha">
                            {doc.fecha_programada || "-"}
                          </td>
                          <td className="expediente-modal-td-fecha">
                            {doc.fecha_envio || "-"}
                          </td>
                          <td className="expediente-modal-td-archivo">
                            {doc.archivo ? (
                              <a
                                href={doc.archivo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="expediente-modal-btn-ver"
                                title="Ver documento"
                              >
                                <i className="ri-eye-line"></i>
                              </a>
                            ) : (
                              <span className="expediente-modal-no-archivo">Sin archivo</span>
                            )}
                          </td>
                          <td className="expediente-modal-td-acciones">
                            <button
                              className="expediente-modal-btn-accion expediente-modal-btn-aprobar"
                              onClick={() => handleAprobar(doc.id)}
                              title="Aprobar documento"
                            >
                              <i className="ri-check-line"></i>
                            </button>
                            <button
                              className="expediente-modal-btn-accion expediente-modal-btn-rechazar"
                              onClick={() => handleRechazar(doc.id)}
                              title="Rechazar documento"
                            >
                              <i className="ri-close-line"></i>
                            </button>
                          </td>
                          <td className="expediente-modal-td-observaciones">
                            <button
                              className="expediente-modal-btn-obs"
                              onClick={() => abrirModalObs(doc.id, doc.observaciones)}
                              title="Editar observación"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            {doc.observaciones && (
                              <span className="expediente-modal-obs-preview">
                                {doc.observaciones.length > 30
                                  ? `${doc.observaciones.substring(0, 30)}...`
                                  : doc.observaciones}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="expediente-modal-footer">
            <button
              className="expediente-modal-btn-cerrar"
              onClick={onClose}
            >
              <i className="ri-close-circle-line"></i>
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Observaciones */}
      {modalObs.open && (
        <div className="expediente-obs-overlay" onClick={cerrarModalObs}>
          <div className="expediente-obs-modal" onClick={(e) => e.stopPropagation()}>
            <div className="expediente-obs-header">
              <h3>
                <i className="ri-edit-box-line"></i>
                Editar Observación
              </h3>
              <button
                className="expediente-obs-close-btn"
                onClick={cerrarModalObs}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="expediente-obs-body">
              <textarea
                className="expediente-obs-textarea"
                value={modalObs.texto}
                onChange={(e) => setModalObs({ ...modalObs, texto: e.target.value })}
                placeholder="Escribe tus observaciones aquí..."
                rows={5}
              />
            </div>
            <div className="expediente-obs-footer">
              <button
                className="expediente-obs-btn-guardar"
                onClick={guardarObservacion}
              >
                <i className="ri-save-line"></i>
                Guardar
              </button>
              <button
                className="expediente-obs-btn-cancelar"
                onClick={cerrarModalObs}
              >
                <i className="ri-close-circle-line"></i>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExpedienteDetallesModal;