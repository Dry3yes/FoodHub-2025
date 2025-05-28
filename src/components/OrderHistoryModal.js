import React, { useState, useEffect } from 'react';
import { getUserOrders } from '../services/Api';
import '../styles/OrderHistoryModal.css';

const OrderHistoryModal = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadOrderHistory();
    }
  }, [isOpen]);

  const loadOrderHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getUserOrders();
      if (response && response.orders) {
        // Sort orders: ongoing orders first (Pending, Confirmed, Preparing, Ready), then completed/cancelled
        const sortedOrders = response.orders.sort((a, b) => {
          const ongoingStatuses = ['Pending', 'Confirmed', 'Preparing', 'Ready'];
          const aIsOngoing = ongoingStatuses.includes(a.status);
          const bIsOngoing = ongoingStatuses.includes(b.status);
          
          if (aIsOngoing && !bIsOngoing) return -1;
          if (!aIsOngoing && bIsOngoing) return 1;
          
          // If both are ongoing or both are completed, sort by creation date (newest first)
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setOrders(sortedOrders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error loading order history:', err);
      setError('Gagal memuat riwayat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'Pending': { text: 'Menunggu Verifikasi', color: '#f59e0b', icon: '⏳' },
      'Confirmed': { text: 'Dikonfirmasi', color: '#3b82f6', icon: '✅' },
      'Preparing': { text: 'Sedang Dimasak', color: '#8b5cf6', icon: '👨‍🍳' },
      'Ready': { text: 'Siap Diambil', color: '#10b981', icon: '🍽️' },
      'Completed': { text: 'Selesai', color: '#059669', icon: '🎉' },
      'Cancelled': { text: 'Dibatalkan', color: '#ef4444', icon: '❌' }
    };
    return statusMap[status] || { text: status, color: '#6b7280', icon: '📋' };
  };

  const isOngoingOrder = (status) => {
    return ['Pending', 'Confirmed', 'Preparing', 'Ready'].includes(status);
  };

  const handleOrderClick = (orderId) => {
    onClose();
    window.location.href = `/order-status/${orderId}`;
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="order-history-modal-overlay" onClick={handleOverlayClick}>
      <div className="order-history-modal">
        <div className="modal-header">
          <h2>Riwayat Pesanan</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-content">
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Memuat riwayat pesanan...</p>
            </div>
          )}

          {error && (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button className="retry-button" onClick={loadOrderHistory}>
                Coba Lagi
              </button>
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>Belum Ada Pesanan</h3>
              <p>Anda belum pernah melakukan pesanan.</p>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="orders-container">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const isOngoing = isOngoingOrder(order.status);
                
                return (
                  <div 
                    key={order.id} 
                    className={`order-item ${isOngoing ? 'ongoing' : 'completed'}`}
                    onClick={() => handleOrderClick(order.id)}
                  >
                    <div className="order-header">
                      <div className="order-id">#{order.id.slice(-8)}</div>
                      <div 
                        className="order-status" 
                        style={{ backgroundColor: statusInfo.color }}
                      >
                        <span className="status-icon">{statusInfo.icon}</span>
                        <span className="status-text">{statusInfo.text}</span>
                      </div>
                    </div>

                    <div className="order-details">
                      <div className="order-info-row">
                        <span className="label">Total:</span>
                        <span className="value">Rp {order.total.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="order-info-row">
                        <span className="label">Tanggal:</span>
                        <span className="value">{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="order-info-row">
                        <span className="label">Items:</span>
                        <span className="value">{order.items.length} item(s)</span>
                      </div>
                    </div>

                    <div className="order-items-preview">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="item-preview">
                          <img 
                            src={item.imageURL || "/placeholder.svg"} 
                            alt={item.menuItemName}
                            className="item-image"
                          />
                          <div className="item-details">
                            <span className="item-name">{item.menuItemName}</span>
                            <span className="item-quantity">x{item.quantity}</span>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="more-items">
                          +{order.items.length - 2} item lainnya
                        </div>
                      )}
                    </div>

                    {isOngoing && (
                      <div className="ongoing-badge">
                        <span>Pesanan Aktif</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryModal;
