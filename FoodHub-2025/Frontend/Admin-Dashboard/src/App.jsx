import React from "react";
import Sidebar from "./component/SidebarAdmin/SidebarAdmin";
import Navbar from "./component/Navbar/Navbar";
import StatisticsSection from "./component/Statistics/Dashboard/StatisticsSection";
import "./App.css";

function App() {
  return (
    <div className="dashboard-container">
    <Sidebar />

    <div className="main-content">
      <Navbar />

      <div className="content-wrapper">
        <h2>Welcome To Admin Dashboard...</h2>

        <StatisticsSection />
      </div>
    </div>
  </div>
  );
}

export default App;
