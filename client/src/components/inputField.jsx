import React from "react";
import "./inputField.css";

const InputField = ({ 
  label, 
  type = "text", 
  name, 
  value, 
  onChange, 
  placeholder, 
  icon,
  options = null, // ✅ NUEVO: Para opciones del select
  ...props 
}) => {
  return (
    <div className="input-field">
      {label && <label>{label}</label>}
      <div className="input-container">
        {icon && <span className="input-icon">{icon}</span>}
        
        {/* ✅ NUEVO: Renderizar select si se pasan opciones */}
        {options ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className="input-select"
            {...props}
          >
            {options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            {...props}
          />
        )}
      </div>
    </div>
  );
};

export default InputField;
