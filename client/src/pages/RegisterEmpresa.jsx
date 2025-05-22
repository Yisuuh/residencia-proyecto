import React, { useState } from "react";
import InputField from "../components/inputField";
import Button from "../components/button";
import { registerEmpresa, getDashboardRoute } from "../api/auth"; // Importa la función para obtener la ruta del dashboard
import { useNavigate } from "react-router-dom";
import "./register.css"; // Archivo CSS para estilos

const Register = () => {
  const [formData, setFormData] = useState({
    nombres: "",
    primerApellido: "",
    segundoApellido: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate(); // Hook para redirigir

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const payload = {
      nombres: formData.nombres,
      primer_apellido: formData.primerApellido,
      segundo_apellido: formData.segundoApellido,
      email: formData.email,
      password: formData.password,
      confirm_password: formData.confirmPassword,
    };

    if (payload.password !== payload.confirm_password) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const data = await registerEmpresa(payload); // Envía los datos al backend
      localStorage.setItem("access_token", data.access); // Guarda el token de acceso
      localStorage.setItem("refresh_token", data.refresh); // Guarda el token de refresco

      // Obtén la ruta del dashboard según el rol
      const dashboardRoute = await getDashboardRoute();
      setSuccess("Registro exitoso. Redirigiendo al dashboard...");
      setError("");
      navigate(dashboardRoute); // Redirige al dashboard correspondiente
    } catch (err) {
      setError(err.detail || "Error al registrarse.");
    }
  };

  return (
    <div className="register-page">
      <div className="overlay" />
      <div className="register-form">
        <div className="register-header">
          <h1>Registro</h1>
          <span>Exclusivo para Empresas e Instituciones</span>
          <span>Por favor completa el formulario para registrarte</span>
        </div>
        <form onSubmit={handleRegister}>
          <InputField
            type="text"
            name="nombres"
            value={formData.nombres}
            onChange={handleChange}
            placeholder="Ingresa tus nombres"
            icon={<i className="ri-user-line"></i>}
          />
          <InputField
            type="text"
            name="primerApellido"
            value={formData.primerApellido}
            onChange={handleChange}
            placeholder="Ingresa tu primer apellido"
            icon={<i className="ri-user-line"></i>}
          />
          <InputField
            type="text"
            name="segundoApellido"
            value={formData.segundoApellido}
            onChange={handleChange}
            placeholder="Ingresa tu segundo apellido"
            icon={<i className="ri-user-line"></i>}
          />
          <InputField
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Ingresa tu correo electrónico"
            icon={<i className="ri-mail-line"></i>}
          />
          <div style={{ position: "relative" }}>
            <InputField
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña"
              icon={<i className="ri-lock-line"></i>}
            />
            <span
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
              }}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <i
                className={
                  showPassword ? "ri-eye-off-line" : "ri-eye-line"
                }></i
              >
            </span>
          </div>
          <div style={{ position: "relative" }}>
            <InputField
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirma tu contraseña"
              icon={<i className="ri-lock-line"></i>}
            />
            <span
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
              }}
              onClick={() => setShowConfirm((prev) => !prev)}
            >
              <i
                className={
                  showConfirm ? "ri-eye-off-line" : "ri-eye-line"
                }></i
              >
            </span>
          </div>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <div className="register-buttons">
            <Button text="REGISTRARSE" type="submit" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;