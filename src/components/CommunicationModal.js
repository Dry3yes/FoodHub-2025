import React, { useState } from 'react';
import styles from '../styles/CommunicationModal.module.css';

const CommunicationModal = ({ isOpen, onClose, order, onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);


  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Additional validation
    if (!order?.customerId) {
      alert('Customer information is missing. Cannot send message.');
      return;
    }

    setSending(true);
    try {
      await onSendMessage(order, message);
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (error.message.includes('Participants list cannot be empty')) {
        errorMessage = 'Unable to identify customer. Please contact support.';      } else if (error.message.includes('Customer ID not found')) {
        errorMessage = 'Customer information is missing from this order.';
      } else if (error.message.includes('Failed to send initial message')) {
        errorMessage = 'Chat was created but the message failed to send. You can try sending the message again in the chat section.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Message Customer</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
          <div className={styles.orderInfo}>
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> {order?.orderId}</p>
          <p><strong>Customer:</strong> {order?.customerName}</p>
          <p><strong>Status:</strong> {order?.status}</p>          <p><strong>Total:</strong> Rp {order?.totalAmount?.toLocaleString('id-ID') || '0'}</p>
        </div>

        <div className={styles.messageSection}>
          <label htmlFor="message">Your Message:</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message to the customer here..."
            rows={4}
            disabled={sending}
          />
        </div>

        <div className={styles.modalActions}>
          <button 
            className={styles.cancelButton} 
            onClick={onClose}
            disabled={sending}
          >
            Cancel
          </button>
          <button 
            className={styles.sendButton} 
            onClick={handleSendMessage}
            disabled={!message.trim() || sending}
          >
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunicationModal;
