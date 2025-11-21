import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import "./GestionUsuarios.css";
import { useAlert } from "../hooks/useAlert";
import CustomAlert from "../components/CustomAlert";

const menuItems = [
  { name: "Inicio", path: "/dashboard/jefe/", icon: "ri-home-line" },
  { name: "Gestión de Usuarios", path: "/dashboard/jefe/usuarios", icon: "ri-user-settings-line" },
  { name: "Banco de Proyectos", path: "/dashboard/jefe/banco", icon: "ri-database-2-line" },
  { name: "Gestión de Proyectos", path: "/dashboard/jefe/gestion-proyectos", icon: "ri-briefcase-4-line" },
  { name: "Configuración", path: "/dashboard/jefe/configuracion", icon: "ri-settings-3-line" },
  { name: "Reportes", path: "/dashboard/jefe/reportes", icon: "ri-bar-chart-2-line" },
  { name: "Expedientes", path: "/dashboard/jefe/expedientes", icon: "ri-folder-line" },
];

// ✅ Roles actualizados
const roles = [
  { value: "alumno", label: "Alumno" },
  { value: "empresa", label: "Empresa" },
  { value: "jefe_carrera", label: "Jefe de Carrera" },
  { value: "coordinador", label: "Coordinador" },
  { value: "presidente_academia", label: "Presidente de Academia" },
];

const GestionUsuarios = ({ user }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]); // ✅ NUEVO
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { alert, closeAlert, showSuccess, showError, showConfirm } = useAlert();
  
  // ✅ Estados para filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    rol: ''
  });
  
  // ✅ Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [newUser, setNewUser] = useState({
    email: "",
    nombres: "",
    primer_apellido: "",
    segundo_apellido: "",
    password: "",
    confirm_password: "",
    role: "alumno",
  });

  // ✅ Función para filtrar usuarios
  const filtrarUsuarios = () => {
    let resultado = [...usuarios]; // Clonar array para no mutar el original

    // Filtrar por rol si está seleccionado
    if (filtros.rol) {
      resultado = resultado.filter(usuario => usuario.role === filtros.rol);
    }

    // Filtrar por búsqueda (email, nombres, apellidos, matrícula)
    if (filtros.busqueda.trim()) {
      const termino = filtros.busqueda.toLowerCase().trim();
      resultado = resultado.filter(usuario => {
        const email = (usuario.email || '').toLowerCase();
        const nombres = (usuario.nombres || '').toLowerCase();
        const primerApellido = (usuario.primer_apellido || '').toLowerCase();
        const segundoApellido = (usuario.segundo_apellido || '').toLowerCase();
        const apellidosCompletos = `${primerApellido} ${segundoApellido}`.trim();
        const matricula = (usuario.matricula || '').toLowerCase();
        
        return email.includes(termino) || 
               nombres.includes(termino) || 
               primerApellido.includes(termino) ||
               segundoApellido.includes(termino) ||
               apellidosCompletos.includes(termino) ||
               matricula.includes(termino);
      });
    }

    setUsuariosFiltrados(resultado);
  };

  // ✅ Ejecutar filtrado cuando cambien filtros o usuarios
  useEffect(() => {
    filtrarUsuarios();
  }, [filtros, usuarios]);

  // Obtener usuarios
  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get("/api/users/usuarios/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(res.data);
      setUsuariosFiltrados(res.data); // ✅ Inicializar filtrados
    } catch (err) {
      setUsuarios([]);
      setUsuariosFiltrados([]); // ✅ También limpiar filtrados
      showError("Error", "No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // ✅ Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  // ✅ Validaciones iguales a RegisterEmpresa
  const validateForm = () => {
    // Validar nombres
    if (!newUser.nombres.trim()) {
      showError("Campo requerido", "El nombre es obligatorio");
      return false;
    } else if (newUser.nombres.trim().length < 2) {
      showError("Error de validación", "El nombre debe tener al menos 2 caracteres");
      return false;
    }

    // Validar primer apellido
    if (!newUser.primer_apellido.trim()) {
      showError("Campo requerido", "El primer apellido es obligatorio");
      return false;
    } else if (newUser.primer_apellido.trim().length < 2) {
      showError("Error de validación", "El apellido debe tener al menos 2 caracteres");
      return false;
    }

    // Validar segundo apellido (OPCIONAL)
    if (newUser.segundo_apellido && newUser.segundo_apellido.trim()) {
      if (newUser.segundo_apellido.trim().length < 2) {
        showError("Error de validación", "El segundo apellido debe tener al menos 2 caracteres");
        return false;
      }
    }

    // Validar email (CUALQUIER DOMINIO)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newUser.email.trim()) {
      showError("Campo requerido", "El correo electrónico es obligatorio");
      return false;
    } else if (!emailRegex.test(newUser.email)) {
      showError("Email inválido", "Ingresa un formato de correo válido (ejemplo@empresa.com)");
      return false;
    }

    // Validar contraseña
    if (!newUser.password) {
      showError("Campo requerido", "La contraseña es obligatoria");
      return false;
    } else {
      const passwordErrors = [];
      if (newUser.password.length < 8) {
        passwordErrors.push("8 caracteres mínimo");
      }
      if (!/[A-Z]/.test(newUser.password)) {
        passwordErrors.push("una mayúscula");
      }
      if (!/[a-z]/.test(newUser.password)) {
        passwordErrors.push("una minúscula");
      }
      if (!/\d/.test(newUser.password)) {
        passwordErrors.push("un número");
      }
      
      if (passwordErrors.length > 0) {
        showError("Contraseña débil", `Falta: ${passwordErrors.join(", ")}`);
        return false;
      }
    }

    // Validar confirmación de contraseña
    if (!newUser.confirm_password) {
      showError("Campo requerido", "Debes confirmar tu contraseña");
      return false;
    } else if (newUser.password !== newUser.confirm_password) {
      showError("Error de confirmación", "Las contraseñas no coinciden");
      return false;
    }

    return true;
  };

  // ✅ Función para limpiar el formulario
  const clearForm = () => {
    setNewUser({
      email: "",
      nombres: "",
      primer_apellido: "",
      segundo_apellido: "",
      password: "",
      confirm_password: "",
      role: "alumno",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // ✅ Función para cerrar modal y limpiar
  const closeModal = () => {
    setShowModal(false);
    clearForm();
  };

  // ✅ Añadir usuario con validaciones personalizadas
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // ✅ Validar antes de enviar
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");
      
      // ✅ Preparar payload
      const payload = {
        nombres: newUser.nombres.trim(),
        primer_apellido: newUser.primer_apellido.trim(),
        segundo_apellido: newUser.segundo_apellido.trim(),
        email: newUser.email.trim().toLowerCase(),
        password: newUser.password,
        confirm_password: newUser.confirm_password,
        role: newUser.role,
      };

      await axios.post("/api/users/register-empresa/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      closeModal();
      fetchUsuarios(); // ✅ Recargar usuarios
      showSuccess("¡Éxito!", "Usuario creado correctamente");
    } catch (error) {
      // ✅ Manejo de errores del servidor
      if (error.response?.data?.email && error.response.data.email[0]) {
        if (error.response.data.email[0].includes('already exists') || 
            error.response.data.email[0].includes('ya existe')) {
          showError("Email duplicado", "Este correo ya está registrado");
        } else {
          showError("Error de email", error.response.data.email[0]);
        }
      } else if (error.response?.data?.password) {
        showError("Error de contraseña", error.response.data.password[0] || "Error en la contraseña");
      } else if (error.response?.data?.non_field_errors) {
        showError("Error de validación", error.response.data.non_field_errors[0]);
      } else if (error.response?.data) {
        // Cualquier otro error del backend
        const backendErrors = error.response.data;
        const firstFieldWithError = Object.keys(backendErrors)[0];
        const errorMessage = Array.isArray(backendErrors[firstFieldWithError]) 
          ? backendErrors[firstFieldWithError][0] 
          : backendErrors[firstFieldWithError];
        
        showError("Error de validación", errorMessage);
      } else {
        showError("Error", "Error al registrarse. Verifica tus datos e intenta nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mostrar confirmación para eliminar
  const confirmDeleteUser = (userId, userName) => {
    setUserToDelete(userId);
    showConfirm(
      '¿Eliminar usuario?',
      `¿Estás seguro de que deseas eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`,
      () => handleDeleteUser(userId)
    );
  };

  // Función para eliminar usuario
  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`/api/users/usuarios/${userId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(usuarios => usuarios.filter(u => u.id !== userId));
      showSuccess("Eliminado", "Usuario eliminado correctamente");
    } catch (error) {
      if (error.response?.status === 403) {
        showError("Error", "No tienes permisos para eliminar este usuario");
      } else {
        showError("Error", "No se pudo eliminar el usuario");
      }
    }
  };

  return (
    <>
      <div className="usuarios-header">
        <h2>Gestión de Usuarios</h2>
        <button className="btn-add-usuario" onClick={() => setShowModal(true)}>
          <i className="ri-user-add-line"></i>
          Añadir usuario
        </button>
      </div>

      {/* ✅ FILTROS */}
      <div className="usuarios-filtros">
        <div className="filtro-busqueda">
          <i className="ri-search-line"></i>
          <input
            type="text"
            placeholder="Buscar por email, nombre, apellido o matrícula..."
            value={filtros.busqueda}
            onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
            className="input-busqueda"
          />
        </div>
        
        <div className="filtro-rol">
          <select
            value={filtros.rol}
            onChange={(e) => setFiltros({...filtros, rol: e.target.value})}
            className="select-rol-filtro"
          >
            <option value="">Todos los roles</option>
            {roles.map(rol => (
              <option key={rol.value} value={rol.value}>{rol.label}</option>
            ))}
          </select>
        </div>
        
        <button 
          className="btn-limpiar-filtros"
          onClick={() => setFiltros({ busqueda: '', rol: '' })}
        >
          <i className="ri-refresh-line"></i>
          Limpiar
        </button>
      </div>

      {showModal && (
        <div className="modal-usuarios">
          <form className="form-usuarios" onSubmit={handleAddUser}>
            <div className="form-usuarios-header">
              <h3>Nuevo Usuario</h3>
              <button 
                type="button" 
                className="btn-close-modal" 
                onClick={closeModal}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            
            <div className="form-usuarios-grid">
              <input 
                className="input-usuario"
                name="email" 
                type="email"
                value={newUser.email} 
                onChange={handleInputChange} 
                placeholder="Email *" 
              />

              <input 
                className="input-usuario"
                name="nombres" 
                value={newUser.nombres} 
                onChange={handleInputChange} 
                placeholder="Nombres *" 
              />

              <input 
                className="input-usuario"
                name="primer_apellido" 
                value={newUser.primer_apellido} 
                onChange={handleInputChange} 
                placeholder="Primer Apellido *" 
              />

              <input 
                className="input-usuario"
                name="segundo_apellido" 
                value={newUser.segundo_apellido} 
                onChange={handleInputChange} 
                placeholder="Segundo Apellido" 
              />
              
              {/* ✅ Campo de contraseña con ojito */}
              <div className="password-field">
                <input 
                  className="input-usuario"
                  name="password" 
                  type={showPassword ? "text" : "password"}
                  value={newUser.password} 
                  onChange={handleInputChange} 
                  placeholder="Contraseña *" 
                />
                <button 
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
                </button>
              </div>

              {/* ✅ Campo de confirmar contraseña con ojito */}
              <div className="password-field">
                <input 
                  className="input-usuario"
                  name="confirm_password" 
                  type={showConfirmPassword ? "text" : "password"}
                  value={newUser.confirm_password} 
                  onChange={handleInputChange} 
                  placeholder="Confirmar Contraseña *" 
                />
                <button 
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i className={showConfirmPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
                </button>
              </div>

              {/* ✅ Select de rol */}
              <select 
                className="input-usuario role-select-input" 
                name="role" 
                value={newUser.role} 
                onChange={handleInputChange}
              >
                {roles.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* ✅ Info de contraseña */}
            <p className="password-requirements">
              La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula y un número.
            </p>
            
            <div className="form-usuarios-actions">
              <button 
                className="btn-guardar" 
                type="submit"
                disabled={isSubmitting}
              >
                <i className={isSubmitting ? "ri-loader-4-line ri-spin" : "ri-save-line"}></i>
                {isSubmitting ? "Guardando..." : "Guardar Usuario"}
              </button>
              <button 
                className="btn-cancelar" 
                type="button" 
                onClick={closeModal}
                disabled={isSubmitting}
              >
                <i className="ri-close-line"></i>
                Cancelar
              </button>
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
              <th>Apellidos</th>
              {/* ✅ Mostrar columna matrícula solo si hay alumnos filtrados */}
              {usuariosFiltrados.some(u => u.role === 'alumno') && <th>Matrícula</th>}
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="loading-cell">
                  <div className="loading-spinner"></div>
                  Cargando usuarios...
                </td>
              </tr>
            ) : usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-cell">
                  <i className="ri-user-line"></i>
                  <p>
                    {usuarios.length === 0 
                      ? "No hay usuarios registrados." 
                      : "No se encontraron usuarios con los filtros aplicados."
                    }
                  </p>
                  {usuarios.length === 0 && (
                    <button 
                      className="btn-add-first-user" 
                      onClick={() => setShowModal(true)}
                    >
                      Crear primer usuario
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="user-email">
                      <i className="ri-mail-line"></i>
                      {u.email}
                    </div>
                  </td>
                  <td>{u.nombres}</td>
                  <td>{`${u.primer_apellido} ${u.segundo_apellido || ''}`.trim()}</td>
                  {/* ✅ Mostrar matrícula solo para alumnos y si hay alumnos filtrados */}
                  {usuariosFiltrados.some(user => user.role === 'alumno') && (
                    <td>
                      {u.role === 'alumno' ? (u.matricula || 'No asignada') : '-'}
                    </td>
                  )}
                  <td>
                    <span className={`role-badge role-${u.role}`}>
                      {roles.find(r => r.value === u.role)?.label || u.role}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-eliminar"
                      onClick={() => confirmDeleteUser(u.id, `${u.nombres} ${u.primer_apellido}`)}
                      title="Eliminar usuario"
                    >
                      <i className="ri-delete-bin-line"></i>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CustomAlert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={closeAlert}
        onConfirm={alert.onConfirm}
        showCancel={alert.showCancel}
        confirmText={alert.type === 'warning' && alert.showCancel ? 'Sí, eliminar' : 'Aceptar'}
        cancelText="Cancelar"
      />
    </>
  );
};

export default GestionUsuarios;