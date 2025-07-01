import React, { useEffect, useState } from "react";
import "./Modal.css";

const Modal = ({ isOpen, onClose, children }) => {
  const [show, setShow] = useState(isOpen);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (isOpen) setShow(true);
    else if (show) {
      setClosing(true);
      setTimeout(() => {
        setShow(false);
        setClosing(false);
      }, 220); // Debe coincidir con la duración de modalPopOut
    }
  }, [isOpen]);

  if (!show) return null;

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setShow(false);
      setClosing(false);
      onClose();
    }, 220);
  };

  return (
    <div className={`modal-overlay${closing ? " closing" : ""}`}>
      <div className={`modal-content${closing ? " closing" : ""}`}>
        <button className="modal-close" onClick={handleClose} aria-label="Cerrar">
          <i className="ri-close-line"></i>
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;