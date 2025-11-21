import React, { useState } from "react";
import InputField from "../components/inputField";
import Button from "../components/button";
import { registerEmpresa, getDashboardRoute } from "../api/auth";
import { useNavigate } from "react-router-dom";
import "./register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    nombres: "",
    primerApellido: "",
    segundoApellido: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({}); // Cambiado a objeto para múltiples errores
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false); // Estado de carga
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Limpiar error específico cuando el usuario empiece a escribir
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  // Validaciones
  const validateForm = () => {
    const newErrors = {};

    // Validar nombres
    if (!formData.nombres.trim()) {
      newErrors.nombres = "❌ El nombre es obligatorio";
    } else if (formData.nombres.trim().length < 2) {
      newErrors.nombres = "❌ El nombre debe tener al menos 2 caracteres";
    }

    // Validar primer apellido
    if (!formData.primerApellido.trim()) {
      newErrors.primerApellido = "❌ El primer apellido es obligatorio";
    } else if (formData.primerApellido.trim().length < 2) {
      newErrors.primerApellido = "❌ El apellido debe tener al menos 2 caracteres";
    }

    // Validar segundo apellido (OBLIGATORIO)
    if (!formData.segundoApellido.trim()) {
      newErrors.segundoApellido = "❌ El segundo apellido es obligatorio";
    } else if (formData.segundoApellido.trim().length < 2) {
      newErrors.segundoApellido = "❌ El segundo apellido debe tener al menos 2 caracteres";
    }

    // Validar email (CUALQUIER DOMINIO)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "❌ El correo electrónico es obligatorio";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "❌ Ingresa un formato de correo válido (ejemplo@empresa.com)";
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = "❌ La contraseña es obligatoria";
    } else {
      const passwordErrors = [];
      if (formData.password.length < 8) {
        passwordErrors.push("8 caracteres mínimo");
      }
      if (!/[A-Z]/.test(formData.password)) {
        passwordErrors.push("una mayúscula");
      }
      if (!/[a-z]/.test(formData.password)) {
        passwordErrors.push("una minúscula");
      }
      if (!/\d/.test(formData.password)) {
        passwordErrors.push("un número");
      }
      
      if (passwordErrors.length > 0) {
        newErrors.password = `❌ Falta: ${passwordErrors.join(", ")}`;
      }
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "❌ Debes confirmar tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "❌ Las contraseñas no coinciden";
    }

    return newErrors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    setLoading(true);

    // Validar formulario
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setLoading(false);
      return;
    }

    const payload = {
      nombres: formData.nombres.trim(),
      primer_apellido: formData.primerApellido.trim(),
      segundo_apellido: formData.segundoApellido.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      confirm_password: formData.confirmPassword,
    };

    try {
      const data = await registerEmpresa(payload);
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      const dashboardRoute = getDashboardRoute(data.role || "empresa");
      setSuccess("¡Registro exitoso! Redirigiendo al dashboard...");
      
      setTimeout(() => {
        navigate(dashboardRoute);
      }, 1500);
    } catch (err) {
      // Manejar errores del servidor
      if (err.email && err.email[0]) {
        if (err.email[0].includes('already exists') || err.email[0].includes('ya existe')) {
          setErrors({ email: "❌ Este correo ya está registrado" });
        } else {
          setErrors({ email: `❌ ${err.email[0]}` });
        }
      } else if (err.password) {
        setErrors({ password: `❌ ${err.password[0] || "Error en la contraseña"}` });
      } else if (err.non_field_errors) {
        setErrors({ general: `❌ ${err.non_field_errors[0]}` });
      } else {
        setErrors({ general: "❌ Error al registrarse. Verifica tus datos e intenta nuevamente." });
      }
    } finally {
      setLoading(false);
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
          <div>
            <InputField
              type="text"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              placeholder="Ingresa tus nombres"
              icon={<i className="ri-user-line"></i>}
            />
            {errors.nombres && <p className="field-error">{errors.nombres}</p>}
          </div>

          <div>
            <InputField
              type="text"
              name="primerApellido"
              value={formData.primerApellido}
              onChange={handleChange}
              placeholder="Ingresa tu primer apellido"
              icon={<i className="ri-user-line"></i>}
            />
            {errors.primerApellido && <p className="field-error">{errors.primerApellido}</p>}
          </div>

          <div>
            <InputField
              type="text"
              name="segundoApellido"
              value={formData.segundoApellido}
              onChange={handleChange}
              placeholder="Ingresa tu segundo apellido"
              icon={<i className="ri-user-line"></i>}
            />
            {errors.segundoApellido && <p className="field-error">{errors.segundoApellido}</p>}
          </div>

          <div>
            <InputField
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ingresa tu correo electrónico"
              icon={<i className="ri-mail-line"></i>}
            />
            <p className="company-email-info">
              Puedes usar cualquier correo electrónico de tu empresa o institución
            </p>
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          {/* CAMPO DE CONTRASEÑA CON OJITO */}
          <div>
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
                  color: "rgba(255, 255, 255, 0.8)",
                }}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
              </span>
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          {/* CAMPO DE CONFIRMAR CONTRASEÑA CON OJITO */}
          <div>
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
                  color: "rgba(255, 255, 255, 0.8)",
                }}
                onClick={() => setShowConfirm((prev) => !prev)}
              >
                <i className={showConfirm ? "ri-eye-off-line" : "ri-eye-line"}></i>
              </span>
            </div>
            {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
          </div>

          <p className="password-requirements">
            La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula y un número.
          </p>

          {errors.general && <p className="error">{errors.general}</p>}
          {success && <p className="success">{success}</p>}
          
          <div className="register-buttons">
            <Button 
              text={loading ? "REGISTRANDO..." : "REGISTRARSE"} 
              type="submit" 
              disabled={loading}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;