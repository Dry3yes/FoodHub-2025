import "../styles/Hero.css"

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <div className="hero-text">
          <h2>The easiest way to enjoy your favorite meals anytime.</h2>
          <p>
            Providing the best experience for food enthusiasts with quick pickups, fresh meals, and excellent service as the optimal solution for your culinary needs.
          </p>
          <button className="btn-order-now">
         Get Started Now
         <img src="/next.png" alt="Next" className="btn-icon" />
          </button>
      <span className="join-text">Join as Restaurant</span>
        </div>
        <div className="hero-image">
          <img src="/chef.png?height=400&width=300" alt="Chef" />
        </div>
      </div>
    </section>
  )
}

export default Hero
