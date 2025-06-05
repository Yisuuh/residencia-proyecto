import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Menubar";
import "./Layout.css";

const Layout = ({ menuItems, children, user }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="layout">
      <Navbar user={user} />
      <div className="layout-container">
        <Sidebar
          menuItems={menuItems}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
        <div className={`layout-content ${isSidebarCollapsed ? "collapsed" : ""}`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;