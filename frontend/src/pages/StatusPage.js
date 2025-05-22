import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Timer from "../components/Timer";
import Map from "../components/Map";
import "../styles/StatusPage.css";

function StatusPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds
  const [status, setStatus] = useState("Preparing");
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Mock order data since backend isn't ready yet
    const mockOrderData = {
      id: orderId || "123456",
      items: [
        { name: "Chicken Rice", quantity: 2, price: 35000 },
        { name: "Iced Tea", quantity: 1, price: 8000 }
      ],
      totalPrice: 78000,
      status: "Preparing",
      estimatedDeliveryTime: 15 // minutes
    };

    // Simulate API call
    setTimeout(() => {
      setOrderDetails(mockOrderData);
      setStatus(mockOrderData.status);
      setLoading(false);
    }, 1000);

    // Start the timer automatically
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setStatus("Delivered");
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
              Status: <span className={status === "Delivered" ? "status-done" : "status-preparing"}>{status}</span>
            </div>
          </div>

          <Timer timeRemaining={timeRemaining} />
          
          <div className="order-items">
            <h3>Order Items:</h3>
            <ul>
              {orderDetails?.items.map((item, index) => (
                <li key={index}>
                  {item.name} x{item.quantity} - Rp {item.price.toLocaleString()}
                </li>
              ))}
            </ul>
            <div className="total-price">
              <strong>Total: Rp {orderDetails?.totalPrice.toLocaleString()}</strong>
            </div>
          </div>

          <div className="map-container">
            <h3>Store Location</h3>
            <Map />
          </div>

          <button className="back-button" onClick={handleBackClick}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default StatusPage;
