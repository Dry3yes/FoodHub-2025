import React, { useState } from "react";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const TotSeller = 10000;
  const AvgActive = 4200;
  const TotActive = 10000;
  const barData = [60, 80, 90, 180, 160, 140, 120, 60, 200, 220, 240, 240];
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

  // Tooltip state
  const [hoveredBar, setHoveredBar] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Navbar
  const navbar = (
    <nav className="admin-navbar">
      <div className="admin-navbar-left">
        <h2>
          Food<span className="highlight">•Hub</span>
        </h2>
      </div>
      <div className="admin-navbar-right">
        <span className="admin-navbar-welcome">
          Welcome <span className="admin-navbar-username">, Mikolas</span>
        </span>
        <img src="./Images/UserProfile.jpg" alt="User" className="admin-navbar-profile" />
      </div>
    </nav>
  );

  // Sidebar
  const sidebarAdmin = (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <h2>
          Food<span className="highlight">•Hub</span>
        </h2>
      </div>
      <ul className="admin-sidebar-list">
        <li className="admin-sidebar-item active">
          <span className="admin-sidebar-icon">🏠</span>
          <span>DashBoard</span>
        </li>
        <li className="admin-sidebar-item">
          <span className="admin-sidebar-icon">↩️</span>
          <span>Sign Out</span>
        </li>
      </ul>
    </aside>
  );

  // Summary Stats Row
  const summaryBox = (
    <div className="admin-summary-row">
      <div className="admin-summary-card">
        <div className="admin-summary-label">Total Seller</div>
        <div className="admin-summary-value">{TotSeller.toLocaleString()}</div>
      </div>
      <div className="admin-summary-card">
        <div className="admin-summary-label">Avg User Active</div>
        <div className="admin-summary-value">{AvgActive.toLocaleString()}</div>
      </div>
      <div className="admin-summary-card">
        <div className="admin-summary-label">Total User Active</div>
        <div className="admin-summary-value">{TotActive.toLocaleString()}</div>
      </div>
    </div>
  );

  // Activity Chart with tooltip
  const activityChart = (
    <div className="admin-chart-card" style={{position: "relative"}}>
      <svg
        width="100%"
        height="200"
        viewBox="0 0 600 200"
        onMouseLeave={() => setHoveredBar(null)}
      >
        {/* Y axis */}
        <line x1="40" y1="10" x2="40" y2="180" stroke="#ccc" strokeWidth="2"/>
        {/* X axis */}
        <line x1="40" y1="180" x2="580" y2="180" stroke="#ccc" strokeWidth="2"/>
        {/* Bars */}
        {barData.map((h, i) => (
          <rect
            key={i}
            x={55 + i * 45}
            y={180 - h}
            width="30"
            height={h}
            fill="#0047ff"
            rx="6"
            onMouseEnter={e => {
              setHoveredBar(i);
              const svgRect = e.target.ownerSVGElement.getBoundingClientRect();
              setTooltipPos({
                x: e.target.getBoundingClientRect().left - svgRect.left + 15,
                y: e.target.getBoundingClientRect().top - svgRect.top - 10
              });
            }}
          />
        ))}
        {/* Labels */}
        {months.map((m, i) => (
          <text
            key={m}
            x={70 + i * 45}
            y={195}
            textAnchor="middle"
            fontSize="13"
            fill="#888"
          >{m}</text>
        ))}
      </svg>
      {hoveredBar !== null && (
        <div
          className="chart-tooltip"
          style={{
            position: "absolute",
            left: tooltipPos.x,
            top: tooltipPos.y,
            background: "#fff",
            color: "#222",
            border: "1px solid #ddd",
            borderRadius: "6px",
            padding: "6px 12px",
            fontSize: "14px",
            pointerEvents: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            transform: "translate(-50%, -100%)",
            zIndex: 10
          }}
        >
          {months[hoveredBar]}: <b>{barData[hoveredBar]}</b>
        </div>
      )}
    </div>
  );

  // Active Member/Stats Card (right)
  const activeMemberCard = (
    <div className="admin-member-card">
      <div className="admin-member-value">300</div>
      <svg width="60" height="60" viewBox="0 0 60 60" style={{margin:"10px auto"}}>
        <circle cx="30" cy="30" r="25" fill="none" stroke="#eee" strokeWidth="7"/>
        <circle cx="30" cy="30" r="25" fill="none" stroke="#0047ff" strokeWidth="7" strokeDasharray="157" strokeDashoffset="30"/>
      </svg>
      <div className="admin-member-label">+5% from yesterday</div>
    </div>
  );

  // Statistics Section
  const statisticsSection = (
    <div className="admin-main-section">
      <h2 className="admin-welcome">Welcome To Admin Dashboard...</h2>
      {summaryBox}
      <div className="admin-main-row">
        {activityChart}
        {activeMemberCard}
      </div>
    </div>
  );

  // Main render
  return (
    <div className="admin-dashboard-root">
      {sidebarAdmin}
      <div className="admin-dashboard-main">
        {navbar}
        {statisticsSection}
      </div>
    </div>
  );
};

export default AdminDashboard;