"use client"

import "../styles/FoodCategories.css"

function FoodCategories({ selectedCategory = "all", onCategoryChange }) {
  const categories = [
    { id: "all", name: "Semua", icon: "All" },
    { id: "food", name: "Makanan", icon: "Utensils" },
    { id: "drinks", name: "Minuman", icon: "Coffee" },
  ]

  const handleCategoryClick = (categoryId) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId)
    }
  }

  const renderIcon = (iconName) => {
  switch (iconName) {
    case "All":
      return null; // Tidak menampilkan gambar untuk "All"
      
    case "Utensils":
      return (
        <img
          src="/Food.png" 
          alt="All"
          className="category-icon-img"
        />
      )
      
    case "Coffee":
      return (
        <img
          src="/Drink.png" 
          alt="All"
          className="category-icon-img"
        />
      )
      
    default:
      return null
  }
}

  return (
    <div className="food-categories">
      <h2 className="categories-title">Pilih berdasarkan kategori</h2>
      <div className="categories-list">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-button ${selectedCategory === category.id ? "active" : ""}`}
            onClick={() => handleCategoryClick(category.id)}
          >
            {renderIcon(category.icon)}
            {category.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default FoodCategories
