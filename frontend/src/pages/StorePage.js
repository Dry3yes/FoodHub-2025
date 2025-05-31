"use client"
import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import Header from "../components/Header"
import CartSidebar from "../components/CartSidebar"
import ConfirmationModal from "../components/ConfirmationModal"
import MenuItemRating from "../components/MenuItemRating"
import { useCart } from "../hooks/useCart"
import { fetchStoreBySlug, fetchMenusByStore, getSellerReviews } from "../services/Api"
import styles from "../styles/StorePage.module.css"

// Fallback data in case API fails
const fallbackStoreData = [
  {
    id: 1,
    name: "Baked Fillets Shrimp Eggplant",
    coverImage: "/placeholder.svg?height=300&width=900",
    logo: "/placeholder.svg?height=100&width=100",
    rating: null,
    totalReviews: 0,
    cuisine: "Seafood",
    deliveryTime: "25-30 min",
    description:
      "Specializing in fresh seafood dishes with a Mediterranean twist. Our chefs use only the freshest ingredients to create memorable dining experiences.",
    menuCategories: [
      {
        id: 1,
        name: "Popular Items",
        items: [
          {
            id: 101,
            name: "Baked Fillets with Shrimp",
            description: "Fresh fish fillets baked with shrimp, herbs, and lemon",
            price: 19.99,
            image: "/placeholder.svg?height=100&width=100",
          },
          {
            id: 102,
            name: "Eggplant Parmesan",
            description: "Layers of eggplant, marinara sauce, and cheese",
            price: 14.99,
            image: "/placeholder.svg?height=100&width=100",
          },
          {
            id: 103,
            name: "Seafood Pasta",
            description: "Linguine with mixed seafood in a white wine sauce",
            price: 18.99,
            image: "/placeholder.svg?height=100&width=100",
          },
        ],
      },
      {
        id: 2,
        name: "Appetizers",
        items: [
          {
            id: 201,
            name: "Calamari",
            description: "Crispy fried calamari with marinara sauce",
            price: 12.99,
            image: "/placeholder.svg?height=100&width=100",
          },
          {
            id: 202,
            name: "Bruschetta",
            description: "Toasted bread topped with tomatoes, basil, and olive oil",
            price: 9.99,
            image: "/placeholder.svg?height=100&width=100",
          },
        ],
      },
      {
        id: 3,
        name: "Main Courses",
        items: [
          {
            id: 301,
            name: "Grilled Salmon",
            description: "Atlantic salmon with lemon butter sauce",
            price: 22.99,
            image: "/placeholder.svg?height=100&width=100",
          },
          {
            id: 302,
            name: "Shrimp Scampi",
            description: "Shrimp sautéed in garlic butter and white wine",
            price: 20.99,
            image: "/placeholder.svg?height=100&width=100",
          },
        ],
      },
    ],
  },  {
    id: 2,
    name: "Truffle Belly Shrimp",
    coverImage: "/placeholder.svg?height=300&width=900",
    logo: "/placeholder.svg?height=100&width=100",
    rating: null,
    totalReviews: 0,
    cuisine: "Seafood",
    deliveryTime: "20-30 min",
    description: "Gourmet seafood restaurant specializing in truffle-infused dishes and premium shrimp preparations.",
    menuCategories: [
      {
        id: 1,
        name: "Signature Dishes",
        items: [
          {
            id: 101,
            name: "Truffle Shrimp Risotto",
            description: "Creamy risotto with shrimp and black truffle",
            price: 24.99,
            image: "/placeholder.svg?height=100&width=100",
          },
          {
            id: 102,
            name: "Pork Belly with Truffle",
            description: "Slow-cooked pork belly with truffle glaze",
            price: 22.99,
            image: "/placeholder.svg?height=100&width=100",
          },
        ],
      },
    ],
  },
]

function StorePage() {
  const { id: slug } = useParams()
  const { addToCart, clearCartAndAddItem } = useCart()
  
  const [store, setStore] = useState(null)
  const [menuItems, setMenuItems] = useState([])
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
      sellerId: store?.id,
      storeName: store?.name,
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
    const fetchStoreData = async () => {
      try {
        setLoading(true)
        
        // Fetch store details
        const storeData = await fetchStoreBySlug(slug)
        
        if (!storeData) {
          setError("Store not found")
          setLoading(false)
          return
        }
          // Add random data for fields not available in the backend
        let rating = null;
        let totalReviews = 0;
        
        try {
          const ratingData = await getSellerReviews(storeData.sellerId, 1, 0);
          if (ratingData && ratingData.totalReviews > 0) {
            rating = ratingData.averageRating;
            totalReviews = ratingData.totalReviews;
          }
        } catch (error) {
          console.error(`Failed to fetch rating for store ${storeData.sellerId}:`, error);
        }
        
        const completeStoreData = {
          id: storeData.sellerId,
          name: storeData.storeName,
          coverImage: storeData.storeImageUrl || "/placeholder.svg?height=300&width=900", // Use placeholder if none exists
          logo: "/placeholder.svg?height=100&width=100",
          rating: rating,
          totalReviews: totalReviews,
          deliveryTime: storeData.deliveryTimeEstimate + " min",
          description: storeData.description,
        }
        
        setStore(completeStoreData)
        
        // Fetch menu items
        const menuData = await fetchMenusByStore(storeData.sellerId)
        
        // Organize menu items by category
        const categorizedMenu = organizeMenuByCategory(menuData)
        setStore(prev => ({ ...prev, menuCategories: categorizedMenu }))
        
      } catch (err) {
        console.error("Error fetching store data:", err)
        setError("Failed to load store data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchStoreData()
  }, [slug])
  
  // Function to organize menu items by category
  const organizeMenuByCategory = (menuItems) => {
    if (!menuItems || menuItems.length === 0) return []
    
    // Group items by category
    const groupedByCategory = menuItems.reduce((acc, item) => {
      const category = item.category || "Other"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(item)
      return acc
    }, {})
    
    // Convert to the format expected by the UI
    return Object.keys(groupedByCategory).map((category, index) => {
      return {
        id: index + 1,
        name: category,
        items: groupedByCategory[category].map(item => ({
          id: item.id,
          name: item.itemName,
          description: `${item.category} dish, prepared with fresh ingredients`,
          price: item.price,
          image: item.imageURL || "/placeholder.svg?height=100&width=100",
        }))
      }
    })
  }

  if (loading) {
    return (
      <div className={styles["store-page-container"]}>
        <Header />
        <main className={styles["store-main-content"]}>
          <div className={styles["loading-container"]}>
            <p>Loading store information...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !store) {
    return (
      <div className={styles["store-page-container"]}>
        <Header />
        <main className={styles["store-main-content"]}>
          <Link to="/" className={styles["back-link"]}>
            <svg
              className={styles["back-icon"]}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Back to restaurants
          </Link>
          <div className={styles["error-container"]}>
            <p>{error || "Store not found"}</p>
            <Link to="/" className={styles["back-button"]}>Return to Home</Link>
          </div>
        </main>
      </div>
    )
  }
  
  return (
    <div className={styles["store-page-container"]}>
      <Header />

      <main className={styles["store-main-content"]}>
        <Link to="/" className={styles["back-link"]}>
          <svg
            className={styles["back-icon"]}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back to restaurants
        </Link>

        <div className={styles["store-grid-layout"]}>
          <div className={styles["store-main-column"]}>
            <div className={styles["store-header-card"]}>
              <div className={styles["store-cover-image-container"]}>
                <img src={store.coverImage || "/placeholder.svg"} alt={store.name} className={styles["store-cover-image"]} />
              </div>
              <div className={styles["store-header-content"]}>
                <h1 className={styles["store-title"]}>{store.name}</h1>
                <div className={styles["store-info"]}>                  
                  <div className={styles["store-rating"]}>
                    {store.rating !== null ? (
                      <>
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`${styles["star-icon"]} ${i < Math.floor(store.rating) ? styles["filled"] : styles["empty"]}`}
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
                        <span>{store.rating.toFixed(1)}</span>
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
                        <span>N/A</span>
                      </>
                    )}
                  </div>
                  <span className={styles["info-separator"]}>•</span>
                  <span>{store.deliveryTime}</span>
                </div>
                <p className={styles["store-description"]}>{store.description}</p>
              </div>
            </div>

            <div className={styles["menu-card"]}>
              <h2 className={styles["store-menu-title"]}>Menu</h2>

              {store.menuCategories && store.menuCategories.length > 0 ? (
                store.menuCategories.map((category) => (
                <div key={category.id} className={styles["menu-category"]}>
                  <h3 className={styles["category-title"]}>{category.name}</h3>
                  <div className={styles["menu-items"]}>
                    {category.items.map((item) => (
                      <div key={item.id} className={styles["menu-item"]}>
                        <div className={styles["menu-item-image-container"]}>
                          <img src={item.image || "/placeholder.svg"} alt={item.name} className={styles["menu-item-image"]} />
                        </div>
                        <div className={styles["menu-item-content"]}>
                          <div>
                            <h4 className={styles["menu-item-name"]}>{item.name}</h4>
                            <p className={styles["menu-item-description"]}>{item.description}</p>
                            <MenuItemRating menuId={item.id} />
                          </div>
                          <div className={styles["store-menu-item-actions"]}>
                            <span className={styles["menu-item-price"]}>Rp {item.price.toLocaleString('id-ID')}</span>
                            <button
                              className={styles["add-to-cart-button"]}
                              onClick={() => handleAddToCart(item)}
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )))
              : (
                <div className={styles["no-menu-items"]}>
                  <p>No menu items available for this restaurant.</p>
                </div>
              )}
            </div>
          </div>

          <div className={styles["store-sidebar-column"]}>
            <CartSidebar />
          </div>
        </div>
      </main>
      <footer className={styles["store-footer"]}>
        <div className={styles["footer-content"]}>
          <div className={styles["footer-text"]}>
            <p>© 2023 FoodHub. All rights reserved.</p>
          </div>
        </div>
      </footer>

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

export default StorePage
