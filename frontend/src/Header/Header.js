import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
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
                    <Link to="/" className="nav-link">Menu</Link>
                    <Link to="/HomePage" className="nav-link">Home</Link>
                    <Link to="/about" className="nav-link">About Us</Link>
                </div>

                {/* Right side - Icons and Buttons */}
                <div className="nav-actions">
                    <div className="nav-icons">
                        <button className="icon-button">
                            <img src="/Images/search-icon.png" alt="Search" className="nav-icon" />
                        </button>
                        <button className="icon-button">
                            <img src="/Images/notification-icon.png" alt="Notifications" className="nav-icon" />
                        </button>
                        <button className="icon-button">
                            <img src="/Images/cart-icon.png" alt="Cart" className="nav-icon" />
                        </button>
                    </div>
                    <div className="auth-buttons">
                        {user ? (
                            <button className="logout-btn" onClick={handleLogout}>Logout</button>
                        ) : (
                            <>
                                <Link to="/register">
                                    <button className="signup-btn">Sign Up</button>
                                </Link>
                                <Link to="/login">
                                    <button className="signin-btn">Sign In</button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;