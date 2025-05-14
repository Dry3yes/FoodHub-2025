import React from "react";
import "./Navbar.css"; // Pastikan ada CSS yang sesuai
import UserProfile from '../../assets/UserProfile.jpg';
import Dropdown from '../../assets/DropDownIcon.png';


const Navbar = ({ name = "Mikolas" }) => {
  return (
    <div className="navbar">
      <div className="profile-container">
        <img src={UserProfile} alt="User Profile" className="profile-img" />
        <span className="welcome-text">
          <strong>Welcome</strong>, {name}
          <img src={Dropdown} alt="Dropdown" className="dropdown-icon" />
        </span>
      </div>
    </div>
  );
};

export default Navbar;

