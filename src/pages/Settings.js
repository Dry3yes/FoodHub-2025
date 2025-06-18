import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { applyForSeller, updateUser } from '../services/Api';
import Header from '../components/Header';
import '../styles/Settings.css';

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Common state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isSellerMode, setIsSellerMode] = useState(false);
    
  // Seller specific state
  const [description, setDescription] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState('');
  const [nik, setNik] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [faceImages, setFaceImages] = useState([null, null, null]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isUserSeller, setIsUserSeller] = useState(false);
  
  // PDF Modal state
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfType, setPdfType] = useState(''); // 'terms' or 'privacy'
  

  // Check if the user is already a seller
  useEffect(() => {
    // Check both user role and sellerInfo
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const sellerInfo = localStorage.getItem('sellerInfo');
    
    // User is a seller if either role is 'Seller' or sellerInfo exists
    const isSeller = user?.role === 'Seller' || !!sellerInfo;
    
    setIsUserSeller(isSeller);
    
    // If user is a seller and currently in seller mode, redirect to profile
    if (isSeller && location.pathname === '/settings/seller') {
      navigate('/settings', { replace: true });
    }
    
    // Load user data into form fields
    if (user?.name) {
      setUsername(user.name);
    }
    if (user?.email) {
      setEmail(user.email);
    }
  }, [navigate, location.pathname]);

  // Handle PDF modal
  const openPdfModal = (type) => {
    setPdfType(type);
    setShowPdfModal(true);
  };

  const closePdfModal = () => {
    setShowPdfModal(false);
    setPdfType('');
  };

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
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error and success messages
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    
    try {
      // Get current user data
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Validate input
      if (!username.trim()) {
        setError('Username is required');
        setIsLoading(false);
        return;
      }
      
      if (!email.trim()) {
        setError('Email is required');
        setIsLoading(false);
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }
      
      // Prepare update data
      const updateData = {
        name: username.trim(),
        email: email.trim()
      };
      
      // Call API to update user
      const response = await updateUser(user.userId, updateData);
      
      if (response.success) {
        // Update local storage with new user data
        const updatedUser = { ...user, ...updateData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setSuccess('Profile updated successfully!');
        
        // If email was changed, show additional message
        if (email !== user.email) {
          setSuccess('Profile updated successfully! Your email has been updated in Firebase as well.');
        }
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError(err.message || 'An error occurred while updating your profile');
    } finally {
      setIsLoading(false);
    }
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
          description : description,
          deliveryEstimate : deliveryEstimate,
          nik: nik 
        }, 
        imageFile
      );
      
      if (response.success) {
        setSuccess('Your seller application has been submitted successfully!');
        // Reset form
        setNik('');
        setUsername('');
        setDescription('');
        setDeliveryEstimate('');
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

  // Toggle between user profile and seller registration modes
  const toggleMode = () => {
    setIsSellerMode(!isSellerMode);
  };

  // PDF Modal Component
  const PdfModal = () => {
    if (!showPdfModal) return null;

    // Updated PDF URL paths - langsung dari public folder
    const pdfUrl = pdfType === 'terms' 
      ? '/terms.pdf'  // File terms.pdf di public folder
      : '/privacy-policy.pdf'; // Atau sesuaikan dengan nama file privacy policy Anda

    const title = pdfType === 'terms' 
      ? 'Terms & Conditions' 
      : 'Privacy Policy';

    return (
      <div className="pdf-modal-overlay" onClick={closePdfModal}>
        <div className="pdf-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="pdf-modal-header">
            <h3>{title}</h3>
            <button className="pdf-modal-close" onClick={closePdfModal}>
              ×
            </button>
          </div>
          <div className="pdf-modal-body">
            <iframe
              src={pdfUrl}
              width="100%"
              height="600px"
              title={title}
              onError={(e) => {
                console.error('Error loading PDF:', e);
                setError('Failed to load PDF. Please make sure the file exists in the public folder.');
              }}
            />
          </div>
          <div className="pdf-modal-footer">
            <button className="pdf-download-btn">
              <a href={pdfUrl} download target="_blank" rel="noopener noreferrer">
                Download PDF
              </a>
            </button>
            <button className="pdf-close-btn" onClick={closePdfModal}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="settings-page">
      {/* Left Sidebar */}
      <div className="settings-sidebar">
        <nav className="sidebar-nav">
          <ul>
            <label>My Account</label>
            <li className={`nav-item account-item active`} onClick={() => navigate('/settings')}>Profile</li>
            {!isUserSeller && (
              <li className={`nav-item seller-toggle`} onClick={toggleMode}>Apply for Seller</li>
            )}
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
                <label htmlFor="username">Name</label>
                <input 
                  type="text" 
                  id="username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={JSON.parse(localStorage.getItem('user'))?.name || 'Enter your username'}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={JSON.parse(localStorage.getItem('user'))?.email || 'Enter your email'}
                  required
                />
                <small className="form-help">
                  Changing your email will update your Firebase account as well.
                </small>
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
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
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
                <label htmlFor="seller-description">Store Description</label>
                <textarea
                  id="seller-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a brief description of your store"
                />
              </div>

              <div className="form-group">
                <label htmlFor="seller-deliveryestimate">Delivery Estimate Time</label>
                <input
                  type="text"
                  id="seller-deliveryestimate"
                  value={deliveryEstimate}
                  onChange={(e) => setDeliveryEstimate(e.target.value)}
                  placeholder="Enter delivery estimate time"
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
                  By clicking, you agree to the{' '}
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      openPdfModal('terms');
                    }}
                  >
                    Terms & Conditions
                  </a> {' '}
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      openPdfModal('privacy');
                    }}
                  >
                  
                  </a>
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

      {/* PDF Modal */}
      <PdfModal />
    </div>
    </>
  );
};

export default Settings;