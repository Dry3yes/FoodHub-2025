import React from "react";
import "./MainBanner.css";
import PizzaBanner from '../../assets/PizzaBanner.png';

const Banner = () => {
  return (
    <div className="banner-container">
      {/* /path-to-your-image.jpg/png */}
      <img src={PizzaBanner} alt="Banner" className="banner" />
      <div className="buttons">
        <button className="btn">Location</button>
        <button className="btn">Chat</button>
        <button className="btn rating">
          ⭐ <span>4.5</span>
        </button>
      </div>
    </div>
  );
};

export default Banner;
