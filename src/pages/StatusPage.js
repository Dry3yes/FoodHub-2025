import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Timer from "../components/Timer";
import Map from "../components/Map";
import { fetchOrderDetails, fetchStoreById } from '../services/Api';
import "../styles/StatusPage.css";

function StatusPage() {
  const { orderId: paramsOrderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const queryOrderId = queryParams.get('orderId');
  const orderId = paramsOrderId || queryOrderId;
  
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [status, setStatus] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrisCode, setQrisCode] = useState("");

  useEffect(() => {
    const getOrderDetails = async () => {
      if (!orderId) {
        setError('No order ID provided');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to view order details');
          setLoading(false);
          return;
        }

        // Use centralized API function to fetch order details
        const orderData = await fetchOrderDetails(orderId);
        
        if (orderData) {
          setOrderDetails(orderData);
          setStatus(orderData.status);
          
          // Fetch the seller's QRIS code using centralized API function
          if (orderData.sellerId) {
            try {
              const storeData = await fetchStoreById(orderData.sellerId);
              
              if (storeData && storeData.qrisUrl) {
                setQrisCode(storeData.qrisUrl);
              }
            } catch (err) {
              console.error('Error fetching seller details:', err);
            }
          }
        } else {
          setError('Failed to fetch order details');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.message || 'An error occurred while fetching order details');
      } finally {
        setLoading(false);
      }
    };

    getOrderDetails();

    // Start the timer for 30 minutes (typical order preparation time)
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(timer);
  }, [orderId]);

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="status-page-container">
        <div className="loading">Loading order information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-page-container">
        <div className="error">Error: {error}</div>
        <button className="back-button" onClick={handleBackClick}>Back</button>
      </div>
    );
  }

  return (
    <div className="status-page-container">
      <div className="content-container">
        <h1 className="status-title">Order Status</h1>
        <div className="order-info">
          <h2>Order #{orderDetails?.id}</h2>
          <div className="status-container">
            <div className="status-text">
              Status: <span className={status === "Completed" ? "status-done" : "status-preparing"}>{status}</span>
            </div>
          </div>

          {status === "Pending" && (
            <div className="timer-container">
              <h3>Please complete payment within:</h3>
              <Timer timeRemaining={timeRemaining} />
            </div>
          )}
          
          <div className="order-items">
            <h3>Order Items:</h3>
            <ul>
              {orderDetails?.items.map((item, index) => (
                <li key={index}>
                  {item.menuItemName} x{item.quantity} - Rp {item.price.toLocaleString('id-ID')}
                </li>
              ))}
            </ul>
            <div className="order-notes">
              <h4>Order Notes:</h4>
              <p>{orderDetails?.notes || "No special instructions"}</p>
            </div>
            <div className="total-price">
              <strong>Total: Rp {orderDetails?.total.toLocaleString('id-ID')}</strong>
            </div>
          </div>

          {qrisCode && (
            <div className="payment-container">
              <h3>Payment QR Code</h3>
              <p>Scan this QR code to complete your payment:</p>
              <div className="qris-container">
                <img src={qrisCode} alt="QRIS Payment Code" className="qris-image" />
              </div>
              <p className="payment-instructions">
                After payment is complete, the seller will confirm your order.
              </p>
            </div>
          )}
          <button className="back-button" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default StatusPage;
