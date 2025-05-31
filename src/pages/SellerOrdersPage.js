import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HubConnectionBuilder } from '@microsoft/signalr';
import Header from "../components/Header";
import PaymentVerificationModal from "../components/PaymentVerificationModal";
import CommunicationModal from "../components/CommunicationModal";
import { getPendingOrders, getSellerOrders, updateOrderStatus, findOrCreateChat } from "../services/Api";
import styles from "../styles/SellerOrders.module.css";

function SellerOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");  const [activeTab, setActiveTab] = useState("pending");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [selectedOrderForMessage, setSelectedOrderForMessage] = useState(null);
  const [connection, setConnection] = useState(null);

  const orderTabs = [
    { id: "pending", name: "Pending Verification", status: "Pending" },
    { id: "all", name: "All Orders", status: "All" }
  ];

  useEffect(() => {
    checkAuthentication();
  }, [navigate]);

  useEffect(() => {
    loadOrders();
  }, [activeTab]);
  // Setup SignalR connection for real-time order updates
  useEffect(() => {
    const setupSignalRConnection = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const newConnection = new HubConnectionBuilder()
          .withUrl(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/chathub`, {
            accessTokenFactory: () => token
          })
          .withAutomaticReconnect()
          .build();

        setConnection(newConnection);
        
        // Listen for seller order updates
        newConnection.on("SellerOrderUpdated", (data) => {
          console.log("Seller order updated:", data);
          setOrders((prevOrders) => 
            prevOrders.map((order) => 
              order.orderId === data.orderId ? { ...order, status: data.status } : order
            )
          );
        });

        // Listen for general order status updates
        newConnection.on("OrderStatusUpdated", (data) => {
          console.log("Order status updated:", data);
          setOrders((prevOrders) => 
            prevOrders.map((order) => 
              order.orderId === data.orderId ? { ...order, status: data.status } : order
            )
          );
        });

        await newConnection.start();
        console.log("SignalR connected for seller orders.");
      } catch (err) {
        console.error("Error establishing SignalR connection:", err);
      }
    };

    setupSignalRConnection();

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, []);

  const checkAuthentication = async () => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    
    if (!token || !userString) {
      navigate('/login');
      return;
    }
    
    try {
      const user = JSON.parse(userString);
      if (user.role !== 'Seller') {
        setError("You don't have seller privileges.");
        setTimeout(() => navigate('/'), 2000);
        return;
      }
    } catch (err) {
      console.error("Error checking authentication:", err);
      setError("Authentication error occurred.");
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      let ordersData;
      if (activeTab === "pending") {
        ordersData = await getPendingOrders();
      } else {
        ordersData = await getSellerOrders();
      }
      
      if (ordersData && ordersData.orders) {
        setOrders(ordersData.orders);
      } else {
        setOrders([]);
      }
      setError("");
    } catch (err) {
      console.error("Error loading orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };
  const handleViewPaymentProof = (order) => {
    console.log("Opening payment modal for order:", order);
    console.log("Order has paymentProofUrl:", order.paymentProofUrl);
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const handleApproveOrder = async (orderId) => {
    try {
      const result = await updateOrderStatus(orderId, "Confirmed");
      if (result.success) {
        loadOrders(); // Refresh orders list
        setShowPaymentModal(false);
        setSelectedOrder(null);
      } else {
        setError("Failed to approve order: " + result.message);
      }
    } catch (err) {
      console.error("Error approving order:", err);
      setError("Failed to approve order");
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      const result = await updateOrderStatus(orderId, "Cancelled");
      if (result.success) {
        loadOrders(); // Refresh orders list
        setShowPaymentModal(false);
        setSelectedOrder(null);
      } else {
        setError("Failed to reject order: " + result.message);
      }
    } catch (err) {
      console.error("Error rejecting order:", err);
      setError("Failed to reject order");
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        loadOrders(); // Refresh orders list
      } else {
        setError("Failed to update order status: " + result.message);
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Failed to update order status");
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'preparing': return '#8b5cf6';
      case 'ready': return '#10b981';
      case 'completed': return '#059669';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };
  const getNextStatus = (currentStatus) => {
    switch (currentStatus.toLowerCase()) {
      case 'confirmed': return 'Preparing';
      case 'preparing': return 'Ready';
      case 'ready': return 'Completed';
      default: return null;
    }
  };  const handleMessageCustomer = (order) => {
    setSelectedOrderForMessage(order);
    setShowCommunicationModal(true);
  };  const handleSendMessage = async (order, message) => {
    try {
      const customerId = order.customerId;
      
      if (!customerId) {
        throw new Error('Customer ID not found in order data');
      }
      
      const result = await findOrCreateChat(customerId, message);
      
      // Close the modal
      setShowCommunicationModal(false);
      setSelectedOrderForMessage(null);
      
      // Show success message
      alert(`Message sent successfully to ${order.customerName || 'customer'}! The conversation has been started and you can continue chatting in the chat section.`);
      
    } catch (error) {
      console.error('Error sending message:', error);
      throw error; // Re-throw to be handled by the modal
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

  if (loading) {
    return (
      <div className={styles['seller-orders-container']}>
        <Header />
        <div className={styles['loading-container']}>
          <div className={styles['loading-spinner']}></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['seller-orders-container']}>
      <Header />

      <main className={styles['seller-orders-main']}>
        <div className={styles['seller-orders-header']}>
          <h1 className={styles['page-title']}>Order Management</h1>
          <p className={styles['page-subtitle']}>Manage your orders and payment verifications</p>
        </div>

        {error && (
          <div className={styles['error-message']}>
            <p>{error}</p>
          </div>
        )}        {/* Order Tabs */}
        <div className={styles['order-tabs']}>
          {orderTabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles['order-tab']} ${activeTab === tab.id ? styles['active'] : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
              {tab.id === "pending" && (
                <span className={styles['tab-badge']}>
                  {activeTab === "pending" 
                    ? orders.length 
                    : orders.filter(order => order.status.toLowerCase() === 'pending').length
                  }
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className={styles['orders-container']}>
          {orders.length === 0 ? (
            <div className={styles['empty-state']}>
              <div className={styles['empty-icon']}>📋</div>
              <h3>No {activeTab === "pending" ? "pending" : ""} orders found</h3>
              <p>
                {activeTab === "pending" 
                  ? "You have no orders pending payment verification."
                  : "You haven't received any orders yet."
                }
              </p>
            </div>
          ) : (
            <div className={styles['orders-grid']}>
              {orders.map((order) => (
                <div key={order.id} className={styles['order-card']}>
                  <div className={styles['order-header']}>
                    <div className={styles['order-id']}>Order #{order.id.slice(-8)}</div>
                    <span 
                      className={styles['order-status']}
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className={styles['order-details']}>
                    <div className={styles['order-info']}>
                      <p><strong>Total:</strong> Rp {order.total.toLocaleString('id-ID')}</p>
                      <p><strong>Items:</strong> {order.items.length} item(s)</p>
                      <p><strong>Order Time:</strong> {formatDate(order.createdAt)}</p>
                      {order.notes && (
                        <p><strong>Notes:</strong> {order.notes}</p>
                      )}
                    </div>

                    <div className={styles['order-items']}>
                      {order.items.map((item, index) => (
                        <div key={index} className={styles['order-item']}>
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
                    </div>
                  </div>                  <div className={styles['order-actions']}>
                    {/* Message Customer Button - Hide for completed and cancelled orders */}
                    {order.status.toLowerCase() !== 'completed' && order.status.toLowerCase() !== 'cancelled' && (
                      <button
                        className={styles['message-customer-btn']}
                        onClick={() => handleMessageCustomer(order)}
                        title="Send a message to the customer"
                      >
                        💬 Message
                      </button>
                    )}
                    
                    {activeTab === "pending" && order.paymentProofUrl && (
                      <button
                        className={styles['verify-payment-btn']}
                        onClick={() => handleViewPaymentProof(order)}
                      >
                        Verify Payment
                      </button>
                    )}
                    
                    {activeTab === "all" && getNextStatus(order.status) && (
                      <button
                        className={styles['status-update-btn']}
                        onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status))}
                      >
                        Mark as {getNextStatus(order.status)}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>      {/* Payment Verification Modal */}
      {showPaymentModal && selectedOrder && (
        <PaymentVerificationModal
          isOpen={showPaymentModal}          onClose={() => {
            setShowPaymentModal(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onApprove={() => handleApproveOrder(selectedOrder.id)}
          onReject={() => handleRejectOrder(selectedOrder.id)}
        />
      )}      {/* Communication Modal */}
      {showCommunicationModal && selectedOrderForMessage && (
        <CommunicationModal
          isOpen={showCommunicationModal}
          onClose={() => {
            setShowCommunicationModal(false);
            setSelectedOrderForMessage(null);
          }}
          order={{
            orderId: selectedOrderForMessage.id,
            customerName: selectedOrderForMessage.name || 'Customer', // Use 'name' field from OrderDto
            customerId: selectedOrderForMessage.userId, // Use 'userId' field from OrderDto
            status: selectedOrderForMessage.status,
            totalAmount: selectedOrderForMessage.total
          }}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
}

export default SellerOrdersPage;
