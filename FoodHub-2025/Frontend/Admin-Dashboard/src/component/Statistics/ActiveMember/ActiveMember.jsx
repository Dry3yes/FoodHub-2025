// src/component/Statistics/ActiveMemberCard.jsx
import React from "react";
import "./ActiveMember.css";

const ActiveMemberCard = ({activeMember = 300}) => {
  return (
    <div className="active-member-card">
      <h4>Active Member Today</h4>
      <div className="circle-container">
        <div className="circle">
        </div>
        <div className="text">
          <h2>{activeMember}</h2>
          <p>Active Member</p>
          <span className="positive">+5% from yesterday</span>
        </div>
      </div>
    </div>
  );
};

export default ActiveMemberCard;
