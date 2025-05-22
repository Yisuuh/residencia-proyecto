import React from "react";
import "./Menubar.css"; // Archivo CSS para estilos
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ menuItems, isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <button className="toggle-button" onClick={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? ">" : "<"}
      </button>

      <ul className="menu">
  {menuItems.map((item) => (
    <li
      key={item.name}
      className={location.pathname === item.path ? "active" : ""}
      onClick={() => navigate(item.path)}
    >
      <i className={item.icon}></i>
      <span className={`menu-text ${isCollapsed ? "hidden" : ""}`}>{item.name}</span>
    </li>
  ))}
</ul>



      <li className="logout" onClick={handleLogout}>
        <i className="ri-logout-box-line"></i>
        <span className={`menu-text ${isCollapsed ? "hidden" : ""}`}>Cerrar Sesión</span>
      </li>
    </div>
  );
};

export default Sidebar;