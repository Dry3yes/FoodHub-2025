import "../styles/Testimonials.css"

function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      image: "/Sarah.png?height=100&width=100",
      text: "FoodHub has made ordering food so convenient! The delivery is always on time and the food arrives hot and fresh.",
    },
    {
      id: 2,
      name: "Michael Chen",
      image: "/Michael.png?height=100&width=100",
      text: "The customer service is exceptional! When I had an issue with my order, they resolved it immediately.",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      image: "/Emily.png?height=100&width=100",
      text: "The customer service is exceptional! When I had an issue with my order, they resolved it immediately.",
    },
    {
      id: 4,
      name: "David Kim",
      image: "/David.png?height=100&width=100",
      text: "FoodHub has the best deals and discounts. I save so much money ordering through them regularly.",
    },
  ]

  return (
    <section className="testimonials">
      <h2>FoodHub in Their Words</h2>

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
