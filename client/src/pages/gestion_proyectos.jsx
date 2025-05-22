import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import "./gestion_proyectos.css";
import axios from "axios";

const menuItems = [
  { name: "Inicio", path: "/dashboard/empresa/", icon: "ri-home-line" },
  { name: "Gestión de Proyectos", path: "/dashboard/empresa/gestion-proyectos", icon: "ri-briefcase-4-line" },
  { name: "Residentes", path: "/dashboard/empresa/residentes", icon: "ri-group-line" },
];

const initialForm = {
  nombre_responsable: "",
  correo: "",
  telefono: "",
  nombre_proyecto: "",
  objetivo: "",
  justificacion: "",
  problema: "",
  actividades: "",
  stack: "",
  modalidad: "virtual",
  tipo_entidad: "empresa",
  nombre_empresa: "",
  rfc: "",
  giro: "servicios",
  pagina_web: "",
  numero_estudiantes: "",
  especialidad: "ciberseguridad",
  periodo: "enero-junio",
  competencias: "",
  apoyo: false,
  tipo_apoyo: "",
  estudiante_interesado: false,
  nombre_estudiante_solicitado: "",
  es_tec: false,
  incluir_asesor: false,
  nombre_asesor: "",
  observaciones: "",
  imagen: null,
};

const GestionProyectos = ({ user }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar proyectos del usuario autenticado
  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get("http://127.0.0.1:8000/api/banco_proyectos/formulario_proyecto/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Si el backend ya filtra por usuario autenticado, solo asigna:
        setProyectos(res.data);
        // Si no, filtra aquí:
        // setProyectos(res.data.filter(p => p.usuario === user.id));
      } catch (err) {
        setProyectos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProyectos();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else if (type === "file") {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      // Solo agrega la imagen si existe
      if (key === "imagen" && value) {
        formData.append(key, value);
      } else if (typeof value === "boolean") {
        formData.append(key, value ? "true" : "false");
      } else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/banco_proyectos/formulario_proyecto/",
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
      // Refresca la lista de proyectos
      fetchProyectos();
    } catch (error) {
      alert("Error al guardar el proyecto");
    }
  };

  return (
    <Layout menuItems={menuItems} user={user}>
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
          <p style={{ textAlign: "center", color: "#888" }}>No hay proyectos registrados.</p>
        ) : (
          proyectos.map((proy) => (
            <div className="gestion-card" key={proy.id}>
              <h4>{proy.nombre_proyecto}</h4>
              <p><strong>Responsable:</strong> {proy.nombre_responsable}</p>
              <p><strong>Especialidad:</strong> {proy.especialidad}</p>
              <p><strong>Periodo:</strong> {proy.periodo}</p>
              <p>{proy.objetivo}</p>
              {/* Agrega más campos si lo deseas */}
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="gestion-modal-overlay">
          <div className="gestion-modal-content">
            <button
              className="gestion-modal-close"
              onClick={() => setShowModal(false)}
              aria-label="Cerrar"
            >
              <i className="ri-close-line"></i>
            </button>
            <h3>Nuevo Proyecto</h3>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <label>Nombre del responsable</label>
              <input type="text" name="nombre_responsable" value={form.nombre_responsable} onChange={handleChange} required />

              <label>Correo</label>
              <input type="email" name="correo" value={form.correo} onChange={handleChange} required />

              <label>Teléfono</label>
              <input type="text" name="telefono" value={form.telefono} onChange={handleChange} required />

              <label>Nombre del proyecto</label>
              <input type="text" name="nombre_proyecto" value={form.nombre_proyecto} onChange={handleChange} required />

              <label>Objetivo</label>
              <textarea name="objetivo" value={form.objetivo} onChange={handleChange} required />

              <label>Justificación</label>
              <textarea name="justificacion" value={form.justificacion} onChange={handleChange} required />

              <label>Problema</label>
              <textarea name="problema" value={form.problema} onChange={handleChange} required />

              <label>Actividades</label>
              <textarea name="actividades" value={form.actividades} onChange={handleChange} required />

              <label>Stack tecnológico</label>
              <textarea name="stack" value={form.stack} onChange={handleChange} required />

              <label>Modalidad</label>
              <select name="modalidad" value={form.modalidad} onChange={handleChange}>
                <option value="virtual">Virtual</option>
                <option value="hibrido">Híbrido</option>
                <option value="presencial">Presencial</option>
              </select>

              <label>Tipo de entidad</label>
              <select name="tipo_entidad" value={form.tipo_entidad} onChange={handleChange}>
                <option value="empresa">Empresa</option>
                <option value="institucion">Institución</option>
              </select>

              <label>Nombre de la empresa</label>
              <input type="text" name="nombre_empresa" value={form.nombre_empresa} onChange={handleChange} />

              <label>RFC</label>
              <input type="text" name="rfc" value={form.rfc} onChange={handleChange} />

              <label>Giro</label>
              <select name="giro" value={form.giro} onChange={handleChange}>
                <option value="servicios">Servicios</option>
                <option value="manufactura">Manufactura</option>
                <option value="comercial">Comercial</option>
              </select>

              <label>Página web</label>
              <input type="url" name="pagina_web" value={form.pagina_web} onChange={handleChange} />

              <label>Número de estudiantes</label>
              <input type="number" name="numero_estudiantes" value={form.numero_estudiantes} onChange={handleChange} />

              <label>Especialidad</label>
              <select name="especialidad" value={form.especialidad} onChange={handleChange}>
                <option value="ciberseguridad">Ciberseguridad</option>
                <option value="ia">Inteligencia Artificial</option>
                <option value="web">Desarrollo Web</option>
              </select>

              <label>Periodo</label>
              <select name="periodo" value={form.periodo} onChange={handleChange}>
                <option value="enero-junio">Enero - Junio</option>
                <option value="agosto-diciembre">Agosto - Diciembre</option>
              </select>

              <label>Competencias</label>
              <textarea name="competencias" value={form.competencias} onChange={handleChange} />

              <label>
                ¿Requiere apoyo?
                <select
                  name="apoyo"
                  value={form.apoyo ? "si" : "no"}
                  onChange={e => setForm({ ...form, apoyo: e.target.value === "si" })}
                >
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </label>

              <label>Tipo de apoyo</label>
              <textarea name="tipo_apoyo" value={form.tipo_apoyo} onChange={handleChange} />

              <label>
                ¿Ya hay estudiante interesado?
                <select
                  name="estudiante_interesado"
                  value={form.estudiante_interesado ? "si" : "no"}
                  onChange={e => setForm({ ...form, estudiante_interesado: e.target.value === "si" })}
                >
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </label>

              <label>Nombre del estudiante solicitado</label>
              <input type="text" name="nombre_estudiante_solicitado" value={form.nombre_estudiante_solicitado} onChange={handleChange} />

              <label>
                ¿Es Tec?
                <select
                  name="es_tec"
                  value={form.es_tec ? "si" : "no"}
                  onChange={e => setForm({ ...form, es_tec: e.target.value === "si" })}
                >
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </label>

              <label>
                ¿Incluir asesor?
                <select
                  name="incluir_asesor"
                  value={form.incluir_asesor ? "si" : "no"}
                  onChange={e => setForm({ ...form, incluir_asesor: e.target.value === "si" })}
                >
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </label>

              <label>Nombre del asesor</label>
              <input type="text" name="nombre_asesor" value={form.nombre_asesor} onChange={handleChange} />

              <label>Observaciones</label>
              <textarea name="observaciones" value={form.observaciones} onChange={handleChange} />

              <label>Imagen</label>
              <input type="file" name="imagen" accept="image/*" onChange={handleChange} />

              <button type="submit">
                Guardar
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default GestionProyectos;