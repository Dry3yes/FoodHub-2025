"use client"

import "../styles/FoodCategories.css"

function FoodCategories({ selectedCategory = "all", onCategoryChange }) {
  const categories = [
    { id: "all", name: "All", icon: "All" },
    { id: "food", name: "Food", icon: "Utensils" },
    { id: "drinks", name: "Drinks", icon: "Coffee" },
  ]

  const handleCategoryClick = (categoryId) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId)
    }
  }

  const renderIcon = (iconName) => {
    switch (iconName) {
      case "All":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="category-icon"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
        )
      case "Utensils":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="category-icon"
          >
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
            <path d="M7 2v20"></path>
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
          </svg>
        )
      case "Pizza":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="category-icon"
          >
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"></path>
            <path d="M12 16l-5-8h10l-5 8z"></path>
          </svg>
        )
      case "Salad":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="category-icon"
          >
            <path d="M7 21h10"></path>
            <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"></path>
            <path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1"></path>
            <path d="M13 12a2.4 2.4 0 0 1-4-2.4 2.4 2.4 0 0 1-1.2-2.8"></path>
          </svg>
        )
      case "Beef":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="category-icon"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="m8 14 2.5 2.5"></path>
            <path d="m14 8 2.5 2.5"></path>
            <path d="m8 8 8 8"></path>
          </svg>
        )
      case "Coffee":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="category-icon"
          >
            <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path>
            <line x1="6" y1="2" x2="6" y2="4"></line>
            <line x1="10" y1="2" x2="10" y2="4"></line>
            <line x1="14" y1="2" x2="14" y2="4"></line>
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="food-categories">
      <h2 className="categories-title">Select by category</h2>
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
