import React from 'react';
import Header from '../components/FoodHubHeader';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import HowItWorks from '../components/HowItWorks';
import AboutUs from '../components/AboutUs';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import '../styles/LandingPage.css';

function LandingPage() {
  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <Stats />
        <HowItWorks />
        <AboutUs />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
