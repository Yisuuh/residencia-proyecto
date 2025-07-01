import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import "./gestion_proyectos.css";
import "./BancoAlumno.css";
import GestionProyectosDetalles from "../components/GestionProyectosDetalles";

const BancoAlumno = ({ user, menuItems }) => {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetalles, setShowDetalles] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [aceptados, setAceptados] = useState(0);
  const [yaAplico, setYaAplico] = useState(false);

  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get("/api/banco_proyectos/formulario_proyecto/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProyectos(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setProyectos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProyectos();
  }, []);

  // Cuando abras el modal, consulta cuántos aceptados hay para ese proyecto
  useEffect(() => {
    const fetchAceptados = async () => {
      if (showDetalles && proyectoSeleccionado) {
        const token = localStorage.getItem("access_token");
        try {
          const res = await axios.get(`/api/empresa/proyecto/${proyectoSeleccionado.id}/aplicaciones/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const aceptadosCount = Array.isArray(res.data)
            ? res.data.filter(a => a.estado === "aceptado").length
            : 0;
          setAceptados(aceptadosCount);
        } catch {
          setAceptados(0);
        }
      }
    };
    fetchAceptados();
  }, [showDetalles, proyectoSeleccionado]);

  const getTagColor = (type, value) => {
    if (type === "especialidad") return "tag-especialidad";
    if (type === "modalidad") return value === "presencial" ? "tag-modalidad-presencial" : "tag-modalidad-otro";
    if (type === "apoyo") return value ? "tag-apoyo-si" : "tag-apoyo-no";
    return "tag-default";
  };

  const handleDetalles = (proy) => {
    setProyectoSeleccionado(proy);
    setShowDetalles(true);
  };

  const handleAplicar = async (proyectoId) => {
    const token = localStorage.getItem("access_token");
    try {
      await axios.post(
        "/api/aplicar/",
        { proyecto: proyectoId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setYaAplico(true);
      alert("¡Aplicación enviada!");
    } catch (error) {
      if (error.response && error.response.data.detail === "Ya aplicaste a este proyecto.") {
        setYaAplico(true);
        alert("Ya aplicaste a este proyecto.");
      } else {
        alert("Error al aplicar.");
      }
    }
  };

  return (
    <div className="banco-alumno-bg">
      <div className="banco-alumno-main">
        <div className="gestion-header">
          <h2>Banco de Proyectos</h2>
        </div>
        <div className="gestion-cards-container">
          {loading ? (
            <p>Cargando proyectos...</p>
          ) : proyectos.length === 0 ? (
            <p className="no-proyectos">No hay proyectos registrados.</p>
          ) : (
            proyectos.map((proy) => (
              <div className="gestion-card" key={proy.id}>
                {/* Fecha y logo */}
                <div className="card-header">
                  <span className="card-fecha">
                    {proy.fecha_subida ? new Date(proy.fecha_subida).toLocaleDateString() : "Sin fecha"}
                  </span>
                  {proy.imagen && (
                    <img
                      src={proy.imagen}
                      alt="Empresa"
                      className="empresa-img"
                    />
                  )}
                </div>
                {/* Empresa y estudiantes */}
                <div className="card-empresa-estudiantes">
                  <span><strong>{proy.nombre_empresa}</strong></span>
                  <span>Estudiantes: <strong>{proy.numero_estudiantes || 1}</strong></span>
                </div>
                {/* Título */}
                <h3 className="card-titulo">{proy.nombre_proyecto}</h3>
                {/* Etiquetas */}
                <div className="card-etiquetas">
                  <span className={`etiqueta ${getTagColor("especialidad", proy.especialidad)}`}>
                    {proy.especialidad}
                  </span>
                  <span className={`etiqueta ${getTagColor("modalidad", proy.modalidad)}`}>
                    {proy.modalidad}
                  </span>
                  <span className={`etiqueta ${getTagColor("apoyo", proy.apoyo)}`}>
                    {proy.apoyo ? "Con apoyo" : "Sin apoyo"}
                  </span>
                </div>
                {/* Botón detalles */}
                <button className="btn-detalles" onClick={() => handleDetalles(proy)}>
                  Detalles
                </button>
              </div>
            ))
          )}
        </div>
        {showDetalles && proyectoSeleccionado && (
          <GestionProyectosDetalles
            proyecto={proyectoSeleccionado}
            onClose={() => setShowDetalles(false)}
            user={user}
            aceptados={aceptados}
            showDetalles={showDetalles}
            proyectoSeleccionado={proyectoSeleccionado}
            onAplicar={handleAplicar}
          />
        )}
      </div>
    </div>
  );
};

export default BancoAlumno;