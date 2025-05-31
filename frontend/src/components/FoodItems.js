"use client"
import { useState, useEffect } from "react"
import { useCart } from "../hooks/useCart"
import { fetchStores, fetchMenusByStore, getMenusByCategory, getMenuItemReviews } from "../services/Api"
import ConfirmationModal from "./ConfirmationModal"
import styles from "../styles/FoodItems.module.css"

// Fallback data in case API calls fail
const fallbackFoodItems = [
  {
    id: 1,
    name: "Baked Fillets Shrimp Eggplant",
    restaurant: "Seafood Delight",
    rating: null,
    totalReviews: 0,
    price: 19.99,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    name: "Truffle Belly Shrimp",
    restaurant: "Gourmet Bites",
    rating: null,
    totalReviews: 0,
    price: 24.99,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    name: "Oatmeal Delight Shrimp",
    restaurant: "Morning Feast",
    rating: null,
    totalReviews: 0,
    price: 14.99,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    name: "Beef Dumpling Noodle Soup",
    restaurant: "Asian Fusion",
    rating: null,
    totalReviews: 0,
    price: 16.99,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 5,
    name: "Baked Fillets Shrimp Eggplant",
    restaurant: "Seafood Delight",
    rating: null,
    totalReviews: 0,
    price: 19.99,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 6,
    name: "Truffle Belly Shrimp",
    restaurant: "Gourmet Bites",
    rating: null,
    totalReviews: 0,
    price: 24.99,
    image: "/placeholder.svg?height=200&width=300",
  },
]

function FoodItems({ selectedCategory = "all" }) {
  const { addToCart, clearCartAndAddItem } = useCart()
  const [foodItems, setFoodItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingCartItem, setPendingCartItem] = useState(null)
  const [confirmationMessage, setConfirmationMessage] = useState("")

  const handleAddToCart = async (item) => {
    const cartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
      sellerId: item.sellerId,
      storeName: item.storeName,
    }

    const result = await addToCart(cartItem)
    
    if (!result.success && result.errorCode === "DIFFERENT_STORE") {
      // Show confirmation modal for store conflict
      setPendingCartItem(cartItem)
      setConfirmationMessage(result.message)
      setShowConfirmModal(true)
    }
  }

  const handleConfirmClearCart = async () => {
    if (pendingCartItem) {
      await clearCartAndAddItem(pendingCartItem)
    }
    setShowConfirmModal(false)
    setPendingCartItem(null)
    setConfirmationMessage("")
  }

  const handleCancelClearCart = () => {
    setShowConfirmModal(false)
    setPendingCartItem(null)
    setConfirmationMessage("")
  }

  useEffect(() => {
    const fetchFeaturedMenuItems = async () => {
      try {
        setLoading(true)
        
        let allMenuItems = []
        
        if (selectedCategory === "all") {
          // Fetch from multiple stores as before
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
          allMenuItems = menuResults
            .filter(result => result.status === 'fulfilled' && result.value)
            .flatMap(result => result.value)
            .filter(item => item) // Remove null/undefined items
        } else {
          // Fetch by category using the API
          const categoryMap = {
            "food": "Makanan",
            "drinks": "Minuman"
          }
          
          const backendCategory = categoryMap[selectedCategory]
          if (backendCategory) {
            allMenuItems = await getMenusByCategory(backendCategory)
          }
        }
        
        // If we have items from the API, transform them
        if (allMenuItems.length > 0) {
          // Transform menu items to the format needed for display and fetch ratings
          const transformedItems = await Promise.all(
            allMenuItems
              .slice(0, Math.min(6, allMenuItems.length))
              .map(async item => {
                let rating = null;
                let totalReviews = 0;
                
                try {
                  const ratingData = await getMenuItemReviews(item.id, 1, 0);
                  if (ratingData && ratingData.totalReviews > 0) {
                    rating = ratingData.averageRating;
                    totalReviews = ratingData.totalReviews;
                  }
                } catch (error) {
                  console.error(`Failed to fetch rating for menu item ${item.id}:`, error);
                }
                
                return {
                  id: item.id,
                  name: item.itemName,
                  restaurant: item.storeName || 'Restaurant',
                  rating: rating,
                  totalReviews: totalReviews,
                  price: item.price,
                  image: item.imageURL || "/placeholder.svg?height=200&width=300",
                  sellerId: item.sellerId,
                  storeName: item.storeName
                };
              })
          );
          
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
  }, [selectedCategory])

  return (
    <div className={styles["food-items-grid"]}>
      {loading ? (
        <div className={styles["loading-container"]}>
          <p>Loading featured items...</p>
        </div>
      ) : foodItems.length === 0 ? (
        <div className={styles["no-items-container"]}>
          <p>No featured items available.</p>
        </div>
      ) : (
        foodItems.map((item) => (
        <div key={item.id} className={styles["food-item-card"]}>
          <div className={styles["food-item-image-container"]}>
            <img src={item.image || "/placeholder.svg"} alt={item.name} className={styles["food-item-image"]} />
          </div>
          <div className={styles["food-item-content"]}>
            <h3 className={styles["food-item-name"]}>{item.name}</h3>
            <div className={styles["food-item-info"]}>
              <div className={styles["food-item-rating"]}>
                {item.rating !== null ? (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`${styles["star-icon"]} ${i < Math.floor(item.rating) ? styles["filled"] : styles["empty"]}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    ))}
                    <span className={styles["rating-value"]}>{item.rating.toFixed(1)}</span>
                  </>
                ) : (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`${styles["star-icon"]} ${styles["empty"]}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    ))}
                    <span className={styles["rating-value"]}>N/A</span>
                  </>
                )}
              </div>
              <span className={styles["info-separator"]}>•</span>
              <span>{item.restaurant}</span>
            </div>
            <div className={styles["food-item-price"]}>Rp {item.price.toLocaleString('id-ID')}</div>
          </div>
          <div className={styles["food-item-footer"]}>
            <button
              className={styles["add-to-cart-button"]}
              onClick={() => handleAddToCart(item)}
            >
              Add to Cart
            </button>
          </div>
        </div>
      ))
      )}
      
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={handleCancelClearCart}
        onConfirm={handleConfirmClearCart}
        title="Different Store Detected"
        message={`${confirmationMessage}\n\n`}
        confirmText="Clear Cart & Continue"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  )
}

export default FoodItems
