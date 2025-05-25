"use client"
import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import Header from "../components/Header"
import CartSidebar from "../components/CartSidebar"
import { useCart } from "../hooks/useCart"
import { fetchStoreBySlug, fetchMenusByStore } from "../services/Api"
import "../styles/StorePage.css"

// Generate random additional data for store display if missing from backend
const generateRandomData = () => {
  const ratings = [4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0]
  
  return {
    rating: ratings[Math.floor(Math.random() * ratings.length)],
  }
}

// Fallback data in case API fails
const fallbackStoreData = [
  {
    id: 1,
    name: "Baked Fillets Shrimp Eggplant",
    coverImage: "/placeholder.svg?height=300&width=900",
    logo: "/placeholder.svg?height=100&width=100",
    rating: 4.8,
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
  },
  {
    id: 2,
    name: "Truffle Belly Shrimp",
    coverImage: "/placeholder.svg?height=300&width=900",
    logo: "/placeholder.svg?height=100&width=100",
    rating: 4.5,
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
  const { addToCart } = useCart()
  
  const [store, setStore] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
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
        const randomData = generateRandomData()
        const completeStoreData = {
          id: storeData.sellerId,
          name: storeData.storeName,
          coverImage: storeData.storeImageUrl || "/placeholder.svg?height=300&width=900", // Use placeholder if none exists
          logo: "/placeholder.svg?height=100&width=100",
          rating: randomData.rating,
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
      <div className="store-page-container">
        <Header />
        <main className="store-main-content">
          <div className="loading-container">
            <p>Loading store information...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !store) {
    return (
      <div className="store-page-container">
        <Header />
        <main className="store-main-content">
          <Link to="/" className="back-link">
            <svg
              className="back-icon"
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
          <div className="error-container">
            <p>{error || "Store not found"}</p>
            <Link to="/" className="back-button">Return to Home</Link>
          </div>
        </main>
      </div>
    )
  }
  
  return (
    <div className="store-page-container">
      <Header />

      <main className="store-main-content">
        <Link to="/" className="back-link">
          <svg
            className="back-icon"
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

        <div className="store-grid-layout">
          <div className="store-main-column">
            <div className="store-header-card">
              <div className="store-cover-image-container">
                <img src={store.coverImage || "/placeholder.svg"} alt={store.name} className="store-cover-image" />
              </div>
              <div className="store-header-content">
                <h1 className="store-title">{store.name}</h1>
                <div className="store-info">
                  <div className="store-rating">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`star-icon ${i < Math.floor(store.rating) ? "filled" : "empty"}`}
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
                    <span>{store.rating}</span>
                  </div>
                  <span className="info-separator">•</span>
                  <span>{store.deliveryTime}</span>
                </div>
                <p className="store-description">{store.description}</p>
              </div>
            </div>

            <div className="menu-card">
              <h2 className="store-menu-title">Menu</h2>

              {store.menuCategories && store.menuCategories.length > 0 ? (
                store.menuCategories.map((category) => (
                <div key={category.id} className="menu-category">
                  <h3 className="category-title">{category.name}</h3>
                  <div className="menu-items">
                    {category.items.map((item) => (
                      <div key={item.id} className="menu-item">
                        <div className="menu-item-image-container">
                          <img src={item.image || "/placeholder.svg"} alt={item.name} className="menu-item-image" />
                        </div>
                        <div className="menu-item-content">
                          <div>
                            <h4 className="menu-item-name">{item.name}</h4>
                            <p className="menu-item-description">{item.description}</p>
                          </div>
                          <div className="store-menu-item-actions">
                            <span className="menu-item-price">Rp {item.price.toLocaleString('id-ID')}</span>
                            <button
                              className="add-to-cart-button"
                              onClick={() =>
                                addToCart({
                                  id: item.id,
                                  name: item.name,
                                  price: item.price,
                                  image: item.image,
                                  quantity: 1,
                                  sellerId: store?.id,
                                  storeName: store?.name,
                                })
                              }
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
                <div className="no-menu-items">
                  <p>No menu items available for this restaurant.</p>
                </div>
              )}
            </div>
          </div>

          <div className="store-sidebar-column">
            <CartSidebar />
          </div>
        </div>
      </main>

      <footer className="store-footer">
        <div className="footer-content">
          <div className="footer-text">
            <p>© 2023 FoodHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default StorePage
