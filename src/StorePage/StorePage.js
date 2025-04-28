import React, { useState } from 'react';
import './StorePage.css';

const StorePage = () => {
  // State for store information
  const [storeName, setStoreName] = useState('');
  const [storeRating, setStoreRating] = useState(0);
  
  // State for menu items
  const [menuItems, setMenuItems] = useState([]);
  
  // State for featured items
  const [featuredItems, setFeaturedItems] = useState([]);
  
  // State for new menu item form visibility
  const [showAddMenuForm, setShowAddMenuForm] = useState(false);
  
  // State for new menu item
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    image: ''
  });
  
  // Handle input change for new menu item
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMenuItem({
      ...newMenuItem,
      [name]: value
    });
  };
  
  // Handle submitting a new menu item
  const handleAddMenuItem = (e) => {
    e.preventDefault();
    
    const newItem = {
      id: Date.now(), // Use timestamp as temporary ID
      ...newMenuItem,
      rating: 0,
      reviews: 0
    };
    
    // Add to menu items
    setMenuItems([...menuItems, newItem]);
    
    // Reset form
    setNewMenuItem({
      name: '',
      description: '',
      price: '',
      image: ''
    });
    
    // Hide form
    setShowAddMenuForm(false);
  };

  // Render a menu item card
  const MenuItemCard = ({ item }) => (
    <div className="menu-card">
      <div className="menu-image">
        <img 
          src={item.image} 
          alt={item.name} 
          onError={(e) => { e.target.src = '/images/food-placeholder.jpg' }}
        />
      </div>
      <div className="menu-rating">
        <span className="rating-star">⭐</span> {item.rating}
      </div>
      <div className="menu-reviews">
        {item.reviews}+ reviews
      </div>
      <div className="menu-name">
        {item.name}
      </div>
      <div className="menu-price">
        ${item.price}
      </div>
      <button className="add-to-cart-btn">
        Add to Cart
      </button>
    </div>
  );

  return (
    <div className="store-page">
      {/* Header / Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="store-name">{storeName || 'Store Name'}</span>
          </h1>
          <p className="hero-tagline">
            Delicious food delivered to your doorstep
          </p>
          <div className="hero-buttons">
            <button className="location-btn">Location</button>
            <button className="chat-btn">Chat</button>
            <div className="rating-badge">
              <span className="star">⭐</span> {storeRating || '0.0'}
            </div>
          </div>
        </div>
      </div>

      {/* Store Admin Button */}
      <div className="admin-controls">
        <button 
          className="add-menu-btn" 
          onClick={() => setShowAddMenuForm(!showAddMenuForm)}
        >
          {showAddMenuForm ? 'Cancel' : '+ Add New Menu Item'}
        </button>
      </div>

      {/* Add Menu Form */}
      {showAddMenuForm && (
        <div className="add-menu-form-container">
          <h3>Add New Menu Item</h3>
          <form onSubmit={handleAddMenuItem} className="add-menu-form">
            <div className="form-group">
              <label htmlFor="name">Item Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newMenuItem.name}
                onChange={handleInputChange}
                required
                placeholder="Enter item name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newMenuItem.description}
                onChange={handleInputChange}
                placeholder="Enter item description"
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={newMenuItem.price}
                onChange={handleInputChange}
                required
                placeholder="Enter price"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="image">Image URL</label>
              <input
                type="text"
                id="image"
                name="image"
                value={newMenuItem.image}
                onChange={handleInputChange}
                placeholder="Enter image URL"
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="submit-btn">Add Item</button>
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => setShowAddMenuForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Featured Items Section - only show if there are items */}
      {featuredItems.length > 0 && (
        <section className="featured-section">
          <h2 className="section-title">Customer Favorites</h2>
          <div className="featured-container">
            {featuredItems.map(item => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Menu Items Section */}
      <section className="menu-section">
        <h2 className="section-title">Our Menu</h2>
        {menuItems.length === 0 ? (
          <div className="empty-menu">
            <p>No menu items yet. Click the 'Add New Menu Item' button to get started.</p>
          </div>
        ) : (
          <div className="menu-grid">
            {menuItems.map(item => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default StorePage;