import React, { useState } from 'react';
import { forgotPassword } from '../services/Api';
import styles from '../styles/ForgotPasswordModal.module.css';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await forgotPassword(email);
      if (response.success) {
        setMessage(response.message);
        setEmail('');
      } else {
        setError(response.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setMessage('');
    setError('');
    onClose();
  };

  return (
    <div className={styles['modal-overlay']} onClick={handleOverlayClick}>
      <div className={styles['modal']}>
        <div className={styles['modal-header']}>
          <h2 className={styles['modal-title']}>Reset Password</h2>
          <button className={styles['close-button']} onClick={handleClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles['modal-content']}>
          {message ? (
            <div className={styles['success-message']}>
              <div className={styles['success-icon']}>✓</div>
              <p>{message}</p>
              <button className={styles['ok-button']} onClick={handleClose}>
                OK
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className={styles['description']}>
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              {error && (
                <div className={styles['error-message']}>
                  {error}
                </div>
              )}

              <div className={styles['form-group']}>
                <label htmlFor="email" className={styles['form-label']}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles['form-input']}
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles['form-actions']}>
                <button
                  type="button"
                  className={styles['cancel-button']}
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles['submit-button']}
                  disabled={loading || !email.trim()}
                >
                  {loading ? (
                    <span className={styles['loading']}>
                      <span className={styles['spinner']}></span>
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
