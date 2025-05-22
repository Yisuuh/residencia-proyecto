import React, { useState } from "react";
import { login, getDashboardRoute, fetchCurrentUser } from "../api/auth";
import InputField from "../components/inputField";
import Button from "../components/button";
import './login.css';
import { useNavigate } from "react-router-dom";


const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Nuevo estado
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
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
      setError(err.detail || "Error al iniciar sesión");
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
          <InputField
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingresa tu correo electrónico"
            icon={<i className="ri-mail-line"></i>}
          />
          <div style={{ position: "relative" }}>
            <InputField
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                padding: 0
              }}
              tabIndex={-1}
            >
              <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
            </button>
          </div>
          {error && <p className="error">{error}</p>}
          <div className="login-buttons">
            <Button text="INICIAR SESIÓN" type="submit" />
            <Button text="REGISTRARSE" onClick={() => navigate("/register")} />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;