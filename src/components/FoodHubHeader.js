import { Link } from "react-router-dom"
import { useCart } from "../hooks/useCart"
import "../styles/FoodHubHeader.css"
import logo from "../assets/logo.png";

function FoodHubHeader() {
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
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/about-us" className="nav-link">
            About Us
          </Link>
          <Link to="/menu" className="nav-link">
            Menu
          </Link>
        </nav>

        <div className="header-actions">
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

          { localStorage.getItem('token') ? (
            <button
            className="logout-btn"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="login-button">Login</Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default FoodHubHeader
