import React, { useState, useEffect } from "react";
import "./CompleteProfileForm.css";

const CompleteProfileForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    matricula: "",
    especialidad: "",
    ingreso: "",
    telefono: "",
    foto: null,
  });
  
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ NUEVO: Prevenir scroll del body cuando el modal esté abierto
  useEffect(() => {
    document.body.classList.add('modal-open');
    
    // Cleanup cuando el componente se desmonte
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpiar error específico cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, foto: file });

    // Limpiar error de foto
    if (errors.foto) {
      setErrors({ ...errors, foto: "" });
    }

    // Generar una URL temporal para la vista previa
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    } else {
      setPreview(null);
    }
  };

  // Validaciones personalizadas
  const validateForm = () => {
    const newErrors = {};

    // Validar matrícula (formato: E seguido de 8 dígitos, ej: E20080894)
    if (!formData.matricula.trim()) {
      newErrors.matricula = "❌ La matrícula es obligatoria";
    } else if (formData.matricula.trim().length !== 9) {
      newErrors.matricula = "❌ La matrícula debe tener exactamente 9 caracteres";
    } else if (!/^E\d{8}$/i.test(formData.matricula.trim())) {
      newErrors.matricula = "❌ Formato de matrícula inválido (ej: E20080894)";
    }

    // Validar especialidad
    if (!formData.especialidad) {
      newErrors.especialidad = "❌ Debes seleccionar una especialidad";
    }

    // Validar semestre de ingreso
    if (!formData.ingreso) {
      newErrors.ingreso = "❌ Debes seleccionar tu semestre de ingreso";
    }

    // Validar teléfono (formato mexicano)
    if (!formData.telefono.trim()) {
      newErrors.telefono = "❌ El teléfono es obligatorio";
    } else {
      const cleanPhone = formData.telefono.replace(/[\s\-\(\)]/g, '');
      if (cleanPhone.length !== 10) {
        newErrors.telefono = "❌ El teléfono debe tener exactamente 10 dígitos";
      } else if (!/^\d{10}$/.test(cleanPhone)) {
        newErrors.telefono = "❌ El teléfono solo debe contener números";
      }
    }

    // Validar foto
    if (!formData.foto) {
      newErrors.foto = "❌ Debes subir una foto de perfil";
    } else {
      const fileName = formData.foto.name.toLowerCase();
      const allowedExtensions = ['.jpg', '.jpeg', '.png']; // ✅ Quitado .gif
      const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
      
      if (!hasValidExtension) {
        newErrors.foto = "❌ Solo se permiten archivos JPG o PNG"; // ✅ Actualizado mensaje
      } else if (formData.foto.size > 500 * 1024) { // 500KB máximo
        newErrors.foto = "❌ La imagen debe ser menor a 500KB";
      } else if (formData.foto.size < 5 * 1024) { // 5KB mínimo
        newErrors.foto = "❌ La imagen es demasiado pequeña (mínimo 5KB)";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
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
      await onSubmit(formData);
    } catch (error) {
      // Manejar errores del servidor
      if (error.matricula) {
        setErrors({ matricula: `❌ ${error.matricula[0] || "Error en la matrícula"}` });
      } else if (error.email) {
        setErrors({ general: "❌ Error al guardar el perfil" });
      } else {
        setErrors({ general: "❌ Error inesperado. Intenta nuevamente." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complete-profile-overlay">
      <div className="complete-profile-form-container">
        <h2>Completa tu Perfil</h2>
        <p className="form-description">
          Todos los campos marcados con <span className="required">*</span> son obligatorios
        </p>
        
        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Vista previa" />
          </div>
        )}
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="matricula">
              Matrícula <span className="required">*</span>
            </label>
            <input
              type="text"
              id="matricula"
              name="matricula"
              placeholder="Ej: E20080894"
              value={formData.matricula}
              onChange={handleChange}
              className={errors.matricula ? "input-error" : ""}
              maxLength="9"
            />
            {errors.matricula && <p className="field-error">{errors.matricula}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="especialidad">
              Especialidad <span className="required">*</span>
            </label>
            <select
              id="especialidad"
              name="especialidad"
              value={formData.especialidad}
              onChange={handleChange}
              className={errors.especialidad ? "input-error" : ""}
            >
              <option value="" disabled>Especialidad</option>
              <option value="desarrollo_web">Desarrollo Web</option>
              <option value="ciberseguridad">Ciberseguridad</option>
              <option value="ia">Inteligencia Artificial</option>
            </select>
            {errors.especialidad && <p className="field-error">{errors.especialidad}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="ingreso">
              Semestre de Ingreso <span className="required">*</span>
            </label>
            <select 
              id="ingreso"
              name="ingreso" 
              value={formData.ingreso} 
              onChange={handleChange}
              className={errors.ingreso ? "input-error" : ""}
            >
              <option value="" disabled>Ingreso</option>
              {[...Array(12).keys()].map((i) => (
                <option key={i + 1} value={i + 1}>
                  Semestre {i + 1}
                </option>
              ))}
              <option value="12+">Semestre 12+</option>
            </select>
            {errors.ingreso && <p className="field-error">{errors.ingreso}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="telefono">
              Teléfono <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              placeholder="Ej: 9991234567"
              value={formData.telefono}
              onChange={handleChange}
              className={errors.telefono ? "input-error" : ""}
              maxLength="10"
            />
            <p className="input-hint">Ingresa tu número de 10 dígitos sin espacios</p>
            {errors.telefono && <p className="field-error">{errors.telefono}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="foto">
              Foto de Perfil <span className="required">*</span>
            </label>
            <label htmlFor="foto" className={`custom-file-upload ${errors.foto ? 'file-error' : ''}`}>
              <i className="ri-camera-line"></i>
              {formData.foto ? "Cambiar Foto" : "Subir Foto"}
            </label>
            <input
              type="file"
              id="foto"
              name="foto"
              accept="image/jpeg,image/jpg,image/png" // ✅ Solo JPG y PNG
              onChange={handleFileChange}
            />
            <p className="input-hint">Máximo 500KB - Formatos: JPG, PNG</p>
            {errors.foto && <p className="field-error">{errors.foto}</p>}
          </div>

          {errors.general && <p className="error">{errors.general}</p>}

          <button type="submit" className="submit-btn" disabled={loading}>
            <i className="ri-save-line"></i>
            {loading ? "Guardando..." : "Guardar Perfil"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfileForm;