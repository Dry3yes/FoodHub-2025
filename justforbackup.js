# FoodHub Landing Page - Complete Implementation Guide

This guide provides all the code and instructions needed to set up and run the FoodHub landing page using React with regular CSS (no Tailwind) and a Node.js/Express backend.

## Project Structure

```
foodhub-project/
├── client/                   # React frontend
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   ├── src/
│   │   ├── assets/           # Images and static assets
│   │   │   ├── logo.png
│   │   │   ├── logo-white.png
│   │   │   ├── chef.png
│   │   ├── components/       # React components
│   │   │   ├── Header.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   ├── AboutUs.jsx
│   │   │   ├── Testimonials.jsx
│   │   │   ├── CallToAction.jsx
│   │   │   ├── ContactForm.jsx
│   │   │   ├── Footer.jsx
│   │   ├── styles/           # CSS styles
│   │   │   ├── App.css
│   │   │   ├── Header.css
│   │   │   ├── Hero.css
│   │   │   ├── HowItWorks.css
│   │   │   ├── AboutUs.css
│   │   │   ├── Testimonials.css
│   │   │   ├── CallToAction.css
│   │   │   ├── ContactForm.css
│   │   │   ├── Footer.css
│   │   │   ├── index.css
│   │   ├── App.jsx           # Main App component
│   │   ├── index.js          # Entry point
│   ├── package.json          # Frontend dependencies
├── api/                      # API routes
│   ├── contact.js            # Contact form endpoint
├── server.js                 # Express server setup
├── package.json              # Backend dependencies
```

## Step 1: Setting Up the Backend

### 1. Create the project directory and initialize npm

```bash
mkdir foodhub-project
cd foodhub-project
npm init -y
```

### 2. Install backend dependencies

```bash
npm install express cors body-parser
npm install --save-dev nodemon concurrently
```

### 3. Create the server.js file

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const contactRoutes = require('./api/contact');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use('/api', contactRoutes);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 4. Create the api folder and contact.js file

```bash
mkdir api
```

```javascript
// api/contact.js
const express = require('express');
const router = express.Router();

// Contact form submission endpoint
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate the request body
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Please provide name, email, and message.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // In a real application, here you would:
    // 1. Store the message in a database
    // 2. Send an email notification
    // 3. Possibly add to a CRM system
    
    console.log('Contact form submission:', { name, email, message });
    
    // For demo purposes, we'll just respond with success
    return res.status(200).json({ 
      success: true, 
      message: 'Thank you for your message. We will get back to you soon!' 
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
  }
});

module.exports = router;
```

### 5. Update the backend package.json

```json
{
  "name": "foodhub-landing-page",
  "version": "1.0.0",
  "description": "FoodHub food delivery landing page",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "server": "nodemon server.js",
    "client": "npm start --prefix client",
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "build": "cd client && npm run build",
    "install-client": "cd client && npm install",
    "heroku-postbuild": "NPM_CONFIG_PRODUCTION=false npm run install-client && npm run build"
  },
  "keywords": [
    "react",
    "express",
    "food-delivery",
    "landing-page"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "nodemon": "^3.0.1"
  }
}
```

## Step 2: Setting Up the React Frontend

### 1. Create a new React app

```bash
npx create-react-app client
cd client
```

### 2. Install frontend dependencies

```bash
npm install react-router-dom
npm install --save @lucide/react
```

### 3. Update the frontend package.json

Add a proxy for API requests:

```json
"proxy": "http://localhost:5000",
```

Your client/package.json should look like this (versions may vary):

```json
{
  "name": "client",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@lucide/react": "^0.294.0",
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "proxy": "http://localhost:5000"
}
```

### 4. Set up the folder structure

```bash
cd src
mkdir -p components styles assets
```

### 5. Create the main CSS files

```css
/* src/styles/index.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.5;
  color: #333;
  background-color: #fff;
}

html {
  scroll-behavior: smooth;
}

a {
  text-decoration: none;
  color: inherit;
}

img {
  max-width: 100%;
  height: auto;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

section {
  padding: 60px 0;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  line-height: 1.2;
}

button, .button {
  cursor: pointer;
  font-family: inherit;
}

/* Grid system */
.grid {
  display: grid;
  gap: 20px;
}

@media (min-width: 768px) {
  .grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .grid-cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .grid-cols-4 {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Utility classes */
.text-center {
  text-align: center;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-center {
  justify-content: center;
}

.flex-col {
  flex-direction: column;
}

.gap-10 {
  gap: 10px;
}

.gap-20 {
  gap: 20px;
}

.mt-10 {
  margin-top: 10px;
}

.mt-20 {
  margin-top: 20px;
}

.mt-40 {
  margin-top: 40px;
}

.mb-10 {
  margin-bottom: 10px;
}

.mb-20 {
  margin-bottom: 20px;
}

.mb-40 {
  margin-bottom: 40px;
}

.m-auto {
  margin: 0 auto;
}

.bg-gray {
  background-color: #f8f9fa;
}

.bg-dark {
  background-color: #000;
  color: #fff;
}

.rounded {
  border-radius: 4px;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
```

```css
/* src/styles/App.css */
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}

section {
  width: 100%;
}

.section-title {
  font-size: 32px;
  margin-bottom: 15px;
}

.section-description {
  font-size: 18px;
  color: #666;
  max-width: 700px;
  margin: 0 auto 40px;
}

@media screen and (max-width: 768px) {
  .section-title {
    font-size: 28px;
  }
  
  .section-description {
    font-size: 16px;
  }
}
```

### 6. Create component-specific CSS files

```css
/* src/styles/Header.css */
.header {
  position: sticky;
  top: 0;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 1000;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  padding: 0 20px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo {
  height: 32px;
  width: 32px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
}

.nav-desktop {
  display: none;
}

.nav-item {
  font-size: 14px;
  font-weight: 500;
  margin-left: 24px;
  transition: color 0.2s;
}

.nav-item:hover {
  color: #10b981;
}

.header-actions {
  display: flex;
  align-items: center;
}

.signup-btn {
  display: none;
  height: 36px;
  background-color: #000;
  color: #fff;
  padding: 0 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  margin-left: 16px;
}

.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}

.mobile-menu {
  display: block;
  padding: 16px 20px;
  background-color: #fff;
  border-top: 1px solid #eee;
}

.mobile-nav-item {
  display: block;
  padding: 16px 0;
  font-size: 14px;
  font-weight: 500;
}

.mobile-nav-item:not(:last-child) {
  border-bottom: 1px solid #eee;
}

@media (min-width: 768px) {
  .nav-desktop {
    display: flex;
  }
  
  .signup-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  .menu-btn {
    display: none;
  }
  
  .mobile-menu {
    display: none;
  }
}
```

```css
/* src/styles/Hero.css */
.hero {
  background-color: #fff;
}

.hero-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: center;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-title {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
}

.hero-description {
  color: #666;
  font-size: 16px;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.primary-btn {
  height: 40px;
  background-color: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0 32px;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.primary-btn:hover {
  background-color: #333;
}

.secondary-btn {
  height: 40px;
  background-color: #fff;
  color: #000;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0 32px;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.secondary-btn:hover {
  background-color: #f5f5f5;
}

.hero-image {
  border-radius: 8px;
  overflow: hidden;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 48px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: 30px;
  font-weight: 700;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

@media (min-width: 400px) {
  .hero-actions {
    flex-direction: row;
  }
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 42px;
  }
  
  .hero-description {
    font-size: 18px;
  }
  
  .stats-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .hero-container {
    grid-template-columns: 1fr 1fr;
  }
  
  .hero-title {
    font-size: 48px;
  }
}
```

```css
/* src/styles/HowItWorks.css */
.how-it-works {
  background-color: #f8f9fa;
}

.steps-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  max-width: 1000px;
  margin: 40px auto 0;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #000;
  color: #fff;
  font-weight: 700;
  margin-bottom: 16px;
}

.step-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
}

.step-description {
  color: #666;
  font-size: 16px;
}

@media (min-width: 768px) {
  .steps-container {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

```css
/* src/styles/AboutUs.css */
.about-us {
  background-color: #fff;
}

.about-header {
  text-align: center;
  margin-bottom: 48px;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 48px;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content-title {
  font-size: 24px;
  font-weight: 700;
}

.content-image {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.content-text {
  color: #666;
}

.vision-image {
  aspect-ratio: 16/9;
  width: 100%;
}

.mission-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.offerings {
  margin-top: 48px;
}

.offerings-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
}

.offerings-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.offering-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.offering-image {
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16/9;
}

.offering-title {
  font-size: 18px;
  font-weight: 600;
}

.offering-description {
  color: #666;
}

@media (min-width: 768px) {
  .content-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .mission-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .offerings-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

```css
/* src/styles/Testimonials.css */
.testimonials {
  background-color: #f8f9fa;
}

.testimonials-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  max-width: 1000px;
  margin: 40px auto 0;
}

.testimonial-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #eee;
  height: 100%;
}

.testimonial-content {
  margin-bottom: 16px;
}

.testimonial-text {
  color: #666;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  flex-direction: column;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.author-name {
  font-size: 14px;
  font-weight: 600;
}

.author-title {
  font-size: 14px;
  color: #666;
}

@media (min-width: 768px) {
  .testimonials-container {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

```css
/* src/styles/CallToAction.css */
.cta {
  background-color: #fff;
  text-align: center;
}

.cta-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 16px;
}

.cta-description {
  color: #666;
  font-size: 18px;
  max-width: 700px;
  margin: 0 auto 24px;
}

.cta-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
}

@media (min-width: 400px) {
  .cta-buttons {
    flex-direction: row;
  }
}
```

```css
/* src/styles/ContactForm.css */
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
}

.form-input,
.form-textarea {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.form-submit {
  height: 40px;
  background-color: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.form-submit:hover {
  background-color: #333;
}

.form-submit:disabled {
  background-color: #999;
  cursor: not-allowed;
}

.status-message {
  padding: 12px;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 16px;
}

.success-message {
  background-color: #d1fae5;
  color: #065f46;
}

.error-message {
  background-color: #fee2e2;
  color: #b91c1c;
}
```

```css
/* src/styles/Footer.css */
.footer {
  background-color: #000;
  color: #fff;
  padding: 48px 0;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
}

.footer-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-logo-image {
  height: 32px;
  width: 32px;
}

.footer-logo-text {
  font-size: 20px;
  font-weight: 700;
}

.footer-text {
  font-size: 14px;
  color: #a3a3a3;
}

.footer-contact {
  font-size: 14px;
  color: #a3a3a3;
}

.footer-heading {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-link {
  font-size: 14px;
  color: #a3a3a3;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #fff;
}

.footer-qr {
  display: flex;
  justify-content: center;
}

.footer-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid #333;
}

.copyright {
  font-size: 12px;
  color: #a3a3a3;
}

.social-links {
  display: flex;
  gap: 16px;
}

.social-link {
  color: #a3a3a3;
  transition: color 0.2s;
}

.social-link:hover {
  color: #fff;
}

@media (min-width: 768px) {
  .footer-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .footer-bottom {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .footer-qr {
    justify-content: flex-start;
  }
}
```

### 7. Create the React components

```jsx
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

```jsx
// src/App.jsx
import React from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import AboutUs from "./components/AboutUs";
import Testimonials from "./components/Testimonials";
import CallToAction from "./components/CallToAction";
import Footer from "./components/Footer";
import "./styles/App.css";

function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <AboutUs />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}

export default App;
```

```jsx
// src/components/Header.jsx
import React, { useState } from "react";
import { Menu, X } from "@lucide/react";
import "../styles/Header.css";
// Import actual logo images when available
import logo from "../assets/logo.png"; 

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo-container">
          <img src={logo} alt="FoodHub Logo" className="logo" />
          <span className="logo-text">FoodHub</span>
        </div>

        <nav className="nav-desktop">
          <a href="#how-it-works" className="nav-item">
            How It Works
          </a>
          <a href="#about-us" className="nav-item">
            About Us
          </a>
          <a href="#menu" className="nav-item">
            Menu
          </a>
        </nav>

        <div className="header-actions">
          <a href="#signup" className="signup-btn">
            Sign Up
          </a>
          <button
            className="menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="mobile-menu">
          <a
            href="#how-it-works"
            className="mobile