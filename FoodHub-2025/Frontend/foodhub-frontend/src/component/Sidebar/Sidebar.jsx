import React from "react";
import "./Sidebar.css"; // Tambahkan file CSS untuk styling
import signoutIcon from "../../assets/SignOutIconNBG2.png";
import orderIcon from "../../assets/OrderIconNBG2.png";
import productIcon from "../../assets/ProductIconNBG2.png";
import settingsIcon from "../../assets/SettingIconNBG2.png";
import messageIcon from "../../assets/MessageIconNBG2.png";
import homeIcon from "../../assets/DashboardIconNBG2.png";






const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Food<span className="highlight">•Hub</span></h2>
      <ul>
        <li><img src={homeIcon} alt="Dashboard" className="sidebar-icon" />
        DashBoard</li>
        <li className="active">
    <img src={orderIcon} alt="Order" className="sidebar-icon" />
    Order
  </li>
        <li><img src={productIcon} alt="Products" className="sidebar-icon" />
        Products</li>
        <li><img src={messageIcon} alt="Messages" className="sidebar-icon" />
        Messages</li>
        <li> <img src={settingsIcon} alt="Settings" className="sidebar-icon" />
        Settings</li>
        <li> <img src={signoutIcon} alt="Sign Out" className="sidebar-icon" />
        Sign Out</li>
      </ul>
    </div>
  );
};

export default Sidebar;
  