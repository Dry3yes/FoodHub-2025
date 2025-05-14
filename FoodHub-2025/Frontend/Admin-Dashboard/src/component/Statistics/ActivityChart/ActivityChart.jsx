import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./ActivityChart.css";
import Dropdown from '../../../assets/DropDownIcon.png';

const fullValue = 400; // nilai maksimal setiap bar

const data = [
  { month: "JAN", activity: 100 },
  { month: "FEB", activity: 120 },
  { month: "MAR", activity: 130 },
  { month: "APR", activity: 250 },
  { month: "MAY", activity: 270 },
  { month: "JUN", activity: 200 },
  { month: "JUL", activity: 230 },
  { month: "AUG", activity: 100 },
  { month: "SEP", activity: 300 },
  { month: "OCT", activity: 350 },
  { month: "NOV", activity: 380 },
  { month: "DEC", activity: 400 },
].map(item => ({
  ...item
}));

const ActivityChart = () => {
  const [period, setPeriod] = useState("Month");

  return (
    <div className="activity-chart-container">
      <div className="chart-header">
        <h4>Activity</h4>
        
        <div className="dropdown">
          <button className="dropdown-button">{period} <img src={Dropdown} alt="Dropdown" className="dropdown-icon" /> </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          
          {/* Foreground progress bars */}
          <Bar dataKey="activity" fill="#1E5EFF" barSize={20} radius={10} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;
