import React, { useState } from "react";
import "./Menuitem.css";

const MenuItem = ({ name, price, rating, image, reviewsCount, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedName, setUpdatedName] = useState(name);
  const [updatedPrice, setUpdatedPrice] = useState(price);

  const handleSave = () => {
    onUpdate({
      name: updatedName,
      price: updatedPrice,
      rating,
      image,
      reviewsCount,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setUpdatedName(name);
    setUpdatedPrice(price);
    setIsEditing(false);
  };

  return (
    <div className="menu-item">
      <img src={image} alt={name} />
      
      {isEditing ? (
        <>
          <input
            type="text"
            value={updatedName}
            onChange={(e) => setUpdatedName(e.target.value)}
          />
          <p>⭐ {rating} • {reviewsCount} people love this!</p>
          <input
            type="text"
            value={updatedPrice}
            onChange={(e) => setUpdatedPrice(e.target.value)}
          />
          <div className="button-container">
            <button className="save-button" onClick={handleSave}>Save</button>
            <button className="cancel-button" onClick={handleCancel}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <h3>{name}</h3>
          <p>⭐ {rating} • {reviewsCount}+ people love this!</p>
          <p>Rp. {price}</p>
          <div className="button-container">
            <button className="update-button" onClick={() => setIsEditing(true)}>Update</button>
            <button className="delete-button" onClick={onDelete}>Delete</button>
          </div>
          
        </>
      )}
    </div>
  );
};

export default MenuItem;