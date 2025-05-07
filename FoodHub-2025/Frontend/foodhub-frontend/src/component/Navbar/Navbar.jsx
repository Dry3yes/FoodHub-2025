import React from "react";
import { FaChevronDown } from "react-icons/fa"; // Import icon dropdown
import "./Navbar.css"; // Pastikan ada CSS yang sesuai
import UserProfile from '../../assets/UserProfile.jpg';

const Navbar = ({ name = "Mikolas" }) => {
  return (
    <div className="navbar">
      <div className="profile-container">
        <img src={UserProfile} alt="User Profile" className="profile-img" />
        <span className="welcome-text">
          <strong>Welcome</strong>, {name}
          <FaChevronDown className="dropdown-icon" />
        </span>
      </div>
    </div>
  );
};

export default Navbar;

