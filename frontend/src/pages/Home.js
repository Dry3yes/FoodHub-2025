import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Header from "../components/Header"
import FoodCategories from "../components/FoodCategories"
import FoodItems from "../components/FoodItems"
import CartSidebar from "../components/CartSidebar"
import { fetchStores, fetchStoreById, getSellerReviews, searchMenusByName } from "../services/Api"
import "../styles/Home.css"
import Footer from '../components/Footer';
import '../styles/Footer.css';


function Home() {
  const [restaurants, setRestaurants] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchMode, setIsSearchMode] = useState(false)

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

  // Handle search functionality
  const handleSearch = async (query) => {
    setSearchQuery(query)
    
    if (!query || query.trim().length === 0) {
      setIsSearchMode(false)
      setSearchResults([])
      return
    }

    setIsSearchMode(true)
    setSearchLoading(true)
    setError(null)

    try {
      const results = await searchMenusByName(query.trim())
      
      if (results && results.length > 0) {
        // Transform search results to match restaurant display format
        const transformedResults = await Promise.all(results.map(async result => {
          let rating = null;
          let totalReviews = 0;
          let storeData = null;
          
          try {
            const ratingData = await getSellerReviews(result.sellerId, 1, 0);
            if (ratingData && ratingData.totalReviews > 0) {
              rating = ratingData.averageRating;
              totalReviews = ratingData.totalReviews;
            }
          } catch (error) {
            console.error(`Failed to fetch rating for store ${result.sellerId}:`, error);
          }
          
          // Fetch complete store data to get the store image
          try {
            storeData = await fetchStoreById(result.sellerId);
          } catch (error) {
            console.error(`Failed to fetch store data for store ${result.sellerId}:`, error);
          }
          
          return {
            id: result.sellerId,
            name: result.storeName,
            slug: result.storeName.toLowerCase().replace(/\s+/g, ''),
            image: storeData?.storeImageUrl || "/placeholder.svg?height=200&width=300",
            deliveryTime: storeData?.deliveryTimeEstimate ? storeData.deliveryTimeEstimate + " min" : "N/A",
            rating: rating,
            totalReviews: totalReviews,
            matchingMenus: result.matchingMenus || [] // Include matching menu items
          }
        }))
        
        setSearchResults(transformedResults)
      } else {
        setSearchResults([])
      }
    } catch (err) {
      console.error("Search error:", err)
      setError("Failed to search restaurants. Please try again.")
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  // Get the restaurants to display (search results or regular restaurants)
  const displayRestaurants = isSearchMode ? searchResults : restaurants
  const isLoading = isSearchMode ? searchLoading : loading

  return (
    <div className="home-container">
      <Header 
        onSearch={handleSearch}
        searchQuery={searchQuery}
        showSearch={true}
      />

      <main className="main-content">
        <div className="grid-layout">
          <div className="main-column">
            <h1 className="page-title">
              {isSearchMode 
                ? `Search Results for "${searchQuery}"` 
                : "Pesan Makanan Lezat Secara Online"
              }
            </h1>

            {!isSearchMode && (
              <FoodCategories 
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            )}

            <div className="section">
              <h2 className="section-title">
                {isSearchMode 
                  ? `Restaurants (${displayRestaurants.length} found)`
                  : "Popular Restaurants"
                }
              </h2>
              
              {/* Search results summary */}
              {isSearchMode && searchResults.length > 0 && (
                <div className="search-summary">
                  <p className="search-summary-text">
                    Found {searchResults.length} restaurant{searchResults.length !== 1 ? 's' : ''} with menu items matching "{searchQuery}"
                  </p>
                </div>
              )}

              {isLoading ? (
                <div className="loading-container">
                  <p>{isSearchMode ? "Searching..." : "Loading restaurants..."}</p>
                </div>
              ) : error ? (
                <div className="error-container">
                  <p>{error}</p>
                  {isSearchMode && (
                    <button 
                      onClick={() => handleSearch("")}
                      className="back-to-restaurants-btn"
                    >
                      Back to all restaurants
                    </button>
                  )}
                </div>
              ) : displayRestaurants.length === 0 ? (
                <div className="no-results-container">
                  {isSearchMode ? (
                    <>
                      <p>No restaurants found with menu items matching "{searchQuery}".</p>
                      <button 
                        onClick={() => handleSearch("")}
                        className="back-to-restaurants-btn"
                      >
                        Back to all restaurants
                      </button>
                    </>
                  ) : (
                    <p>No restaurants available at the moment.</p>
                  )}
                </div>
              ) : (
              <div className="restaurant-grid">
                {displayRestaurants.map((restaurant) => (
                  <Link to={`/store/${restaurant.slug}`} key={restaurant.id} className="restaurant-card-link">
                    <div className="restaurant-card">
                      <div className="restaurant-image-container">
                        <img
                          src={restaurant.image || "/placeholder.svg"}
                          alt={restaurant.name}
                          className="restaurant-image"
                        />
                        {/* Show "Search Match" badge for search results */}
                        {isSearchMode && (
                          <div className="search-match-badge">
                            Search Match
                          </div>
                        )}
                      </div>
                      <div className="restaurant-content">
                        <h3 className="restaurant-name">{restaurant.name}</h3>
                        
                        {/* Show matching menu items for search results */}
                        {isSearchMode && restaurant.matchingMenus && restaurant.matchingMenus.length > 0 && (
                          <div className="matching-items">
                            <p className="matching-items-label">Matching items:</p>
                            <div className="matching-items-list">
                              {restaurant.matchingMenus.slice(0, 3).map((item, index) => (
                                <span key={item.id} className="matching-item">
                                  {item.itemName}
                                  {index < Math.min(restaurant.matchingMenus.length, 3) - 1 && ", "}
                                </span>
                              ))}
                              {restaurant.matchingMenus.length > 3 && (
                                <span className="more-items">
                                  +{restaurant.matchingMenus.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
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
                          <span className="info-separator">&nbsp;•&nbsp;</span>
                          <span>{restaurant.deliveryTime}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              )}
            </div>

            {!isSearchMode && (
              <div className="section">
                <h2 className="section-title">Featured Items</h2>
                <FoodItems selectedCategory={selectedCategory} />
              </div>
            )}
          </div>

          <div className="sidebar-column">
            <CartSidebar />
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-container">
          <Footer />
        </div>
      </footer>
    </div>
  )
}

export default Home
