import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Header from "../components/Header"
import FoodCategories from "../components/FoodCategories"
import FoodItems from "../components/FoodItems"
import CartSidebar from "../components/CartSidebar"
import { fetchStores, getSellerReviews } from "../services/Api"
import "../styles/Home.css"

function Home() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadStores = async () => {
      try {
        setLoading(true)
        const stores = await fetchStores()
        
        // Map stores to the format needed for display
        // Fetch ratings for each store
        const mappedStores = await Promise.all(stores.map(async store => {
          let rating = null;
          let totalReviews = 0;
          
          try {
            const ratingData = await getSellerReviews(store.sellerId, 1, 0);
            if (ratingData && ratingData.totalReviews > 0) {
              rating = ratingData.averageRating;
              totalReviews = ratingData.totalReviews;
            }
          } catch (error) {
            console.error(`Failed to fetch rating for store ${store.sellerId}:`, error);
          }
          
          return {
            id: store.sellerId,
            name: store.storeName,
            slug: store.storeName.toLowerCase().replace(/\s+/g, ''),
            image: store.storeImageUrl || "/placeholder.svg?height=200&width=300",
            deliveryTime: store.deliveryTimeEstimate + " min",
            rating: rating,
            totalReviews: totalReviews
          }
        }))
        
        setRestaurants(mappedStores)
      } catch (err) {
        console.error("Failed to fetch stores:", err)
        setError("Failed to load restaurants. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    
    loadStores()
  }, [])
  return (
    <div className="home-container">
      <Header />

      <main className="main-content">
        <div className="grid-layout">
          <div className="main-column">
            <h1 className="page-title">Order delicious food online</h1>

            <FoodCategories />

            <div className="section">
              <h2 className="section-title">Popular Restaurants</h2>
              {loading ? (
                <div className="loading-container">
                  <p>Loading restaurants...</p>
                </div>
              ) : error ? (
                <div className="error-container">
                  <p>{error}</p>
                </div>
              ) : (
              <div className="restaurant-grid">
                {restaurants.map((restaurant) => (
                  <Link to={`/store/${restaurant.slug}`} key={restaurant.id} className="restaurant-card-link">
                    <div className="restaurant-card">
                      <div className="restaurant-image-container">
                        <img
                          src={restaurant.image || "/placeholder.svg"}
                          alt={restaurant.name}
                          className="restaurant-image"
                        />
                      </div>
                      <div className="restaurant-content">
                        <h3 className="restaurant-name">{restaurant.name}</h3>
                        <div className="restaurant-info">
                          <div className="restaurant-rating">
                            {restaurant.rating !== null ? (
                              <>
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`star-icon ${i < Math.floor(restaurant.rating) ? "filled" : "empty"}`}
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
                                <span className="rating-value">{restaurant.rating.toFixed(1)}</span>
                              </>
                            ) : (
                              <>
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className="star-icon empty"
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
                                <span className="rating-value">N/A</span>
                              </>
                            )}
                          </div>
                          <span className="info-separator">•</span>
                          <span>{restaurant.deliveryTime}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              )}
            </div>

            <div className="section">
              <h2 className="section-title">Featured Items</h2>
              <FoodItems />
            </div>
          </div>

          <div className="sidebar-column">
            <CartSidebar />
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-column">
              <h3 className="footer-heading">FoodHub</h3>
              <p className="footer-text">Delicious food delivered to your doorstep</p>
              <p className="footer-text">contact@foodhub.com</p>
              <p className="footer-text">+1 (555) 123-4567</p>
            </div>

            <div className="footer-column">
              <h3 className="footer-heading">Quick Links</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/" className="footer-link">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="footer-link">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/menu" className="footer-link">
                    Menu
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="footer-link">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-heading">Legal</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/terms" className="footer-link">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="footer-link">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-heading">Download Our App</h3>
              <div className="app-buttons">
                <button className="app-button">
                  <svg className="app-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.5234 12.0371C17.5 10.8984 17.9375 9.9375 18.8203 9.19922C18.2578 8.36328 17.3672 7.875 16.1719 7.73438C15.0312 7.59375 13.7969 8.0625 13.1875 8.0625C12.5547 8.0625 11.4609 7.75781 10.5469 7.75781C8.90625 7.78125 7.125 8.95312 6.30469 10.7109C4.59375 14.2969 5.85938 19.5 7.49219 22.3594C8.32031 23.7656 9.28906 25.3438 10.5469 25.2891C11.7656 25.2344 12.2344 24.4922 13.7031 24.4922C15.1484 24.4922 15.5859 25.2891 16.8516 25.2578C18.1641 25.2344 18.9922 23.8359 19.7969 22.4297C20.4297 21.3359 20.9219 20.1172 21.2344 18.8047C19.3125 17.9766 17.5469 16.1953 17.5234 12.0371Z" />
                    <path d="M14.9531 6.07031C15.6797 5.17969 16.1016 3.98438 15.9766 2.78906C14.9297 2.85156 13.6875 3.46094 12.9141 4.35156C12.2109 5.15625 11.7188 6.375 11.8672 7.54688C13.0078 7.64062 14.2266 6.96094 14.9531 6.07031Z" />
                  </svg>
                  App Store
                </button>
                <button className="app-button">
                  <svg className="app-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.00977 5.83789C3.00977 5.28561 3.45748 4.83789 4.00977 4.83789H20C20.5523 4.83789 21 5.28561 21 5.83789V17.1621C21 18.2667 20.1046 19.1621 19 19.1621H5C3.89543 19.1621 3 18.2667 3 17.1621V6.16211C3 6.11449 3.00333 6.06765 3.00977 6.0218V5.83789ZM5 8.06165V17.1621H19V8.06199L14.1215 12.9405C12.9499 14.1121 11.0504 14.1121 9.87885 12.9405L5 8.06165ZM6.57232 6.80554H17.428L12.7073 11.5263C12.3168 11.9168 11.6836 11.9168 11.2931 11.5263L6.57232 6.80554Z" />
                  </svg>
                  Google Play
                </button>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2023 FoodHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
