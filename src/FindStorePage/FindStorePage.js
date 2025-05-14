import React, { useState } from 'react';
import './FindStorePage.css';

const FindStorePage = () => {
  // Category data
                      // const categories = [
                      //   'Hot Picks', 'Fast Food', 'Indonesian', 'Japanese', 
                      //   'Chinese', 'Western', 'Drinks', 'Desserts'
                      // ];
  
  // State to track selected category
  const [selectedCategory, setSelectedCategory] = useState('Hot Picks');
  
  // State for chat box visibility
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // State for active chat contact
  const [activeContact, setActiveContact] = useState(null);
  
  // State for store form visibility
  const [isAddStoreFormVisible, setIsAddStoreFormVisible] = useState(false);
  
  // State for new store data
  const [newStore, setNewStore] = useState({
    name: '',
    image: '',
    distance: '',
    rating: ''
  });
  
  // State for storing food items
  const [foodItems, setFoodItems] = useState([]);
  
  // Contact data
  const contacts = [
    { id: 1, name: 'Bakmie Effata', lastMessage: 'Your order is ready!', unread: 2 },
    { id: 2, name: 'Chicken Rice Bowl', lastMessage: 'Would you like to order again?', unread: 0 },
    { id: 3, name: 'Pad Thai Noodles', lastMessage: 'Your coffee is being prepared', unread: 1 },
    { id: 4, name: 'Sushi Platter', lastMessage: 'Thank you for your order', unread: 0 },
  ];
  
  // Chat messages
  const messages = {
    1: [
      { sender: 'Bakmie Effata', text: 'Hello! Your burger is being prepared.', time: '10:30 AM' },
      { sender: 'Bakmie Effata', text: 'Your order is ready!', time: '10:45 AM' },
      { sender: 'me', text: 'Thanks! I\'ll pick it up soon.', time: '10:46 AM' },
    ],
    2: [
      { sender: 'Chicken Rice Bowl', text: 'Your pizza has been delivered.', time: 'Yesterday' },
      { sender: 'Chicken Rice Bowl', text: 'Would you like to order again?', time: 'Today' },
    ],
    3: [
      { sender: 'Pad Thai Noodles', text: 'Your coffee is being prepared', time: '11:20 AM' },
    ],
    4: [
      { sender: 'Sushi Platter', text: 'Thank you for your order', time: 'Yesterday' },
      { sender: 'me', text: 'The chicken was delicious!', time: 'Yesterday' },
    ],
  };
  
  // Handle chat contact selection
  const handleContactSelect = (contactId) => {
    setActiveContact(contactId);
  };
  
  // Toggle chat box visibility
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen && !activeContact && contacts.length > 0) {
      setActiveContact(contacts[0].id);
    }
  };
  
  // Toggle add store form
  const toggleAddStoreForm = () => {
    setIsAddStoreFormVisible(!isAddStoreFormVisible);
  };
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStore({
      ...newStore,
      [name]: value
    });
  };
  
  // Handle store submission
  const handleSubmitStore = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newStore.name || !newStore.image || !newStore.distance || !newStore.rating) {
      alert('Please fill in all fields');
      return;
    }
    
    // Create new store object
    const newStoreItem = {
      id: Date.now(), // generate unique ID
      name: newStore.name,
      image: newStore.image,
      distance: newStore.distance,
      rating: parseFloat(newStore.rating)
    };
    
    // Add to foodItems array
    setFoodItems([...foodItems, newStoreItem]);
    
    // Reset form
    setNewStore({
      name: '',
      image: '',
      distance: '',
      rating: ''
    });
    
    // Hide form
    setIsAddStoreFormVisible(false);
  };
  
  return (
    <div className="find-store-page">
      {/* 1️⃣ Category Filter (Top Section) */}
                          {/* <div className="category-filter">
                            <div className="category-scrollable">
                              {categories.map((category) => (
                                <button
                                  key={category}
                                  className={`category-button ${selectedCategory === category ? 'selected' : 'unselected'}`}
                                  onClick={() => setSelectedCategory(category)}
                                >
                                  {category}
                                </button>
                              ))}
                            </div>
                          </div> */}

      {/* 2️⃣ Food Grid Section - Now Blank with Add Button */}
      <div className="food-grid-container">
        {!isAddStoreFormVisible ? (
          <div className="empty-grid">
            <button className="add-store-button" onClick={toggleAddStoreForm}>
              + Add New Store
            </button>
            <p className="empty-text">No stores available. Click the button above to add a new store.</p>
          </div>
        ) : (
          <div className="add-store-form-container">
            <h2>Add New Store</h2>
            <form className="add-store-form" onSubmit={handleSubmitStore}>
              <div className="form-group">
                <label htmlFor="name">Store Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newStore.name}
                  onChange={handleInputChange}
                  placeholder="Enter store name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="image">Image URL</label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={newStore.image}
                  onChange={handleInputChange}
                  placeholder="Enter image URL or path"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="distance">Distance</label>
                <input
                  type="text"
                  id="distance"
                  name="distance"
                  value={newStore.distance}
                  onChange={handleInputChange}
                  placeholder="e.g. 1.2 km away"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="rating">Rating</label>
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  min="1"
                  max="5"
                  step="0.1"
                  value={newStore.rating}
                  onChange={handleInputChange}
                  placeholder="Rating from 1-5"
                  required
                />
              </div>
              
              <div className="form-buttons">
                <button type="submit" className="submit-button">Add Store</button>
                <button type="button" className="cancel-button" onClick={toggleAddStoreForm}>Cancel</button>
              </div>
            </form>
          </div>
        )}
        
        {/* Display added stores if any */}
        {foodItems.length > 0 && (
          <div className="food-grid">
            {foodItems.map((food) => (
              <div key={food.id} className="food-card">
                <div className="food-image-container">
                  <img 
                    src={food.image} 
                    alt={food.name}
                    className="food-image"
                    onError={(e) => {
                      e.target.src = '/Images/food_1.png'; // Fallback image
                    }}
                  />
                </div>
                <div className="food-info">
                  <h3 className="food-name">{food.name}</h3>
                  <p className="food-location">{food.distance}</p>
                  <div className="food-rating">
                    <span className="star-icon">⭐</span>
                    <span>{food.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3️⃣ Inbox Button (Bottom Right) */}
      <button className="inbox-button" onClick={toggleChat}>
        Inbox
      </button>
      
      {/* Chat Box Interface */}
      {isChatOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <h3>Chat</h3>
            <button className="close-button" onClick={toggleChat}>×</button>
          </div>
          <div className="chat-body">
            {/* Left Panel - Contacts */}
            <div className="chat-contacts">
              {contacts.map(contact => (
                <div
                  key={contact.id}
                  className={`contact-item ${activeContact === contact.id ? 'active' : ''}`}
                  onClick={() => handleContactSelect(contact.id)}
                >
                  <div className="contact-avatar">
                    {contact.name.charAt(0)}
                  </div>
                  <div className="contact-info">
                    <div className="contact-name">{contact.name}</div>
                    <div className="contact-last-message">{contact.lastMessage}</div>
                  </div>
                  {contact.unread > 0 && (
                    <div className="unread-badge">{contact.unread}</div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Right Panel - Messages */}
            <div className="chat-messages">
              {activeContact ? (
                <>
                  <div className="message-header">
                    {contacts.find(c => c.id === activeContact)?.name}
                  </div>
                  <div className="message-list">
                    {messages[activeContact]?.map((message, index) => (
                      <div 
                        key={index} 
                        className={`message ${message.sender === 'me' ? 'sent' : 'received'}`}
                      >
                        <div className="message-content">
                          <p>{message.text}</p>
                          <span className="message-time">{message.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="message-input">
                    <input 
                      type="text" 
                      placeholder="Type a message..." 
                    />
                    <button>Send</button>
                  </div>
                </>
              ) : (
                <div className="no-chat-selected">
                  Select a contact to start chatting
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindStorePage;

