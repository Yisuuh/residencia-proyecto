import React, { useState, useEffect } from "react";
import axios from "axios";
import GestionProyectosCard from "../components/GestionProyectosCard";
import GestionProyectosDetalles from "../components/GestionProyectosDetalles";
import GestionProyectosForm from "../components/GestionProyectosForm";
import CustomAlert from "../components/CustomAlert";  // ✅ IMPORTAR
import { useAlert } from "../hooks/useAlert";  // ✅ IMPORTAR
import "./gestion_proyectos.css";

const GestionProyectos = () => {
  const [proyectos, setProyectos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetalles, setShowDetalles] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // ✅ CUSTOM ALERT
  const { alert, showAlert, hideAlert } = useAlert();
  
  // ✅ ESTADO PARA CONFIRMACIÓN
  const [showConfirmTerminar, setShowConfirmTerminar] = useState(false);
  const [proyectoATerminar, setProyectoATerminar] = useState(null);

  const [form, setForm] = useState({
    nombre_responsable: "",
    correo: "",
    telefono: "",
    nombre_proyecto: "",
    objetivo: "",
    justificacion: "",
    problema: "",
    modalidad: "",
    tipo_entidad: "",
    nombre_empresa: "",
    nombre_institucion: "",
    rfc: "",
    giro: "",
    pagina_web: "",
    numero_estudiantes: "",
    periodo: "",
    apoyo: "",
    tipo_apoyo: "",
    especialidad: "",
    estudiante_interesado: "",
    nombre_estudiante_solicitado: "",
    es_tec: "",
    observaciones: "",
    imagen: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  // Obtener usuario
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get("/api/users/me/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("✅ gestion_proyectos: Usuario obtenido:", response.data);
        console.log("  👤 Email:", response.data.email);
        console.log("  🎭 Role:", response.data.role);
        
        setUser(response.data);
      } catch (error) {
        console.error("❌ Error al obtener usuario:", error);
        showAlert("Error al cargar usuario", "error");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    fetchProyectos();
  }, []);

  const fetchProyectos = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get("/api/banco_proyectos/formulario_proyecto/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Proyectos obtenidos:", response.data.length);
      setProyectos(response.data);
    } catch (error) {
      console.error("❌ Error al obtener proyectos:", error);
      showAlert("Error al cargar proyectos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "imagen" && files && files[0]) {
      setForm({ ...form, imagen: files[0] });
      setPreviewUrl(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key]) {
        formData.append(key, form[key]);
      }
    });

    try {
      const token = localStorage.getItem("access_token");
      await axios.post("/api/banco_proyectos/formulario_proyecto/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Proyecto creado exitosamente");
      showAlert("Proyecto creado exitosamente", "success");  // ✅ CUSTOM ALERT
      setShowModal(false);
      fetchProyectos();
      
      // Reset form
      setForm({
        nombre_responsable: "",
        correo: "",
        telefono: "",
        nombre_proyecto: "",
        objetivo: "",
        justificacion: "",
        problema: "",
        modalidad: "",
        tipo_entidad: "",
        nombre_empresa: "",
        nombre_institucion: "",
        rfc: "",
        giro: "",
        pagina_web: "",
        numero_estudiantes: "",
        periodo: "",
        apoyo: "",
        tipo_apoyo: "",
        especialidad: "",
        estudiante_interesado: "",
        nombre_estudiante_solicitado: "",
        es_tec: "",
        observaciones: "",
        imagen: null,
      });
      setPreviewUrl(null);
    } catch (error) {
      console.error("❌ Error al crear proyecto:", error);
      showAlert("Error al crear proyecto. Verifica los campos obligatorios.", "error");  // ✅ CUSTOM ALERT
    }
  };

  const handleDetalles = (proyecto) => {
    console.log("👁️ Abriendo detalles de:", proyecto.nombre_proyecto);
    setProyectoSeleccionado(proyecto);
    setShowDetalles(true);
  };

  // ✅ MOSTRAR CONFIRMACIÓN PARA TERMINAR
  const handleTerminarProyectoClick = (proyecto) => {
    setProyectoATerminar(proyecto);
    setShowConfirmTerminar(true);
  };

  // ✅ CONFIRMAR TERMINAR PROYECTO
  const confirmarTerminarProyecto = async () => {
    if (!proyectoATerminar) return;

    try {
      const token = localStorage.getItem("access_token");
      
      console.log(`🔴 Terminando proyecto ID: ${proyectoATerminar.id}`);
      
      const response = await axios.post(
        `/api/banco_proyectos/formulario_proyecto/${proyectoATerminar.id}/terminar/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Proyecto terminado:", response.data);
      showAlert("Proyecto marcado como terminado exitosamente", "success");  // ✅ CUSTOM ALERT
      
      // Recargar lista de proyectos
      fetchProyectos();
      
      // Cerrar modal de detalles si está abierto
      if (showDetalles) {
        setShowDetalles(false);
      }
    } catch (error) {
      console.error("❌ Error al terminar proyecto:", error);
      showAlert(
        error.response?.data?.error || "Error al terminar el proyecto",
        "error"
      );  // ✅ CUSTOM ALERT
    } finally {
      setShowConfirmTerminar(false);
      setProyectoATerminar(null);
    }
  };

  // ✅ CANCELAR TERMINAR
  const cancelarTerminarProyecto = () => {
    setShowConfirmTerminar(false);
    setProyectoATerminar(null);
  };

  // Loading usuario
  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <i className="ri-loader-4-line" style={{ 
          fontSize: '64px', 
          color: '#7E122A',
          animation: 'spin 1s linear infinite' 
        }}></i>
        <p style={{ fontSize: '18px', color: '#6c757d' }}>
          Cargando información del usuario...
        </p>
      </div>
    );
  }

  // Loading proyectos
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <i className="ri-loader-4-line" style={{ 
          fontSize: '64px', 
          color: '#7E122A',
          animation: 'spin 1s linear infinite' 
        }}></i>
        <p style={{ fontSize: '18px', color: '#6c757d' }}>
          Cargando proyectos...
        </p>
      </div>
    );
  }

  console.log("🎨 Renderizando gestion_proyectos con:");
  console.log("  👤 user.role:", user.role);
  console.log("  📦 Total proyectos:", proyectos.length);

  return (
    <div className="gestion-container">
      {/* ✅ CUSTOM ALERT */}
      {alert.show && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={hideAlert}
        />
      )}

      {/* ✅ MODAL DE CONFIRMACIÓN PARA TERMINAR */}
      {showConfirmTerminar && proyectoATerminar && (
        <div className="modal-overlay" onClick={cancelarTerminarProyecto}>
          <div 
            className="modal-content-confirm" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <i 
                className="ri-alert-line" 
                style={{ 
                  fontSize: '64px', 
                  color: '#dc3545',
                  marginBottom: '15px'
                }}
              ></i>
              <h3 style={{ 
                color: '#2c3e50', 
                fontSize: '22px', 
                fontWeight: '700',
                marginBottom: '10px'
              }}>
                ¿Terminar Proyecto?
              </h3>
              <p style={{ 
                color: '#6c757d', 
                fontSize: '15px', 
                lineHeight: '1.6',
                margin: '0'
              }}>
                ¿Estás seguro de que deseas marcar como terminado el proyecto{' '}
                <strong style={{ color: '#7E122A' }}>
                  "{proyectoATerminar.nombre_proyecto}"
                </strong>?
              </p>
              <p style={{ 
                color: '#dc3545', 
                fontSize: '14px', 
                marginTop: '15px',
                fontWeight: '600'
              }}>
                Los alumnos ya no podrán verlo en el banco de proyectos.
              </p>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '15px', 
              justifyContent: 'center' 
            }}>
              <button
                onClick={cancelarTerminarProyecto}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #6c757d, #495057)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarTerminarProyecto}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #dc3545, #c82333)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                Sí, Terminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="gestion-header">
        <h2>Gestión de Proyectos</h2>
        <button
          className="gestion-add-btn"
          onClick={() => setShowModal(true)}
        >
          <i className="ri-add-line"></i>
          Añadir nuevo proyecto
        </button>
      </div>

      {proyectos.length === 0 ? (
        <div className="gestion-empty">
          <i className="ri-inbox-line" style={{ fontSize: '64px', color: '#ccc' }}></i>
          <p>No hay proyectos disponibles</p>
          <p style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
            Haz clic en "Añadir nuevo proyecto" para comenzar
          </p>
        </div>
      ) : (
        <div className="gestion-grid">
          {proyectos.map((proy) => (
            <GestionProyectosCard
              key={proy.id}
              proyecto={proy}
              onDetalles={handleDetalles}
              onTerminar={handleTerminarProyectoClick}
              user={user}
            />
          ))}
        </div>
      )}

      {showModal && (
        <GestionProyectosForm
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          previewUrl={previewUrl}
          setShowModal={setShowModal}
        />
      )}

      {showDetalles && proyectoSeleccionado && (
        <GestionProyectosDetalles
          proyecto={proyectoSeleccionado}
          onClose={() => setShowDetalles(false)}
          user={user}
          onTerminar={handleTerminarProyectoClick} 
        />
      )}
    </div>
  );
};

export default GestionProyectos;