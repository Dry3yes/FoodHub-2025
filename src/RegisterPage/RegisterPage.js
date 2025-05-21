"use client"

import { useState } from "react"
import "./RegisterPage.css"
import { Eye } from "lucide-react"

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Registration attempt with:", formData)
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match")
      return
    }
    // Add your registration logic here
  }

  return (
    <div className="register-page-wrapper">
      <div className="register-container">
        {/* Left Panel */}
        <div className="register-left-panel">
          <div className="register-left-content">
            <p className="register-moment">
              A Moment of Happy
              <span className="register-line"></span>
            </p>
            <div className="register-tagline">
              <h2 className="register-tagline-text">
                Get
                <br />
                what you love
                <br />
                love what you get.
              </h2>
              <p className="register-description">
                Discover your favorite meals and enjoy a culinary experience that brings true happiness. Foodhub is your
                go-to spot at Binus where you can savor every delicious moment because you deserve the best.
              </p>
            </div>
          </div>
        </div>
        {/* Right Panel */}
        <div className="register-right-panel">
          <div className="register-form-container">
            <div className="register-logo">
              <img src="/Images/MainLogo.png" alt="Foodhub Logo" />
            </div>
            <h1 className="register-title">Welcome to Foodhub!</h1>
            <p className="register-subtitle">Register with your details to start your personalized experience.</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your active email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    <Eye size={20} />
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Eye size={20} />
                  </button>
                </div>
              </div>

              <button type="submit" className="register-button">
                Register
              </button>
            </form>

            <p className="login-link">
              Already have an account? <a href="#login">Log In</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
