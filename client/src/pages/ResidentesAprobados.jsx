import React, { useEffect, useState } from "react";
import axios from "axios";
import ResidenteCard from "../components/ResidenteCard";
import ResidenteCardVerMas from "../components/ResidenteCardVerMas";

const ResidentesAprobados = ({ user }) => {
  const [aprobados, setAprobados] = useState([]);
  const [modal, setModal] = useState({ open: false, aplicacion: null });
  const [proyectos, setProyectos] = useState([]);

  useEffect(() => {
    const fetchAprobados = async () => {
      const token = localStorage.getItem("access_token");
      const res = await axios.get("/api/banco_proyectos/empresa/aprobados/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAprobados(res.data);
    };

    const fetchProyectos = async () => {
      const token = localStorage.getItem("access_token");
      const res = await axios.get("/api/banco_proyectos/empresa/proyectos/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Respuesta proyectos:", res.data);
      // Siempre guarda un array
      let proyectosArray = [];
      if (Array.isArray(res.data)) {
        proyectosArray = res.data;
      } else if (Array.isArray(res.data.results)) {
        proyectosArray = res.data.results;
      }
      setProyectos(proyectosArray);
    };

    fetchAprobados();
    fetchProyectos();
  }, []);

  const proyectoSeleccionado = modal.aplicacion && Array.isArray(proyectos)
    ? proyectos.find(
        p =>
          String(p.id) ===
          String(
            typeof modal.aplicacion.proyecto === "object"
              ? modal.aplicacion.proyecto.id
              : modal.aplicacion.proyecto
          )
      )
    : null;

  if (modal.aplicacion) {
    console.log("modal.aplicacion.proyecto:", modal.aplicacion.proyecto);
    console.log("proyectos:", proyectos);
  }

  return (
    <div className="residentes-empresa-container">
      <h2>Residentes aprobados</h2>
      {aprobados.length === 0 ? (
        <p>No hay residentes aprobados.</p>
      ) : (
        <div className="residentes-list">
          {aprobados.map(aplicacion => (
            <ResidenteCard
              key={aplicacion.id}
              aplicacion={aplicacion}
              onVerMas={apli => setModal({ open: true, aplicacion: apli })}
            />
          ))}
        </div>
      )}

      {modal.open && (
        <ResidenteCardVerMas
          aplicacion={modal.aplicacion}
          proyecto={modal.aplicacion?.proyecto}
          onClose={() => setModal({ open: false, aplicacion: null })}
        />
      )}
    </div>
  );
};

export default ResidentesAprobados;