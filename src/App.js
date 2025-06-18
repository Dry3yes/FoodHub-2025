import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import Home from "./pages/Home"
import StorePage from "./pages/StorePage"
import CartPage from "./pages/CartPage"
import { CartProvider } from "./hooks/useCart"
import "./styles/global.css"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import SellerDashboard from "./pages/SellerDashboard"
import AdminDashboard from "./components/AdminDashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import LandingPage from "./pages/LandingPage"
import Settings from "./pages/Settings"
import OrderStatus from "./components/OrderStatus"
import OrderStatusPage from "./pages/OrderStatusPage"
import SellerOrdersPage from "./pages/SellerOrdersPage"
import SupportPage from "./pages/SupportPage"
import Chat from "./components/Chat"

// Component to conditionally render the Chat based on the current route
const AppContent = () => {
  const location = useLocation();
  const currentPath = location.pathname;
    // Exclude Chat from login and register pages
  const shouldShowChat = !["/login", "/register"].includes(currentPath);
  
  return (
    <>
      <Routes>        
        <Route path="/" element={<Home />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/store/:id" element={<StorePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />          <Route 
          path="/seller" 
          element={
            <ProtectedRoute requiredRole="Seller">
              <SellerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/seller-orders" 
          element={
            <ProtectedRoute requiredRole="Seller">
              <SellerOrdersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/seller" element={<Settings />} />        <Route path="/support" element={<SupportPage />} />
        <Route path="/order-status/:orderId" element={<OrderStatusPage />} />
        <Route path="/order-status" element={<OrderStatus />} />
      </Routes>
      {/* Conditionally render Chat component based on the current route */}
      {shouldShowChat && <Chat />}
    </>
  );
};

function App() {
  return (
    <CartProvider>
      <Router>
        <AppContent />
      </Router>
    </CartProvider>
  )
}

export default App
