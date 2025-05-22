import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import Home from "./pages/Home"
import StorePage from "./pages/StorePage"
import CartPage from "./pages/CartPage"
import { CartProvider } from "./hooks/useCart"
import "./styles/global.css"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import SellerDashboard from "./pages/SellerDashboard"
import LandingPage from "./pages/LandingPage"
import Settings from "./pages/Settings"
import StatusPage from "./pages/StatusPage"
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
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/seller" element={<Settings />} />
        {/* <Route path="/order-status/:orderId" element={<StatusPage />} /> */}
        <Route path="/order-status" element={<StatusPage />} />
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
