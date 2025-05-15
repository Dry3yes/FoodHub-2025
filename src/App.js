import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import StorePage from "./pages/StorePage"
import CartPage from "./pages/CartPage"
import { CartProvider } from "./hooks/useCart"
import "./styles/global.css"
import LoginPage from "./pages/LoginPage"
import LoginRegis_RightSide from "./components/LoginRegis_RightSide"
import RegisterPage from "./pages/RegisterPage"

// Auth layout wrapper
const AuthLayout = ({ children, rightSide }) => {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh' }}>
      {children}
      {rightSide}
    </div>
  );
};

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/store/:id" element={<StorePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={
            <AuthLayout 
              children={<LoginPage />} 
              rightSide={<LoginRegis_RightSide />} 
            />
          } />
          <Route path="/register" element={
            <AuthLayout 
              children={<RegisterPage />} 
              rightSide={<LoginRegis_RightSide />} 
            />
          } />
        </Routes>
      </Router>
    </CartProvider>
  )
}

export default App
