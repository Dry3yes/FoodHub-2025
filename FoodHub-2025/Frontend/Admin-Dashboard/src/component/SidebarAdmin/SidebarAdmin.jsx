import React from "react";
import "./Sidebar.css"; // Tambahkan file CSS untuk styling
import signoutIcon from "../../assets/SignOutIconNBG2.png";
import homeIcon from "../../assets/DashboardIconNBG2.png";






const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Food<span className="highlight">•Hub</span></h2>
      <ul>
        
        <li className="active">
        <img src={homeIcon} alt="Dashboard" className="sidebar-icon" />
        DashBoard
  </li>
        <li> <img src={signoutIcon} alt="Sign Out" className="sidebar-icon" />
        Sign Out</li>
      </ul>
    </div>
  );
};

export default Sidebar;
  