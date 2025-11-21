import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import "./gestion_proyectos.css";
import "./BancoAlumno.css";
import GestionProyectosDetalles from "../components/GestionProyectosDetalles";
import { useAlert } from "../hooks/useAlert";
import CustomAlert from "../components/CustomAlert";

const BancoAlumno = ({ user, menuItems }) => {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [aplicandoProyecto, setAplicandoProyecto] = useState(false);
  const [aceptados, setAceptados] = useState(0); // ✅ AGREGAR ESTE ESTADO
  
  // ✅ NUEVOS ESTADOS PARA VALIDACIONES
  const [tieneProyectoAprobado, setTieneProyectoAprobado] = useState(false);
  const [aplicacionesActivas, setAplicacionesActivas] = useState(0);
  const [proyectosAplicados, setProyectosAplicados] = useState([]);
  const { alert, closeAlert, showSuccess, showError } = useAlert();

  // ✅ MOVER fetchProyectos FUERA DEL useEffect
  const fetchProyectos = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get("/api/banco_proyectos/formulario_proyecto/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProyectos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al cargar proyectos:", err);
      setProyectos([]);
    }
  };

  // ✅ AGREGAR ESTA FUNCIÓN PARA VERIFICAR ESTADO DEL ALUMNO
  const fetchEstadoAlumno = async () => {
    try {
      const token = localStorage.getItem("access_token");
      
      // ✅ OBTENER APLICACIONES REALES DEL ALUMNO
      const aplicacionesRes = await axios.get("/api/banco_proyectos/alumno/mis-aplicaciones/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (aplicacionesRes.data) {
        const { 
          aplicaciones_activas, 
          tiene_proyecto_aprobado, 
          aplicaciones 
        } = aplicacionesRes.data;
        
        setTieneProyectoAprobado(tiene_proyecto_aprobado);
        setAplicacionesActivas(aplicaciones_activas);
        
        // Crear array con los IDs de proyectos a los que ya aplicó
        const proyectosIds = aplicaciones.map(app => app.proyecto_id);
        setProyectosAplicados(proyectosIds);
        
        console.log("📊 Estado del alumno:", {
          aplicaciones_activas,
          tiene_proyecto_aprobado,
          proyectos_aplicados: proyectosIds
        });
      }
      
    } catch (error) {
      console.log("No hay aplicaciones:", error);
      setTieneProyectoAprobado(false);
      setAplicacionesActivas(0);
      setProyectosAplicados([]);
    }
  };

  // ✅ useEffect PRINCIPAL - Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchProyectos(), fetchEstadoAlumno()]);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ useEffect SEPARADO - Para contar aceptados del proyecto seleccionado
  useEffect(() => {
    const fetchAceptados = async () => {
      if (showModal && selectedProyecto) {
        const token = localStorage.getItem("access_token");
        try {
          console.log(`OBTENIENDO APLICACIONES PARA PROYECTO: ${selectedProyecto.id}`);
          console.log(`Nombre: ${selectedProyecto.nombre_proyecto}`);
          console.log(`Estudiantes solicitados: ${selectedProyecto.numero_estudiantes}`);
          
          const res = await axios.get(`/api/empresa/proyecto/${selectedProyecto.id}/aplicaciones/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log("📊 RESPUESTA COMPLETA DEL BACKEND:", res.data);
          
          // ✅ EL BACKEND DEVUELVE DIRECTAMENTE UN ARRAY
          const aplicacionesArray = Array.isArray(res.data) ? res.data : [];
          const aceptadosCount = aplicacionesArray.filter(a => a.estado === "aceptado").length;
          
          console.log(`APLICACIONES ENCONTRADAS: ${aplicacionesArray.length}`);
          console.log(`ACEPTADOS: ${aceptadosCount}`);
          console.log(`VACANTES DISPONIBLES: ${selectedProyecto.numero_estudiantes - aceptadosCount}`);
          
          // Mostrar cada aplicación
          aplicacionesArray.forEach(app => {
            console.log(`   👤 ${app.alumno_nombre || app.alumno} - ${app.estado}`);
          });
          
          setAceptados(aceptadosCount);
          
        } catch (error) {
          console.error("ERROR AL OBTENER APLICACIONES:", error);
          if (error.response) {
            console.error("RESPUESTA ERROR:", error.response.data);
            console.error("STATUS ERROR:", error.response.status);
          }
          setAceptados(0);
        }
      }
    };
    fetchAceptados();
  }, [showModal, selectedProyecto]);

  const getTagColor = (type, value) => {
    if (type === "especialidad") return "tag-especialidad";
    if (type === "modalidad") return value === "presencial" ? "tag-modalidad-presencial" : "tag-modalidad-otro";
    if (type === "apoyo") return value ? "tag-apoyo-si" : "tag-apoyo-no";
    return "tag-default";
  };

  const handleDetalles = (proy) => {
    setSelectedProyecto(proy);
    setShowModal(true);
  };

  // ✅ FUNCIÓN handleAplicar MEJORADA
  const handleAplicar = async (proyectoId) => {
    // Validaciones del frontend
    if (tieneProyectoAprobado) {
      showError("❌ Error", "Ya tienes un proyecto aceptado. No puedes postularte a otros proyectos.");
      setShowModal(false);
      return;
    }
    
    if (aplicacionesActivas >= 3) {
      showError("❌ Error", "Has alcanzado el límite máximo de 3 postulaciones activas.");
      setShowModal(false);
      return;
    }
    
    if (proyectosAplicados.includes(proyectoId)) {
      showError("❌ Atención", "Ya te has postulado a este proyecto anteriormente.");
      setShowModal(false);
      return;
    }
    
    setAplicandoProyecto(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post("/api/banco_proyectos/aplicar/", 
        { proyecto_id: proyectoId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // ✅ MENSAJES DE ÉXITO MEJORADOS
      const aplicacionesRestantes = response.data.aplicaciones_restantes || 0;
      showSuccess("✅ ¡Éxito!", `¡Aplicación enviada exitosamente!\n\nTe quedan ${aplicacionesRestantes} postulaciones disponibles.`);
      
      // Actualizar estado local
      setAplicacionesActivas(prev => prev + 1);
      setProyectosAplicados(prev => [...prev, proyectoId]);
      setShowModal(false);
      
    } catch (error) {
      console.error("Error al aplicar:", error);
      
      // ✅ MANEJO DE ERRORES ESPECÍFICOS
      if (error.response?.data?.tipo_error) {
        switch (error.response.data.tipo_error) {
          case 'proyecto_aprobado':
            showError("❌ Error", "Ya tienes un proyecto aceptado. No puedes postularte a otros proyectos.");
            setTieneProyectoAprobado(true);
            break;
          case 'limite_aplicaciones':
            showError("❌ Error", `Has alcanzado el límite máximo de 3 postulaciones activas.\n\nAplicaciones activas: ${error.response.data.aplicaciones_activas || 3}`);
            setAplicacionesActivas(3);
            break;
          case 'aplicacion_duplicada':
            showError("❌ Atención", "Ya te has postulado a este proyecto anteriormente.");
            setProyectosAplicados(prev => [...prev, proyectoId]);
            break;
          default:
            showError("❌ Error", error.response.data.error || 'Error al enviar la aplicación');
        }
      } else {
        showError("❌ Error", "Error al enviar la aplicación. Intenta nuevamente.");
      }
      
    } finally {
      setAplicandoProyecto(false);
    }
  };

  return (
    <div className="banco-alumno-bg">
      <div className="banco-alumno-main">
        <div className="gestion-header">
          <h2>Banco de Proyectos</h2>
          {/* ✅ AGREGAR CONTADOR DE APLICACIONES EN EL HEADER */}
          {!tieneProyectoAprobado && (
            <div className="aplicaciones-contador-header">
              📊 Postulaciones activas: {aplicacionesActivas}/3
            </div>
          )}
          {tieneProyectoAprobado && (
            <div className="proyecto-aprobado-header">
              Ya tienes un proyecto aceptado
            </div>
          )}
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
                <button 
                  className={`btn-detalles ${tieneProyectoAprobado ? 'btn-disabled' : ''}`}
                  onClick={() => handleDetalles(proy)}
                  disabled={tieneProyectoAprobado}
                >
                  {tieneProyectoAprobado ? 'Ya tienes proyecto' : 'Detalles'}
                </button>
              </div>
            ))
          )}
        </div>
        {showModal && selectedProyecto && (
          <GestionProyectosDetalles
            proyecto={selectedProyecto}
            onClose={() => setShowModal(false)}
            user={user}
            aceptados={aceptados} // ✅ AHORA SÍ ESTÁ DEFINIDO
            showDetalles={showModal}
            proyectoSeleccionado={selectedProyecto}
            onAplicar={handleAplicar}
          />
        )}
      </div>
      {/* ✅ CustomAlert */}
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

export default BancoAlumno;