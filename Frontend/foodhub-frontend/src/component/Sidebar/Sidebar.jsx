import React from "react";
import "./Sidebar.css"; // Tambahkan file CSS untuk styling



const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Food<span className="highlight">•Hub</span></h2>
      <ul>
        <li>🏠 DashBoard </li>
        <li className="active">🛒 Order</li>
        <li>📦 Products</li>
        <li>💬 Messages</li>
        <li> ⚙ Settings</li>
        <li>🚪 Sign Out</li>
      </ul>
    </div>
  );
};

export default Sidebar;
  