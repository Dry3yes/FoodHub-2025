import "../styles/HowItWorks.css"

function HowItWorks() {
  return (
    <section className="how-it-works">
      <h2>How it Works</h2>
      <p className="section-subtitle">Order food from your favorite restaurants in just a few clicks</p>

      <div className="steps-container">
        <div className="step">
          <div className="step-number">1</div>
          <h3>Browse Restaurants</h3>
          <p>Find your favorite restaurants and browse their menus</p>
        </div>

        <div className="step">
          <div className="step-number">2</div>
          <h3>Place Your Order</h3>
          <p>Select your items, customize as needed, and place your order</p>
        </div>

        <div className="step">
          <div className="step-number">3</div>
          <h3>Pick Up Your Food</h3>
          <p>Skip the line and pick up your order when it's ready</p>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
