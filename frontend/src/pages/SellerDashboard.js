import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "../styles/SellerDashboard.css";
import { fetchStoreById, fetchMenusByStore, fetchSellerByUserId } from "../services/Api";

function SellerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for store data
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Menu category tabs
  const [activeTab, setActiveTab] = useState("all");
  
  const sellerTabs = [
    { id: "all", name: "All Items" },
    { id: "popular", name: "Popular" },
    { id: "appetizers", name: "Appetizers" },
    { id: "main", name: "Main Courses" },
    { id: "desserts", name: "Desserts" },
  ];

  // Initialize with an empty array instead of dummy data
  const [menuData, setMenuData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  
  // New menu item state
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuPrice, setNewMenuPrice] = useState("");
  const [tempImage, setTempImage] = useState(null);

  // Handle image upload for new menu items
  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        setTempImage(URL.createObjectURL(file));
      }
    };
    input.click();
  };

  // Add a new menu item
  const addMenu = () => {
    if (newMenuName.trim() === "" || newMenuPrice.trim() === "" || !tempImage) return;
    const newMenu = {
      itemName: newMenuName,
      price: newMenuPrice || "0",
      rating: 0,
      imageURL: tempImage,
      reviewsCount: 0,
    };
    setMenuData([...menuData, newMenu]);
    setNewMenuName("");
    setNewMenuPrice("");
    setTempImage(null);
    
    // Hide the add form after adding
    document.querySelector('.add-new-form').style.display = 'none';
  };
  
  // Check if user is authenticated and has seller role
  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem('token');
      const userString = localStorage.getItem('user');
      const sellerInfoString = localStorage.getItem('sellerInfo');
      
      if (!token || !userString) {
        // User is not logged in
        navigate('/login');
        return;
      }
      
      try {
        const user = JSON.parse(userString);
        
        if (user.role !== 'Seller') {
          // User is not a seller
          setError("You don't have seller privileges.");
          setTimeout(() => navigate('/'), 2000);
          return;
        }
        
        setLoading(true);
        
        // If we have seller info in localStorage, use it
        if (sellerInfoString) {
          const sellerInfo = JSON.parse(sellerInfoString);
          
          // Fetch store data using the sellerId from localStorage
          const storeData = await fetchStoreById(sellerInfo.sellerId);
          if (storeData) {
            setStore(storeData);
            // Fetch menu items for this seller
            const menus = await fetchMenusByStore(sellerInfo.sellerId);
            setMenuData(menus || []);
          } else {
            setError("Could not fetch store data.");
          }
        } else {
          // Fallback to the API call if sellerInfo is not in localStorage
          const sellerInfo = await fetchSellerByUserId(user.id);
          
          if (!sellerInfo || !sellerInfo.sellerId) {
            setError("Could not find seller information. Please contact support.");
            setLoading(false);
            return;
          }
          
          // Now use the sellerId to fetch store data
          const storeData = await fetchStoreById(sellerInfo.sellerId);
          if (storeData) {
            setStore(storeData);
            // Fetch menu items for this seller
            const menus = await fetchMenusByStore(sellerInfo.sellerId);
            setMenuData(menus || []);
          } else {
            setError("Could not fetch store data.");
          }
        }
      } catch (err) {
        console.error("Error loading seller data:", err);
        setError("An error occurred while loading your store data.");
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthentication();
  }, [navigate]);



  const startEdit = (index) => {
    setEditIndex(index);
    setEditName(menuData[index].itemName);
    setEditPrice(menuData[index].price);
  };

  const saveEdit = (index) => {
    const updatedMenu = [...menuData];
    updatedMenu[index] = { ...updatedMenu[index], itemName: editName, price: editPrice };
    setMenuData(updatedMenu);
    setEditIndex(null);
    setEditName("");
    setEditPrice("");
  };

  const deleteMenu = (index) => {
    const updatedMenu = menuData.filter((_, i) => i !== index);
    setMenuData(updatedMenu);
  };

  // Show loading or error states
  if (loading) {
    return (
      <div className="seller-dashboard-container">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your store data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="seller-dashboard-container">
        <Header />
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  // If no store data is available
  if (!store) {
    return (
      <div className="seller-dashboard-container">
        <Header />
        <div className="error-container">
          <p>No store data available. Please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-dashboard-container">
      <Header />
      
      <main className="main-content">
        <div className="grid-layout">
          <div className="main-column">
            {/* Store Header Card */}
            <div className="store-header-card">
              <div className="store-cover-image-container">
                <img src={store.storeImageUrl || "/placeholder.svg?height=300&width=900"} alt="Store Cover" className="store-cover-image" />
              </div>
              <div className="store-header-content">
                <h1 className="store-title">{store.storeName}</h1>
                <div className="store-info">
                  <div className="store-rating">
                    <svg
                      className="star-icon filled"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span>{store.rating || "N/A"}</span>
                  </div>
                  <span className="info-separator">•</span>
                  <span>{store.cuisine || "Various"}</span>
                  <span className="info-separator">•</span>
                  <span>{store.deliveryTimeEstimate + " min" || "20-30 min"}</span>
                </div>
                <p className="store-description">{store.description || "Manage your store, edit menu items and view orders all in one place."}</p>
              </div>
            </div>
            
            {/* Menu Category Tabs */}
            <div className="category-tabs">
              {sellerTabs.map(tab => (
                <button
                  key={tab.id}
                  className={`category-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
            
            {/* Menu Management Section */}
            <div className="menu-card">
              <div className="menu-header">
                <h2 className="menu-title">Menu Management</h2>
                <button className="primary-button" onClick={() => {
                  // Show the add new form when this button is clicked
                  document.querySelector('.add-new-form').style.display = 'flex';
                }}>Add New Item</button>
              </div>
              
              <div className="menu-items">
                {/* Add Menu Form (hidden by default, show when clicking 'Add New Item') */}
                <div className="menu-item add-new-form" style={{ display: 'none' }}>
                  <div className="menu-item-image-container">
                    <button onClick={handleImageUpload} className="image-upload-button">+</button>
                    {tempImage && <img src={tempImage} alt="Preview" className="menu-item-image" />}
                  </div>
                  <div className="menu-item-content">
                    <div>
                      <input
                        type="text"
                        placeholder="Menu Item Name"
                        value={newMenuName}
                        onChange={(e) => setNewMenuName(e.target.value)}
                        className="menu-item-input"
                      />
                      <textarea
                        placeholder="Item description"
                        className="menu-item-textarea"
                      ></textarea>
                    </div>
                    <div className="menu-item-actions">
                      <div className="price-input-wrapper">
                        <span>Rp</span>
                        <input
                          type="number"
                          className="price-input"
                          placeholder="0"
                          value={newMenuPrice}
                          onChange={(e) => setNewMenuPrice(e.target.value)}
                        />
                      </div>
                      <button onClick={addMenu} className="primary-button">Save</button>
                    </div>
                  </div>
                </div>
                
                {/* No Menu Items Message */}
                {menuData.length === 0 ? (
                  <div className="no-menu-items">
                    <div className="empty-state">
                      <svg
                        className="empty-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                      </svg>
                      <h3 className="empty-title">No menu items have been created</h3>
                      <p className="empty-message">Click the "Add New Item" button to create your first menu item.</p>
                    </div>
                  </div>
                ) : (
                  /* Menu Items */
                  menuData.map((item, index) => (
                    <div key={index} className="menu-item">
                      <div className="menu-item-image-container">
                        <img src={item.imageURL} alt={item.itemName} className="menu-item-image" />
                      </div>
                      <div className="menu-item-content">
                        <div>
                          <h4 className="menu-item-name">{item.itemName}</h4>
                          <div className="menu-item-details">
                            <svg
                              className="star-icon filled"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            <span className="menu-rating">{item.rating}</span>
                            <span className="menu-reviews">{item.reviewsCount}+ reviews</span>
                          </div>
                        </div>
                        <div className="menu-item-actions">
                          <span className="menu-item-price">Rp {item.price.toLocaleString('id-ID')}</span>
                          <div className="menu-item-buttons">
                            <button onClick={() => startEdit(index)} className="edit-button">Edit</button>
                            <button onClick={() => deleteMenu(index)} className="delete-button">Delete</button>
                          </div>
                        </div>
                      </div>
                      {editIndex === index && (
                        <div className="edit-form">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="edit-input"
                            placeholder="Menu name"
                          />
                          <div className="price-input-wrapper">
                            <span>Rp</span>
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="price-input"
                              placeholder="Price"
                            />
                          </div>
                          <div className="edit-buttons">
                            <button onClick={() => saveEdit(index)} className="save-button">Save</button>
                            <button onClick={() => setEditIndex(null)} className="cancel-button">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Stats Section */}
            <div className="stats-card">
              <h2 className="section-title">Store Statistics</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon orders">📦</div>
                  <div className="stat-content">
                    <h3 className="stat-title">Orders</h3>
                    <p className="stat-value">24</p>
                    <p className="stat-subtitle">This month</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon revenue">💰</div>
                  <div className="stat-content">
                    <h3 className="stat-title">Revenue</h3>
                    <p className="stat-value">Rp 3.450.000</p>
                    <p className="stat-subtitle">This month</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon customers">👥</div>
                  <div className="stat-content">
                    <h3 className="stat-title">Customers</h3>
                    <p className="stat-value">18</p>
                    <p className="stat-subtitle">Repeat customers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="sidebar-column">
            <div className="dashboard-sidebar">
              <h3 className="sidebar-title">Quick Actions</h3>
              <nav className="sidebar-nav">
                <Link to="/SellerDashboard" className="sidebar-link active">
                  <span className="sidebar-icon">🏠</span>
                  <span>Dashboard</span>
                </Link>
                <Link to="/orders" className="sidebar-link">
                  <span className="sidebar-icon">🛒</span>
                  <span>Orders</span>
                </Link>
                <Link to="/products" className="sidebar-link">
                  <span className="sidebar-icon">📦</span>
                  <span>Products</span>
                </Link>
                <Link to="/messages" className="sidebar-link">
                  <span className="sidebar-icon">💬</span>
                  <span>Messages</span>
                </Link>
                <Link to="/settings" className="sidebar-link">
                  <span className="sidebar-icon">⚙️</span>
                  <span>Settings</span>
                </Link>
              </nav>
              
              <div className="sidebar-section">
                <h3 className="sidebar-title">Recent Orders</h3>
                <div className="recent-orders">
                  <div className="order-item">
                    <div className="order-info">
                      <p className="order-id">#1234</p>
                      <p className="order-customer">John D.</p>
                    </div>
                    <p className="order-amount">Rp 125.000</p>
                    <span className="order-status completed">Completed</span>
                  </div>
                  <div className="order-item">
                    <div className="order-info">
                      <p className="order-id">#1235</p>
                      <p className="order-customer">Sarah M.</p>
                    </div>
                    <p className="order-amount">Rp 85.000</p>
                    <span className="order-status pending">Pending</span>
                  </div>
                  <div className="order-item">
                    <div className="order-info">
                      <p className="order-id">#1236</p>
                      <p className="order-customer">Mike R.</p>
                    </div>
                    <p className="order-amount">Rp 150.000</p>
                    <span className="order-status processing">Processing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-text">
            <p>© 2023 FoodHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SellerDashboard;
