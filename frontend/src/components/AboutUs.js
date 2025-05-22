import "../styles/AboutUs.css"

function AboutUs() {
  return (
    <section className="about-us" id="about">
      <h2>About Us</h2>
      <p className="about-description">
        FoodHub is an innovative platform that connects food enthusiasts with a wide variety of dishes and drinks from various restaurants and vendors. With FoodHub, you can easily find food that suits your taste and needs, providing a fast, easy, and secure ordering experience.
      </p>

      <div className="about-sections">
        <div className="about-section">
          <h3>Our Vision</h3>
          <div className="about-content">
            <div className="about-image">
            </div>
            <p>
              To be the best food delivery platform that offers convenience and comfort for users to enjoy a diverse selection of cuisine from around the world, while supporting culinary businesses to grow and reach a broader audience.
            </p>
          </div>
        </div>

        <div className="about-section">
          <h3>Our Mission</h3> 
          <div className="about-content">
            <p>
              Our mission is to make it easier for users to access their favorite foods by gathering various restaurants in one simple and easy-to-use platform. We are dedicated to supporting culinary businesses by providing a platform that helps them expand their market reach, increase their sales, and manage their orders more efficiently. In everything we do, we aim to deliver an unforgettable user experience by ensuring that every transaction runs smoothly with secure technology, a friendly user interface, and responsive customer support.
            </p>
            <div className="about-image">
            </div>
          </div>
        </div>

        <div className="about-section">
          <h3>What We Offer</h3>
          <div className="about-content">
            <div className="about-image">
            </div>
            <p>
              FoodHub makes it easy for BINUS students and residents to order their favorite meals quickly and effortlessly. With plenty of food choices from local favorites to popular cafes, users can enjoy fast ordering, real-time tracking, and cashless payments. Plus, we offer regular promos to help you save more while enjoying great food around campus.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutUs
