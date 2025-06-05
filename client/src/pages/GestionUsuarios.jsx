import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import "./GestionUsuarios.css";

const menuItems = [
  { name: "Inicio", path: "/dashboard/jefe/", icon: "ri-home-line" },
  { name: "Gestión de Usuarios", path: "/dashboard/jefe/usuarios", icon: "ri-user-settings-line" },
  { name: "Banco de Proyectos", path: "/dashboard/jefe/banco", icon: "ri-database-2-line" },
  { name: "Gestión de Proyectos", path: "/dashboard/jefe/gestion-proyectos", icon: "ri-briefcase-4-line" },
  { name: "Configuración", path: "/dashboard/jefe/configuracion", icon: "ri-settings-3-line" },
  { name: "Reportes", path: "/dashboard/jefe/reportes", icon: "ri-bar-chart-2-line" },
  { name: "Expedientes", path: "/dashboard/jefe/expedientes", icon: "ri-folder-line" },
];

const roles = [
  { value: "alumno", label: "Alumno" },
  { value: "empresa", label: "Empresa" },
  { value: "jefe_carrera", label: "Jefe de Carrera" },
  // Agrega más roles si tienes
];

const GestionUsuarios = ({ user }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    nombres: "",
    primer_apellido: "",
    segundo_apellido: "",
    password: "",
    confirm_password: "",
    role: "alumno",
  });

  // Obtener usuarios
  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get("/api/users/usuarios/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(res.data);
    } catch (err) {
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  // Añadir usuario
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      await axios.post("/api/users/register/", newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowModal(false);
      setNewUser({
        email: "",
        nombres: "",
        primer_apellido: "",
        segundo_apellido: "",
        password: "",
        confirm_password: "",
        role: "alumno",
      });
      fetchUsuarios();
    } catch (error) {
      alert("No se pudo crear el usuario.");
    }
  };

  // Función para eliminar usuario
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`/api/users/usuarios/${userId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(usuarios => usuarios.filter(u => u.id !== userId));
    } catch (error) {
      alert("No se pudo eliminar el usuario.");
    }
  };

  return (
    <>
      <div className="usuarios-header">
        <h2>Gestión de Usuarios</h2>
        <button className="btn-add-usuario" onClick={() => setShowModal(true)}>
          Añadir usuario
        </button>
      </div>
      {showModal && (
        <div className="modal-usuarios">
          <form className="form-usuarios" onSubmit={handleAddUser}>
            <h3>Nuevo Usuario</h3>
            <input className="input-usuario" name="email" value={newUser.email} onChange={handleInputChange} placeholder="Email" required />
            <input className="input-usuario" name="nombres" value={newUser.nombres} onChange={handleInputChange} placeholder="Nombres" required />
            <input className="input-usuario" name="primer_apellido" value={newUser.primer_apellido} onChange={handleInputChange} placeholder="Primer Apellido" required />
            <input className="input-usuario" name="segundo_apellido" value={newUser.segundo_apellido} onChange={handleInputChange} placeholder="Segundo Apellido" required />
            <input className="input-usuario" name="password" type="password" value={newUser.password} onChange={handleInputChange} placeholder="Contraseña" required />
            <input className="input-usuario" name="confirm_password" type="password" value={newUser.confirm_password} onChange={handleInputChange} placeholder="Confirmar Contraseña" required />
            <select className="input-usuario" name="role" value={newUser.role} onChange={handleInputChange}>
              {roles.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <div className="form-usuarios-actions">
              <button className="btn-guardar" type="submit">Guardar</button>
              <button className="btn-cancelar" type="button" onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
      <div className="usuarios-table-container">
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Nombres</th>
              <th>Primer Apellido</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>Cargando usuarios...</td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "#888" }}>
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.nombres}</td>
                  <td>{u.primer_apellido}</td>
                  <td>
                    <span>
                      {roles.find(r => r.value === u.role)?.label || u.role}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-eliminar"
                      onClick={() => handleDeleteUser(u.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default GestionUsuarios;