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
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      const response = await fetch(`${apiEndpoint}/v1/seller-application`, {
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