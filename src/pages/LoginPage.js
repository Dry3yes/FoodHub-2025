"use client";

import { useState } from "react";
import "../styles/LoginPage.css";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/Api";
import { Eye } from "lucide-react";
import { useCart } from "../hooks/useCart";
import ForgotPasswordModal from "../components/ForgotPasswordModal";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const navigate = useNavigate();
  const { syncCartWithBackend } = useCart();

  const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      if(!email || !password) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
      }
      // Email validation
      if (!email.includes('@')) {
          setError('Email must contain @');
          setLoading(false);
          return;
      }
      // Password validation
      if (password.length < 5) {
          setError('Password must be at least 5 characters long');
          setLoading(false);
          return;
      }
      try {
          const response = await loginUser({ email, password });
          if (response && response.data) {
              localStorage.setItem('token', response.data.token);
              localStorage.setItem('refreshToken', response.data.refreshToken);
              localStorage.setItem('user', JSON.stringify(response.data.user));
              localStorage.setItem('expiresIn', response.data.expiresIn);
              
              // Store seller information if available
              if (response.data.seller) {
                  localStorage.setItem('sellerInfo', JSON.stringify(response.data.seller));
              }

              // Sync cart with backend after successful login
              try {
                  await syncCartWithBackend();
              } catch (cartError) {
                  console.error('Failed to sync cart after login:', cartError);
                  // Don't fail login if cart sync fails
              }
                // Check if user is a seller and redirect accordingly
              const user = response.data.user;
              if (user && user.role === 'Admin') {
                  navigate('/admin');
              } else if (user && user.role === 'Seller') {
                  navigate('/seller');
              } else {
                  navigate('/');
              }
          } else {
              navigate('/');
          }
      } catch (err) {
          setError('Login failed. Please check your credentials.');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <div className="login-left-panel">
          <div className="login-left-content">
            <p className="login-moment">
                A Moment of Happy
                <span className="Login-Line"></span>
            </p>
            <div className="login-tagline">
              <h2 className="login-tagline-text">
                Get
                <br />
                what you love
                <br />
                love what you get.
              </h2>
              <p className="login-description">
                Discover your favorite meals and enjoy a culinary experience that brings true happiness. Foodhub is your
                go-to spot at Binus where you can savor every delicious moment because you deserve the best.
              </p>
            </div>
          </div>
        </div>
        <div className="login-right-panel">
          <div className="login-form-container">
            {/* <div className="login-logo">
              <img src="/Images/MainLogo.png" alt="Foodhub Logo" />
            </div> */}
            <h1 className="login-title">Welcome to Foodhub!</h1>
            <p className="login-subtitle">Sign in with your credentials to access your personalized experience.</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="text"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    <Eye size={20} />
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <div className="remember-me">
                  <input type="checkbox" id="remember" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                  <label htmlFor="remember">Remember me</label>
                </div>                <button 
                  type="button" 
                  className="forgot-link" 
                  onClick={() => setShowForgotPasswordModal(true)}
                >
                  Forgot Password
                </button>
              </div>
              
              {error && <p className="error-message">{error}</p>}

              <button type="submit" className="signin-button" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

              {/* <button type="button" className="google-signin-button" disabled={loading}>
                <span className="google-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </span>
                Sign In with Google
              </button> */}
            </form>

            <p className="signup-link">
              Don't have an account? <a href="/register">Sign Up</a>
            </p>
          </div>
        </div>
      </div>      {showForgotPasswordModal && (
        <ForgotPasswordModal 
          isOpen={showForgotPasswordModal}
          onClose={() => setShowForgotPasswordModal(false)} 
        />
      )}
    </div>
  );
};

export default LoginPage;
