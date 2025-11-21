import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ResidenteSolicitudesyAprobado.css";
import ResidenteCard from "../components/ResidenteCard";
import ResidenteCardVerMas from "../components/ResidenteCardVerMas";
import CustomAlert from "../components/CustomAlert"; // ✅ Importar CustomAlert
import { useAlert } from "../hooks/useAlert"; // ✅ Importar hook
import { fetchCurrentUser } from "../api/auth";

const ResidentesEmpresa = () => {
  const [user, setUser] = useState(null);
  const [aplicaciones, setAplicaciones] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ✅ Hook para manejar alertas
  const { alert, closeAlert, showSuccess, showError } = useAlert();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const userData = await fetchCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Error obteniendo usuario:", error);
      }
    };
    
    getCurrentUser();
  }, []);

  const fetchAplicaciones = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/banco_proyectos/empresa/aplicaciones/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setAplicaciones(data);
      } else {
        setAplicaciones([]);
      }
    } catch (error) {
      console.error("Error al obtener aplicaciones:", error);
      setAplicaciones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAplicaciones();
  }, []);

  // ✅ Función para aceptar con CustomAlert
  const handleAceptar = async (aplicacionId) => {
    try {
      const response = await axios.patch(
        `/api/banco_proyectos/aplicacion/${aplicacionId}/`, 
        { estado: "aceptado" },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // ✅ Usar CustomAlert en lugar de alert()
      showSuccess("¡Éxito!", "Aplicación aceptada exitosamente");
      fetchAplicaciones();
      
    } catch (error) {
      // ✅ Usar CustomAlert para errores
      if (error.response?.status === 403) {
        showError("Sin permisos", "No tienes permisos para realizar esta acción");
      } else if (error.response?.status === 404) {
        showError("No encontrado", "No se encontró la aplicación");
      } else if (error.response?.status === 400) {
        showError(
          "Atención", 
          error.response?.data?.detail || "Ya se llenó el cupo de este proyecto"
        );
      } else {
        showError("Error", `Error al aceptar: ${error.message}`);
      }
    }
  };

  // ✅ Función para rechazar con CustomAlert
  const handleRechazar = async (aplicacionId) => {
    try {
      const response = await axios.patch(
        `/api/banco_proyectos/aplicacion/${aplicacionId}/`, 
        { estado: "rechazado" },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // ✅ Usar CustomAlert
      showSuccess("Actualizado", "Aplicación rechazada exitosamente");
      fetchAplicaciones();
      
    } catch (error) {
      // ✅ Usar CustomAlert para errores
      showError("Error", `Error al rechazar: ${error.response?.status || 'Desconocido'}`);
    }
  };

  if (loading) {
    return (
      <div className="residentes-empresa-container solicitudes">
        <h2>Cargando...</h2>
      </div>
    );
  }

  return (
    <div className="residentes-empresa-container solicitudes">
      <h2>Solicitudes de Residencia</h2>
      
      {aplicaciones.length === 0 ? (
        <p>No hay aplicaciones pendientes.</p>
      ) : (
        <div className="residentes-list">
          {aplicaciones.map((aplicacion) => (
            <ResidenteCard
              key={aplicacion.id}
              aplicacion={aplicacion}
              onVerMas={() => setModalData(aplicacion)}
              onAceptar={() => handleAceptar(aplicacion.id)}
              onRechazar={() => handleRechazar(aplicacion.id)}
            />
          ))}
        </div>
      )}

      {/* ✅ Modal CON botones de acción */}
      {modalData && (
        <ResidenteCardVerMas
          aplicacion={modalData}
          proyecto={modalData.proyecto}
          onClose={() => setModalData(null)}
          showActions={true}
          onUpdate={fetchAplicaciones}
        />
      )}

      {/* ✅ CustomAlert para mostrar mensajes */}
      <CustomAlert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={closeAlert}
        onConfirm={alert.onConfirm}
      />
    </div>
  );
};

export default ResidentesEmpresa;