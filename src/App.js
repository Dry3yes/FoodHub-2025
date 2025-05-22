import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
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
import Chat from "./components/Chat"

function App() {
  return (
    <CartProvider>
      <Router>
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
        </Routes>
        {/* Chat component that appears on all pages */}
        <Chat />
      </Router>
    </CartProvider>
  )
}

export default App
