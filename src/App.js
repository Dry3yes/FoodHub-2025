import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import StorePage from "./pages/StorePage"
import CartPage from "./pages/CartPage"
import { CartProvider } from "./hooks/useCart"
import "./styles/global.css"

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/store/:id" element={<StorePage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </Router>
    </CartProvider>
  )
}

export default App
