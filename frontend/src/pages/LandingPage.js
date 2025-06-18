import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import AboutUs from '../components/AboutUs';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import '../styles/LandingPage.css';

function LandingPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#about') {
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <div id="about">
          <AboutUs />
        </div>
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
