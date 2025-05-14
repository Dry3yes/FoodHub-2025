import React from "react";
import "./SummaryBox.css";

const SummaryBox = ({ TotSeller = 10000, AvgActive = 4200, TotActive = 10000 }) => {
  return (
    <div className="summary-box">
      <div className="summary-item">
        <p>Total Seller</p>
        <h3>{TotSeller}</h3>
      </div>
      <div className="divider" />
      <div className="summary-item">
        <p>Avg User Active</p>
        <h3>{AvgActive}</h3>
      </div>
      <div className="divider" />
      <div className="summary-item">
        <p>Total User Active</p>
        <h3>{TotActive}</h3>
      </div>
    </div>
  );
};

export default SummaryBox;
