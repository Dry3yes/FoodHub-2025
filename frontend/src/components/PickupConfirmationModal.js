import React, { useState, useEffect } from 'react';
import '../styles/PickupConfirmationModal.css';

const PickupConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  orderData,
  timeRemaining 
}) => {
  const [countdown, setCountdown] = useState(timeRemaining || 900); // 15 minutes = 900 seconds

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Auto-confirm when timer reaches 0
          onConfirm();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onConfirm]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="pickup-modal-overlay" onClick={onClose}>
      <div className="pickup-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="pickup-modal-header">
          <div className="pickup-icon">🎉</div>
          <h3>Pesanan Siap Diambil!</h3>
          <button className="pickup-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="pickup-modal-body">
          <div className="pickup-message">
            <p>
              Pesanan Anda sudah siap untuk diambil di <strong>{orderData?.storeName}</strong>.
            </p>
            <p>
              Silakan konfirmasi setelah Anda mengambil pesanan. Jika tidak dikonfirmasi dalam{' '}
              <strong>{formatTime(countdown)}</strong>, sistem akan otomatis mengkonfirmasi pesanan.
            </p>
          </div>

          <div className="pickup-order-summary">
            <h4>Detail Pesanan</h4>
            <div className="pickup-order-info">
              <div className="pickup-info-row">
                <span>Order ID:</span>
                <span>#{orderData?.orderId}</span>
              </div>
              <div className="pickup-info-row">
                <span>Total:</span>
                <span>Rp {orderData?.total?.toLocaleString('id-ID')}</span>
              </div>
              <div className="pickup-info-row">
                <span>Items:</span>
                <span>{orderData?.items?.length || 0} item(s)</span>
              </div>
            </div>
          </div>

          <div className="pickup-timer">
            <div className="timer-display">
              <span className="timer-label">Auto-confirm in:</span>
              <span className="timer-countdown">{formatTime(countdown)}</span>
            </div>
            <div className="timer-bar">
              <div 
                className="timer-progress" 
                style={{ 
                  width: `${(countdown / 900) * 100}%`,
                  backgroundColor: countdown < 300 ? '#ef4444' : countdown < 600 ? '#f59e0b' : '#10b981'
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="pickup-modal-footer">
          <button className="pickup-btn-secondary" onClick={onClose}>
            Tutup
          </button>
          <button className="pickup-btn-primary" onClick={onConfirm}>
            Konfirmasi Pengambilan
          </button>
        </div>
      </div>
    </div>
  );
};

export default PickupConfirmationModal;
