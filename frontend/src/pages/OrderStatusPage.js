import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { fetchOrderDetails, confirmPickup } from '../services/Api';
import Header from '../components/Header';
import '../styles/OrderStatus.css';

const OrderStatusPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStatus, setCurrentStatus] = useState('pending');
  const [pickupTimer, setPickupTimer] = useState(null);
  const [showPickupConfirmation, setShowPickupConfirmation] = useState(false);  const [countdown, setCountdown] = useState(900); // 15 minutes in seconds
  const [connection, setConnection] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const statusSteps = [
    { id: "pending", label: "Menunggu Verifikasi", icon: "⏳", status: "Pending" },
    { id: "confirmed", label: "Pesanan Dikonfirmasi", icon: "✅", status: "Confirmed" },
    { id: "preparing", label: "Sedang Dimasak", icon: "👨‍🍳", status: "Preparing" },
    { id: "ready", label: "Siap Diambil", icon: "🍽️", status: "Ready" },
    { id: "completed", label: "Selesai", icon: "🎉", status: "Completed" },
    { id: "cancelled", label: "Pesanan Dibatalkan", icon: "❌", status: "Cancelled" },
  ];

  useEffect(() => {
    if (orderId) {
      loadOrderData();
    } else {
      setError('Order ID not provided');
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    // Poll for order status updates every 30 seconds
    const intervalId = setInterval(() => {
      if (orderId && !loading) {
        loadOrderData();
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [orderId, loading]);

  useEffect(() => {
    // Start pickup timer when order is ready
    if (currentStatus === 'Ready' && !pickupTimer && !showPickupConfirmation) {
      setCountdown(900); // Reset countdown to 15 minutes
      setShowPickupConfirmation(true);
      
      const timer = setTimeout(() => {
        // Auto-confirm pickup after 15 minutes
        handleAutoPickupConfirmation();
      }, 15 * 60 * 1000); // 15 minutes
      
      setPickupTimer(timer);
    }

    return () => {
      if (pickupTimer) {
        clearTimeout(pickupTimer);
      }
    };
  }, [currentStatus]);

  // Setup SignalR connection for real-time updates
  useEffect(() => {
    const setupSignalRConnection = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const newConnection = new HubConnectionBuilder()
        .withUrl(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/chathub`, {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .build();

      try {
        await newConnection.start();
        console.log('SignalR Connected for order updates');

        // Listen for order status updates
        newConnection.on('OrderStatusUpdated', (data) => {
          if (data.orderId === orderId) {
            console.log('Order status updated:', data);
            setCurrentStatus(data.status);
            setStatusMessage(data.message);
            
            // Update order data
            if (data.orderData) {
              setOrderData(data.orderData);
            }
          }
        });

        // Listen for pickup ready notifications
        newConnection.on('OrderReadyForPickup', (data) => {
          if (data.orderId === orderId) {
            console.log('Order ready for pickup:', data);
            setCurrentStatus('Ready');
            setStatusMessage(data.message);
            setCountdown(data.timeout || 900);
            setShowPickupConfirmation(true);
          }
        });

        setConnection(newConnection);
      } catch (error) {
        console.error('SignalR Connection Error:', error);
      }
    };

    setupSignalRConnection();

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [orderId]);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      const data = await fetchOrderDetails(orderId);
      
      if (data) {
        setOrderData(data);
        setCurrentStatus(data.status);
        setError('');
      } else {
        setError('Order not found');
      }
    } catch (err) {
      console.error('Error loading order data:', err);
      setError('Error loading order data');
    } finally {
      setLoading(false);
    }
  };
  const handlePickupConfirmation = async () => {
    try {
      const response = await confirmPickup(orderId);
      if (response.success) {
        setCurrentStatus('Completed');
        setShowPickupConfirmation(false);
        if (pickupTimer) {
          clearTimeout(pickupTimer);
          setPickupTimer(null);
        }        // Reload order data to reflect the completed status
        loadOrderData();
      }
    } catch (err) {
      console.error('Error confirming pickup:', err);
    }
  };

  const handleAutoPickupConfirmation = async () => {
    try {
      console.log('Auto-confirming pickup after timeout');
      await handlePickupConfirmation();
    } catch (err) {
      console.error('Error with auto pickup confirmation:', err);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };  const getStepStatus = (step) => {
    // If order is cancelled, only show cancelled step as active
    if (currentStatus === 'Cancelled') {
      return step.status === 'Cancelled';
    }
    
    const currentStepIndex = statusSteps.findIndex(s => s.status === currentStatus);
    const stepIndex = statusSteps.findIndex(s => s.id === step.id);
    return stepIndex <= currentStepIndex;
  };

  if (loading) {
    return (
      <div className="status-page-container">
        <Header />
        <main className="status-main-content">
          <div className="loading-message">
            <h2>Loading order details...</h2>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-page-container">
        <Header />
        <main className="status-main-content">
          <div className="error-loading-message">
            <h2>Error: {error}</h2>
            <button className="status-btn-primary" onClick={handleBackToHome}>
              Back to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="status-page-container">
        <Header />
        <main className="status-main-content">
          <div className="error-loading-message">
            <h2>Order not found</h2>
            <button className="status-btn-primary" onClick={handleBackToHome}>
              Back to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="status-page-container">
      <Header />
      <main className="status-main-content">
        <div className="order-status-container">
          <div className="status-header">
            <h2>Status Pesanan</h2>
            <div className="order-id">ID Pesanan: {orderData.id}</div>            {statusMessage && (
              <div className={`status-message ${currentStatus === 'Cancelled' ? 'cancelled' : ''}`}>
                <p>{statusMessage}</p>
              </div>
            )}
            {currentStatus === 'Cancelled' && !statusMessage && (
              <div className="status-message cancelled">
                <p>Pesanan telah dibatalkan oleh seller</p>
              </div>
            )}
          </div>

          <div className="status-timeline">            {currentStatus === 'Cancelled' ? (
              // Show only cancelled status for cancelled orders
              <div className="status-step active cancelled">
                <div className="step-icon">❌</div>
                <div className="step-content">
                  <div className="step-label">Pesanan Dibatalkan</div>
                  <div className="step-description">
                    Pesanan Anda telah dibatalkan oleh seller. Mohon maaf atas ketidaknyamanannya.
                  </div>
                </div>
              </div>
            ) : (
              // Show normal timeline for other statuses
              statusSteps.filter(step => step.status !== 'Cancelled').map((step, index) => (
                <div key={step.id} className={`status-step ${getStepStatus(step) ? "active" : ""}`}>
                  <div className="step-icon">{step.icon}</div>
                  <div className="step-content">
                    <div className="step-label">{step.label}</div>
                    {step.status === currentStatus && step.status === 'Pending' && (
                      <div className="step-description">
                        Bukti pembayaran Anda sedang diverifikasi oleh seller. Proses ini biasanya memakan waktu 5-15 menit.
                      </div>
                    )}
                    {step.status === currentStatus && step.status === 'Confirmed' && (
                      <div className="step-description">
                        Pesanan Anda telah dikonfirmasi dan akan segera diproses.
                      </div>
                    )}
                    {step.status === currentStatus && step.status === 'Preparing' && (
                      <div className="step-description">
                        Pesanan Anda sedang dimasak. Mohon tunggu sebentar.
                      </div>
                    )}
                    {step.status === currentStatus && step.status === 'Ready' && (
                      <div className="step-description">
                        Pesanan Anda sudah siap untuk diambil! Silakan konfirmasi setelah mengambil pesanan.
                      </div>
                    )}
                    {step.status === currentStatus && step.status === 'Completed' && (
                      <div className="step-description">
                        Pesanan telah selesai. Terima kasih sudah berbelanja!
                      </div>
                    )}
                  </div>
                  {index < statusSteps.filter(s => s.status !== 'Cancelled').length - 1 && <div className="step-line"></div>}
                </div>
              ))
            )}
          </div>

          <div className="order-details">
            <h3>Detail Pesanan</h3>
            <div className="order-info">
              <div className="info-row">
                <span>Nama:</span>
                <span>{orderData.name}</span>
              </div>
              <div className="info-row">
                <span>WhatsApp:</span>
                <span>{orderData.phone}</span>
              </div>
              <div className="info-row">
                <span>Total:</span>
                <span>Rp {orderData.total.toLocaleString("id-ID")}</span>
              </div>
              <div className="info-row">
                <span>Waktu Pesan:</span>
                <span>{new Date(orderData.createdAt).toLocaleString("id-ID")}</span>
              </div>
              {orderData.notes && (
                <div className="info-row">
                  <span>Catatan:</span>
                  <span>{orderData.notes}</span>
                </div>
              )}
            </div>

            <div className="order-items">
              <h4>Item Pesanan:</h4>
              {orderData.items.map((item, index) => (
                <div key={index} className="status-item">
                  <img src={item.imageURL || "/placeholder.svg"} alt={item.menuItemName} className="status-item-image" />
                  <div className="status-item-details">
                    <div className="status-item-name">{item.menuItemName}</div>
                    <div className="status-item-qty">Qty: {item.quantity}</div>
                    <div className="status-item-price">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pickup Confirmation Modal */}
          {showPickupConfirmation && currentStatus === 'Ready' && (
            <div className="pickup-confirmation">
              <div className="pickup-alert">
                <h4>🎉 Pesanan Siap Diambil!</h4>
                <p>Silakan konfirmasi setelah Anda mengambil pesanan. Jika tidak dikonfirmasi dalam 15 menit, sistem akan otomatis mengkonfirmasi pesanan.</p>
                <button className="status-btn-primary" onClick={handlePickupConfirmation}>
                  Konfirmasi Pengambilan
                </button>
              </div>
            </div>
          )}          <div className="status-actions">
            <button className="status-btn-secondary" onClick={handleBackToHome}>
              Kembali ke Home
            </button>
            <button className="status-btn-primary" onClick={loadOrderData}>
              Refresh Status
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderStatusPage;
