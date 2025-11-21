import React from 'react';
import './CustomAlert.css';

const CustomAlert = ({
  type = 'info',
  title,
  message,
  isOpen,
  onClose,
  onConfirm,
  showCancel = false,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar'
}) => {
  if (!isOpen) return null;

  // ✅ Íconos actualizados - Success con ícono diferente
  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'ri-checkbox-circle-line'; // ✅ Cambié a este ícono
      case 'error':
        return 'ri-error-warning-fill';
      case 'warning':
        return 'ri-alert-fill';
      case 'info':
        return 'ri-information-fill';
      default:
        return 'ri-information-fill';
    }
  };

  return (
    <div className="custom-alert-overlay">
      <div className="custom-alert-container">
        <div className={`custom-alert-header ${type}`}>
          <div className="custom-alert-icon">
            <i className={getIcon()}></i>
          </div>
          <h3 className="custom-alert-title">{title}</h3>
        </div>
        
        <div className="custom-alert-body">
          <p className="custom-alert-message">{message}</p>
        </div>
        
        <div className="custom-alert-buttons">
          {showCancel && (
            <button 
              className="custom-alert-button cancel" 
              onClick={onClose}
            >
              <i className="ri-close-line"></i>
              {cancelText}
            </button>
          )}
          <button 
            className="custom-alert-button confirm" 
            onClick={onConfirm || onClose}
          >
            <i className="ri-check-line"></i>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;