import React, { useState } from "react";
  import { useLocation } from "react-router-dom";
import "./SellerProduct.css";

function SellerDashboard() {
  const location = useLocation();
  const sidebarLinks = [
    { label: "Dashboard", href: "/SellerDashboard", icon: "🏠" },
    { label: "Order", href: "/settings/seller", icon: "🛒" },
    { label: "Products", href: "/settings/seller", icon: "📦" },
    { label: "Messages", href: "/settings/seller", icon: "💬" },
    { label: "Settings", href: "/settings/seller", icon: "⚙️" },
    { label: "Sign Out", href: "/settings/seller", icon: "↩️" },
  ];

  const [menuData, setMenuData] = useState([
    {
      name: "Garlic Crust Vegetable Pizza",
      price: "148.000",
      rating: 4.7,
      image: "./Images/pizza.jpg",
      reviewsCount: 300,
    }
  ]);
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuPrice, setNewMenuPrice] = useState("");
  const [tempImage, setTempImage] = useState(null);

  const [editIndex, setEditIndex] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

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

  const addMenu = () => {
    if (newMenuName.trim() === "" || newMenuPrice.trim() === "" || !tempImage) return;
    const newMenu = {
      name: newMenuName,
      price: newMenuPrice || "0",
      rating: 0,
      image: tempImage,
      reviewsCount: 0,
    };
    setMenuData([...menuData, newMenu]);
    setNewMenuName("");
    setNewMenuPrice("");
    setTempImage(null);
  };

  const startEdit = (index) => {
    setEditIndex(index);
    setEditName(menuData[index].name);
    setEditPrice(menuData[index].price);
  };

  const saveEdit = (index) => {
    const updatedMenu = [...menuData];
    updatedMenu[index] = { ...updatedMenu[index], name: editName, price: editPrice };
    setMenuData(updatedMenu);
    setEditIndex(null);
    setEditName("");
    setEditPrice("");
  };

  const deleteMenu = (index) => {
    const updatedMenu = menuData.filter((_, i) => i !== index);
    setMenuData(updatedMenu);
  };

  return (
    <div className="seller-dashboard-container">
      {/* Sidebar */}
      <aside className="seller-sidebar">
        <h3>Sidebar</h3>
        <ul>
          {sidebarLinks.map(link => (
            <li key={link.label}>
              <a
                className={`sidebar-link-box${location.pathname === link.href ? " active" : ""}`}
                href={link.href}
              >
                <span className="sidebar-icon">{link.icon}</span>
                <span className="sidebar-label">{link.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <div className="seller-main-content">
        {/* Banner */}
        <div className="banner-container">
          <img src="./Images/PizzaBanner.png" alt="Banner" className="banner" />
          <div className="buttons">
            <button className="sd-btn sd-location-btn">Location</button>
            <button className="sd-btn sd-chat-btn">Chat</button>
            <div className="sd-rating">
              ⭐ <span>4.5</span>
            </div>
          </div>
        </div>

        {/* Menu List */}
        <div className="menu-list">
          <h2>Your Menu</h2>
          <div className="menu-grid">
            {/* Add Menu Form */}
            <div className="add-menu">
              <button onClick={handleImageUpload} className="sd-btn sd-plus-button">+</button>
              {tempImage && <img src={tempImage} alt="Preview" className="preview-img" />}
              <input
                type="text"
                placeholder="Insert Your Menu's Name Here"
                value={newMenuName}
                onChange={(e) => setNewMenuName(e.target.value)}
              />
              <div className="menu-footer">
                <p>Rp.</p>
                <input
                  type="number"
                  className="price-input"
                  placeholder="0"
                  value={newMenuPrice}
                  onChange={(e) => setNewMenuPrice(e.target.value)}
                />
                <button onClick={addMenu} className="sd-btn sd-save-button">Save</button>
              </div>
            </div>
            {/* Menu Items */}
            {menuData.map((item, index) => (
              <div key={index} className="menu-item-card">
                <div className="menu-img-wrapper">
                  <img src={item.image} alt={item.name} className="menu-img-circle" />
                </div>
                <div className="menu-item-content">
                  <h4 className="menu-item-title">{item.name}</h4>
                  <div className="menu-rating-row">
                    <span className="menu-star">⭐</span>
                    <span className="menu-rating">{item.rating}</span>
                    <span className="menu-reviews">{item.reviewsCount}+ people love this!</span>
                  </div>
                  <div className="menu-price-row">
                    <span className="menu-price">Rp. {item.price}</span>
                  </div>
                  <div className="menu-action-row">
                    <button onClick={() => startEdit(index)} className="sd-btn sd-update-btn">Update</button>
                    <button onClick={() => deleteMenu(index)} className="sd-btn sd-delete-btn">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerDashboard;
