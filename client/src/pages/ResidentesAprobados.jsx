import React, { useEffect, useState } from "react";
import axios from "axios";
import ResidenteCard from "../components/ResidenteCard";

const ResidentesAprobados = ({ user }) => {
  const [aprobados, setAprobados] = useState([]);

  useEffect(() => {
    const fetchAprobados = async () => {
      const token = localStorage.getItem("access_token");
      const res = await axios.get("/api/banco_proyectos/empresa/aprobados/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAprobados(res.data);
    };
    fetchAprobados();
  }, []);

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
              // No pases props de botones de acción
              hideActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResidentesAprobados;