"use client"

import { createContext, useContext, useState, useEffect } from "react"
import * as Api from "../services/Api"

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!localStorage.getItem('token')
  }

  // Helper function to transform backend cart items to frontend format
  const transformBackendItems = (backendItems) => {
    if (!Array.isArray(backendItems)) return []
    return backendItems.map(item => ({
      id: item.menuId,
      name: item.menuItemName,
      price: item.price,
      quantity: item.quantity,
      image: item.imageURL,
      sellerId: item.sellerId,
      storeName: item.storeName
    }))
  }

  // Helper function to transform frontend cart items to backend format
  const transformFrontendItems = (frontendItems) => {
    if (!Array.isArray(frontendItems)) return []
    return frontendItems.map(item => ({
      menuId: item.id,
      menuItemName: item.name,
      price: item.price,
      quantity: item.quantity,
      imageURL: item.image,
      sellerId: item.sellerId,
      storeName: item.storeName
    }))
  }

  // Load cart from backend or localStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated()) {
        try {
          setIsLoading(true)
          setError(null)
          const cartData = await Api.getCart()
          
          if (cartData && cartData.items) {
            // Transform backend items to frontend format
            const transformedItems = transformBackendItems(cartData.items)
            setItems(transformedItems)
          } else {
            setItems([])
          }
          setIsOnline(true)
        } catch (error) {
          console.error("Failed to load cart from backend, falling back to localStorage", error)
          setIsOnline(false)
          setError("Failed to sync with server")
          
          // Fallback to localStorage
          const savedCart = localStorage.getItem("foodhub-cart")
          if (savedCart) {
            try {
              const parsedCart = JSON.parse(savedCart)
              setItems(Array.isArray(parsedCart) ? parsedCart : [])
            } catch (parseError) {
              console.error("Failed to parse cart from localStorage", parseError)
              setItems([])
            }
          }
        } finally {
          setIsLoading(false)
        }
      } else {
        // Not authenticated, use localStorage only
        const savedCart = localStorage.getItem("foodhub-cart")
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart)
            setItems(Array.isArray(parsedCart) ? parsedCart : [])
          } catch (error) {
            console.error("Failed to parse cart from localStorage", error)
            setItems([])
          }
        }
      }
    }

    loadCart()
  }, [])

  // Save cart to localStorage when it changes (backup for offline use)
  useEffect(() => {
    if (items.length > 0 || localStorage.getItem("foodhub-cart")) {
      localStorage.setItem("foodhub-cart", JSON.stringify(items))
    }
  }, [items])
  const addToCart = async (newItem) => {
    if (!newItem || !newItem.id) {
      console.error("Invalid item data for addToCart")
      return { success: false, message: "Invalid item data" }
    }

    // Check for single-store restriction
    if (items.length > 0) {
      const existingStore = items[0].sellerId
      if (newItem.sellerId && existingStore && existingStore !== newItem.sellerId) {
        const existingStoreName = items[0].storeName || "Unknown Store"
        const newStoreName = newItem.storeName || "Unknown Store"
        return {
          success: false,
          message: `You can only order from one store at a time. Your cart contains items from ${existingStoreName}. Would you like to clear your cart?`,
          errorCode: "DIFFERENT_STORE",
          existingStoreName,
          newStoreName
        }
      }
    }

    if (isAuthenticated() && isOnline) {
      try {
        setIsLoading(true)
        setError(null)
        
        await Api.addToCart(newItem.id, newItem.quantity || 1)
        
        // Refresh cart from backend to get latest state
        const cartData = await Api.getCart()
        if (cartData && cartData.items) {
          const transformedItems = transformBackendItems(cartData.items)
          setItems(transformedItems)
        }
        return { success: true }
      } catch (error) {
        console.error("Failed to add to cart via API:", error)
        
        // Check if the error is a store validation error from backend
        if (error.response?.data?.errorCode === "DIFFERENT_STORE") {
          return {
            success: false,
            message: error.response.data.message,
            errorCode: "DIFFERENT_STORE",
            existingStoreName: error.response.data.existingStoreName,
            newStoreName: error.response.data.newStoreName
          }
        }
        
        setIsOnline(false)
        setError("Failed to sync with server")
        // Fallback to local storage
        return addToCartLocal(newItem)
      } finally {
        setIsLoading(false)
      }
    } else {
      // Not authenticated or offline, use local storage
      return addToCartLocal(newItem)
    }
  }
  const addToCartLocal = (newItem) => {
    // Check for single-store restriction for local cart
    if (items.length > 0) {
      const existingStore = items[0].sellerId
      if (newItem.sellerId && existingStore && existingStore !== newItem.sellerId) {
        const existingStoreName = items[0].storeName || "Unknown Store"
        const newStoreName = newItem.storeName || "Unknown Store"
        return {
          success: false,
          message: `You can only order from one store at a time. Your cart contains items from ${existingStoreName}. Would you like to clear your cart?`,
          errorCode: "DIFFERENT_STORE",
          existingStoreName,
          newStoreName
        }
      }
    }

    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.id === newItem.id)

      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + (newItem.quantity || 1),
        }
        return updatedItems
      } else {
        // Item doesn't exist, add it
        return [...prevItems, { ...newItem, quantity: newItem.quantity || 1 }]
      }
    })
    return { success: true }
  }

  const updateQuantity = async (id, quantity) => {
    if (!id || quantity < 0) {
      console.error("Invalid parameters for updateQuantity")
      return
    }

    // If quantity is 0, remove the item
    if (quantity === 0) {
      return removeFromCart(id)
    }

    if (isAuthenticated() && isOnline) {
      try {
        setIsLoading(true)
        setError(null)
        
        await Api.updateCartItem(id, quantity)
        
        // Refresh cart from backend
        const cartData = await Api.getCart()
        if (cartData && cartData.items) {
          const transformedItems = transformBackendItems(cartData.items)
          setItems(transformedItems)
        }
      } catch (error) {
        console.error("Failed to update cart via API, using local storage", error)
        setIsOnline(false)
        setError("Failed to sync with server")
        // Fallback to local storage
        updateQuantityLocal(id, quantity)
      } finally {
        setIsLoading(false)
      }
    } else {
      // Not authenticated or offline, use local storage
      updateQuantityLocal(id, quantity)
    }
  }

  const updateQuantityLocal = (id, quantity) => {
    setItems((prevItems) => 
      prevItems.map((item) => 
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  const removeFromCart = async (id) => {
    if (!id) {
      console.error("Invalid item id for removeFromCart")
      return
    }

    if (isAuthenticated() && isOnline) {
      try {
        setIsLoading(true)
        setError(null)
        
        await Api.removeFromCart(id)
        
        // Refresh cart from backend
        const cartData = await Api.getCart()
        if (cartData && cartData.items) {
          const transformedItems = transformBackendItems(cartData.items)
          setItems(transformedItems)
        } else {
          setItems([])
        }
      } catch (error) {
        console.error("Failed to remove from cart via API, using local storage", error)
        setIsOnline(false)
        setError("Failed to sync with server")
        // Fallback to local storage
        removeFromCartLocal(id)
      } finally {
        setIsLoading(false)
      }
    } else {
      // Not authenticated or offline, use local storage
      removeFromCartLocal(id)
    }
  }

  const removeFromCartLocal = (id) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }
  const clearCart = async () => {
    if (isAuthenticated() && isOnline) {
      try {
        setIsLoading(true)
        setError(null)
        
        await Api.clearCart()
        setItems([])
      } catch (error) {
        console.error("Failed to clear cart via API, using local storage", error)
        setIsOnline(false)
        setError("Failed to sync with server")
        // Fallback to local storage
        setItems([])
      } finally {
        setIsLoading(false)
      }
    } else {
      // Not authenticated or offline, use local storage
      setItems([])
    }
  }

  // Function to clear cart and add item from different store
  const clearCartAndAddItem = async (newItem) => {
    await clearCart()
    return await addToCart(newItem)
  }

  // Sync local cart with backend when user logs in
  const syncCartWithBackend = async () => {
    if (!isAuthenticated() || items.length === 0) return

    try {
      setIsLoading(true)
      setError(null)
      
      // Clear backend cart first to avoid duplicates
      await Api.clearCart()
      
      // Add each local cart item to backend cart
      for (const item of items) {
        await Api.addToCart(item.id, item.quantity)
      }
      
      // Refresh cart from backend to get the final state
      const cartData = await Api.getCart()
      if (cartData && cartData.items) {
        const transformedItems = transformBackendItems(cartData.items)
        setItems(transformedItems)
      }
      
      setIsOnline(true)
    } catch (error) {
      console.error("Failed to sync cart with backend", error)
      setIsOnline(false)
      setError("Failed to sync with server")
    } finally {
      setIsLoading(false)
    }
  }

  // Clear local cart when user logs out
  const clearLocalCart = () => {
    setItems([])
    localStorage.removeItem("foodhub-cart")
    setError(null)
  }

  // Calculate cart total
  const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0)
    // Calculate total item count
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)
  
  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      updateQuantity, 
      removeFromCart, 
      clearCart,
      clearCartAndAddItem, 
      isLoading,
      isOnline,
      error,
      syncCartWithBackend,
      clearLocalCart,
      cartTotal,
      itemCount,
      isAuthenticated,
      transformBackendItems,
      transformFrontendItems
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
