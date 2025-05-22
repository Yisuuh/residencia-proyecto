import React, { useState } from "react";
import "./CompleteProfileForm.css"; // Archivo CSS para estilos

const CompleteProfileForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    matricula: "",
    especialidad: "desarrollo_web",
    ingreso: "1",
    telefono: "",
    foto: null,
  });
  const [preview, setPreview] = useState(null); // Estado para la vista previa de la imagen

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, foto: file });

    // Generar una URL temporal para la vista previa
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // Llama a la función pasada como prop para manejar el envío
  };

  return (
    <div className="complete-profile-overlay">
      <div className="complete-profile-form-container">
        <h2>Completa tu Perfil</h2>
        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Vista previa" />
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="matricula"
            placeholder="Matrícula"
            value={formData.matricula}
            onChange={handleChange}
            required
          />
          <select
            name="especialidad"
            value={formData.especialidad}
            onChange={handleChange}
          >
            <option value="desarrollo_web">Desarrollo Web</option>
            <option value="ciberseguridad">Ciberseguridad</option>
            <option value="ia">Inteligencia Artificial</option>
          </select>
          <select name="ingreso" value={formData.ingreso} onChange={handleChange}>
            {[...Array(12).keys()].map((i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
            <option value="12+">12+</option>
          </select>
          <input
            type="text"
            name="telefono"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={handleChange}
            required
          />
          <label htmlFor="foto" className="custom-file-upload">
            Subir Foto
          </label>
          <input
            type="file"
            id="foto"
            name="foto"
            onChange={handleFileChange}
            required
          />
          <button type="submit">Guardar</button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfileForm;