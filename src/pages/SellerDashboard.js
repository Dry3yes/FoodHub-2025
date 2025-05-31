import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ConfirmationModal from "../components/ConfirmationModal";
import MenuItemRating from "../components/MenuItemRating";
import styles from "../styles/SellerDashboard.module.css";
import { 
  fetchStoreById, 
  fetchMenusByStore, 
  fetchSellerByUserId,
  createMenu,
  updateMenu,
  deleteMenu,
  uploadStoreImage,
  uploadQrisCode,
  getSellerReviews,
  getSellerOrders
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
    { id: "Makanan", name: "Makanan" },
    { id: "Minuman", name: "Minuman" },
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

  // Store image upload state
  const [isUploadingStoreImage, setIsUploadingStoreImage] = useState(false);
  const [storeImageFile, setStoreImageFile] = useState(null);
  // QRIS code upload state
  const [isUploadingQrisCode, setIsUploadingQrisCode] = useState(false);
  const [qrisImageFile, setQrisImageFile] = useState(null);
  // Statistics state
  const [statistics, setStatistics] = useState({
    monthlyOrders: 0,
    monthlyRevenue: 0,
    pendingRevenue: 0,
    uniqueCustomers: 0,
    recentOrders: []
  });
  // Calculate statistics from orders data
  const calculateStatistics = (orders) => {
    if (!orders || orders.length === 0) {
      return {
        monthlyOrders: 0,
        monthlyRevenue: 0,
        pendingRevenue: 0,
        uniqueCustomers: 0,
        recentOrders: []
      };
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Filter orders for current month (exclude cancelled orders)
    const monthlyOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === currentMonth && 
             orderDate.getFullYear() === currentYear &&
             order.status !== 'Cancelled';
    });

    // Calculate monthly revenue from COMPLETED orders only
    const completedOrders = monthlyOrders.filter(order => order.status === 'Completed');
    const monthlyRevenue = completedOrders.reduce((total, order) => total + order.total, 0);

    // Calculate pending revenue from non-completed, non-cancelled orders
    const pendingOrders = monthlyOrders.filter(order => 
      order.status === 'Pending' || 
      order.status === 'Confirmed' || 
      order.status === 'Preparing' || 
      order.status === 'Ready'
    );
    const pendingRevenue = pendingOrders.reduce((total, order) => total + order.total, 0);

    // Calculate unique customers from all orders (excluding cancelled)
    const validOrders = orders.filter(order => order.status !== 'Cancelled');
    const uniqueUserIds = new Set(validOrders.map(order => order.userId));

    // Get recent orders (latest 5 orders) for sidebar (excluding cancelled)
    const recentOrders = validOrders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(order => ({
        id: order.id,
        customerName: order.name || 'Anonymous',
        amount: order.total,
        status: order.status
      }));

    return {
      monthlyOrders: completedOrders.length, // Only completed orders count
      monthlyRevenue: monthlyRevenue,
      pendingRevenue: pendingRevenue,
      uniqueCustomers: uniqueUserIds.size,
      recentOrders: recentOrders
    };
  };
  // Load statistics data
  const loadStatistics = async () => {
    try {
      const response = await getSellerOrders();
      if (response && response.orders) {
        const stats = calculateStatistics(response.orders);
        setStatistics(stats);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

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

  // Handle store image file selection
  const handleStoreImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, or GIF)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setStoreImageFile(file);
      setError(''); // Clear any previous errors
    }
  };

  // Upload store cover image
  const handleUploadStoreImage = async () => {
    if (!storeImageFile) {
      setError('Please select an image file first');
      return;
    }

    setIsUploadingStoreImage(true);
    try {
      const response = await uploadStoreImage(storeImageFile);
      
      if (response.success) {
        // Update the store state with the new image URL
        setStore(prev => ({
          ...prev,
          storeImageUrl: response.imageUrl
        }));
        
        // Clear the selected file
        setStoreImageFile(null);
        
        // Reset the file input
        const fileInput = document.getElementById('store-image-input');
        if (fileInput) {
          fileInput.value = '';
        }
        
        setError(''); // Clear any errors
        
        // Show success message temporarily
        const originalError = error;
        setError('Store image updated successfully!');
        setTimeout(() => {
          setError(originalError);
        }, 3000);
      } else {
        setError(response.message || 'Failed to upload store image');
      }
    } catch (err) {
      console.error('Error uploading store image:', err);
      setError(err.message || 'Failed to upload store image');
    } finally {
      setIsUploadingStoreImage(false);
    }
  };

  // Handle QRIS code file selection
  const handleQrisImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, or GIF) for your QRIS code');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('QRIS code image size must be less than 2MB');
        return;
      }
      
      setQrisImageFile(file);
      setError(''); // Clear any previous errors
    }
  };

  // Upload QRIS payment code
  const handleUploadQrisCode = async () => {
    if (!qrisImageFile) {
      setError('Please select a QRIS code image file first');
      return;
    }

    setIsUploadingQrisCode(true);
    try {
      const response = await uploadQrisCode(qrisImageFile);
      
      if (response.success) {
        // Update the store state with the new QRIS URL
        setStore(prev => ({
          ...prev,
          qrisUrl: response.qrisUrl
        }));
        
        // Clear the selected file
        setQrisImageFile(null);
        
        // Reset the file input
        const fileInput = document.getElementById('qris-image-input');
        if (fileInput) {
          fileInput.value = '';
        }
        
        setError(''); // Clear any errors
        
        // Show success message temporarily
        const originalError = error;
        setError('QRIS payment code updated successfully!');
        setTimeout(() => {
          setError(originalError);
        }, 3000);
      } else {
        setError(response.message || 'Failed to upload QRIS code');
      }
    } catch (err) {
      console.error('Error uploading QRIS code:', err);
      setError(err.message || 'Failed to upload QRIS code');
    } finally {
      setIsUploadingQrisCode(false);
    }
  };
    // Load rating data for the store
  const loadStoreRating = async (sellerId) => {
    try {
      const ratingData = await getSellerReviews(sellerId, 1, 0);
      if (ratingData && ratingData.totalReviews > 0) {
        return {
          rating: ratingData.averageRating,
          totalReviews: ratingData.totalReviews
        };
      }
      return { rating: null, totalReviews: 0 };
    } catch (error) {
      console.error(`Failed to fetch rating for store ${sellerId}:`, error);
      return { rating: null, totalReviews: 0 };
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
            // Fetch rating data
            const ratingInfo = await loadStoreRating(sellerInfo.sellerId);
            setStore({ ...storeData, ...ratingInfo });
            // Fetch menu items for this seller
            const menus = await fetchMenusByStore(sellerInfo.sellerId);
            setMenuData(menus || []);
            // Load statistics data
            await loadStatistics();
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
            // Fetch rating data
            const ratingInfo = await loadStoreRating(sellerInfo.sellerId);
            setStore({ ...storeData, ...ratingInfo });
            // Fetch menu items for this seller
            const menus = await fetchMenusByStore(sellerInfo.sellerId);
            setMenuData(menus || []);
            // Load statistics data
            await loadStatistics();
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
      <div className={styles['seller-dashboard-container']}>
        <Header />
        <div className={styles['loading-container']}>
          <div className={styles['loading-spinner']}></div>
          <p>Loading your store data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['seller-dashboard-container']}>
        <Header />
        <div className={styles['error-container']}>
          <p className={styles['error-message']}>{error}</p>
        </div>
      </div>
    );
  }

  // If no store data is available
  if (!store) {
    return (
      <div className={styles['seller-dashboard-container']}>
        <Header />
        <div className={styles['error-container']}>
          <p>No store data available. Please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['seller-dashboard-container']}>
      <Header />

      <main className={styles['main-content']}>
        <div className={styles['grid-layout']}>
          <div className={styles['main-column']}>
            {/* Store Header Card */}
            <div className={styles['store-header-card']}>
              <div className={styles['store-cover-image-container']}>
                <img src={store.storeImageUrl || "/placeholder.svg?height=300&width=900"} alt="Store Cover" className={styles['store-cover-image']} />
              </div>
              <div className={styles['seller-store-header-content']}>
                <div className={styles['store-header-left']}>
                  <h1 className={styles['store-title']}>{store.storeName}</h1>
                  <div className={styles['store-info']}>
                    <div className={styles['store-rating']}>
                      {store.rating !== null ? (
                        <>
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
                          <span>{store.rating.toFixed(1)}</span>
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
                          <span>N/A</span>
                        </>
                      )}
                    </div>
                    <span className={styles['info-separator']}>•</span>
                    <span>{store.cuisine || "Various"}</span>
                    <span className={styles['info-separator']}>•</span>
                    <span>{store.deliveryTimeEstimate + " min" || "20-30 min"}</span>
                  </div>
                  <p className={styles['store-description']}>{store.description || "Manage your store, edit menu items and view orders all in one place."}</p>
                </div>
                <div className={styles['store-header-right']}>
                  <div className={styles['store-image-upload']}>
                    <input
                      id="store-image-input"
                      type="file"
                      accept="image/*"
                      onChange={handleStoreImageSelect}
                      style={{ display: 'none' }}
                    />
                    <button
                      className={styles['store-image-upload-btn']}
                      onClick={() => document.getElementById('store-image-input').click()}
                      disabled={isUploadingStoreImage}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21,15 16,10 5,21"/>
                      </svg>
                      Change Cover Image
                    </button>
                    {storeImageFile && (
                      <div className={styles['cover-upload-controls']}>
                        <div className={styles['upload-actions']}>
                          <button
                            className={styles['seller-upload-btn']}
                            onClick={handleUploadStoreImage}
                            disabled={isUploadingStoreImage}
                          >
                            {isUploadingStoreImage ? 'Uploading...' : 'Upload'}
                          </button>
                          <button
                            className={styles['seller-cancel-btn']}
                            onClick={() => {
                            setStoreImageFile(null);
                            document.getElementById('store-image-input').value = '';
                          }}
                          disabled={isUploadingStoreImage}
                          >
                            Cancel
                          </button>
                        </div>
                        <span className={styles['selected-file']}>{storeImageFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Menu Category Tabs */}
            <div className={styles['category-tabs']}>
              {sellerTabs.map(tab => (
                <button
                  key={tab.id}
                  className={`${styles['category-tab']} ${activeTab === tab.id ? styles['active'] : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
            
            {/* Menu Management Section */}
            <div className={styles['menu-card']}>
              <div className={styles['menu-header']}>
                <h2 className={styles['menu-title']}>Menu Management</h2>
                <button 
                  className={styles['primary-button']} 
                  onClick={() => setShowAddForm(true)}
                  disabled={isSubmitting}
                >
                  Add New Item
                </button>
              </div>
              
              {/* Error Display */}
              {error && (
                <div className={styles['error-message']} style={{ color: 'red', margin: '10px 0', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
                  {error}
                </div>
              )}
              
              {/* Add/Edit Menu Form */}
              {showAddForm && (
                <div className={styles['menu-form-overlay']}>
                  <div className={styles['menu-form']}>
                    <div className={styles['form-header']}>
                      <h3>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
                      <button
                        className={styles['close-button']}
                        onClick={resetForm}
                        disabled={isSubmitting}
                      >
                        ×
                      </button>
                    </div>
                    
                    <form onSubmit={editingItem ? handleUpdateMenu : handleCreateMenu}>
                      <div className={styles['form-group']}>
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
                      
                      <div className={styles['form-group']}>
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

                      <div className={styles['form-group']}>
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

                      <div className={styles['form-group']}>
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

                      <div className={styles['form-group']}>
                        <label>Image {!editingItem && '*'}</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                        />
                        {formData.imageURL && (
                          <div className={styles['image-preview']}>
                            <img src={formData.imageURL} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                          </div>
                        )}
                      </div>

                      <div className={styles['form-actions']}>
                        <button
                          type="button"
                          onClick={resetForm}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className={styles['primary-button']}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className={styles['menu-items']}>
                {/* No Menu Items Message */}
                {menuData.length === 0 ? (
                  <div className={styles['no-menu-items']}>
                    <div className={styles['empty-state']}>
                      <svg
                        className={styles['empty-icon']}
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
                      <h3 className={styles['empty-title']}>No menu items have been created</h3>
                      <p className={styles['empty-message']}>Click the "Add New Item" button to create your first menu item.</p>
                    </div>
                  </div>
                ) : (
                  /* Menu Items */
                  menuData
                    .filter(item => activeTab === "all" || item.category === activeTab)
                    .map((item) => (
                    <div key={item.id} className={styles['menu-item']}>
                      <div className={styles['menu-item-image-container']}>
                        <img 
                          src={item.imageURL || '/placeholder.jpg'} 
                          alt={item.itemName} 
                          className={styles['menu-item-image']} 
                        />
                      </div>
                      <div className={styles['seller-menu-item-content']}>                        <div className={styles['menu-item-info']}>
                          <h4 className={styles['menu-item-name']}>{item.itemName}</h4>
                          <div className={styles['menu-item-details']}>
                            <span className={styles['menu-category']}>{item.category}</span>
                            <span className={styles['menu-stock']}>Stock: {item.stock}</span>
                          </div>
                          <MenuItemRating menuId={item.id} />
                        </div>
                        <div className={styles['menu-item-actions']}>
                          <span className={styles['menu-item-price']}>Rp {item.price.toLocaleString('id-ID')}</span>
                          <div className={styles['menu-item-buttons']}>
                            <button 
                              onClick={() => startEdit(item)} 
                              className={styles['edit-button']}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteMenu(item)} 
                              className={styles['delete-button']}
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
            <div className={styles['stats-card']}>
              <h2 className={styles['section-title']}>Store Statistics</h2>
              <div className={styles['stats-grid']}>                <div className={styles['stat-card']}>
                  <div className={styles['stat-icon']}><span role="img" aria-label="Orders">📦</span></div>
                  <div className={styles['stat-content']}>
                    <h3 className={styles['stat-title']}>Orders</h3>
                    <p className={styles['stat-value']}>{statistics.monthlyOrders}</p>
                    <p className={styles['stat-subtitle']}>Completed this month</p>
                  </div>
                </div><div className={styles['stat-card']}>
                  <div className={styles['stat-icon']}><span role="img" aria-label="Revenue">💰</span></div>
                  <div className={styles['stat-content']}>
                    <h3 className={styles['stat-title']}>Revenue</h3>
                    <p className={styles['stat-value']}>Rp {statistics.monthlyRevenue.toLocaleString('id-ID')}</p>
                    <p className={styles['stat-subtitle']}>Completed orders this month</p>
                    {statistics.pendingRevenue > 0 && (
                      <p className={styles['pending-revenue']}>
                        + Rp {statistics.pendingRevenue.toLocaleString('id-ID')} pending
                      </p>
                    )}
                  </div>
                </div>
                <div className={styles['stat-card']}>
                  <div className={styles['stat-icon']}><span role="img" aria-label="Customers">👥</span></div>
                  <div className={styles['stat-content']}>
                    <h3 className={styles['stat-title']}>Customers</h3>
                    <p className={styles['stat-value']}>{statistics.uniqueCustomers}</p>
                    <p className={styles['stat-subtitle']}>Repeat customers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles['sidebar-column']}>
            <div className={styles['dashboard-sidebar']}>
              <div className={styles['sidebar-section']}>
                <h3 className={styles['sidebar-title']}>Payment Settings</h3>
                <div className={styles['payment-settings']}>
                  <div className={styles['qris-upload-section']}>
                    <h4 className={styles['qris-section-title']}>QRIS Payment Code</h4>
                    <p className={styles['qris-description']}>Upload your QRIS code for customer payments</p>

                    {store.qrisUrl && (
                      <div className={styles['qris-preview-container']}>
                        <img src={store.qrisUrl} alt="Your QRIS Code" className={styles['qris-preview-image']} />
                      </div>
                    )}

                    <div className={styles['qris-upload-controls']}>
                      <input
                        id="qris-image-input"
                        type="file"
                        accept="image/*"
                        onChange={handleQrisImageSelect}
                        style={{ display: 'none' }}
                      />
                      <button
                        className={styles['qris-upload-btn']}
                        onClick={() => document.getElementById('qris-image-input').click()}
                        disabled={isUploadingQrisCode}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21,15 16,10 5,21"/>
                        </svg>
                        {store.qrisUrl ? 'Change QRIS Code' : 'Upload QRIS Code'}
                      </button>
                      
                      {qrisImageFile && (
                        <div className={styles['upload-controls']}>
                          <span className={styles['selected-file']}>{qrisImageFile.name}</span>
                          <button
                            className={styles['seller-upload-btn']}
                            onClick={handleUploadQrisCode}
                            disabled={isUploadingQrisCode}
                          >
                            {isUploadingQrisCode ? 'Uploading...' : 'Upload'}
                          </button>
                          <button
                            className={styles['seller-cancel-btn']}
                            onClick={() => {
                              setQrisImageFile(null);
                              document.getElementById('qris-image-input').value = '';
                            }}
                            disabled={isUploadingQrisCode}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    <div className={styles['qris-info']}>
                      <p>Your QRIS code will be shown to customers during checkout</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles['sidebar-section']}>
                <h3 className={styles['sidebar-title']}>Recent Orders</h3>
                <div className={styles['recent-orders']}>
                  {statistics.recentOrders.length === 0 ? (
                    <p className={styles['no-recent-orders']}>No recent orders</p>
                  ) : (
                    statistics.recentOrders.map(order => (
                      <div key={order.id} className={styles['order-item']}>
                        <div className={styles['order-info']}>
                          <p className={styles['order-id']}>#{order.id}</p>
                          <p className={styles['order-customer']}>{order.customerName}</p>
                        </div>
                        <p className={styles['order-amount']}>Rp {order.amount.toLocaleString('id-ID')}</p>
                        <span className={`${styles['order-status']} ${styles[order.status.toLowerCase()]}`}>{order.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles['footer']}>
        <div className={styles['footer-content']}>
          <div className={styles['footer-text']}>
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
