import React from 'react';
import './App.css';

// Mengimpor komponen
import Header from './components/Header';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';  // Contoh komponen produk
import CartSummary from './components/CartSummary'; // Contoh komponen ringkasan keranjang
import Home from './pages/Home';  // Halaman utama

function App() {
  return (
    <div className="App">
      {/* Komponen Header */}
      <Header />

      {/* Halaman utama - Home */}
      <Home />

      {/* Komponen Footer */}
      <Footer />
    </div>
  );
}

export default App;
