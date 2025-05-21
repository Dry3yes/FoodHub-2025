"use client";

import { useState } from "react";
import "../styles/Header.css";
import logo from "../assets/logo.png";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container">
          <img src={logo || "/chef.png"} alt="FoodHub" className="logo" />
          <h1>FoodHub</h1>
        </div>

        <div
          className={`menu-button ${menuOpen ? "active" : ""}`}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        <nav className={`nav-menu ${menuOpen ? "active" : ""}`}>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#menu">Menu</a></li>
            <li className="login-mobile-only">
              <button className="btn-login">Login</button>
            </li>
          </ul>
        </nav>

        <div className="login-desktop-only">
          <button className="btn-login">Login</button>
        </div>
      </div>
    </header>
  );
}

export default Header;
