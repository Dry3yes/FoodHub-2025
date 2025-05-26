import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useCart } from '../hooks/useCart';
import { checkout } from '../services/Api';
import '../styles/CheckoutPage.css';

function CheckoutPage() {
  const { items, clearCart, isAuthenticated } = useCart();
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Calculate totals
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const feeservice = 2000
  const total = subtotal + feeservice; // No delivery, just the items total

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [isAuthenticated, navigate]);

  // Redirect to cart if cart is empty
  React.useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Get the auth token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to checkout');
      }

      // Call the checkout API using centralized function
      const response = await checkout(notes);
      
      if (response.success) {
        // Clear the cart and redirect to the status page
        await clearCart();
        navigate(`/status/${response.data.id}`);
      } else {
        setError(response.message || 'Failed to create order');
      }
    } catch (err) {
      console.error('Error during checkout:', err);
      setError(err.message || 'An error occurred during checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-page-container">
      <Header />

      <main className="checkout-main-content">
        <div className="checkout-header">
          <h1 className="checkout-title">Checkout</h1>
        </div>

        <div className="checkout-grid">
          <div className="checkout-items-column">
            <div className="checkout-card">
              <div className="checkout-card-header">
                <h2 className="checkout-card-title">Order Items ({items.length})</h2>
              </div>
              
              <div className="checkout-card-content">
                <div className="checkout-items-list">
                  {items.map((item) => (
                    <div key={item.id} className="checkout-item">
                      <div className="checkout-item-image-container">
                        <img src={item.image || "/placeholder.svg"} alt={item.name} className="checkout-item-image" />
                      </div>
                      <div className="checkout-item-content">
                        <h3 className="checkout-item-name">{item.name}</h3>
                        <div className="checkout-item-details">
                          <span className="checkout-item-quantity">{item.quantity} x</span>
                          <span className="checkout-item-price">Rp {item.price.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="checkout-item-total">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="checkout-card">
              <div className="checkout-card-header">
                <h2 className="checkout-card-title">Order Notes</h2>
              </div>
              
              <div className="checkout-card-content">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="notes" className="form-label">Special Instructions</label>
                    <textarea
                      id="notes"
                      className="form-control"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any special instructions or notes for the seller..."
                      rows={4}
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="order-summary-column">
            <div className="order-summary-card">
              <div className="order-summary-header">
                <h2 className="order-summary-title">Order Summary</h2>
              </div>
              
              <div className="order-summary-content">
                <div className="order-summary-details">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="summary-row">
                    <span>Fee Service</span>
                    <span>Rp {feeservice.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
              
              <div className="order-summary-footer">
                {error && <div className="checkout-error">{error}</div>}
                <button 
                  className="place-order-button" 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>

            <div className="checkout-info-card">
              <div className="checkout-info-header">
                <h3>Important Information</h3>
              </div>
              <div className="checkout-info-content">
                <p>After placing your order, you'll be redirected to the order status page where you can see the seller's QRIS code for payment.</p>
                <p>Please complete the payment to ensure your order is processed.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="checkout-footer">
        <div className="footer-content">
          <div className="footer-text">
            <p>© 2023 FoodHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default CheckoutPage;
