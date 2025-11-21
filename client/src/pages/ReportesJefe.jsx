import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import CustomAlert from "../components/CustomAlert";
import "./ReportesJefe.css";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ReportesJefe = () => {
  const [tabActiva, setTabActiva] = useState("estadisticas");
  const [loading, setLoading] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  // Estados para datos
  const [estadisticas, setEstadisticas] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [proyectos, setProyectos] = useState([]);

  // Estados para filtros
  const [filtrosAlumnos, setFiltrosAlumnos] = useState({
    especialidad: "",
    con_proyecto: "",
    sexo: "",
    search: "",
  });

  const [filtrosProyectos, setFiltrosProyectos] = useState({
    estado: "",
    modalidad: "",
    especialidad: "",
    search: "",
  });

  // Alert
  const [alert, setAlert] = useState({
    isOpen: false,
    type: "",
    title: "",
    message: "",
  });

  const showAlert = (type, title, message) => {
    setAlert({ isOpen: true, type, title, message });
  };

  const closeAlert = () => {
    setAlert({ isOpen: false, type: "", title: "", message: "" });
  };

  // ============================================
  // CARGAR DATOS
  // ============================================

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get("/api/banco_proyectos/reportes/estadisticas/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEstadisticas(res.data);
      console.log("✅ Estadísticas cargadas:", res.data);
    } catch (error) {
      console.error("❌ Error al cargar estadísticas:", error);
      showAlert("error", "Error", "No se pudieron cargar las estadísticas.");
    } finally {
      setLoading(false);
    }
  };

  const cargarAlumnos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const params = new URLSearchParams(filtrosAlumnos);
      const res = await axios.get(
        `/api/banco_proyectos/reportes/alumnos/?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAlumnos(res.data.alumnos);
      console.log("✅ Alumnos cargados:", res.data.total);
    } catch (error) {
      console.error("❌ Error al cargar alumnos:", error);
      showAlert("error", "Error", "No se pudieron cargar los alumnos.");
    } finally {
      setLoading(false);
    }
  };

  const cargarProyectos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const params = new URLSearchParams(filtrosProyectos);
      const res = await axios.get(
        `/api/banco_proyectos/reportes/proyectos/?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProyectos(res.data.proyectos);
      console.log("✅ Proyectos cargados:", res.data.total);
    } catch (error) {
      console.error("❌ Error al cargar proyectos:", error);
      showAlert("error", "Error", "No se pudieron cargar los proyectos.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al cambiar de tab
  useEffect(() => {
    if (tabActiva === "estadisticas") {
      cargarEstadisticas();
    } else if (tabActiva === "alumnos") {
      cargarAlumnos();
    } else if (tabActiva === "proyectos") {
      cargarProyectos();
    }
  }, [tabActiva]);

  // Recargar al cambiar filtros
  useEffect(() => {
    if (tabActiva === "alumnos") {
      cargarAlumnos();
    }
  }, [filtrosAlumnos]);

  useEffect(() => {
    if (tabActiva === "proyectos") {
      cargarProyectos();
    }
  }, [filtrosProyectos]);

  // ============================================
  // GENERAR PDF
  // ============================================

  const generarPDFAlumnos = () => {
    setGenerandoPDF(true);
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(18);
      doc.text("Reporte de Alumnos", 14, 20);
      
      doc.setFontSize(11);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 28);
      doc.text(`Total: ${alumnos.length} alumnos`, 14, 34);

      // Tabla
      const headers = [["Matrícula", "Nombre", "Especialidad", "Proyecto"]];
      const data = alumnos.map((a) => [
        a.matricula,
        a.nombre,
        a.especialidad,
        a.tiene_proyecto ? a.proyecto.nombre : "Sin proyecto",
      ]);

      autoTable(doc, {
        startY: 40,
        head: headers,
        body: data,
        theme: "grid",
        headStyles: { fillColor: [126, 18, 42] },
        styles: { fontSize: 9 },
      });

      doc.save(`Reporte_Alumnos_${new Date().toISOString().split("T")[0]}.pdf`);
      showAlert("success", "¡PDF Generado!", "El reporte se descargó exitosamente.");
    } catch (error) {
      console.error("❌ Error al generar PDF:", error);
      showAlert("error", "Error", "No se pudo generar el PDF.");
    } finally {
      setGenerandoPDF(false);
    }
  };

  const generarPDFProyectos = () => {
    setGenerandoPDF(true);
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text("Reporte de Proyectos", 14, 20);
      
      doc.setFontSize(11);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 28);
      doc.text(`Total: ${proyectos.length} proyectos`, 14, 34);

      const headers = [["Proyecto", "Empresa", "Modalidad", "Estado", "Ocupación"]];
      const data = proyectos.map((p) => [
        p.nombre,
        p.empresa,
        p.modalidad,
        p.estado_display,
        `${p.ocupados}/${p.cupo}`,
      ]);

      autoTable(doc, {
        startY: 40,
        head: headers,
        body: data,
        theme: "grid",
        headStyles: { fillColor: [126, 18, 42] },
        styles: { fontSize: 9 },
      });


      doc.save(`Reporte_Proyectos_${new Date().toISOString().split("T")[0]}.pdf`);
      showAlert("success", "¡PDF Generado!", "El reporte se descargó exitosamente.");
    } catch (error) {
      console.error("❌ Error al generar PDF:", error);
      showAlert("error", "Error", "No se pudo generar el PDF.");
    } finally {
      setGenerandoPDF(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      <CustomAlert
        isOpen={alert.isOpen}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={closeAlert}
      />

      <div className="reportes-container">
        <div className="reportes-header">
          <h1>
            <i className="ri-file-chart-line"></i>
            Reportes y Estadísticas
          </h1>
          <p>Genera reportes detallados en PDF y visualiza estadísticas</p>
        </div>

        {/* TABS */}
        <div className="reportes-tabs">
          <button
            className={`tab-btn ${tabActiva === "estadisticas" ? "active" : ""}`}
            onClick={() => setTabActiva("estadisticas")}
          >
            <i className="ri-dashboard-line"></i>
            Dashboard
          </button>
          <button
            className={`tab-btn ${tabActiva === "alumnos" ? "active" : ""}`}
            onClick={() => setTabActiva("alumnos")}
          >
            <i className="ri-user-line"></i>
            Alumnos
          </button>
          <button
            className={`tab-btn ${tabActiva === "proyectos" ? "active" : ""}`}
            onClick={() => setTabActiva("proyectos")}
          >
            <i className="ri-briefcase-line"></i>
            Proyectos
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="reportes-content">
          {loading ? (
            <div className="reportes-loading">
              <i className="ri-loader-4-line"></i>
              <p>Cargando datos...</p>
            </div>
          ) : (
            <>
              {/* ESTADÍSTICAS */}
              {tabActiva === "estadisticas" && estadisticas && (
                <div className="estadisticas-grid">
                  {/* Cards de resumen */}
                  <div className="stats-cards">
                    <div className="stat-card">
                      <div className="stat-icon alumnos">
                        <i className="ri-user-line"></i>
                      </div>
                      <div className="stat-info">
                        <h3>{estadisticas.alumnos.total}</h3>
                        <p>Total Alumnos</p>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon proyectos">
                        <i className="ri-briefcase-line"></i>
                      </div>
                      <div className="stat-info">
                        <h3>{estadisticas.proyectos.total}</h3>
                        <p>Total Proyectos</p>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon success">
                        <i className="ri-check-line"></i>
                      </div>
                      <div className="stat-info">
                        <h3>{estadisticas.alumnos.con_proyecto}</h3>
                        <p>Con Proyecto</p>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon warning">
                        <i className="ri-close-line"></i>
                      </div>
                      <div className="stat-info">
                        <h3>{estadisticas.alumnos.sin_proyecto}</h3>
                        <p>Sin Proyecto</p>
                      </div>
                    </div>
                  </div>

                  {/* Gráficas */}
                  <div className="charts-grid">
                    <div className="chart-card">
                      <h3>Alumnos por Especialidad</h3>
                      <Bar
                        data={{
                          labels: estadisticas.alumnos.por_especialidad.map(
                            (e) => e.especialidad
                          ),
                          datasets: [
                            {
                              label: "Alumnos",
                              data: estadisticas.alumnos.por_especialidad.map(
                                (e) => e.total
                              ),
                              backgroundColor: "#7E122A",
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    </div>

                    <div className="chart-card">
                      <h3>Distribución por Sexo</h3>
                      <Pie
                        data={{
                          labels: estadisticas.alumnos.por_sexo.map(
                            (g) => g.sexo
                          ),
                          datasets: [
                            {
                              data: estadisticas.alumnos.por_sexo.map(
                                (g) => g.total
                              ),
                              backgroundColor: ["#7E122A", "#dc3545", "#6c757d"],
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ALUMNOS */}
              {tabActiva === "alumnos" && (
                <>
                  {/* Filtros */}
                  <div className="filtros-section">
                    <div className="filtros-grid">
                      <select
                        value={filtrosAlumnos.con_proyecto}
                        onChange={(e) =>
                          setFiltrosAlumnos({
                            ...filtrosAlumnos,
                            con_proyecto: e.target.value,
                          })
                        }
                      >
                        <option value="">Todos</option>
                        <option value="si">Con Proyecto</option>
                        <option value="no">Sin Proyecto</option>
                      </select>

                      <select
                        value={filtrosAlumnos.sexo}  // ✅ Cambiado
                        onChange={(e) =>
                          setFiltrosAlumnos({
                            ...filtrosAlumnos,
                            sexo: e.target.value,  // ✅ Cambiado
                          })
                        }
                      >
                        <option value="">Todos los Sexos</option>
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Buscar por nombre o matrícula..."
                        value={filtrosAlumnos.search}
                        onChange={(e) =>
                          setFiltrosAlumnos({
                            ...filtrosAlumnos,
                            search: e.target.value,
                          })
                        }
                      />
                    </div>

                    <button
                      className="btn-generar-pdf"
                      onClick={generarPDFAlumnos}
                      disabled={generandoPDF || alumnos.length === 0}
                    >
                      <i className="ri-file-pdf-line"></i>
                      Generar PDF
                    </button>
                  </div>

                  {/* Tabla */}
                  <div className="tabla-reporte">
                    <table>
                      <thead>
                        <tr>
                          <th>Matrícula</th>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Especialidad</th>
                          <th>Sexo</th>
                          <th>Proyecto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alumnos.length > 0 ? (
                          alumnos.map((alumno) => (
                            <tr key={alumno.id}>
                              <td>{alumno.matricula}</td>
                              <td>{alumno.nombre}</td>
                              <td>{alumno.email}</td>
                              <td>{alumno.especialidad}</td>
                              <td>{alumno.sexo}</td>
                              <td>
                                {alumno.tiene_proyecto ? (
                                  <span className="badge-success">
                                    {alumno.proyecto.nombre}
                                  </span>
                                ) : (
                                  <span className="badge-warning">Sin proyecto</span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="no-data">
                              No hay alumnos para mostrar
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* PROYECTOS */}
              {tabActiva === "proyectos" && (
                <>
                  {/* Filtros */}
                  <div className="filtros-section">
                    <div className="filtros-grid">
                      <select
                        value={filtrosProyectos.estado}
                        onChange={(e) =>
                          setFiltrosProyectos({
                            ...filtrosProyectos,
                            estado: e.target.value,
                          })
                        }
                      >
                        <option value="">Todos los Estados</option>
                        <option value="activo">Activos</option>
                        <option value="terminado">Terminados</option>
                      </select>

                      <select
                        value={filtrosProyectos.modalidad}
                        onChange={(e) =>
                          setFiltrosProyectos({
                            ...filtrosProyectos,
                            modalidad: e.target.value,
                          })
                        }
                      >
                        <option value="">Todas las Modalidades</option>
                        <option value="presencial">Presencial</option>
                        <option value="remoto">Remoto</option>
                        <option value="hibrido">Híbrido</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Buscar por proyecto o empresa..."
                        value={filtrosProyectos.search}
                        onChange={(e) =>
                          setFiltrosProyectos({
                            ...filtrosProyectos,
                            search: e.target.value,
                          })
                        }
                      />
                    </div>

                    <button
                      className="btn-generar-pdf"
                      onClick={generarPDFProyectos}
                      disabled={generandoPDF || proyectos.length === 0}
                    >
                      <i className="ri-file-pdf-line"></i>
                      Generar PDF
                    </button>
                  </div>

                  {/* Tabla */}
                  <div className="tabla-reporte">
                    <table>
                      <thead>
                        <tr>
                          <th>Proyecto</th>
                          <th>Empresa</th>
                          <th>Modalidad</th>
                          <th>Especialidad</th>
                          <th>Estado</th>
                          <th>Ocupación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {proyectos.length > 0 ? (
                          proyectos.map((proyecto) => (
                            <tr key={proyecto.id}>
                              <td>{proyecto.nombre}</td>
                              <td>{proyecto.empresa}</td>
                              <td>{proyecto.modalidad}</td>
                              <td>{proyecto.especialidad}</td>
                              <td>
                                <span
                                  className={`badge-${
                                    proyecto.estado === "terminado"
                                      ? "secondary"
                                      : "success"
                                  }`}
                                >
                                  {proyecto.estado_display}
                                </span>
                              </td>
                              <td>
                                {proyecto.ocupados}/{proyecto.cupo}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="no-data">
                              No hay proyectos para mostrar
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ReportesJefe;