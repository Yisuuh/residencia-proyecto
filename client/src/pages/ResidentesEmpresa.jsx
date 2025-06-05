import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ResidenteEmpresa.css";
import ResidenteCard from "../components/ResidenteCard";
import ResidenteDetallesModal from "../components/ResidenteDetallesModal";

const ResidentesEmpresa = ({ user }) => {
  const [aplicaciones, setAplicaciones] = useState([]);
  const [modal, setModal] = useState({ open: false, aplicacion: null });

  const handleEstadoActualizado = (id, estado) => {
    setAplicaciones(prev =>
      prev.filter(a => a.id !== id)
    );
    // Opcional: puedes mostrar un mensaje o actualizar el cupo aquí
  };

  useEffect(() => {
    const fetchAplicaciones = async () => {
      const token = localStorage.getItem("access_token");
      // Recuerda definir proyectoId si filtras por uno específico
      const res = await axios.get(`/api/banco_proyectos/empresa/aplicaciones/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAplicaciones(res.data.filter(a => a.estado === "pendiente"));
    };
    fetchAplicaciones();
  }, []);

  return (
    <div className="residentes-empresa-container">
      <h2>Residentes pendientes</h2>
      {aplicaciones.length === 0 ? (
        <p>No hay aplicaciones pendientes.</p>
      ) : (
        <div className="residentes-list">
          {aplicaciones.map(aplicacion => (
            <ResidenteCard
              key={aplicacion.id}
              aplicacion={aplicacion}
              onVerMas={apli => setModal({ open: true, aplicacion: apli })}
            />
          ))}
        </div>
      )}

      {modal.open && (
        <ResidenteDetallesModal
          aplicacion={modal.aplicacion}
          onClose={() => setModal({ open: false, aplicacion: null })}
          onEstadoActualizado={handleEstadoActualizado}
        />
      )}
    </div>
  );
};

export default ResidentesEmpresa;

// Debes crear el componente ResidenteDetallesModal.jsx aparte