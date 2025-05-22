import React from "react";
import "./inputField.css";

const InputField = ({ label, type, name, value, onChange, placeholder, icon }) => {
  return (
    <div className="input-field">
      {label && <label>{label}</label>}
      <div className="input-container">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          type={type}
          name={name} // ✅ CLAVE
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default InputField;
