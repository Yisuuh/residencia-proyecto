import axios from "axios";

const API_URL = "/api/users"; // Cambia según tu configuración

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login/`, { email, password });
    // Guarda el token en localStorage
    localStorage.setItem("access_token", response.data.access);
    localStorage.setItem("refresh_token", response.data.refresh);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Error de conexión");
  }
};

export const register = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/register/`, formData);
    // Guarda el token en localStorage
    localStorage.setItem("access_token", response.data.access);
    localStorage.setItem("refresh_token", response.data.refresh);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Error de conexión");
  }
};

export const getDashboardRoute = (role) => {
  switch (role) {
    case "alumno":
      return "/dashboard/alumno/";
    case "empresa":
      return "/dashboard/empresa/";
    case "jefe_carrera":
      return "/dashboard/jefe/";
    case "coordinador":
      return "/dashboard/coordinador/";
    case "academia":
      return "/dashboard/academia/";
    // Agrega más roles si los tienes
    default:
      return "/";
  }
};

export const registerEmpresa = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/register-empresa/`, formData);
    // Guarda el token en localStorage si el backend los devuelve
    localStorage.setItem("access_token", response.data.access);
    localStorage.setItem("refresh_token", response.data.refresh);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Error de conexión");
  }
};

export const fetchCurrentUser = async () => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("No token found");
  const response = await axios.get("/api/users/me/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};