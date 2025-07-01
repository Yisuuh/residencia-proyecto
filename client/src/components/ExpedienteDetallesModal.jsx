import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ExpedienteDetallesModal.css";

const ExpedienteDetallesModal = ({ alumnoId, onClose }) => {
  const [documentos, setDocumentos] = useState([]);
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
      } catch (error) {
        setDocumentos([]);
      } finally {
        setLoading(false);
      }
    };
    if (alumnoId) fetchDocumentos();
  }, [alumnoId]);

  const actualizarDocumento = async (docId, data) => {
    const token = localStorage.getItem("access_token");
    await axios.patch(`/api/expediente/documentos/${docId}/`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Refresca la lista
    const res = await axios.get(`/api/expediente/documentos/?alumno_id=${alumnoId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setDocumentos(res.data);
  };

  const handleAprobar = (docId) => actualizarDocumento(docId, { estado: "aprobado" });
  const handleRechazar = (docId) => actualizarDocumento(docId, { estado: "rechazado" });

  const abrirModalObs = (docId, textoActual) => setModalObs({ open: true, docId, texto: textoActual || "" });
  const cerrarModalObs = () => setModalObs({ open: false, docId: null, texto: "" });

  const guardarObservacion = async () => {
    await actualizarDocumento(modalObs.docId, { observaciones: modalObs.texto });
    cerrarModalObs();
  };

  if (!alumnoId) return null;
  if (loading) return (
    <div className="modal-detalles-overlay">
      <div className="modal-detalles-content">
        Cargando...
      </div>
    </div>
  );

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
        <h3>Expediente del Alumno</h3>
        <table className="expediente-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Fecha programada</th>
              <th>Fecha de envío</th>
              <th>Acciones</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {documentos.map((doc, idx) => (
              <tr key={doc.id}>
                <td>{idx + 1}</td>
                <td>{doc.documento_predefinido_nombre || doc.documento_predefinido?.nombre}</td>
                <td>
                  <button
                    className="btn-accion check"
                    title="Aprobar"
                    onClick={() => handleAprobar(doc.id)}
                  >
                    ✔
                  </button>
                  <button
                    className="btn-accion tacha"
                    title="Rechazar"
                    onClick={() => handleRechazar(doc.id)}
                  >
                    ✖
                  </button>
                  <div style={{ fontWeight: 500, marginTop: 4 }}>{doc.estado}</div>
                </td>
                <td>{doc.fecha_programada}</td>
                <td>{doc.fecha_envio || "-"}</td>
                <td>
                  {doc.archivo && (
                    <a href={doc.archivo} target="_blank" rel="noopener noreferrer">
                      <i className="ri-eye-line"></i>
                    </a>
                  )}
                </td>
                <td>
                  <button
                    className="btn-accion lapiz"
                    title="Editar observación"
                    onClick={() => abrirModalObs(doc.id, doc.observaciones)}
                  >
                    ✎
                  </button>
                  <span style={{ marginLeft: 6 }}>{doc.observaciones || "-"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de observaciones */}
      {modalObs.open && (
        <div className="modal-obs">
          <h4>Editar observación</h4>
          <textarea
            value={modalObs.texto}
            onChange={e => setModalObs({ ...modalObs, texto: e.target.value })}
            rows={4}
            style={{ width: "100%" }}
          />
          <div style={{ marginTop: 10 }}>
            <button onClick={guardarObservacion} style={{ marginRight: 8 }}>Guardar</button>
            <button onClick={cerrarModalObs}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpedienteDetallesModal;