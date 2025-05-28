import React from "react";
import "../styles/PaymentVerificationModal.css";

function PaymentVerificationModal({ isOpen, onClose, order, onApprove, onReject }) {
  if (!isOpen || !order) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="payment-verification-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Payment Verification</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-content">
          <div className="order-summary">
            <h3>Order Details</h3>
            <div className="order-info-grid">
              <div className="info-item">
                <span className="label">Order ID:</span>
                <span className="value">#{order.id.slice(-8)}</span>
              </div>
              <div className="info-item">
                <span className="label">Total Amount:</span>
                <span className="value">Rp {order.total.toLocaleString('id-ID')}</span>
              </div>
              <div className="info-item">
                <span className="label">Order Time:</span>
                <span className="value">{formatDate(order.createdAt)}</span>
              </div>
              <div className="info-item">
                <span className="label">Items:</span>
                <span className="value">{order.items.length} item(s)</span>
              </div>
            </div>

            {order.notes && (
              <div className="order-notes">
                <span className="label">Customer Notes:</span>
                <p className="notes-text">{order.notes}</p>
              </div>
            )}

            <div className="order-items-list">
              <h4>Items Ordered:</h4>
              {order.items.map((item, index) => (
                <div key={index} className="verification-order-item">
                  <img 
                    src={item.imageURL || "/placeholder.svg"} 
                    alt={item.menuItemName}
                    className="verification-item-image"
                  />
                  <div className="verification-item-details">
                    <span className="verification-item-name">{item.menuItemName}</span>
                    <span className="verification-item-price">
                      Rp {item.price.toLocaleString('id-ID')} x {item.quantity}
                    </span>
                  </div>
                  <div className="verification-item-total">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="payment-proof-section">
            <h3>Payment Proof</h3>
            {order.paymentProofUrl ? (
              <div className="payment-proof-container">
                <img 
                  src={order.paymentProofUrl} 
                  alt="Payment Proof" 
                  className="payment-proof-image"
                />
                <p className="payment-proof-note">
                  Please verify that the payment amount matches the order total and that the payment was received.
                </p>
              </div>
            ) : (
              <div className="no-payment-proof">
                <p>No payment proof has been uploaded for this order.</p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button 
            className="reject-button"
            onClick={onReject}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            Reject Order
          </button>
          
          <button 
            className="approve-button"
            onClick={onApprove}
            disabled={!order.paymentProofUrl}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            Approve Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentVerificationModal;
