"use client"
import { useState, useEffect } from "react"
import { useCart } from "../hooks/useCart"
import { fetchStores, fetchMenusByStore } from "../services/Api"
import "../styles/FoodItems.css"

// Fallback data in case API calls fail
const fallbackFoodItems = [
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
  const [foodItems, setFoodItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFeaturedMenuItems = async () => {
      try {
        setLoading(true)
        
        // First, fetch stores to get their IDs
        const stores = await fetchStores()
        
        if (!stores || stores.length === 0) {
          setFoodItems(fallbackFoodItems)
          return
        }
        
        // Select up to 3 random stores to fetch menu items from
        const selectedStores = stores.slice(0, Math.min(3, stores.length))
        
        // Fetch menu items for each selected store
        const menuPromises = selectedStores.map(store => fetchMenusByStore(store.sellerId))
        const menuResults = await Promise.allSettled(menuPromises)
        
        // Process successful results
        const allMenuItems = menuResults
          .filter(result => result.status === 'fulfilled' && result.value)
          .flatMap(result => result.value)
          .filter(item => item) // Remove null/undefined items
        
        // If we have items from the API, transform them
        if (allMenuItems.length > 0) {
          // Transform menu items to the format needed for display
          const transformedItems = allMenuItems
            .map(item => ({
              id: item.id,
              name: item.itemName,
              restaurant: item.storeName || 'Restaurant',
              rating: parseFloat((4 + Math.random()).toFixed(1)), // Random rating between 4.0-5.0
              price: item.price,
              image: item.imageURL || "/placeholder.svg?height=200&width=300"
            }))
            // Take random items or all if less than 6
            .slice(0, Math.min(6, allMenuItems.length))
          
          setFoodItems(transformedItems)
        } else {
          // Fallback to default items if no menu items found
          setFoodItems(fallbackFoodItems)
        }
      } catch (err) {
        console.error("Error fetching menu items:", err)
        // Use fallback data on error
        setFoodItems(fallbackFoodItems)
      } finally {
        setLoading(false)
      }
    }
    
    fetchFeaturedMenuItems()
  }, [])

  return (
    <div className="food-items-grid">
      {loading ? (
        <div className="loading-container">
          <p>Loading featured items...</p>
        </div>
      ) : foodItems.length === 0 ? (
        <div className="no-items-container">
          <p>No featured items available.</p>
        </div>
      ) : (
        foodItems.map((item) => (
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
      ))
      )}
    </div>
  )
}

export default FoodItems
