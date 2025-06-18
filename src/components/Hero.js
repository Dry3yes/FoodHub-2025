import "../styles/Hero.css"

import { useNavigate } from "react-router-dom"
import "../styles/Hero.css"

function Hero() {
  const navigate = useNavigate();

  const handleOrderNow = () => {
    navigate("/settings");
  };


  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <div className="hero-text">
          <h2>Cara mudah nikmati makanan favorit kapan saja.</h2>
          <p>
            Memberikan pengalaman terbaik bagi mahasiswa pecinta kuliner melalui pengambilan cepat tanpa antre, makanan segar, dan layanan efisien sebagai solusi praktis untuk kebutuhan makan di lingkungan kampus.
          </p>
          <div className="hero-actions">
            <button className="btn-order-now" onClick={handleOrderNow}>
              Mulai Sekarang
              <img src="/Next.png" alt="Next" className="btn-icon" />
            </button>
            <span className="join-text">Bergabung sebagai Restoran</span>
          </div>
          
          {/* Statistics Section */}
          <div className="hero-stats">
            <div className="stat-item">
              <h3>30+</h3>
              <p>Restoran-restoran telah bekerja sama dengan FoodHub untuk mengembangkan bisnis mereka.</p>
            </div>
            <div className="stat-item">
              <h3>10k+</h3>
              <p>Hidangan lezat telah disajikan kepada pelanggan yang bahagia sebagai pengalaman makan terbaik.</p>
            </div>
          </div>
        </div>
        
        <div className="hero-image">
          <img src="/chef.png?height=400&width=300" alt="Chef" />
        </div>
        

      </div>
    </section>
  )
}

export default Hero