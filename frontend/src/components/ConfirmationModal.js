import React from 'react';
import styles from '../styles/ConfirmationModal.module.css';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "warning" // warning, danger, info
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles['confirmation-modal-overlay']} onClick={handleOverlayClick}>
      <div className={styles['confirmation-modal']}>
        <div className={styles['modal-header']}>
          <div className={styles['modal-icon-container']}>
          </div>
          <button className={styles['modal-close-button']} onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles['modal-content']}>
          <h3 className={styles['modal-title']}>{title}</h3>
          <p className={styles['modal-message']}>{message}</p>
        </div>

        <div className={styles['modal-actions']}>
          <button className={`${styles['modal-button']} ${styles['cancel']}`} onClick={onClose}>
            {cancelText}
          </button>
          <button className={`${styles['modal-button']} ${styles['confirm']} ${styles[type]}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
