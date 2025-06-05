import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ExpedienteJefe.css";
import ExpedienteDetallesModal from "../components/ExpedienteDetallesModal";

const ExpedienteJefe = () => {
  const [expedientes, setExpedientes] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [alumnoIdSeleccionado, setAlumnoIdSeleccionado] = useState(null);

  useEffect(() => {
    const fetchExpedientes = async () => {
      const token = localStorage.getItem("access_token");
      const res = await axios.get("/api/expediente/expedientes_alumnos/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpedientes(res.data);
    };
    fetchExpedientes();
  }, []);

  const abrirModal = (alumnoId) => {
    setAlumnoIdSeleccionado(alumnoId);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setAlumnoIdSeleccionado(null);
  };

  return (
    <div className="expediente-jefe-container">
      <h2>Expedientes de Alumnos</h2>
      <table className="expediente-jefe-table">
        <thead>
          <tr>
            <th>Matrícula</th>
            <th>Nombre</th>
            <th>Proyecto</th>
            <th>Documentos Subidos</th>
            <th>Última Modificación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {expedientes.map((exp, idx) => (
            <tr key={exp.alumno_id}>
              <td>{exp.matricula}</td>
              <td>{exp.nombre}</td>
              <td>{exp.proyecto}</td>
              <td>{exp.documentos_subidos} / {exp.total_documentos}</td>
              <td>{exp.ultima_modificacion || "-"}</td>
              <td>
                <button
                  className="btn-accion btn-eye"
                  title="Ver detalles"
                  onClick={() => abrirModal(exp.alumno_id)}
                >
                  <i className="ri-eye-line"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {modalAbierto && (
        <ExpedienteDetallesModal
          alumnoId={alumnoIdSeleccionado}
          onClose={cerrarModal}
        />
      )}
    </div>
  );
};

export default ExpedienteJefe;