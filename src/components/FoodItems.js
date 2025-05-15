"use client"
import { useCart } from "../hooks/useCart"
import "../styles/FoodItems.css"

const foodItems = [
  {
    id: 1,
    name: "Baked Fillets Shrimp Eggplant",
    restaurant: "Seafood Delight",
    rating: 4.8,
    price: 19.99,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    name: "Truffle Belly Shrimp",
    restaurant: "Gourmet Bites",
    rating: 4.5,
    price: 24.99,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    name: "Oatmeal Delight Shrimp",
    restaurant: "Morning Feast",
    rating: 4.7,
    price: 14.99,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    name: "Beef Dumpling Noodle Soup",
    restaurant: "Asian Fusion",
    rating: 4.6,
    price: 16.99,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 5,
    name: "Baked Fillets Shrimp Eggplant",
    restaurant: "Seafood Delight",
    rating: 4.8,
    price: 19.99,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 6,
    name: "Truffle Belly Shrimp",
    restaurant: "Gourmet Bites",
    rating: 4.5,
    price: 24.99,
    image: "/placeholder.svg?height=200&width=300",
  },
]

function FoodItems() {
  const { addToCart } = useCart()

  return (
    <div className="food-items-grid">
      {foodItems.map((item) => (
        <div key={item.id} className="food-item-card">
          <div className="food-item-image-container">
            <img src={item.image || "/placeholder.svg"} alt={item.name} className="food-item-image" />
          </div>
          <div className="food-item-content">
            <h3 className="food-item-name">{item.name}</h3>
            <div className="food-item-info">
              <div className="food-item-rating">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="star-icon filled"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span>{item.rating}</span>
              </div>
              <span className="info-separator">•</span>
              <span>{item.restaurant}</span>
            </div>
            <div className="food-item-price">${item.price.toFixed(2)}</div>
          </div>
          <div className="food-item-footer">
            <button
              className="add-to-cart-button"
              onClick={() =>
                addToCart({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  image: item.image,
                  quantity: 1,
                })
              }
            >
              Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default FoodItems
