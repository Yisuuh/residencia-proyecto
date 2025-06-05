import React, { useEffect, useState } from "react";
import axios from "axios";

const ExpedienteDetallesModal = ({ alumnoId, onClose }) => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (!alumnoId) return null;
  if (loading) return <div className="modal">Cargando...</div>;

  return (
    <div className="modal">
      <button onClick={onClose}>Cerrar</button>
      <h3>Expediente del Alumno</h3>
      <table>
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
              <td>{doc.documento_predefinido_nombre}</td>
              <td>{doc.estado}</td>
              <td>{doc.fecha_programada}</td>
              <td>{doc.fecha_envio || "-"}</td>
              <td>
                {doc.archivo && (
                  <a href={doc.archivo} target="_blank" rel="noopener noreferrer">
                    <i className="ri-eye-line"></i>
                  </a>
                )}
              </td>
              <td>{doc.observaciones || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpedienteDetallesModal;