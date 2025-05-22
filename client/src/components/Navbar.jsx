import React from "react";
import "./Navbar.css"; // Archivo CSS para estilos

const Navbar = ({ user }) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/images/logoimec.png" alt="Logo" className="logo" /> {/* Cambia la ruta del logo si es necesario */}
        <span className="navbar-title">SRRP</span>
      </div>
      <div className="navbar-right">
        <div className="navbar-notifications">
          <i className="ri-notification-3-line"></i> {/* Icono de campana */}
        </div>
        <div className="navbar-user">
          <img src={user.photo} alt="Usuario" className="user-photo" />
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-email">{user.email}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;