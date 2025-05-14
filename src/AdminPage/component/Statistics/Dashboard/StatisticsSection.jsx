import React from "react";
import SummaryBox from "../SummaryBox/SummaryBox";
import ActiveMemberCard from "../ActiveMember/ActiveMember";
import ActivityChart from "../ActivityChart/ActivityChart";
import "./Dashboard.css";

const StatisticsSection = () => {
  return (
    <div className="statistics-container">
  <div className="top-row">
    <div className="summary-section">
      <SummaryBox />
      <div className="bottom-row">
        <ActivityChart />
      </div>
    </div>
    <div className="active-member-section">
      <ActiveMemberCard />
    </div>
  </div>
</div>

  );
};

export default StatisticsSection;
