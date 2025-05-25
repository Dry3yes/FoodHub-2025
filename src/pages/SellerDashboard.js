import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ConfirmationModal from "../components/ConfirmationModal";
import "../styles/SellerDashboard.css";
import { 
  fetchStoreById, 
  fetchMenusByStore, 
  fetchSellerByUserId,
  createMenu,
  updateMenu,
  deleteMenu
} from "../services/Api";

function SellerDashboard() {
  const navigate = useNavigate();
  
  // State for store data
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Menu category tabs
  const [activeTab, setActiveTab] = useState("all");
  
  const sellerTabs = [
    { id: "all", name: "All Items" },
    { id: "appetizers", name: "Appetizers" },
    { id: "main", name: "Main Courses" },
    { id: "desserts", name: "Desserts" },
    { id: "beverages", name: "Beverages" },
  ];

  // Menu state
  const [menuData, setMenuData] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    itemName: "",
    price: "",
    category: "Makanan",
    stock: "",
    imageURL: ""
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Form handling functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Form field changed: ${name} = ${value}`); // Debug log
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, imageURL: previewUrl }));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      itemName: "",
      price: "",
      category: "Makanan",
      stock: "",
      imageURL: ""
    });
    setSelectedImage(null);
    setEditingItem(null);
    setShowAddForm(false);
  };

  // Create new menu item
  const handleCreateMenu = async (e) => {
    e.preventDefault();
    if (!formData.itemName || !formData.price || !formData.stock || !formData.category) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const menuData = {
        itemName: formData.itemName,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock)
      };

      console.log("Submitting menu data:", menuData); // Debug log
      const response = await createMenu(menuData, selectedImage);
      
      if (response.success) {
        // Refresh the menu list
        await loadMenuData();
        resetForm();
        setError("");
      } else {
        setError(response.message || "Failed to create menu item");
      }
    } catch (err) {
      console.error("Error creating menu:", err);
      setError(err.message || "Failed to create menu item");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update menu item
  const handleUpdateMenu = async (e) => {
    e.preventDefault();
    if (!editingItem || !formData.itemName || !formData.price || !formData.stock) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const menuData = {
        itemName: formData.itemName,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        imageURL: formData.imageURL
      };

      const response = await updateMenu(editingItem.id, menuData);
      
      if (response.success) {
        // Refresh the menu list
        await loadMenuData();
        resetForm();
        setError("");
      } else {
        setError(response.message || "Failed to update menu item");
      }
    } catch (err) {
      console.error("Error updating menu:", err);
      setError(err.message || "Failed to update menu item");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete menu item
  const handleDeleteMenu = async (menuItem) => {
    setItemToDelete(menuItem);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await deleteMenu(itemToDelete.id);
      
      if (response.success) {
        // Refresh the menu list
        await loadMenuData();
        setError("");
      } else {
        setError(response.message || "Failed to delete menu item");
      }
    } catch (err) {
      console.error("Error deleting menu:", err);
      setError(err.message || "Failed to delete menu item");
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Start editing
  const startEdit = (menuItem) => {
    setEditingItem(menuItem);
    setFormData({
      itemName: menuItem.itemName,
      price: menuItem.price.toString(),
      category: menuItem.category,
      stock: menuItem.stock.toString(),
      imageURL: menuItem.imageURL
    });
    setShowAddForm(true);
  };

  // Load menu data
  const loadMenuData = async () => {
    const sellerInfoString = localStorage.getItem('sellerInfo');
    if (sellerInfoString) {
      const sellerInfo = JSON.parse(sellerInfoString);
      const menus = await fetchMenusByStore(sellerInfo.sellerId);
      setMenuData(menus || []);
    }
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
                <button 
                  className="primary-button" 
                  onClick={() => setShowAddForm(true)}
                  disabled={isSubmitting}
                >
                  Add New Item
                </button>
              </div>
              
              {/* Error Display */}
              {error && (
                <div className="error-message" style={{ color: 'red', margin: '10px 0', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
                  {error}
                </div>
              )}
              
              {/* Add/Edit Menu Form */}
              {showAddForm && (
                <div className="menu-form-overlay">
                  <div className="menu-form">
                    <div className="form-header">
                      <h3>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
                      <button 
                        className="close-button" 
                        onClick={resetForm}
                        disabled={isSubmitting}
                      >
                        ×
                      </button>
                    </div>
                    
                    <form onSubmit={editingItem ? handleUpdateMenu : handleCreateMenu}>
                      <div className="form-group">
                        <label>Item Name *</label>
                        <input
                          type="text"
                          name="itemName"
                          value={formData.itemName}
                          onChange={handleInputChange}
                          placeholder="Enter item name"
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Price (Rp) *</label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          placeholder="Enter price"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Category *</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="Makanan">Makanan</option>
                          <option value="Minuman">Minuman</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>Stock *</label>
                        <input
                          type="number"
                          name="stock"
                          value={formData.stock}
                          onChange={handleInputChange}
                          placeholder="Enter stock quantity"
                          min="0"
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Image {!editingItem && '*'}</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                        />
                        {formData.imageURL && (
                          <div className="image-preview">
                            <img src={formData.imageURL} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                          </div>
                        )}
                      </div>
                      
                      <div className="form-actions">
                        <button 
                          type="button" 
                          onClick={resetForm}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="primary-button"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              <div className="menu-items">
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
                  menuData
                    .filter(item => activeTab === "all" || item.category === activeTab)
                    .map((item) => (
                    <div key={item.id} className="menu-item">
                      <div className="menu-item-image-container">
                        <img 
                          src={item.imageURL || '/placeholder.jpg'} 
                          alt={item.itemName} 
                          className="menu-item-image" 
                        />
                      </div>
                      <div className="menu-item-content">
                        <div className="menu-item-info">
                          <h4 className="menu-item-name">{item.itemName}</h4>
                          <div className="menu-item-details">
                            <span className="menu-category">{item.category}</span>
                            <span className="menu-stock">Stock: {item.stock}</span>
                          </div>
                        </div>
                        <div className="menu-item-actions">
                          <span className="menu-item-price">Rp {item.price.toLocaleString('id-ID')}</span>
                          <div className="menu-item-buttons">
                            <button 
                              onClick={() => startEdit(item)} 
                              className="edit-button"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteMenu(item)} 
                              className="delete-button"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
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
      
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${itemToDelete?.itemName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}

export default SellerDashboard;
