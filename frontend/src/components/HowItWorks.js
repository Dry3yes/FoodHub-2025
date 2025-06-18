import "../styles/HowItWorks.css"

function HowItWorks() {
  return (
    <section className="how-it-works">
      <h2>Lihat Cara Kerjanya</h2>
      <p className="section-subtitle">Pesan makanan dari restoran favoritmu hanya dengan beberapa klik saja.</p>

      <div className="steps-container">
        <div className="step">
          <div className="step-number">1</div>
          <h3>Jelajahi Restorans</h3>
          <p>Temukan restoran favoritmu dan lihat menu mereka</p>
        </div>

        <div className="step">
          <div className="step-number">2</div>
          <h3>Lakukan Pemesanan</h3>
          <p>Pilih itemmu, sesuaikan sesuai kebutuhan, dan lakukan pemesanan</p>
        </div>

        <div className="step">
          <div className="step-number">3</div>
          <h3>Ambil Makananmu</h3>
          <p>Lewati antrean dan ambil pesananmu saat sudah siap</p>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
