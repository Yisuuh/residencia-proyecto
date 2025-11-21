import React, { useEffect, useState } from "react";
import axios from "axios";
import "./GestionProyectosJefe.css";
import ProyectoDetallesModalJefe from "../components/ProyectoDetallesModalJefe";


const GestionProyectosJefe = () => {
  const [proyectos, setProyectos] = useState([]);
  const [proyectosFiltrados, setProyectosFiltrados] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [filtros, setFiltros] = useState({
    busqueda: "",
    estado: "todos",
    modalidad: "todos",
    especialidad: "todos"
  });

  // Cargar proyectos
  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get("/api/banco_proyectos/formulario_proyecto/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("✅ Proyectos cargados:", res.data.length);
        setProyectos(res.data);
        setProyectosFiltrados(res.data);
      } catch (error) {
        console.error("❌ Error al cargar proyectos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProyectos();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let resultado = [...proyectos];

    // Filtro de búsqueda
    if (filtros.busqueda.trim()) {
      const termino = filtros.busqueda.toLowerCase().trim();
      resultado = resultado.filter(proy => {
        const nombreMatch = proy.nombre_proyecto?.toLowerCase().includes(termino);
        const empresaMatch = proy.nombre_empresa?.toLowerCase().includes(termino);
        const institucionMatch = proy.nombre_institucion?.toLowerCase().includes(termino);
        const correoMatch = proy.correo?.toLowerCase().includes(termino);
        
        return nombreMatch || empresaMatch || institucionMatch || correoMatch;
      });
    }

    // Filtro por estado
    if (filtros.estado !== "todos") {
      resultado = resultado.filter(proy => {
        if (filtros.estado === "activos") return proy.estado === "activo";
        if (filtros.estado === "terminados") return proy.estado === "terminado";
        return true;
      });
    }

    // Filtro por modalidad
    if (filtros.modalidad !== "todos") {
      resultado = resultado.filter(proy => proy.modalidad === filtros.modalidad);
    }

    // Filtro por especialidad
    if (filtros.especialidad !== "todos") {
      resultado = resultado.filter(proy => proy.especialidad === filtros.especialidad);
    }

    setProyectosFiltrados(resultado);
  }, [proyectos, filtros]);

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      estado: "todos",
      modalidad: "todos",
      especialidad: "todos"
    });
  };

  // Estadísticas
  const stats = {
    total: proyectos.length,
    activos: proyectos.filter(p => p.estado === "activo").length,
    terminados: proyectos.filter(p => p.estado === "terminado").length,
    conAlumnos: proyectos.filter(p => p.total_aplicaciones > 0).length
  };

  const abrirModal = (proyecto) => {
    setProyectoSeleccionado(proyecto);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProyectoSeleccionado(null);
  };

  if (loading) {
    return (
      <div className="gestion-proyectos-jefe-loading">
        <i className="ri-loader-4-line"></i>
        <p>Cargando proyectos...</p>
      </div>
    );
  }

  return (
    <div className="gestion-proyectos-jefe-container">
      <h2 className="gestion-proyectos-jefe-title">
        <i className="ri-briefcase-4-line"></i> Gestión de Proyectos
      </h2>

      {/* Estadísticas */}
      <div className="proyectos-stats">
        <div className="stat-card-proyecto">
          <div className="stat-number-proyecto">{stats.total}</div>
          <div className="stat-label-proyecto">Total Proyectos</div>
        </div>
        <div className="stat-card-proyecto stat-activos">
          <div className="stat-number-proyecto">{stats.activos}</div>
          <div className="stat-label-proyecto">Activos</div>
        </div>
        <div className="stat-card-proyecto stat-terminados">
          <div className="stat-number-proyecto">{stats.terminados}</div>
          <div className="stat-label-proyecto">Terminados</div>
        </div>
        <div className="stat-card-proyecto stat-con-alumnos">
          <div className="stat-number-proyecto">{stats.conAlumnos}</div>
          <div className="stat-label-proyecto">Con Alumnos</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="proyectos-filtros">
        <div className="filtro-busqueda-proyecto">
          <i className="ri-search-line"></i>
          <input
            type="text"
            className="input-busqueda-proyecto"
            placeholder="Buscar por nombre, empresa o correo..."
            value={filtros.busqueda}
            onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
          />
        </div>

        <div className="filtro-select-proyecto">
          <select
            className="select-proyecto"
            value={filtros.estado}
            onChange={(e) => handleFiltroChange('estado', e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Activos</option>
            <option value="terminados">Terminados</option>
          </select>
        </div>

        <div className="filtro-select-proyecto">
          <select
            className="select-proyecto"
            value={filtros.modalidad}
            onChange={(e) => handleFiltroChange('modalidad', e.target.value)}
          >
            <option value="todos">Todas las modalidades</option>
            <option value="presencial">Presencial</option>
            <option value="remoto">Remoto</option>
            <option value="hibrido">Híbrido</option>
          </select>
        </div>

        <div className="filtro-select-proyecto">
          <select
            className="select-proyecto"
            value={filtros.especialidad}
            onChange={(e) => handleFiltroChange('especialidad', e.target.value)}
          >
            <option value="todos">Todas las especialidades</option>
            <option value="sistemas">Sistemas Computacionales</option>
            <option value="gestion">Gestión Empresarial</option>
            <option value="industrial">Industrial</option>
            <option value="mecatronica">Mecatrónica</option>
            <option value="contador">Contador Público</option>
          </select>
        </div>

        <button
          className="btn-limpiar-proyecto"
          onClick={limpiarFiltros}
          title="Limpiar filtros"
        >
          <i className="ri-filter-off-line"></i>
        </button>
      </div>

      {/* Tabla */}
      {proyectosFiltrados.length > 0 ? (
        <div className="tabla-proyectos-wrapper">
          <table className="tabla-proyectos-jefe">
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Empresa/Institución</th>
                <th>Contacto</th>
                <th>Modalidad</th>
                <th>Especialidad</th>
                <th>Estudiantes</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proyectosFiltrados.map((proyecto) => (
                <tr key={proyecto.id}>
                  <td className="proyecto-nombre-cell">
                    <strong>{proyecto.nombre_proyecto}</strong>
                  </td>
                  <td>
                    {proyecto.nombre_empresa || proyecto.nombre_institucion || "N/A"}
                  </td>
                  <td className="proyecto-contacto-cell">
                    <div className="contacto-info">
                      <i className="ri-mail-line"></i>
                      <span>{proyecto.correo}</span>
                    </div>
                  </td>
                  <td>
                    <span className="tag-modalidad-tabla">
                      {proyecto.modalidad_display || proyecto.modalidad}
                    </span>
                  </td>
                  <td>
                    <span className="tag-especialidad-tabla">
                      {proyecto.especialidad_display || proyecto.especialidad}
                    </span>
                  </td>
                  <td className="proyecto-estudiantes-cell">
                    <span className="estudiantes-badge">
                      <i className="ri-group-line"></i>
                      {proyecto.total_aplicaciones || 0} / {proyecto.numero_estudiantes}
                    </span>
                  </td>
                  <td>
                    <span className={`estado-badge estado-${proyecto.estado || 'activo'}`}>
                      {proyecto.estado === "terminado" ? "Terminado" : "Activo"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-ver-proyecto"
                      title="Ver detalles"
                      onClick={() => abrirModal(proyecto)}
                    >
                      <i className="ri-eye-line"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="proyectos-empty-container">
          <div className="empty-state-proyecto">
            <i className="ri-folder-open-line"></i>
            <h3>No se encontraron proyectos</h3>
            <p>
              {filtros.busqueda || filtros.estado !== "todos" || filtros.modalidad !== "todos" || filtros.especialidad !== "todos"
                ? "No hay proyectos que coincidan con los filtros aplicados."
                : "Aún no hay proyectos registrados."
              }
            </p>
            {(filtros.busqueda || filtros.estado !== "todos" || filtros.modalidad !== "todos" || filtros.especialidad !== "todos") && (
              <button 
                className="btn-limpiar-empty-proyecto"
                onClick={limpiarFiltros}
              >
                <i className="ri-filter-off-line"></i>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {modalAbierto && proyectoSeleccionado && (
        <ProyectoDetallesModalJefe
          proyecto={proyectoSeleccionado}
          onClose={cerrarModal}
        />
      )}
    </div>
  );
};

export default GestionProyectosJefe;