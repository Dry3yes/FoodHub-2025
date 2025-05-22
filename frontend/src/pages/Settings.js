import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { applyForSeller } from '../services/Api';
import Header from '../components/Header';
import '../styles/Settings.css';

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine if we're in seller mode based on the URL
  const [isSellerMode, setIsSellerMode] = useState(location.pathname === '/settings/seller');
  
  // Common state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  
  // User profile specific state
  const [gender, setGender] = useState('');
  
  // Seller specific state
  const [nik, setNik] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [faceImages, setFaceImages] = useState([null, null, null]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Update the URL and mode state when toggling between views
  const toggleMode = () => {
    const newMode = !isSellerMode;
    setIsSellerMode(newMode);
    navigate(newMode ? '/settings/seller' : '/settings', { replace: true });
  };
  
  // Update mode based on URL when location changes
  useEffect(() => {
    setIsSellerMode(location.pathname === '/settings/seller');
  }, [location.pathname]);

  // Handle face image upload for seller mode
  const handleImageUpload = (index, e) => {
    const newImages = [...faceImages];
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        newImages[index] = event.target.result;
        setFaceImages(newImages);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Handle form submission for user profile
  const handleUserSubmit = (e) => {
    e.preventDefault();
    console.log('User form submitted:', { username, email, gender });
    alert('Changes saved successfully!');
  };
  
  // Handle form submission for seller registration
  const handleSellerSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    setSuccess(null);
    
    // Validation
    if (!agreedToTerms) {
      setError('Please agree to the Terms & Conditions to continue');
      return;
    }
    
    if (!username) {
      setError('Store name is required');
      return;
    }
    
    if (!nik) {
      setError('NIK (National ID) is required');
      return;
    }
    
    // Check if at least one face image is uploaded
    if (!faceImages[0]) {
      setError('At least one face image is required for verification');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Convert base64 image to file
      let imageFile = null;
      if (faceImages[0]) {
        imageFile = await base64ToFile(faceImages[0], 'face_verification.jpg');
      }
      
      // Call the API function
      const response = await applyForSeller(
        { 
          storeName: username, 
          nik: nik 
        }, 
        imageFile
      );
      
      if (response.success) {
        setSuccess('Your seller application has been submitted successfully!');
        // Reset form
        setNik('');
        setFaceImages([null, null, null]);
        setAgreedToTerms(false);
      } else {
        setError(response.message || 'Failed to submit application');
      }
    } catch (err) {
      console.error('Error submitting seller application:', err);
      setError(err.message || 'An error occurred while submitting your application');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to convert base64 to File object
  const base64ToFile = async (base64String, fileName) => {
    const res = await fetch(base64String);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type });
  };

  return (
    <>
      <Header />
      <div className="settings-page">
      {/* Left Sidebar */}
      <div className="settings-sidebar">
        {/* <div className="user-profile">
          <div className="profile-picture">
            <img src="/Images/User_Profile_Picture.png" alt="User" />
          </div>
          <button className="change-profile-btn">Change Profile</button>
        </div> */}

        <nav className="sidebar-nav">
          <ul>
            <label>My Account</label>
            <li className={`nav-item account-item active`} onClick={() => navigate('/settings')}>Profile</li>
            <li className={`nav-item seller-toggle`} onClick={toggleMode}>Apply for Seller</li>
          </ul>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="settings-main">
        {!isSellerMode ? (
          // User Profile Form
          <div className="profile-form-container">
            <h2>User Profile</h2>
            
            <form className="profile-form" onSubmit={handleUserSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input 
                  type="text" 
                  id="username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={JSON.parse(localStorage.getItem('user'))?.name || ''}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={JSON.parse(localStorage.getItem('user'))?.email || ''}
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="apply-button">Save Changes</button>
              </div>
            </form>
          </div>
        ) : (
          // Seller Registration Form
          <div className="profile-form-container">
            <h2>Seller Verification</h2>
            
            <form className="profile-form" onSubmit={handleSellerSubmit}>
              <div className="form-group">
                <label htmlFor="seller-username">Store Name</label>
                <input 
                  type="text" 
                  id="seller-username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your store name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="nik">NIK</label>
                <input 
                  type="text" 
                  id="nik" 
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  placeholder="Enter your National ID"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="seller-email">Email</label>
                <input 
                  type="email" 
                  id="seller-email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={JSON.parse(localStorage.getItem('user'))?.email || ''}
                />
              </div>
              
              <div className="face-verification">
                <h3>Identity Verification</h3>
                <p>Please Upload Your ID CARD for the verification</p>
                <div className="image-upload-container">
                  {[0].map((index) => (
                    <div key={index} className="image-upload">
                      {faceImages[index] ? (
                        <img src={faceImages[index]} alt={`Face ${index + 1}`} />
                      ) : (
                        <label htmlFor={`face-image-${index}`}>
                          <div className="upload-placeholder">
                            <span className="plus-icon">+</span>
                          </div>
                        </label>
                      )}
                      <input
                        type="file"
                        id={`face-image-${index}`}
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e)}
                        style={{ display: 'none' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="terms-section">
                <div className="agree-checkbox">
                  <input
                    type="checkbox"
                    id="agree-terms"
                    checked={agreedToTerms}
                    onChange={() => setAgreedToTerms(!agreedToTerms)}
                  />
                  <label htmlFor="agree-terms">
                    Agree & Continue
                  </label>
                </div>
                <p className="terms-notice">
                  By clicking, you agree to the <a href="#terms">Terms & Conditions</a> and 
                  <a href="#privacy"> Privacy Policy</a>
                </p>
                
                <ul className="terms-list">
                  <li>
                    <span className="checkmark">✅</span>
                    Users must comply with laws and regulations.
                  </li>
                  <li>
                    <span className="checkmark">✅</span>
                    Users are responsible for providing accurate information.
                  </li>
                  <li>
                    <span className="checkmark">✅</span>
                    FoodHub reserves the right to modify, suspend, or terminate accounts that violate policies.
                  </li>
                  <li>
                    <span className="checkmark">✅</span>
                    Disputes will be handled according to dispute resolution policy.
                  </li>
                  <li>
                    <span className="checkmark">✅</span>
                    Using FoodHub means acceptance of these terms.
                  </li>
                </ul>
              </div>
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="success-message">
                  {success}
                </div>
              )}
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="apply-button" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting...' : 'Apply'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Settings;