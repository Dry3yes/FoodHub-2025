// components/Navbar.jsx
import React from "react";
import "./Navbar.css";

import UserProfile from '../../assets/UserProfile.jpg';
import Dropdown from '../../assets/DropDownIcon.png';
import Logo from '../../assets/FoodHubLogo.png'; // Gambar logo FoodHub
import CartIcon from '../../assets/OrderIcon.png'; // Gambar ikon cart (keranjang)

const Navbar = ({ name = "Mikolas", orderCount = 2 }) => {
  return (
    <div className="navbar">
      <div className="navbar-logo">
        <img src={Logo} alt="FoodHub Logo" className="logo-img" />
      </div>

      <div className="navbar-links">
        <a href="">Home</a>
        <a href="">About Us</a>
        <a href="">Menu</a>
      </div>

      <div className="navbar-right">
        <div className="cart-icon-wrapper" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <img src={CartIcon} alt="Cart" className="cart-icon" />
          <span className="cart-badge">{orderCount}</span> 
        </div>
        <div className="profile-container" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <img src={UserProfile} alt="User Profile" className="profile-img" />
          <span className="welcome-text">
            {name}
            <img src={Dropdown} alt="Dropdown" className="dropdown-icon" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
