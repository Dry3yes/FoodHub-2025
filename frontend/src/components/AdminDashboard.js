"use client"

import React, { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { getAnalytics, getAllSupportTickets, updateSupportTicketStatus, getAllSellerApplications, processSellerApplication } from "../services/Api"
import "../styles/AdminDashboard.css"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedChart, setSelectedChart] = useState("mobile")
  const [chartPeriod, setChartPeriod] = useState("monthly")

  // Help tickets state
  const [helpTickets, setHelpTickets] = useState([])

  // Seller approval state
  const [pendingUsers, setPendingUsers] = useState([])
  // Analytics data
  const [analyticsData, setAnalyticsData] = useState({
    activeUsers: 0,
    activeSellers: 0,
    pendingApprovals: 0,
    totalTickets: 0,
    chartData: []
  })
  const [isLoading, setIsLoading] = useState(false)

  // Comprehensive refresh function that refreshes all dashboard data
  const refreshAllData = async () => {
    try {
      setIsLoading(true)
      // Fetch all data simultaneously for faster refresh
      await Promise.all([
        fetchAnalyticsData(),
        fetchSupportTickets(),
        fetchSellerApplications()
      ])
    } catch (error) {
      console.error('Error refreshing all data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      const response = await getAnalytics()
      if (response.success) {
        setAnalyticsData(prev => ({
          ...prev,
          activeUsers: response.data.activeUsers,
          activeSellers: response.data.activeSellers,
          pendingApprovals: response.data.pendingApprovals,
          chartData: response.data.chartData || []
        }))
      }
      
      // Fetch pending support tickets count
      await fetchPendingTicketsCount()
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  // Fetch count of pending support tickets
  const fetchPendingTicketsCount = async () => {
    try {
      // Fetch tickets with status "Open" or "in-progress" to count as pending
      const openResponse = await getAllSupportTickets('Open', '', '', 1, 1000)
      const inProgressResponse = await getAllSupportTickets('in-progress', '', '', 1, 1000)
      
      let pendingCount = 0
      
      if (openResponse.success && openResponse.data.tickets) {
        pendingCount += openResponse.data.tickets.length
      }
      
      if (inProgressResponse.success && inProgressResponse.data.tickets) {
        pendingCount += inProgressResponse.data.tickets.length
      }
      
      setAnalyticsData(prev => ({
        ...prev,
        totalTickets: pendingCount
      }))
    } catch (error) {
      console.error('Error fetching pending tickets count:', error)
    }
  }

  // Fetch support tickets
  const fetchSupportTickets = async () => {
    try {
      const response = await getAllSupportTickets()
      if (response.success && response.data.tickets) {
        const formattedTickets = response.data.tickets.map(ticket => ({
          id: ticket.ticketId,
          ticketId: ticket.ticketId,
          userName: ticket.name,
          userEmail: ticket.email,
          question: ticket.description,
          subject: ticket.subject,
          timestamp: new Date(ticket.createdAt).toLocaleString(),
          status: ticket.status.toLowerCase(),
          adminResponse: ticket.adminResponse || "",
          category: ticket.category,
          userId: ticket.userId
        }))
        setHelpTickets(formattedTickets)
      }
    } catch (error) {
      console.error('Error fetching support tickets:', error)
    }
  }

  // Fetch seller applications
  const fetchSellerApplications = async () => {
    try {
      const response = await getAllSellerApplications("Pending")
      if (response.success && response.data) {
        const formattedApplications = response.data.map(app => ({
          id: app.applicationId,
          applicationId: app.applicationId,
          name: app.userName || "Unknown User",
          email: app.userEmail || "No email",
          avatar: "/placeholder.svg?height=40&width=40",
          requestDate: new Date(app.createdAt).toLocaleDateString(),
          businessName: app.storeName,
          description: app.description,
          status: app.status.toLowerCase(),
          userId: app.userId
        }))
        setPendingUsers(formattedApplications)
      }
    } catch (error) {
      console.error('Error fetching seller applications:', error)
    }
  }

  const handleApproveUser = async (applicationId) => {
    try {
      await processSellerApplication(applicationId, { 
        Status: "Approved", 
        Message: "Your seller application has been approved. Welcome to FoodHub!" 
      })
      // Refresh data
      fetchSellerApplications()
      fetchAnalyticsData()
    } catch (error) {
      console.error('Error approving user:', error)
      alert('Failed to approve application')
    }
  }

  const handleRejectUser = async (applicationId) => {
    try {
      const reason = prompt("Please provide a reason for rejection:")
      if (reason) {
        await processSellerApplication(applicationId, { 
          Status: "Rejected", 
          Message: reason 
        })
        // Refresh data
        fetchSellerApplications()
        fetchAnalyticsData()
      }
    } catch (error) {
      console.error('Error rejecting user:', error)
      alert('Failed to reject application')
    }
  }
  const handleAnswerTicket = async (ticketId, response) => {
    try {
      await updateSupportTicketStatus(ticketId, {
        Status: "answered",
        AdminResponse: response
      })
      // Refresh tickets and pending count
      fetchSupportTickets()
      fetchPendingTicketsCount()
    } catch (error) {
      console.error('Error answering ticket:', error)
      alert('Failed to send response')
    }
  }

  const handleLogout = () => {
    // Clear all localStorage
    localStorage.clear()
    // Redirect to login
    window.location.href = '/login'
  }

const sidebarItems = [
  { id: "overview", label: "Overview", icon: <img src="/home.png" alt="Home" style={{ width: 20, height: 20 }} /> },
  { id: "help", label: "Help Tickets", icon: <img src="/support.png" alt="Help" style={{ width: 20, height: 20 }} /> },
  { id: "approve", label: "Approve Sellers", icon: <img src="/approve.png" alt="Approve" style={{ width: 20, height: 20 }} /> },
]
  // Load data on component mount
  useEffect(() => {
    refreshAllData()

    // Auto-refresh data every 30 seconds
    const interval = setInterval(() => {
      refreshAllData()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>Admin Panel</h1>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`admin-nav-item ${activeTab === item.id ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}              {item.id === "help" && helpTickets.filter((t) => t.status === "open" || t.status === "in-progress").length > 0 && (
                <span className="notification-badge">{helpTickets.filter((t) => t.status === "open" || t.status === "in-progress").length}</span>
              )}
              {item.id === "approve" && pendingUsers.length > 0 && (
                <span className="notification-badge">{pendingUsers.length}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-wrapper">
          {activeTab === "overview" && (
            <div>
              <div className="page-header">
                <h2>Admin Dashboard</h2>                <div className="page-actions">
                  <button className="latest-reports-btn" onClick={refreshAllData} disabled={isLoading}>
                    {isLoading ? "Loading..." : "Refresh Data"}
                  </button>
                  <button className="logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <span className="admin-stat-title">Active Users</span>
                    <span className="admin-stat-icon">🟢</span>
                  </div>
                  <div className="admin-stat-content">
                    <div className="admin-stat-number">{analyticsData.activeUsers.toLocaleString()}</div>
                    <p className="admin-stat-change positive">Users with role "User"</p>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <span className="admin-stat-title">Active Sellers</span>
                    <span className="admin-stat-icon">🛒</span>
                  </div>
                  <div className="admin-stat-content">
                    <div className="admin-stat-number">{analyticsData.activeSellers.toLocaleString()}</div>
                    <p className="admin-stat-change positive">Users with role "Seller"</p>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <span className="admin-stat-title">Pending Approvals</span>
                    <span className="admin-stat-icon">⏳</span>
                  </div>
                  <div className="admin-stat-content">
                    <div className="admin-stat-number">{analyticsData.pendingApprovals}</div>
                    <p className="admin-stat-change neutral">Requires attention</p>
                  </div>
                </div>                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <span className="admin-stat-title">Pending Tickets</span>
                    <span className="admin-stat-icon">📄</span>
                  </div>
                  <div className="admin-stat-content">
                    <div className="admin-stat-number">{helpTickets.filter((t) => t.status === "open" || t.status === "in-progress").length}</div>
                    <p className="admin-stat-change neutral">Need attention</p>
                  </div>
                </div>
              </div>              {/* Chart Section */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Daily New Users & Sellers</h3>
                  <div className="chart-controls">
                    <div className="chart-toggles">
                      <span className="chart-info">📊 Registration Activity</span>
                    </div>
                  </div>
                </div>
                <div className="chart-content">
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart
                      data={analyticsData.chartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 20,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: "#666" }} 
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#666" }}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="newUsers"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                        name="New Users"
                      />
                      <Line
                        type="monotone"
                        dataKey="newSellers"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                        name="New Sellers"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-summary">
                  <div className="summary-item">
                    <span className="summary-label">Total New Users (Last 2 weeks):</span>
                    <span className="summary-value positive">
                      {analyticsData.chartData.reduce((sum, day) => sum + (day.newUsers || 0), 0)}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Total New Sellers (Last 2 weeks):</span>
                    <span className="summary-value positive">
                      {analyticsData.chartData.reduce((sum, day) => sum + (day.newSellers || 0), 0)}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Average Daily Growth:</span>
                    <span className="summary-value">
                      {analyticsData.chartData.length > 0 
                        ? Math.round((analyticsData.chartData.reduce((sum, day) => sum + (day.newUsers || 0) + (day.newSellers || 0), 0)) / analyticsData.chartData.length * 100) / 100
                        : 0
                      } registrations/day
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "help" && (
            <div>
              <h2 className="page-title">Help Tickets Management</h2>              <div className="help-stats">
                <div className="help-stat">
                  <span className="help-stat-number">{helpTickets.filter((t) => t.status === "open" || t.status === "in-progress").length}</span>
                  <span className="help-stat-label">Pending</span>
                </div>
                <div className="help-stat">
                  <span className="help-stat-number">{helpTickets.filter((t) => t.status === "answered" || t.status === "resolved").length}</span>
                  <span className="help-stat-label">Answered</span>
                </div>
                <div className="help-stat">
                  <span className="help-stat-number">{helpTickets.length}</span>
                  <span className="help-stat-label">Total</span>
                </div>
              </div>

              <div className="tickets-container">
                {helpTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} onAnswer={handleAnswerTicket} />
                ))}
              </div>
            </div>
          )}

          {activeTab === "approve" && (
            <div>
              <h2 className="page-title">Seller Approval Management</h2>

              <div className="approve-card">
                <div className="approve-header">
                  <h3>Pending Seller Applications</h3>
                  <p>Review and approve users who want to become sellers</p>
                </div>
                <div className="approve-content">
                  {pendingUsers.length === 0 ? (
                    <p>No pending applications</p>
                  ) : (
                    pendingUsers.map((user) => (
                      <div key={user.id} className="user-item">
                        <div className="user-info">
                          <div className="user-details">
                            <h4>{user.name}</h4>
                            <p className="user-email">{user.email}</p>
                            <p className="user-business">Business: {user.businessName}</p>
                            {user.description && <p className="user-description">Description: {user.description}</p>}
                            <p className="user-date">Applied: {user.requestDate}</p>
                          </div>
                        </div>

                        <div className="user-actions">
                          {user.status === "pending" && (
                            <>
                              <button onClick={() => handleApproveUser(user.applicationId)} className="approve-btn">
                                ✅ Approve
                              </button>
                              <button onClick={() => handleRejectUser(user.applicationId)} className="reject-btn">
                                ❌ Reject
                              </button>
                            </>
                          )}

                          {user.status === "approved" && <span className="status-badge approved">✅ Approved</span>}
                          {user.status === "rejected" && <span className="status-badge rejected">❌ Rejected</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Ticket Card Component
function TicketCard({ ticket, onAnswer }) {
  const [response, setResponse] = useState("")
  const [isResponding, setIsResponding] = useState(false)

  const handleSubmitResponse = () => {
    if (response.trim()) {
      onAnswer(ticket.ticketId, response)
      setResponse("")
      setIsResponding(false)
    }
  }

  const isPending = ticket.status === "open" || ticket.status === "in-progress"

  return (
    <div className={`ticket-card ${ticket.status}`}>
      <div className="ticket-header">
        <div className="ticket-user">
          <h4>{ticket.userName}</h4>
          <span className="ticket-email">{ticket.userEmail}</span>
          {/* {ticket.subject && <span className="ticket-subject">Subject: {ticket.subject}</span>} */}
        </div>
        <div className="ticket-meta">
          <span className="ticket-time">{ticket.timestamp}</span>
          <span className={`ticket-status ${ticket.status}`}>
            {isPending ? "🔴 Pending" : "✅ Answered"}
          </span>
        </div>
      </div>

      <div className="ticket-subject">
        <h5>Subject:</h5>
        <p>{ticket.subject || "No subject provided"}</p>
      </div>

      <div className="ticket-question">
        <h5>Question:</h5>
        <p>{ticket.question}</p>
      </div>

      {!isPending && ticket.adminResponse && (
        <div className="ticket-response">
          <h5>Admin Response:</h5>
          <p>{ticket.adminResponse}</p>
        </div>
      )}

      {isPending && (
        <div className="ticket-actions">
          {!isResponding ? (
            <button className="respond-btn" onClick={() => setIsResponding(true)}>
              💬 Respond
            </button>
          ) : (
            <div className="response-form">
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your response..."
                className="response-textarea"
                rows="3"
              />
              <div className="response-actions">
                <button onClick={handleSubmitResponse} className="send-response-btn">
                  Send Response
                </button>
                <button
                  onClick={() => {
                    setIsResponding(false)
                    setResponse("")
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
