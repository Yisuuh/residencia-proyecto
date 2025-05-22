import React from "react";
import "./Modal.css"; // Archivo CSS para los estilos del modal

const Modal = ({ isOpen, onClose, children, className = "" }) => {
  if (!isOpen) return null; // Si el modal no está abierto, no renderiza nada

  return (
    <div className="modal-overlay">
      <div className={`modal ${className}`}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
};

export default Modal;