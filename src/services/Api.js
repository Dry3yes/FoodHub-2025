const apiEndpoint = "https://localhost:5001";

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const loginUser = async (credentials) => {
    try {
      const response = await fetch(`${apiEndpoint}/api/v1/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return await response.json();
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

export const registerUser = async (userData) => {
    try {
      const response = await fetch(`${apiEndpoint}/api/v1/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }



// Fetch all available stores for the home page
export const fetchStores = async () => {
    try {
        const response = await fetch(`${apiEndpoint}/api/v1/get-stores`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error('Error fetching stores:', error);
        return [];
    }
};

// Fetch store details by sellerId
export const fetchStoreById = async (sellerId) => {
    try {
        const response = await fetch(`${apiEndpoint}/api/v1/get-store/${sellerId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error(`Error fetching store ${sellerId}:`, error);
        return null;
    }
};

// Fetch store details by slug (lowercase store name without spaces)
export const fetchStoreBySlug = async (slug) => {
    try {
        // First get all stores
        const response = await fetch(`${apiEndpoint}/api/v1/get-stores`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });
        const data = await response.json();
        if (!data.success) return null;
        
        // Find the store with matching slug
        const store = data.data.find(s => 
            s.storeName.toLowerCase().replace(/\s+/g, '') === slug
        );
        
        return store || null;
    } catch (error) {
        console.error(`Error fetching store by slug ${slug}:`, error);
        return null;
    }
};

// Fetch menu items by sellerId
export const fetchMenusByStore = async (sellerId) => {
    try {
        const response = await fetch(`${apiEndpoint}/api/v1/get-menus-by-store/${sellerId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error(`Error fetching menus for store ${sellerId}:`, error);
        return [];
    }
};

// Fetch seller information by userId
export const fetchSellerByUserId = async (userId) => {
    try {
        const response = await fetch(`${apiEndpoint}/api/v1/get-seller-by-userid/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error(`Error fetching seller for user ${userId}:`, error);
        return null;
    }
};

export const applyForSeller = async (sellerData, imageFile) => {
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('StoreName', sellerData.storeName);
      formData.append('UserIdentificationNumber', sellerData.nik);
      formData.append('Description', sellerData.description);
      formData.append('DeliveryTimeEstimate', sellerData.deliveryEstimate);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      const response = await fetch(`${apiEndpoint}/api/v1/seller-application`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          // Don't set Content-Type for multipart/form-data, browser will set it with boundary
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network response was not ok');
      }
        return await response.json();
    } catch (error) {
      console.error('Error applying for seller:', error);
      throw error;
    }
}

// Upload store cover image
export const uploadStoreImage = async (imageFile) => {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const response = await fetch(`${apiEndpoint}/api/v1/upload-store-image`, {
            method: 'POST',
            headers: {
                ...getAuthHeader(),
                // Don't set Content-Type for multipart/form-data, browser will set it with boundary
            },
            body: formData,
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to upload store image');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error uploading store image:', error);
        throw error;
    }
};

// Upload seller QRIS payment code
export const uploadQrisCode = async (qrisImageFile) => {
    try {
        const formData = new FormData();
        formData.append('qrisImage', qrisImageFile);
        
        const response = await fetch(`${apiEndpoint}/api/v1/upload-qris-code`, {
            method: 'POST',
            headers: {
                ...getAuthHeader(),
                // Don't set Content-Type for multipart/form-data, browser will set it with boundary
            },
            body: formData,
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to upload QRIS code');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error uploading QRIS code:', error);
        throw error;
    }
};

// Fetch order details by orderId
export const fetchOrderDetails = async (orderId) => {
    try {
        const response = await fetch(`${apiEndpoint}/api/v1/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error(`Error fetching order details for ${orderId}:`, error);
        return null;
    }
};

// Fetch order status by orderId
export const fetchOrderStatus = async (orderId) => {
    try {
        const response = await fetch(`${apiEndpoint}/api/v1/orders/${orderId}/status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error(`Error fetching order status for ${orderId}:`, error);
        return null;
    }
};

// Update order status (for sellers/admins)
export const updateOrderStatus = async (orderId, newStatus) => {
    try {
        const response = await fetch(`${apiEndpoint}/api/v1/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ status: newStatus })
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error(`Error updating order status for ${orderId}:`, error);
        return false;
    }
};

// ===== MENU CRUD OPERATIONS =====

// Create a new menu item
export const createMenu = async (menuData, imageFile) => {
    try {
        const formData = new FormData();
        formData.append('ItemName', menuData.itemName);
        formData.append('Price', menuData.price.toString());
        formData.append('Category', menuData.category);
        formData.append('Stock', menuData.stock.toString());
        
        if (imageFile) {
            formData.append('image', imageFile);
        }
        
        const response = await fetch(`${apiEndpoint}/api/v1/create-menu`, {
            method: 'POST',
            headers: {
                ...getAuthHeader(),
                // Don't set Content-Type for multipart/form-data
            },
            body: formData,
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create menu item');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error creating menu item:', error);
        throw error;
    }
};

// Update an existing menu item
export const updateMenu = async (menuId, menuData) => {
    try {
        const response = await fetch(`${apiEndpoint}/api/v1/update-menu/${menuId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({
                itemName: menuData.itemName,
                price: menuData.price,
                category: menuData.category,
                stock: menuData.stock,
                imageURL: menuData.imageURL || ""
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update menu item');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating menu item:', error);
        throw error;
    }
};

// Delete a menu item
export const deleteMenu = async (menuId) => {
    try {
        const response = await fetch(`${apiEndpoint}/api/v1/delete-menu/${menuId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete menu item');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error deleting menu item:', error);
        throw error;
    }
};

// Get a single menu item by ID
export const getMenuById = async (menuId) => {
    try {
        const response = await fetch(`${apiEndpoint}/api/v1/get-menu/${menuId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });
        
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error(`Error fetching menu item ${menuId}:`, error);
        return null;
    }
};

// Get all menus (for admin or general use)
export const getAllMenus = async () => {
    try {
        const response = await fetch(`${apiEndpoint}/api/v1/get-menus`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });
        
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error('Error fetching all menus:', error);
        return [];
    }
};

// Get menus by category
export const getMenusByCategory = async (category) => {
    try {
        const response = await fetch(`${apiEndpoint}/api/v1/get-menus-by-category/${category}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });
        
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error(`Error fetching menus for category ${category}:`, error);
        return [];
    }
};

// ========================
// CART API FUNCTIONS
// ========================

// Get user's cart
export const getCart = async () => {
    try {
        const response = await fetch(`${apiEndpoint}/api/v1/cart`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch cart');
        }
        
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error('Error fetching cart:', error);
        throw error;
    }
};

// Add item to cart
export const addToCart = async (menuId, quantity = 1) => {
    try {
        const response = await fetch(`${apiEndpoint}/api/v1/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({
                menuId,
                quantity
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to add item to cart');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
    }
};

// Update cart item quantity
export const updateCartItem = async (menuId, quantity) => {
    try {
        const response = await fetch(`${apiEndpoint}/api/v1/cart/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({
                menuId,
                quantity
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update cart item');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating cart item:', error);
        throw error;
    }
};

// Remove item from cart
export const removeFromCart = async (menuId) => {
    try {
        const response = await fetch(`${apiEndpoint}/api/v1/cart/remove`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({
                menuId
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to remove item from cart');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error removing from cart:', error);
        throw error;
    }
};

// Clear entire cart
export const clearCart = async () => {
    try {
        const response = await fetch(`${apiEndpoint}/api/v1/cart/clear`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to clear cart');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error clearing cart:', error);
        throw error;
    }
};

// Checkout (create a new order)
export const checkout = async (notes) => {
    try {
        const response = await fetch(`${apiEndpoint}/api/v1/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ notes })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Checkout failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error during checkout:', error);
        throw error;
    }
};

// Upload payment proof for an order
export const uploadPaymentProof = async (orderId, paymentProofFile) => {
    try {
        const formData = new FormData();
        formData.append('orderId', orderId);
        formData.append('paymentProof', paymentProofFile);

        const response = await fetch(`${apiEndpoint}/api/v1/upload-payment-proof`, {
            method: 'POST',
            headers: {
                ...getAuthHeader()
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to upload payment proof');
        }

        return await response.json();
    } catch (error) {
        console.error('Error uploading payment proof:', error);
        throw error;
    }
};

// Submit support ticket
export const submitSupportTicket = async (ticketData) => {
    try {
        const response = await fetch(`${apiEndpoint}/api/v1/tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(ticketData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit support ticket');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error submitting support ticket:', error);
        throw error;
    }
};

// Admin Dashboard APIs
export const getAnalytics = async () => {
    try {
        const response = await fetch(`${apiEndpoint}/api/v1/analytics`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch analytics');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching analytics:', error);
        throw error;
    }
};

// Support Tickets APIs
export const getAllSupportTickets = async (status = '', category = '', priority = '', page = 1, pageSize = 10) => {
    try {
        const params = new URLSearchParams({
            ...(status && { status }),
            ...(category && { category }),
            ...(priority && { priority }),
            page: page.toString(),
            pageSize: pageSize.toString()
        });

        const response = await fetch(`${apiEndpoint}/api/v1/tickets?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch support tickets');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching support tickets:', error);
        throw error;
    }
};

export const updateSupportTicketStatus = async (ticketId, statusData) => {
    try {
        const response = await fetch(`${apiEndpoint}/api/v1/tickets/${ticketId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(statusData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update support ticket status');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating support ticket status:', error);
        throw error;
    }
};

// Seller Applications APIs
export const getAllSellerApplications = async (status = '') => {
    try {
        const params = new URLSearchParams({
            ...(status && { status })
        });

        const response = await fetch(`${apiEndpoint}/api/v1/seller-applications?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch seller applications');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching seller applications:', error);
        throw error;
    }
};

export const processSellerApplication = async (applicationId, processData) => {
    try {
        const response = await fetch(`${apiEndpoint}/api/v1/seller-applications/${applicationId}/process`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(processData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to process seller application');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error processing seller application:', error);
        throw error;
    }
};