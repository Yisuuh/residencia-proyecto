import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import RegisterEmpresa from "./pages/RegisterEmpresa";
import DashboardAlumno from "./pages/DashboardAlumno";
import ExpedienteAlumno from "./pages/ExpedienteAlumno";
import VisorPDF from "./pages/VisorPDF";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import axios from "axios";
import 'remixicon/fonts/remixicon.css';
import DashboardEmpresa from "./pages/DashboardEmpresa";
import GestionProyectos from "./pages/gestion_proyectos";
import BancoAlumno from "./pages/BancoAlumno";
import DashboardJefeCarrera from "./pages/DashboardJefeCarrera";
import GestionUsuarios from "./pages/GestionUsuarios";

const alumnoMenuItems = [
  { name: "Inicio", path: "/dashboard/alumno/", icon: "ri-home-line" },
  { name: "Estado del Proyecto", path: "/dashboard/alumno/estado", icon: "ri-file-list-line" },
  { name: "Banco de Proyectos", path: "/dashboard/alumno/banco", icon: "ri-database-2-line" },
  { name: "Expediente", path: "/dashboard/alumno/expediente", icon: "ri-folder-line" },
];

const jefeMenuItems = [
  { name: "Inicio", path: "/dashboard/jefe/", icon: "ri-home-line" },
  { name: "Gestión de Usuarios", path: "/dashboard/jefe/usuarios", icon: "ri-user-settings-line" },
  { name: "Banco de Proyectos", path: "/dashboard/jefe/banco", icon: "ri-database-2-line" },
  { name: "Gestión de Proyectos", path: "/dashboard/jefe/gestion-proyectos", icon: "ri-briefcase-4-line" },
  { name: "Configuración del Sistema", path: "/dashboard/jefe/configuracion", icon: "ri-settings-3-line" },
  { name: "Reportes", path: "/dashboard/jefe/reportes", icon: "ri-bar-chart-2-line" },
  { name: "Expedientes", path: "/dashboard/jefe/expedientes", icon: "ri-folder-line" },
];

const AppContent = ({ user, setUser }) => {
  const location = useLocation();

  // Ocultar el Navbar en las rutas de Login y Register
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/register-empresa";

  return (
    <>
      {!hideNavbar && <Navbar user={user} />} {/* Renderiza el Navbar solo si no estás en Login o Register */}
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} /> {/* Pasa setUser */}
        <Route path="/register" element={<Register setUser={setUser} />} /> {/* Pasa setUser */}
        <Route path="/register-empresa" element={<RegisterEmpresa />} />
        <Route
          path="/"
          element={<Navigate to="/login" />}
        />
        <Route
          path="/dashboard/alumno"
          element={
            <ProtectedRoute>
              <DashboardAlumno />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/alumno/expediente"
          element={
            <ProtectedRoute>
              <ExpedienteAlumno />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/alumno/banco"
          element={
            <ProtectedRoute>
              <BancoAlumno menuItems={alumnoMenuItems} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/empresa"
          element={
            <ProtectedRoute>
              <DashboardEmpresa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/empresa/gestion-proyectos"
          element={
            <ProtectedRoute>
              <GestionProyectos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/jefe"
          element={
            <ProtectedRoute>
              <DashboardJefeCarrera />
            </ProtectedRoute>
          }
        />
         <Route
          path="/dashboard/jefe/usuarios"
          element={
            <ProtectedRoute>
              <GestionUsuarios />
            </ProtectedRoute>
          }
        />
         <Route
          path="/dashboard/jefe/banco"
          element={
            <ProtectedRoute>
              <BancoAlumno menuItems={jefeMenuItems} />
            </ProtectedRoute>
          }
        />
        <Route path="/visor-pdf" element={<VisorPDF />} />
      </Routes>
    </>
  );
};

const App = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    photo: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get("https://residencia-proyecto.onrender.com/api/users/me/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data); // Actualiza el estado con los datos del usuario
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <Router>
      <AppContent user={user} setUser={setUser} />
    </Router>
  );
};

export default App;