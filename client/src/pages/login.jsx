import React, { useState } from "react";
import { login, getDashboardRoute, fetchCurrentUser } from "../api/auth";
import InputField from "../components/inputField";
import Button from "../components/button";
import './login.css';
import { useNavigate } from "react-router-dom";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({}); // Cambiado a objeto para múltiples errores
  const [loading, setLoading] = useState(false); // Estado de carga
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    if (field === 'email') {
      setEmail(value);
    } else {
      setPassword(value);
    }
    // Limpiar error específico cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  // Validaciones del frontend
  const validateForm = () => {
    const newErrors = {};

    // Validar email
    if (!email.trim()) {
      newErrors.email = "❌ El correo electrónico es obligatorio";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "❌ Ingresa un formato de correo válido";
      }
    }

    // Validar contraseña
    if (!password.trim()) {
      newErrors.password = "❌ La contraseña es obligatoria";
    } else if (password.length < 4) {
      newErrors.password = "❌ La contraseña es demasiado corta";
    }

    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validar formulario
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await login(email, password);
      const { access, refresh, role } = response;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      // Obtén los datos actualizados del usuario
      const userData = await fetchCurrentUser();
      setUser({ ...userData, role });

      const dashboardRoute = getDashboardRoute(role);
      navigate(dashboardRoute);
    } catch (err) {
      // Manejar diferentes tipos de errores del servidor
      if (err.detail) {
        if (err.detail.includes('No active account') || err.detail.includes('Invalid credentials')) {
          setErrors({ general: "❌ Correo o contraseña incorrectos" });
        } else if (err.detail.includes('Unable to log in')) {
          setErrors({ general: "❌ No se pudo iniciar sesión. Verifica tus credenciales" });
        } else {
          setErrors({ general: `❌ ${err.detail}` });
        }
      } else if (err.email) {
        setErrors({ email: `❌ ${err.email[0] || "Error en el correo"}` });
      } else if (err.password) {
        setErrors({ password: `❌ ${err.password[0] || "Error en la contraseña"}` });
      } else if (err.non_field_errors) {
        setErrors({ general: `❌ ${err.non_field_errors[0]}` });
      } else {
        setErrors({ general: "❌ Error de conexión. Intenta nuevamente" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="overlay" />
      <div className="login-form">
        <div className="login-logos">
          <img src="/images/logoimec.png" alt="Logo IMEC" />
          <div className="login-separator" />
          <img src="/images/logotec.png" alt="Logo Tec" />
        </div>
        <div className="login-header">
          <h1>¡Bienvenido de nuevo!</h1>
          <span>Por favor inicia sesión al SRRP con tu correo institucional</span>
        </div>
        <form onSubmit={handleLogin}>
          <div>
            <InputField
              type="email"
              value={email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Ingresa tu correo electrónico"
              icon={<i className="ri-mail-line"></i>}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div>
            <div style={{ position: "relative" }}>
              <InputField
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Ingresa tu contraseña"
                icon={<i className="ri-lock-line"></i>}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "white",
                  padding: 0
                }}
                tabIndex={-1}
              >
                <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          {errors.general && <p className="error">{errors.general}</p>}
          
          <div className="login-buttons">
            <Button 
              text={loading ? "INICIANDO SESIÓN..." : "INICIAR SESIÓN"} 
              type="submit" 
              disabled={loading}
            />
            <Button text="REGISTRARSE" onClick={() => navigate("/register")} />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;