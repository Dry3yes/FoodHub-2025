"use client"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../hooks/useCart"
import "../styles/CartSidebar.css"
import CheckoutModal from "./CheckoutModal"

function CartSidebar() {
  const { items, updateQuantity, removeFromCart, clearCart, isLoading, error, isOnline, isAuthenticated } = useCart()
  const navigate = useNavigate()
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)

  const total = items.reduce((total, item) => total + item.price * item.quantity, 0)

  const handleCheckout = () => {
    if (!isAuthenticated()) {
      // Redirect to login page if not authenticated
      navigate('/login')
      return
    }
    // Show the checkout modal for authenticated users
    setShowCheckoutModal(true)
  }

  if (items.length === 0) {
    return (
      <div className="cart-sidebar-card">
        <div className="cart-sidebar-header">
          <h2 className="cart-sidebar-title">Order Summary</h2>
        </div>
        <div className="cart-sidebar-content">
          <div className="empty-cart-message">
            <div className="empty-cart-icon-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="empty-cart-icon"
              >
                <path d="M2 3h2l3.4 7h11.2l3.4-7H22" />
                <circle cx="9" cy="20" r="1" />
                <circle cx="17" cy="20" r="1" />
                <path d="M3 3h18v13H3z" />
              </svg>
            </div>
            <h3 className="empty-cart-title">Your cart is empty</h3>
            <p className="empty-cart-text">Add items to your cart to see them here.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="cart-sidebar-card">
        <div className="cart-sidebar-header">
          <h2 className="cart-sidebar-title">Order Summary</h2>
          {!isOnline && (
            <div className="cart-status-indicator offline">
              <span>Offline Mode</span>
            </div>
          )}
          {error && (
            <div className="cart-error-message">
              <span>{error}</span>
            </div>
          )}
        </div>
        <div className="cart-sidebar-content">
          {isLoading && (
            <div className="cart-loading">
              <span>Updating cart...</span>
            </div>
          )}
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image-container">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="cart-item-image" />
                </div>
                <div className="cart-item-details">
                  <div className="cart-item-header">
                    <div className="cart-item-name">{item.name}</div>
                    <button className="remove-item-button" onClick={() => removeFromCart(item.id)}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="remove-icon"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      <span className="sr-only">Remove</span>
                    </button>
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-price">Rp {item.price.toLocaleString('id-ID')}</div>
                  </div>
                  <div className="cart-item-quantity">
                    <button
                      className="quantity-button"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="minus-icon"
                      >
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      <span className="sr-only">Decrease quantity</span>
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button className="quantity-button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="plus-icon"
                      >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      <span className="sr-only">Increase quantity</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-divider"></div>

          <div className="cart-summary">
            <div className="summary-row total">
              <span>Total</span>
              <span>Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>        {/* Moved checkout button here, directly below the summary */}
          <div className="cart-sidebar-footer">
            <button className="checkout-button" onClick={handleCheckout}>
              Complete your purchase
            </button>
          </div>
        </div>
      </div>
      
      {showCheckoutModal && (
        <CheckoutModal onClose={() => setShowCheckoutModal(false)} />
      )}
    </>
  )
}

export default CartSidebar
