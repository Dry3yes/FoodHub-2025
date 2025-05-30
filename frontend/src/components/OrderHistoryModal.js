import React, { useState, useEffect } from 'react';
import { getUserOrders, getOrderReviewStatus, createReview, updateReview } from '../services/Api';
import ReviewModal from './ReviewModal';
import styles from '../styles/OrderHistoryModal.module.css';

const OrderHistoryModal = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);  const [orderReviewStatuses, setOrderReviewStatuses] = useState({});

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

  // Load review statuses for completed orders
  const loadReviewStatuses = async (completedOrders) => {
    try {
      const reviewStatuses = {};
      for (const order of completedOrders) {
        if (order.status === 'Completed') {
          try {
            const reviewStatus = await getOrderReviewStatus(order.id);
            reviewStatuses[order.id] = reviewStatus;
          } catch (err) {
            console.error(`Error loading review status for order ${order.id}:`, err);
            reviewStatuses[order.id] = { canReview: false, hasReviewed: false };
          }
        }
      }
      setOrderReviewStatuses(reviewStatuses);
    } catch (err) {
      console.error('Error loading review statuses:', err);
    }
  };

  // Load orders and review statuses when modal opens
  useEffect(() => {
    if (isOpen) {
      loadOrderHistory();
    }
  }, [isOpen]);

  // Load review statuses after orders are loaded
  useEffect(() => {
    if (orders.length > 0) {
      const completedOrders = orders.filter(order => order.status === 'Completed');
      if (completedOrders.length > 0) {
        loadReviewStatuses(completedOrders);
      }
    }
  }, [orders]);

  const handleOrderClick = (orderId) => {
    onClose();
    window.location.href = `/order-status/${orderId}`;
  };

  const handleReviewClick = (order) => {
    setSelectedOrderForReview(order);
    setShowReviewModal(true);
  };
  const handleReviewSubmit = async (reviewData) => {
    try {
      const existingReview = orderReviewStatuses[selectedOrderForReview.id]?.existingReview;
      
      if (existingReview && existingReview.id) {
        // Update existing review
        await updateReview(existingReview.id, reviewData);
      } else {
        // Create new review
        await createReview(reviewData);
      }
      
      setShowReviewModal(false);
      setSelectedOrderForReview(null);
      
      // Refresh review status for this order
      if (selectedOrderForReview) {
        const updatedReviewStatus = await getOrderReviewStatus(selectedOrderForReview.id);
        setOrderReviewStatuses(prev => ({
          ...prev,
          [selectedOrderForReview.id]: updatedReviewStatus
        }));
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      throw err;
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

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles['order-history-modal-overlay']} onClick={handleOverlayClick}>
      <div className={styles['order-history-modal']}>
        <div className={styles['modal-header']}>
          <h2>Riwayat Pesanan</h2>
          <button className={styles['close-button']} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles['modal-content']}>
          {loading && (
            <div className={styles['loading-container']}>
              <div className={styles['loading-spinner']}></div>
              <p>Memuat riwayat pesanan...</p>
            </div>
          )}

          {error && (
            <div className={styles['error-container']}>
              <p className={styles['error-message']}>{error}</p>
              <button className={styles['retry-button']}   onClick={loadOrderHistory}>
                Coba Lagi
              </button>
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className={styles['empty-state']}>
              <div className={styles['empty-icon']}>📋</div>
              <h3>Belum Ada Pesanan</h3>
              <p>Anda belum pernah melakukan pesanan.</p>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className={styles['orders-container']}>
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const isOngoing = isOngoingOrder(order.status);
                
                return (                  <div 
                    key={order.id} 
                    className={`${styles['order-item']} ${isOngoing ? styles['ongoing'] : styles['completed']}`}
                    onClick={() => handleOrderClick(order.id)}
                  >
                    <div className={styles['order-header']}>
                      <div className={styles['order-id']}>#{order.id.slice(-8)}</div>
                      <div 
                        className={styles['order-status']} 
                        style={{ backgroundColor: statusInfo.color }}
                      >
                        <span className={styles['status-icon']}>{statusInfo.icon}</span>
                        <span className={styles['status-text']}>{statusInfo.text}</span>
                      </div>
                    </div>

                    <div className={styles['order-details']}>
                      <div className={styles['order-info-row']}>
                        <span className={styles['label']}>Total:</span>
                        <span className={styles['value']}>Rp {order.total.toLocaleString('id-ID')}</span>
                      </div>
                      <div className={styles['order-info-row']}>
                        <span className={styles['label']}>Tanggal:</span>
                        <span className={styles['value']}>{formatDate(order.createdAt)}</span>
                      </div>
                      <div className={styles['order-info-row']}>
                        <span className={styles['label']}>Items:</span>
                        <span className={styles['value']}>{order.items.length} item(s)</span>
                      </div>
                    </div>

                    <div className={styles['order-items-preview']}>
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className={styles['item-preview']}>
                          <img 
                            src={item.imageURL || "/placeholder.svg"} 
                            alt={item.menuItemName}
                            className={styles['item-image']}
                          />
                          <div className={styles['item-details']}>
                            <span className={styles['item-name']}>{item.menuItemName}</span>
                            <span className={styles['item-quantity']}>x{item.quantity}</span>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className={styles['more-items']}>
                          +{order.items.length - 2} item lainnya
                        </div>
                      )}                    </div>

                    {/* Review Button for Completed Orders */}
                    {order.status === 'Completed' && orderReviewStatuses[order.id] && (
                      <div className={styles['order-actions']}>
                        <button
                          className={styles['review-button']}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering order click
                            handleReviewClick(order);
                          }}
                        >
                          {orderReviewStatuses[order.id].hasReviewed ? '✏️ Edit Review' : '⭐ Rate & Review'}
                        </button>
                      </div>
                    )}

                    {/* {isOngoing && (
                      <div className={styles['ongoing-badge']}>
                        <span>Pesanan Aktif</span>
                      </div>
                    )} */}
                  </div>
                );
              })}
            </div>
          )}        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedOrderForReview && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedOrderForReview(null);
          }}
          onSubmit={handleReviewSubmit}
          orderData={selectedOrderForReview}
          existingReview={orderReviewStatuses[selectedOrderForReview.id]?.existingReview}
        />
      )}
    </div>
  );
};

export default OrderHistoryModal;
