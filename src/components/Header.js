import { Link } from "react-router-dom"
import { useCart } from "../hooks/useCart"
import "../styles/Header.css"
import logo from "../assets/logo.png";

function Header() {
  const { items } = useCart()
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo-link">
          <div className="logo">
            <img src={logo} alt="Logo" />
          </div>
          <span className="logo-text">FoodHub</span>
        </Link>

        <nav className="nav-menu">
          <Link to="/landing" className="nav-link">
            Home
          </Link>
          <Link 
            to="/landing#about" 
            className="nav-link"
            onClick={(e) => {
              if (window.location.pathname === '/landing') {
                e.preventDefault();
                window.history.pushState({}, '', '#about');
                const aboutSection = document.getElementById('about');
                if (aboutSection) {
                  aboutSection.scrollIntoView({ behavior: 'smooth' });
                }
              }
            }}
          >
            About Us
          </Link>
          <Link to="/" className="nav-link">
            Menu
          </Link>
        </nav>

        <div className="header-actions">
          { localStorage.getItem('token') ? (
            <>
              <Link to="/cart" className="cart-button-container">
                <button className="cart-button">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="cart-icon"
                  >
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                </button>
              </Link>
              <Link to="/settings" className="settings-button">
                <button className="settings-button">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="settings-icon"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"></path>
                    <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path>
                  </svg>
                </button>
              </Link>
              <button
                className="logout-btn"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="login-button">Login</Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
