import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import "./ExpedienteAlumno.css";
import Modal from "../components/Modal";

const ExpedienteAlumno = () => {
  const [documentosPredefinidos, setDocumentosPredefinidos] = useState([]);
  const [documentosAlumno, setDocumentosAlumno] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDocumento, setCurrentDocumento] = useState(null); // Documento seleccionado
  const [modalFile, setModalFile] = useState(null); // Archivo seleccionado en el modal
  const [proyecto, setProyecto] = useState(null); // Nuevo estado para el proyecto

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("access_token");

        // Proyecto aceptado
        const proyectoRes = await axios.get(
          "/api/banco_proyectos/alumno/proyecto-aceptado/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProyecto(proyectoRes.data);

        // Documentos predefinidos
        const predefinidosResponse = await axios.get(
          "/api/expediente/documentos_predefinidos/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDocumentosPredefinidos(predefinidosResponse.data);

        // Documentos del alumno
        const alumnoResponse = await axios.get(
          "/api/expediente/documentos/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDocumentosAlumno(alumnoResponse.data);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchAll();
  }, []);

  const openModal = (documento) => {
    setCurrentDocumento(documento);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentDocumento(null);
    setModalFile(null);
  };

  const handleModalFileChange = (e) => {
    setModalFile(e.target.files[0]);
  };

  const handleModalUpload = async () => {
    if (!modalFile || !currentDocumento) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("archivo", modalFile);
    try {
      const token = localStorage.getItem("access_token");
      await axios.put(
        `/api/expediente/documentos/${currentDocumento.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // Obtener la fecha actual en la zona horaria local
      const fechaEnvio = new Date().toLocaleDateString("en-CA"); // Formato YYYY-MM-DD
      // Actualiza la lista de documentos después de subir el archivo
      const updatedDocumentos = documentosAlumno.map((doc) =>
        doc.id === currentDocumento.id
          ? { ...doc, archivo: modalFile.name, fecha_envio: fechaEnvio } // Mantener estado como "pendiente"
          : doc
      );
      setDocumentosAlumno(updatedDocumentos);
      closeModal(); // Cierra el modal
    } catch (error) {
      console.error("Error al subir el archivo:", error);
    } finally {
      setUploading(false);
    }
  };

  // Combinar documentos predefinidos con los documentos del alumno
  const documentos = documentosPredefinidos.map((predefinido) => {
    const documentoAlumno = documentosAlumno.find(
      (doc) => doc.documento_predefinido.id === predefinido.id
    );
    return {
      id: documentoAlumno ? documentoAlumno.id : null,
      nombre: predefinido.nombre,
      estado: documentoAlumno ? documentoAlumno.estado : "pendiente",
      fecha_programada: documentoAlumno ? documentoAlumno.fecha_programada : "-",
      fecha_envio: documentoAlumno ? documentoAlumno.fecha_envio : "-",
      observaciones: documentoAlumno ? documentoAlumno.observaciones : "-",
      archivo: documentoAlumno?.archivo
        ? documentoAlumno.archivo.startsWith("http")
          ? documentoAlumno.archivo // Si ya es una URL completa, úsala directamente
          : `https://residencia-proyecto.onrender.com${documentoAlumno.archivo}` // Si es relativa, agrega la base
        : null,
    };
  });

  // Cálculo del porcentaje de avance
  const totalDocs = documentosPredefinidos.length;
  const aprobados = documentosAlumno.filter(
    (doc) => doc.estado === "aprobado"
  ).length;
  const porcentaje = totalDocs > 0 ? Math.round((aprobados / totalDocs) * 100) : 0;

  return (
    <>
      <div className="expediente-container">
        <h1 className="expediente-title">Expediente del Alumno</h1>
        {/* NUEVO: Info del proyecto */}
        {proyecto && (
          <div className="expediente-proyecto-info">
            <strong>Proyecto asignado:</strong> {proyecto.nombre_proyecto} <br />
            <strong>Responsable:</strong> {proyecto.nombre_responsable}
          </div>
        )}
        {/* NUEVO: Porcentaje de avance */}
        <div className="expediente-avance">
          <strong>Avance:</strong> {porcentaje}%
          <div className="expediente-barra-avance">
            <div
              className="expediente-barra-avance-inner"
              style={{ width: `${porcentaje}%` }}
            ></div>
          </div>
        </div>
        <p className="expediente-desc">
          En esta sección podrás cargar los documentos necesarios para completar el
          proceso de Residencia Profesional. Asegúrate de incluir todos los archivos
          requeridos.
        </p>
        <table className="expediente-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre del Documento</th>
              <th>Estado</th>
              <th>Fecha Programada</th>
              <th>Fecha de Envío</th>
              <th>Acciones</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {documentos.map((doc, index) => (
              <tr key={doc.id || index}>
                <td>{doc.id}</td>
                <td>{doc.nombre}</td>
                <td className={`estado ${doc.estado.toLowerCase()}`}>
                  {doc.estado.toLowerCase() === "aprobado" && (
                    <i
                      className="ri-check-line"
                      style={{
                        color: "#2ecc71",
                        fontSize: "1.2rem",
                        verticalAlign: "middle",
                        fontWeight: 200,
                        filter: "brightness(1.2) opacity(0.8)",
                      }}
                    ></i>
                  )}
                  {doc.estado.toLowerCase() === "rechazado" && (
                    <i
                      className="ri-close-line"
                      style={{
                        color: "#e74c3c",
                        fontSize: "1.2rem",
                        verticalAlign: "middle",
                        fontWeight: 200,
                        filter: "brightness(1.2) opacity(0.8)",
                      }}
                    ></i>
                  )}
                  {doc.estado.toLowerCase() === "pendiente" && (
                    <i
                      className="ri-time-line"
                      style={{
                        color: "#888",
                        fontSize: "1.2rem",
                        verticalAlign: "middle",
                        fontWeight: 200,
                        filter: "brightness(1.2) opacity(0.8)",
                      }}
                    ></i>
                  )}
                </td>
                <td>{doc.fecha_programada}</td>
                <td>{doc.fecha_envio}</td>
                <td>
                  <button
                    className="btn-accion btn-upload"
                    onClick={() => openModal(doc)}
                    title="Subir archivo"
                  >
                    <i className="ri-upload-2-line"></i>
                  </button>
                  {doc.archivo && (
                    <button
                      className="btn-accion btn-eye"
                      onClick={() => window.open(doc.archivo, "_blank")}
                      title="Visualizar"
                      style={{
                        background: "none",
                        border: "none",
                        boxShadow: "none",
                        color: "#27ae60",
                        padding: 0,
                        marginLeft: 6,
                        marginRight: 0,
                        cursor: "pointer",
                      }}
                    >
                      <i
                        className="ri-eye-line"
                        style={{ fontSize: "1.3rem", color: "#27ae60" }}
                      ></i>
                    </button>
                  )}
                </td>
                <td>{doc.observaciones}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2>Subir Archivo</h2>
        <p>Documento: {currentDocumento?.nombre}</p>
        <input
          type="file"
          id="modal-file-input"
          onChange={handleModalFileChange}
        />
        <label htmlFor="modal-file-input" className="modal-file-upload">
          Seleccionar Archivo
        </label>
        <div className="modal-actions">
          <button onClick={handleModalUpload} disabled={!modalFile || uploading}>
            {uploading ? "Subiendo..." : "Subir"}
          </button>
          <button onClick={closeModal}>Cancelar</button>
        </div>
      </Modal>
    </>
  );
};

export default ExpedienteAlumno;