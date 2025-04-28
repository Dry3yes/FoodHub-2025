import React from 'react';
import './Aboutus.css';

const AboutUs = () => {
    return (
      <div className="container">
          {/* <!-- Section 1 - Image on Right --> */}
          <div className="section1">
              <div className="text">
                  <h2>Crafting the Future of Food Ordering</h2>
                  <p>
                      Di FoodHub, kami percaya bahwa kemudahan dan kecepatan adalah kunci dalam menikmati makanan.
                      Dengan teknologi inovatif dan sistem yang efisien, kami menghadirkan pengalaman pemesanan makanan
                      yang seamless, cepat, dan bebas repot.
                  </p>
              </div>
              <div className="image">
                  <img src="/Images/AboutUs_1.png" alt="Team Working"/>
              </div>
          </div>
            <div className="highlight">
                <p>
                    Kami berkomitmen untuk menghubungkan pelanggan dengan restoran terbaik, menghadirkan
                    berbagai pilihan kuliner, serta memastikan setiap pesanan tiba dengan akurat dan tepat waktu.
                    Bersama, kami menciptakan cara baru dalam menikmati makanan dengan lebih fleksibel dan modern.
                </p>
          </div>

          {/* <!-- Section 2 - Image on Left --> */}
          <div className="section2">
              <div className="text">
                  <h2>Our Mission</h2>
                  <p>
                      Menyediakan pengalaman pemesanan makanan yang lebih praktis dan nyaman, dengan layanan yang cepat,
                      transparan, dan dapat diandalkan. Kami terus berinovasi untuk menghadirkan teknologi terbaik yang
                      menghubungkan pelanggan dengan makanan favorit mereka kapan saja dan di mana saja.
                  </p>
              </div>
              <div className="image">
                    <img src="/Images/AboutUs_2.png" alt="Woman with Phone"/>
              </div>
          </div>

          {/* <!-- Section 3 - Image on Right --> */}
          <div className="section3">
              <div className="text">
                  <h2>Our Vision</h2>
                  <p>
                      Menjadi platform food-ordering terdepan yang memberikan pengalaman terbaik bagi pelanggan dan mitra restoran.
                      Dengan teknologi modern dan sistem yang efisien, FoodHub bertekad untuk terus berkembang dan membangun
                      ekosistem kuliner yang lebih cerdas, praktis, dan menyenangkan bagi semua.
                  </p>
              </div>
              <div className="image">
                    <img src="/Images/AboutUs_3.png" alt="Person Holding Coffee"/>
              </div>
          </div>
      </div>
  );
};

export default AboutUs;