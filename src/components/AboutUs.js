import "../styles/AboutUs.css"

function AboutUs() {
  return (
    <section className="about-us" id="about">
      <div className="section-divider"></div>
      <h2>Tentang Kami</h2>
      <p className="about-description">
        FoodHub adalah platform inovatif yang bertujuan untuk menghubungkan para penggemar kuliner dengan berbagai pilihan hidangan dan minuman dari beragam restoran dan vendor terpercaya. Kami menyediakan solusi mudah dan modern bagi siapa pun yang ingin menikmati makanan favorit mereka tanpa repot.

Dengan menggunakan FoodHub, Anda dapat dengan cepat menemukan beragam pilihan makanan yang sesuai dengan selera, kebutuhan diet, maupun preferensi pribadi Anda. Kami berkomitmen untuk memberikan pengalaman pemesanan yang cepat, muda bagi pengguna.
      </p>
      
      <div className="about-sections">
        <div className="about-section">
          <h3>Visi Kami</h3>
          <div className="about-content">
            <div className="about-image">
              <img 
                src="/Vision.png" 
                alt="Food delivery team planning" 
              />
            </div>
            <p>
              Menjadi platform pengantaran makanan terbaik yang menawarkan kenyamanan dan kenyamanan bagi pengguna untuk menikmati
              berbagai pilihan masakan dari seluruh dunia, sambil mendukung bisnis kuliner
              untuk tumbuh dan menjangkau audiens yang lebih luas.
            </p>
          </div>
        </div>

        <div className="about-section">
          <h3>Misi Kami</h3>
          <div className="about-content">
            <p>
              Misi kami adalah untuk memudahkan pengguna mengakses makanan favorit mereka dengan mengumpulkan berbagai
              restoran dalam satu platform yang sederhana dan mudah digunakan. Kami berdedikasi untuk mendukung
              bisnis kuliner dengan menyediakan platform yang membantu mereka memperluas jangkauan pasar, meningkatkan penjualan mereka,
              dan mengelola pesanan mereka dengan lebih efisien. Dalam segala hal yang kami lakukan, kami bertujuan untuk memberikan pengalaman pengguna yang tak terlupakan dengan memastikan bahwa setiap transaksi berjalan lancar dengan teknologi yang aman, antarmuka pengguna yang ramah, dan dukungan pelanggan yang responsif.
            </p>
            <div className="about-image">
              <img 
                src="/Mission.png"  
                alt="Restaurant kitchen preparation" 
              />
            </div>
          </div>
        </div>

        <div className="about-section">
          <h3>Layanan Kami</h3>
          <div className="about-content">
            <div className="about-image">
              <img 
                src="/Offer.png"  
                alt="Delicious food variety" 
              />
            </div>
            <p>
              FoodHub memudahkan mahasiswa dan penghuni BINUS untuk memesan makanan favorit mereka dengan cepat
              dan tanpa usaha. Dengan banyak pilihan makanan dari favorit lokal hingga kafe populer, pengguna dapat
              menikmati pemesanan yang cepat, pelacakan waktu nyata, dan pembayaran tanpa uang tunai. Plus, kami menawarkan promo reguler
              untuk membantu Anda menghemat lebih banyak sambil menikmati makanan lezat di sekitar kampus.
            </p>
          </div>
          <div className="section-divider"></div>
        </div>
      </div>


    </section>
  )
}

export default AboutUs