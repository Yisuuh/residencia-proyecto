import React from "react";
import "./button.css"; // Asegúrate de tener un archivo CSS para estilos

const Button = ({ text, onClick, type = "button" }) => {
  return (
    <button type={type} onClick={onClick} className="btn">
      {text}
    </button>
  );
};

export default Button;