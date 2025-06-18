import "../styles/Testimonials.css"

function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Gabriel A.R.",
      image: "/52824834.jpeg?height=100&width=100",
      text: "FoodHub membuat pesan makanan jadi sangat mudah! Pengirimannya selalu tepat waktu dan makanannya tiba dalam keadaan hangat.",
    },
    {
      id: 2,
      name: "Luther Choo",
      image: "/Luther.jpg?height=100&width=100",
      text: "Layanan pelanggan sangat luar biasa! Ketika saya mengalami masalah dengan pesanan saya, mereka segera menyelesaikannya.",
    },
    {
      id: 3,
      name: "Farell Rafael",
      image: "/Farell.jpg?height=100&width=100",
      text: "Layanan pelanggan sangat luar biasa! Ketika saya mengalami masalah dengan pesanan saya, mereka segera menyelesaikannya.",
    },
    {
      id: 4,
      name: "Jason",
      image: "/David.png?height=100&width=100",
      text: "Pesan makanan kapan aja pakai FoodHub! Prosesnya cepat, aman, dan makanan yang kamu pesan selalu diterima hangat dan nikmat.",
    },
  ]

  return (
    <section className="testimonials">
      <h2>Cerita Mereka Tentang FoodHub</h2>

      <div className="testimonials-container">
        {testimonials.map((testimonial) => (
          <div className="testimonial" key={testimonial.id}>
            <div className="testimonial-image">
              <img src={testimonial.image || "/placeholder.svg"} alt={testimonial.name} />
            </div>
            <p className="testimonial-text">{testimonial.text}</p>
            <h4 className="testimonial-name">{testimonial.name}</h4>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Testimonials
