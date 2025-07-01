import React, { useState, useEffect } from "react";
import "./gestion_proyectos.css";
import axios from "axios";
import "./BancoAlumno.css";
import GestionProyectosForm from "../components/GestionProyectosForm";
import GestionProyectosCard from "../components/GestionProyectosCard";
import GestionProyectosDetalles from "../components/GestionProyectosDetalles";

const initialForm = {
  nombre_responsable: "",
  correo: "",
  telefono: "",
  nombre_proyecto: "",
  objetivo: "",
  justificacion: "",
  problema: "",
  modalidad: "", // <--- antes "virtual"
  tipo_entidad: "", // <--- antes "empresa"
  nombre_empresa: "",
  nombre_institucion: "",
  rfc: "",
  giro: "",
  pagina_web: "",
  numero_estudiantes: "",
  periodo: "",
  apoyo: "", // <--- antes false
  tipo_apoyo: "",
  estudiante_interesado: "", // <--- antes false
  nombre_estudiante_solicitado: "",
  es_tec: "", // <--- antes false
  observaciones: "",
  imagen: null,
};

const GestionProyectos = ({ user }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showDetalles, setShowDetalles] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [aceptados, setAceptados] = useState(0);

  const fetchProyectos = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get("/api/banco_proyectos/formulario_proyecto/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProyectos(res.data);
    } catch (err) {
      setProyectos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProyectos();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else if (type === "file") {
      setForm({ ...form, [name]: files[0] });
      if (files && files[0]) {
        setPreviewUrl(URL.createObjectURL(files[0]));
      } else {
        setPreviewUrl(null);
      }
    } else if (
      name === "apoyo" ||
      name === "estudiante_interesado" ||
      name === "es_tec" ||
      name === "incluir_asesor"
    ) {
      setForm({ ...form, [name]: value }); // <-- Guarda el string tal cual
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    const fechaActual = new Date().toISOString().split("T")[0];

    Object.entries(form).forEach(([key, value]) => {
      if (key === "imagen" && value) {
        formData.append(key, value);
      } else if (typeof value === "boolean") {
        formData.append(key, value ? "true" : "false");
      } else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    formData.append("fecha_subida", fechaActual);

    try {
      await axios.post(
        "/api/banco_proyectos/formulario_proyecto/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setShowModal(false);
      setForm(initialForm);
      setPreviewUrl(null);
      setLoading(true);
      fetchProyectos();
    } catch (error) {
      alert("Error al guardar el proyecto");
    }
  };

  const handleDetalles = (proy) => {
    setProyectoSeleccionado(proy);
    setShowDetalles(true);
  };

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

  return (
    <>
      <div className="gestion-header">
        <h2>Gestión de Proyectos</h2>
        <button className="gestion-add-btn" onClick={() => setShowModal(true)}>
          <i className="ri-add-line"></i>
          Añadir nuevo proyecto
        </button>
      </div>

      <div className="gestion-cards-container">
        {loading ? (
          <p>Cargando proyectos...</p>
        ) : proyectos.length === 0 ? (
          <p className="no-proyectos">No hay proyectos registrados.</p>
        ) : (
          proyectos.map((proy) => (
            <GestionProyectosCard
              key={proy.id}
              proyecto={proy}
              onDetalles={handleDetalles}
            />
          ))
        )}
      </div>

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
          aceptados={aceptados}
          showDetalles={showDetalles}
          proyectoSeleccionado={proyectoSeleccionado}
          // ...otros props si los necesitas
        />
      )}
    </>
  );
};

export default GestionProyectos;