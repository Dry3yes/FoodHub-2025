"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import "./AdminDashboard.css"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedChart, setSelectedChart] = useState("mobile")
  const [chartPeriod, setChartPeriod] = useState("monthly")

  // Help tickets state
  const [helpTickets, setHelpTickets] = useState([
    {
      id: 1,
      userName: "John Doe",
      userEmail: "john@example.com",
      question: "How do I update my seller profile information?",
      timestamp: "2024-01-15 10:30",
      status: "pending",
      adminResponse: "",
    },
    {
      id: 2,
      userName: "Sarah Wilson",
      userEmail: "sarah@example.com",
      question: "I'm having trouble uploading product images. The upload keeps failing.",
      timestamp: "2024-01-15 09:15",
      status: "pending",
      adminResponse: "",
    },
    {
      id: 3,
      userName: "Mike Chen",
      userEmail: "mike@example.com",
      question: "Can you help me understand the commission structure for sellers?",
      timestamp: "2024-01-14 16:45",
      status: "answered",
      adminResponse:
        "Hi Mike! Our commission structure is 5% for new sellers and 3% for premium sellers. You can upgrade to premium after 50 successful sales.",
    },
  ])

  // Seller approval state
  const [pendingUsers, setPendingUsers] = useState([
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      avatar: "/placeholder.svg?height=40&width=40",
      requestDate: "2024-01-15",
      businessName: "Smith Electronics",
      status: "pending",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      avatar: "/placeholder.svg?height=40&width=40",
      requestDate: "2024-01-14",
      businessName: "Johnson Crafts",
      status: "pending",
    },
    {
      id: 3,
      name: "Mike Chen",
      email: "mike.chen@email.com",
      avatar: "/placeholder.svg?height=40&width=40",
      requestDate: "2024-01-13",
      businessName: "Chen Tech Solutions",
      status: "pending",
    },
  ])

  // Analytics data with chart data for Recharts
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 12678,
    activeUsers: 8945,
    activeSellers: 2350,
    pendingApprovals: 15,
    totalOrders: 45231,
    systemUptime: 99.9,
    // Chart data formatted for Recharts
    chartData: [
      { month: "Jan", mobile: 4200, desktop: 2800 },
      { month: "Feb", mobile: 4800, desktop: 2600 },
      { month: "Mar", mobile: 5100, desktop: 2400 },
      { month: "Apr", mobile: 5600, desktop: 2200 },
      { month: "May", mobile: 6200, desktop: 2000 },
      { month: "Jun", mobile: 6800, desktop: 1900 },
      { month: "Jul", mobile: 7100, desktop: 1800 },
      { month: "Aug", mobile: 7800, desktop: 1600 },
      { month: "Sep", mobile: 8200, desktop: 1500 },
      { month: "Oct", mobile: 8600, desktop: 1400 },
      { month: "Nov", mobile: 9100, desktop: 1300 },
      { month: "Dec", mobile: 9500, desktop: 1200 },
    ],
  })

  const [isLoading, setIsLoading] = useState(false)

  // Fetch analytics data function - THIS IS WHERE YOU ADD YOUR API CALLS
  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with your actual API endpoints

      // Example API calls:
      // const userStatsResponse = await fetch('/api/admin/user-stats')
      // const userStats = await userStatsResponse.json()

      // const chartDataResponse = await fetch('/api/admin/device-analytics')
      // const chartData = await chartDataResponse.json()

      // For now, using dummy data with some randomization
      const dummyData = {
        totalUsers: 12678 + Math.floor(Math.random() * 100),
        activeUsers: 8945 + Math.floor(Math.random() * 50),
        activeSellers: 2350 + Math.floor(Math.random() * 20),
        pendingApprovals: 15 + Math.floor(Math.random() * 5),
        totalOrders: 45231 + Math.floor(Math.random() * 200),
        systemUptime: 99.9,
        chartData: [
          {
            month: "Jan",
            mobile: 4200 + Math.floor(Math.random() * 100),
            desktop: 2800 + Math.floor(Math.random() * 100),
          },
          {
            month: "Feb",
            mobile: 4800 + Math.floor(Math.random() * 100),
            desktop: 2600 + Math.floor(Math.random() * 100),
          },
          {
            month: "Mar",
            mobile: 5100 + Math.floor(Math.random() * 100),
            desktop: 2400 + Math.floor(Math.random() * 100),
          },
          {
            month: "Apr",
            mobile: 5600 + Math.floor(Math.random() * 100),
            desktop: 2200 + Math.floor(Math.random() * 100),
          },
          {
            month: "May",
            mobile: 6200 + Math.floor(Math.random() * 100),
            desktop: 2000 + Math.floor(Math.random() * 100),
          },
          {
            month: "Jun",
            mobile: 6800 + Math.floor(Math.random() * 100),
            desktop: 1900 + Math.floor(Math.random() * 100),
          },
          {
            month: "Jul",
            mobile: 7100 + Math.floor(Math.random() * 100),
            desktop: 1800 + Math.floor(Math.random() * 100),
          },
          {
            month: "Aug",
            mobile: 7800 + Math.floor(Math.random() * 100),
            desktop: 1600 + Math.floor(Math.random() * 100),
          },
          {
            month: "Sep",
            mobile: 8200 + Math.floor(Math.random() * 100),
            desktop: 1500 + Math.floor(Math.random() * 100),
          },
          {
            month: "Oct",
            mobile: 8600 + Math.floor(Math.random() * 100),
            desktop: 1400 + Math.floor(Math.random() * 100),
          },
          {
            month: "Nov",
            mobile: 9100 + Math.floor(Math.random() * 100),
            desktop: 1300 + Math.floor(Math.random() * 100),
          },
          {
            month: "Dec",
            mobile: 9500 + Math.floor(Math.random() * 100),
            desktop: 1200 + Math.floor(Math.random() * 100),
          },
        ],
      }

      setAnalyticsData(dummyData)
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveUser = (userId) => {
    setPendingUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, status: "approved" } : user)))
  }

  const handleRejectUser = (userId) => {
    setPendingUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, status: "rejected" } : user)))
  }

  const handleAnswerTicket = (ticketId, response) => {
    setHelpTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, adminResponse: response, status: "answered" } : ticket,
      ),
    )
  }

const sidebarItems = [
  { id: "overview", label: "Overview", icon: <img src="/home.png" alt="Home" style={{ width: 20, height: 20 }} /> },
  { id: "help", label: "Help Tickets", icon: <img src="/support.png" alt="Help" style={{ width: 20, height: 20 }} /> },
  { id: "approve", label: "Approve Sellers", icon: <img src="/approve.png" alt="Approve" style={{ width: 20, height: 20 }} /> },
]

  // Load data on component mount
  useEffect(() => {
    fetchAnalyticsData()

    // Auto-refresh data every 30 seconds
    const interval = setInterval(fetchAnalyticsData, 30000)
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
              className={`nav-item ${activeTab === item.id ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.id === "help" && helpTickets.filter((t) => t.status === "pending").length > 0 && (
                <span className="notification-badge">{helpTickets.filter((t) => t.status === "pending").length}</span>
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
                <h2>Admin Dashboard</h2>
                <button className="latest-reports-btn" onClick={fetchAnalyticsData} disabled={isLoading}>
                  {isLoading ? "LOADING..." : "REFRESH DATA"}
                </button>
              </div>

              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Total Users</span>
                    <span className="stat-icon">👥</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{analyticsData.totalUsers.toLocaleString()}</div>
                    <p className="stat-change positive">+5.2% from last month</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Active Users</span>
                    <span className="stat-icon">🟢</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{analyticsData.activeUsers.toLocaleString()}</div>
                    <p className="stat-change positive">+12.1% from last month</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Active Sellers</span>
                    <span className="stat-icon">🛒</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{analyticsData.activeSellers.toLocaleString()}</div>
                    <p className="stat-change positive">+18.5% from last month</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Pending Approvals</span>
                    <span className="stat-icon">⏳</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{analyticsData.pendingApprovals}</div>
                    <p className="stat-change neutral">Requires attention</p>
                  </div>
                </div>


                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">System Uptime</span>
                    <span className="stat-icon">⚡</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{analyticsData.systemUptime}%</div>
                    <p className="stat-change positive">Excellent performance</p>
                  </div>
                </div>
              </div>

              {/* Chart Section */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Daily Line Chart</h3>
                  <div className="chart-controls">
                    <div className="chart-toggles">
                      <button
                        className={`chart-toggle ${selectedChart === "mobile" ? "active" : ""}`}
                        onClick={() => setSelectedChart("mobile")}
                      >
                        📱 Mobile
                      </button>
                      <button
                        className={`chart-toggle ${selectedChart === "desktop" ? "active" : ""}`}
                        onClick={() => setSelectedChart("desktop")}
                      >
                        💻 Desktop
                      </button>
                    </div>
                    <select
                      className="chart-period-select"
                      value={chartPeriod}
                      onChange={(e) => setChartPeriod(e.target.value)}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                      <option value="daily">Daily</option>
                    </select>
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
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#666" }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="mobile"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                        name="Mobile"
                      />
                      <Line
                        type="monotone"
                        dataKey="desktop"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#f59e0b", strokeWidth: 2 }}
                        name="Desktop"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-summary">
                  <div className="summary-item">
                    <span className="summary-label">Mobile Growth:</span>
                    <span className="summary-value positive">+126.2%</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Desktop Trend:</span>
                    <span className="summary-value negative">-57.1%</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Total Sessions:</span>
                    <span className="summary-value">
                      {(
                        analyticsData.chartData[11]?.mobile + analyticsData.chartData[11]?.desktop || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "help" && (
            <div>
              <h2 className="page-title">Help Tickets Management</h2>

              <div className="help-stats">
                <div className="help-stat">
                  <span className="help-stat-number">{helpTickets.filter((t) => t.status === "pending").length}</span>
                  <span className="help-stat-label">Pending</span>
                </div>
                <div className="help-stat">
                  <span className="help-stat-number">{helpTickets.filter((t) => t.status === "answered").length}</span>
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
                  {pendingUsers.map((user) => (
                    <div key={user.id} className="user-item">
                      <div className="user-info">
                        <div className="user-avatar">
                          <img src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        </div>
                        <div className="user-details">
                          <h4>{user.name}</h4>
                          <p className="user-email">{user.email}</p>
                          <p className="user-business">Business: {user.businessName}</p>
                          <p className="user-date">Applied: {user.requestDate}</p>
                        </div>
                      </div>

                      <div className="user-actions">
                        {user.status === "pending" && (
                          <>
                            <button onClick={() => handleApproveUser(user.id)} className="approve-btn">
                              ✅ Approve
                            </button>
                            <button onClick={() => handleRejectUser(user.id)} className="reject-btn">
                              ❌ Reject
                            </button>
                          </>
                        )}

                        {user.status === "approved" && <span className="status-badge approved">✅ Approved</span>}
                        {user.status === "rejected" && <span className="status-badge rejected">❌ Rejected</span>}
                      </div>
                    </div>
                  ))}
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
      onAnswer(ticket.id, response)
      setResponse("")
      setIsResponding(false)
    }
  }

  return (
    <div className={`ticket-card ${ticket.status}`}>
      <div className="ticket-header">
        <div className="ticket-user">
          <h4>{ticket.userName}</h4>
          <span className="ticket-email">{ticket.userEmail}</span>
        </div>
        <div className="ticket-meta">
          <span className="ticket-time">{ticket.timestamp}</span>
          <span className={`ticket-status ${ticket.status}`}>
            {ticket.status === "pending" ? "🔴 Pending" : "✅ Answered"}
          </span>
        </div>
      </div>

      <div className="ticket-question">
        <h5>Question:</h5>
        <p>{ticket.question}</p>
      </div>

      {ticket.status === "answered" && (
        <div className="ticket-response">
          <h5>Admin Response:</h5>
          <p>{ticket.adminResponse}</p>
        </div>
      )}

      {ticket.status === "pending" && (
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


