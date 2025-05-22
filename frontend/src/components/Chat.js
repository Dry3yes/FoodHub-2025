import React, { useState, useEffect } from 'react';
import '../styles/Chat.css';

const Chat = () => {
  // Sample data for contacts and messages (replace with actual API calls)
  const [contacts, setContacts] = useState([
    { id: '1', name: 'Restaurant 1', lastMessage: 'Your order is ready', unread: 2 },
    { id: '2', name: 'Restaurant 2', lastMessage: 'Thank you for your order', unread: 0 },
    { id: '3', name: 'Customer Support', lastMessage: 'How can I help you?', unread: 1 }
  ]);

  const [messages, setMessages] = useState({
    '1': [
      { sender: 'other', text: 'Your order #1234 is being prepared', time: '10:30 AM' },
      { sender: 'other', text: 'Your order is ready for pickup', time: '10:45 AM' },
      { sender: 'me', text: 'Thanks! I\'ll be there in 10 minutes', time: '10:46 AM' }
    ],
    '2': [
      { sender: 'me', text: 'Is my order ready?', time: '11:20 AM' },
      { sender: 'other', text: 'Yes, it will be ready in 5 minutes', time: '11:22 AM' },
      { sender: 'me', text: 'Great, thanks!', time: '11:23 AM' }
    ],
    '3': [
      { sender: 'other', text: 'Hello! How can I assist you today?', time: '9:00 AM' },
      { sender: 'me', text: 'I have a question about my order', time: '9:05 AM' },
      { sender: 'other', text: 'Sure, what\'s your order number?', time: '9:06 AM' }
    ]
  });

  // State for new message input
  const [newMessage, setNewMessage] = useState('');

  // State for chat box visibility
  const [isChatOpen, setIsChatOpen] = useState(false);

  // State for active chat contact
  const [activeContact, setActiveContact] = useState(null);

  // Handle chat contact selection
  const handleContactSelect = (contactId) => {
    setActiveContact(contactId);
    // Mark messages as read when selecting a contact
    if (contacts.find(c => c.id === contactId)?.unread > 0) {
      setContacts(contacts.map(c => 
        c.id === contactId ? { ...c, unread: 0 } : c
      ));
    }
  };

  // Toggle chat box visibility
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen && !activeContact && contacts.length > 0) {
      setActiveContact(contacts[0].id);
    }
  };

  // Handle sending a new message
  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !activeContact) return;
    
    const newMessageObj = {
      sender: 'me',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prevMessages => ({
      ...prevMessages,
      [activeContact]: [...(prevMessages[activeContact] || []), newMessageObj]
    }));
    
    setNewMessage('');
    
    // Simulate response after 1 second
    setTimeout(() => {
      const responseMessage = {
        sender: 'other',
        text: 'Thanks for your message. We\'ll get back to you shortly.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prevMessages => ({
        ...prevMessages,
        [activeContact]: [...(prevMessages[activeContact] || []), responseMessage]
      }));
    }, 1000);
  };

  // Handle Enter key press to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    if (activeContact) {
      const messageList = document.querySelector('.message-list');
      if (messageList) {
        messageList.scrollTop = messageList.scrollHeight;
      }
    }
  }, [messages, activeContact]);

  return (
    <div className="chat-wrapper">
      {/* Inbox Button (Bottom Right) */}
      <button className="inbox-button" onClick={toggleChat}>
        Inbox
        {contacts.reduce((total, contact) => total + contact.unread, 0) > 0 && (
          <span className="inbox-badge">
            {contacts.reduce((total, contact) => total + contact.unread, 0)}
          </span>
        )}
      </button>

      {/* Chat Box Interface */}
      {isChatOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <h3>Chat</h3>
            <button className="close-button" onClick={toggleChat}>×</button>
          </div>
          <div className="chat-body">
            {/* Left Panel - Contacts */}
            <div className="chat-contacts">
              {contacts.map(contact => (
                <div
                  key={contact.id}
                  className={`contact-item ${activeContact === contact.id ? 'active' : ''}`}
                  onClick={() => handleContactSelect(contact.id)}
                >
                  <div className="contact-avatar">
                    {contact.name.charAt(0)}
                  </div>
                  <div className="contact-info">
                    <div className="contact-name">{contact.name}</div>
                    <div className="contact-last-message">{contact.lastMessage}</div>
                  </div>
                  {contact.unread > 0 && (
                    <div className="unread-badge">{contact.unread}</div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Right Panel - Messages */}
            <div className="chat-messages">
              {activeContact ? (
                <>
                  <div className="message-header">
                    {contacts.find(c => c.id === activeContact)?.name}
                  </div>
                  <div className="message-list">
                    {messages[activeContact]?.map((message, index) => (
                      <div 
                        key={index} 
                        className={`message ${message.sender === 'me' ? 'sent' : 'received'}`}
                      >
                        <div className="message-content">
                          <p>{message.text}</p>
                          <span className="message-time">{message.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="message-input">
                    <input 
                      type="text" 
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <button onClick={handleSendMessage}>Send</button>
                  </div>
                </>
              ) : (
                <div className="no-chat-selected">
                  Select a contact to start chatting
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;