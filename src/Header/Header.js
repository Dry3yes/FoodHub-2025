import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const [showSearch, setShowSearch] = useState(false);

    const toggleSearch = () => {
        setShowSearch(!showSearch);
    };

    return (
        <header className="fixed-header">
            <div className="navbar">
                {/* Left side - Logo */}
                <div className="nav-logo">
                    <img src="/Images/MainLogo.png" alt="Main Logo" />
                </div>

                {/* Middle - Navigation Links */}
                <div className="nav-links">
                    <Link to="/FindStore" className="nav-link">Menu</Link>
                    <Link to="/HomePage" className="nav-link">Home</Link>
                    <Link to="/AboutUs" className="nav-link">About Us</Link>
                    <Link to="/settings" className="nav-link">Settings</Link>
                    <Link to="/StorePage" className="nav-link">Store</Link>
                </div>

                {/* Right side - Icons and Buttons */}
                <div className="nav-actions">
                    <div className="nav-icons">
                        <div className="search-section">
                            <button className="icon-button" onClick={toggleSearch}>
                                <img src="/Images/Search_MagnifyingGlass.png" alt="Search" className="nav-icon" />
                            </button>
                            {showSearch && (
                                <div className="search-container">
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Search..."
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>
                        <button className="icon-button">
                            <img src="/Images/Notification_Bell.png" alt="Notifications" className="nav-icon" />
                        </button>
                        <button className="icon-button">
                            <img src="/Images/Cart_cart.png" alt="Cart" className="nav-icon" />
                        </button>
                    </div>
                    <div className="auth-buttons">
                        <Link to="/register">
                            <button className="signup-btn">Sign Up</button>
                        </Link>
                        <Link to="/login">
                            <button className="signin-btn">Sign In</button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;