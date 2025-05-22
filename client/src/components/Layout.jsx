import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Menubar";
import "./Layout.css"; // Archivo CSS para estilos

const Layout = ({ menuItems, children, user }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="layout">
      <div className="layout-container">
        <Sidebar
          menuItems={menuItems}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
        <div className={`layout-content ${isSidebarCollapsed ? "collapsed" : ""}`}>
          {children} {/* Aquí se inyectará el contenido específico de cada página */}
        </div>
      </div>
    </div>
  );
};

export default Layout;