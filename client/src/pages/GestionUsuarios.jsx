import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";

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

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get("http://127.0.0.1:8000/api/users/usuarios/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsuarios(res.data);
      } catch (err) {
        setUsuarios([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.patch(
        `http://127.0.0.1:8000/api/users/usuarios/${userId}/`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsuarios(usuarios =>
        usuarios.map(u =>
          u.id === userId ? { ...u, role: newRole } : u
        )
      );
    } catch (error) {
      alert("No se pudo actualizar el rol.");
    }
  };

  return (
    <Layout menuItems={menuItems} user={user}>
      <h2>Gestión de Usuarios</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                    >
                      {roles.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {/* Aquí puedes agregar un botón para editar más información */}
                    {/* <button onClick={() => handleEdit(u.id)}>Editar</button> */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default GestionUsuarios;