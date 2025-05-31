import { Link } from "react-router-dom"
import { useCart } from "../hooks/useCart"
import { useState, useEffect } from "react"
import { getPendingOrders } from "../services/Api"
import OrderHistoryModal from "./OrderHistoryModal"
import styles from "../styles/Header.module.css"
import logo from "../assets/logo.png";

function Header({ onSearch, searchQuery = "", showSearch = true }) {
  const { items, clearLocalCart } = useCart()
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)
  const [isSeller, setIsSeller] = useState(false)
  const [showOrderHistory, setShowOrderHistory] = useState(false)
  const [searchValue, setSearchValue] = useState(searchQuery)

  // Check if user is a seller and fetch pending orders count
  useEffect(() => {
    const checkSellerStatus = async () => {
      const userString = localStorage.getItem('user')
      if (userString) {
        const user = JSON.parse(userString)
        if (user.role === 'Seller') {
          setIsSeller(true)
          
          // Fetch pending orders count
          try {
            const pendingOrders = await getPendingOrders()
            if (pendingOrders && pendingOrders.orders) {
              setPendingOrdersCount(pendingOrders.count || pendingOrders.orders.length)
            }
          } catch (error) {
            console.error('Error fetching pending orders:', error)
          }
        }
      }
    }
    
    checkSellerStatus()
    
    // Set up polling for pending orders if user is seller
    if (isSeller) {
      const interval = setInterval(async () => {
        try {
          const pendingOrders = await getPendingOrders()
          if (pendingOrders && pendingOrders.orders) {
            setPendingOrdersCount(pendingOrders.count || pendingOrders.orders.length)
          }
        } catch (error) {
          console.error('Error fetching pending orders:', error)
        }
      }, 30000) // Check every 30 seconds
      
      return () => clearInterval(interval)
    }
  }, [isSeller])

  // Update search value when prop changes
  useEffect(() => {
    setSearchValue(searchQuery)
  }, [searchQuery])

  // Handle search input change and trigger search
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchValue(value)
    if (onSearch) {
      onSearch(value)
    }
  }

  // Handle search form submission (Enter key)
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchValue)
    }
  }

  const handleLogout = () => {
    // Clear local cart first
    clearLocalCart()
    // Clear all localStorage
    localStorage.clear()
    // Redirect to login
    window.location.href = '/login'
  }

  return (
    <header className={styles.header}>
      <div className={styles["header-container"]}>
        <Link to="/" className={styles["logo-link"]}>
          <div className={styles.logo}>
            <img src={logo} alt="Logo" />
          </div>
          <span className={styles["logo-text"]}>FoodHub</span>
        </Link>

        <nav className={styles["nav-menu"]}>
          <Link to="/landing" className={styles["nav-link"]}>
            Home
          </Link>
          <Link
            to="/landing#about"
            className={styles["nav-link"]}
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
          <Link to="/" className={styles["nav-link"]}>
            Menu
          </Link>
          <Link to="/support" className={styles["nav-link"]}>
            Support
          </Link>
        </nav>

        {/* Search Bar - Only show on home page or when explicitly enabled */}
        {showSearch && !isSeller && (
          <div className={styles["search-container"]}>
            <form onSubmit={handleSearchSubmit} className={styles["search-form"]}>
              <div className={styles["search-input-wrapper"]}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles["search-icon"]}
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder="Search for food items..."
                  value={searchValue}
                  onChange={handleSearchChange}
                  className={styles["search-input"]}
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchValue('')
                      if (onSearch) onSearch('')
                    }}
                    className={styles["clear-search-btn"]}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div className={styles["header-actions"]}>
          {isSeller && (
            <Link to="/seller-orders" className={styles["pending-orders-button-container"]}>
              <button className={styles["pending-orders-button"]}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles["orders-icon"]}
                >
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                <span className={styles["pending-orders-text"]}>Pending Orders</span>
                {pendingOrdersCount > 0 && (
                  <span className={styles["pending-orders-badge"]}>{pendingOrdersCount}</span>
                )}
              </button>
            </Link>
          )}
            <Link to="/cart" className={styles["cart-button-container"]}>
            <button className={styles["cart-button"]}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles["cart-icon"]}
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {itemCount > 0 && <span className={styles["cart-badge"]}>{itemCount}</span>}
            </button>
          </Link>
          
          {/* Order History Button - Only for logged in non-seller users */}
          {localStorage.getItem('token') && !isSeller && (
            <div className={styles["order-history-button-container"]}>
              <button
                className={styles["order-history-button"]}
                onClick={() => setShowOrderHistory(true)}
                title="Order History"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles["history-icon"]}
              >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                  <path d="M12 7v5l4 2"></path>
                </svg>
              </button>
            </div>
          )}
          
          { localStorage.getItem('token') ? (
            <>
              <Link to="/settings" className={styles["settings-button-container"]}>
                <button className={styles["settings-button"]}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles["settings-icon"]}
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"></path>
                    <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path>
                  </svg>
                </button>
              </Link>
              <button
                className={styles["logout-btn"]}
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className={styles["login-button"]}>Login</Link>
          )}
        </div>
      </div>
      
      {/* Order History Modal */}
      <OrderHistoryModal 
        isOpen={showOrderHistory}
        onClose={() => setShowOrderHistory(false)}
      />
    </header>
  )
}

export default Header
