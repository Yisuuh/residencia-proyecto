import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ExpedienteJefe.css";
import ExpedienteDetallesModal from "../components/ExpedienteDetallesModal";

const ExpedienteJefe = () => {
  const [expedientes, setExpedientes] = useState([]);
  const [expedientesFiltrados, setExpedientesFiltrados] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [alumnoIdSeleccionado, setAlumnoIdSeleccionado] = useState(null);
  
  const [filtros, setFiltros] = useState({
    busqueda: "",
    tipo: "todos"
  });

  useEffect(() => {
    const fetchExpedientes = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get("/api/expediente/expedientes_alumnos/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExpedientes(res.data);
        setExpedientesFiltrados(res.data);
      } catch (error) {
        console.error("Error al cargar expedientes:", error);
      }
    };
    fetchExpedientes();
  }, []);

  useEffect(() => {
    let resultado = [...expedientes];

    if (filtros.busqueda.trim()) {
      const termino = filtros.busqueda.toLowerCase().trim();
      resultado = resultado.filter(exp => {
        const matriculaMatch = exp.matricula?.toLowerCase().includes(termino);
        const nombreMatch = exp.nombre?.toLowerCase().includes(termino);
        const proyectoMatch = exp.proyecto?.toLowerCase().includes(termino);
        
        return matriculaMatch || nombreMatch || proyectoMatch;
      });
    }

    if (filtros.tipo !== "todos") {
      resultado = resultado.filter(exp => {
        const subidos = Number(exp.documentos_subidos) || 0;
        const total = Number(exp.total_documentos) || 1;
        const progreso = subidos / total;

        switch (filtros.tipo) {
          case "completos":
            return progreso >= 1;
          case "incompletos":
            return progreso > 0 && progreso < 1;
          case "vacios":
            return progreso === 0;
          default:
            return true;
        }
      });
    }

    setExpedientesFiltrados(resultado);
  }, [expedientes, filtros]);

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      tipo: "todos"
    });
  };

  const stats = {
    total: expedientes.length,
    completos: expedientes.filter(exp => exp.documentos_subidos === exp.total_documentos).length,
    incompletos: expedientes.filter(exp => exp.documentos_subidos > 0 && exp.documentos_subidos < exp.total_documentos).length,
    vacios: expedientes.filter(exp => exp.documentos_subidos === 0).length
  };

  const getProgressClass = (subidos, total) => {
    const progreso = subidos / total;
    if (progreso === 1) return "jefe-progress-complete";
    if (progreso > 0) return "jefe-progress-partial";
    return "jefe-progress-incomplete";
  };

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
      <h2 className="expediente-jefe-title">
        <i className="ri-folder-user-line"></i> Expedientes de Alumnos
      </h2>

      <div className="expediente-jefe-stats">
        <div className="expediente-jefe-stat-card">
          <div className="expediente-jefe-stat-number">{stats.total}</div>
          <div className="expediente-jefe-stat-label">Total Expedientes</div>
        </div>
        <div className="expediente-jefe-stat-card">
          <div className="expediente-jefe-stat-number">{stats.completos}</div>
          <div className="expediente-jefe-stat-label">Completos</div>
        </div>
        <div className="expediente-jefe-stat-card">
          <div className="expediente-jefe-stat-number">{stats.incompletos}</div>
          <div className="expediente-jefe-stat-label">En Progreso</div>
        </div>
        <div className="expediente-jefe-stat-card">
          <div className="expediente-jefe-stat-number">{stats.vacios}</div>
          <div className="expediente-jefe-stat-label">Sin Documentos</div>
        </div>
      </div>

      <div className="expediente-jefe-filtros">
        <div className="expediente-jefe-filtro-busqueda">
          <i className="ri-search-line"></i>
          <input
            type="text"
            className="expediente-jefe-input-busqueda"
            placeholder="Buscar por matrícula, nombre o proyecto..."
            value={filtros.busqueda}
            onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
          />
        </div>

        <div className="expediente-jefe-filtro-tipo">
          <select
            className="expediente-jefe-select-tipo"
            value={filtros.tipo}
            onChange={(e) => handleFiltroChange('tipo', e.target.value)}
          >
            <option value="todos">Todos los expedientes</option>
            <option value="completos">Completos</option>
            <option value="incompletos">En progreso</option>
            <option value="vacios">Sin documentos</option>
          </select>
        </div>

        <button
          className="expediente-jefe-btn-limpiar"
          onClick={limpiarFiltros}
          title="Limpiar filtros"
        >
          <i className="ri-filter-off-line"></i>
          Limpiar
        </button>
      </div>

      {expedientesFiltrados.length > 0 ? (
        <table className="expediente-jefe-table">
          <thead>
            <tr>
              <th>Matrícula</th>
              <th>Nombre</th>
              <th>Proyecto</th>
              <th>Progreso</th>
              <th>Última Modificación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {expedientesFiltrados.map((exp, index) => (
              <tr key={`${exp.alumno_id}-${index}`}>
                <td>{exp.matricula}</td>
                <td>{exp.nombre}</td>
                <td>{exp.proyecto || "Sin asignar"}</td>
                <td className={`expediente-jefe-progress-cell ${getProgressClass(exp.documentos_subidos, exp.total_documentos)}`}>
                  {exp.documentos_subidos} / {exp.total_documentos}
                </td>
                <td>{exp.ultima_modificacion || "Nunca"}</td>
                <td>
                  <button
                    className="expediente-jefe-btn-accion expediente-jefe-btn-eye"
                    title="Ver detalles del expediente"
                    onClick={() => abrirModal(exp.alumno_id)}
                  >
                    <i className="ri-eye-line"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="expediente-jefe-empty-container">
          <div className="expediente-jefe-empty-state">
            <i className="ri-file-search-line"></i>
            <h3>No se encontraron expedientes</h3>
            <p>
              {filtros.busqueda || filtros.tipo !== "todos" 
                ? `No hay expedientes que coincidan con los filtros aplicados.`
                : "Aún no hay expedientes registrados."
              }
            </p>
            {(filtros.busqueda || filtros.tipo !== "todos") && (
              <button 
                className="expediente-jefe-btn-limpiar-empty"
                onClick={limpiarFiltros}
              >
                <i className="ri-filter-off-line"></i>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}

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