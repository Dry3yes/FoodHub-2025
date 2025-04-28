import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    return (
        <div className="home-container">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-text">
                    <h1 className='SeamlessFood'>Seamless Food,</h1>
                    <h1 className='OrderingFast'>Ordering, Fast,</h1>
                    <h1 className='SimpleStress'>Simple, Stress-Free!</h1>
                    <h3>Effortless Pre-Orders, Instant Enjoyment, Anytime!</h3>
                    <div className="hero-buttons">
                        <button className="btn primary">Watch Guide</button>
                        <button className="btn secondary">How it Works</button>
                    </div>
                    <div className="team-info">
                        <div>
                            <h3>FoodHub Team</h3>
                            <p><em>Developer</em></p>
                            <p>Created by developers to bring a seamless food ordering experience with FoodHub.</p>
                        </div>
                        <img src="/Images/DeveloperPose.png" alt="Developer" className="developer-img" />
                    </div>
                </div>
                <div className="hero-image">
                    <img src="/Images/HomePage_DiscoverBackground.png" alt="Food Menu" />
                    <button className="discover-menu">Discover Menu</button>
                </div>
            </div>

            {/* Promo Section */}
            <div className="promo-section">
                <div>

                    <div className="promo-card">
                        <img src="/Images/HomePage_PromoCard.png" alt="Burger Feast" />
                    </div>
                    <div className="promo-card">
                        <img src="/Images/HomePage_PromoCard.png" alt="Burger Feast" />
                    </div>
                </div>
                <div>

                    <div className="promo-card">
                        <img src="/Images/HomePage_PromoCard.png" alt="Burger Feast" />
                    </div>
                    <div className="promo-card">
                        <img src="/Images/HomePage_PromoCard.png" alt="Burger Feast" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
