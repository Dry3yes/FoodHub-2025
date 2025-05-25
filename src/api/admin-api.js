// API functions for fetching admin data
// Replace these with your actual backend endpoints

export const adminAPI = {
  // Fetch user statistics
  async getUserStats() {
    try {
      const response = await fetch("/api/admin/user-stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`, // Add your auth token
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user stats")
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching user stats:", error)
      throw error
    }
  },

  // Fetch device analytics data
  async getDeviceAnalytics() {
    try {
      const response = await fetch("/api/admin/device-analytics", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch device analytics")
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching device analytics:", error)
      throw error
    }
  },

  // Fetch help tickets
  async getHelpTickets() {
    try {
      const response = await fetch("/api/admin/help-tickets", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch help tickets")
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching help tickets:", error)
      throw error
    }
  },

  // Answer a help ticket
  async answerTicket(ticketId, response) {
    try {
      const apiResponse = await fetch(`/api/admin/help-tickets/${ticketId}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ response }),
      })

      if (!apiResponse.ok) {
        throw new Error("Failed to answer ticket")
      }

      return await apiResponse.json()
    } catch (error) {
      console.error("Error answering ticket:", error)
      throw error
    }
  },

  // Fetch pending seller applications
  async getPendingSellerApplications() {
    try {
      const response = await fetch("/api/admin/seller-applications", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch seller applications")
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching seller applications:", error)
      throw error
    }
  },

  // Approve seller application
  async approveSellerApplication(userId) {
    try {
      const response = await fetch(`/api/admin/seller-applications/${userId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to approve seller application")
      }

      return await response.json()
    } catch (error) {
      console.error("Error approving seller application:", error)
      throw error
    }
  },

  // Reject seller application
  async rejectSellerApplication(userId) {
    try {
      const response = await fetch(`/api/admin/seller-applications/${userId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to reject seller application")
      }

      return await response.json()
    } catch (error) {
      console.error("Error rejecting seller application:", error)
      throw error
    }
  },
}

// Expected API response formats:

/*
GET /api/admin/user-stats
Response:
{
  "totalUsers": 12678,
  "activeUsers": 8945,
  "activeSellers": 2350,
  "pendingApprovals": 15,
  "totalOrders": 45231,
  "systemUptime": 99.9
}

GET /api/admin/device-analytics
Response:
{
  "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  "mobile": [4200, 4800, 5100, 5600, 6200, 6800, 7100, 7800, 8200, 8600, 9100, 9500],
  "desktop": [2800, 2600, 2400, 2200, 2000, 1900, 1800, 1600, 1500, 1400, 1300, 1200]
}

GET /api/admin/help-tickets
Response:
{
  "tickets": [
    {
      "id": 1,
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "question": "How do I update my seller profile?",
      "timestamp": "2024-01-15 10:30",
      "status": "pending",
      "adminResponse": ""
    }
  ]
}
*/
