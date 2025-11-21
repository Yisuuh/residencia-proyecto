// client/src/hooks/useAlert.js
import { useState } from 'react';

export const useAlert = () => {
  const [alert, setAlert] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    showCancel: false
  });

  const showAlert = (type, title, message, onConfirm = null, showCancel = false) => {
    setAlert({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
      showCancel
    });
  };

  const closeAlert = () => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  };

  return {
    alert,
    showAlert,
    closeAlert,
    showSuccess: (title, message) => showAlert('success', title, message),
    showError: (title, message) => showAlert('error', title, message),
    showWarning: (title, message) => showAlert('warning', title, message),
    showInfo: (title, message) => showAlert('info', title, message),
    showConfirm: (title, message, onConfirm) => showAlert('warning', title, message, onConfirm, true)
  };
};