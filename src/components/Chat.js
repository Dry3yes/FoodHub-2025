import React, { useState, useEffect, useRef } from 'react';
import chatService from '../services/ChatService';
import '../styles/Chat.css';

const Chat = () => {
  // State management
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({ connected: false });
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);

  // Initialize chat service and load chats
  useEffect(() => {
    initializeChatService();
    loadUserChats();
    
    return () => {
      chatService.disconnect();
    };
  }, []);

  // Set up event listeners
  useEffect(() => {
    const handleConnectionStateChanged = (state) => {
      setConnectionStatus(state);
    };

    const handleMessageReceived = (message) => {
      setMessages(prev => ({
        ...prev,
        [message.chatId]: [...(prev[message.chatId] || []), message]
      }));
      
      // Update chat list with new last message
      setChats(prev => prev.map(chat => 
        chat.chatId === message.chatId 
          ? { 
              ...chat, 
              lastMessage: message.content, 
              lastMessageTime: message.timestamp,
              lastMessageSender: message.senderId,
              unreadCount: chat.unreadCount + 1
            }
          : chat
      ));
      
      scrollToBottom();
    };

    const handleUserTyping = ({ chatId, userId, userName }) => {
      if (chatId === activeChat?.chatId) {
        setTypingUsers(prev => new Set([...prev, `${userName} is typing...`]));
        
        // Clear typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(`${userName} is typing...`);
            return newSet;
          });
        }, 3000);
      }
    };

    const handleUserStoppedTyping = ({ chatId, userId }) => {
      // Will be cleared by timeout in handleUserTyping
    };

    const handleUserOnline = ({ userId }) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    };

    const handleUserOffline = ({ userId }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    const handleUnreadCountUpdate = ({ count }) => {
      setTotalUnreadCount(count);
    };    const handleChatRead = ({ chatId, userId }) => {
      // Update UI to show messages as read
      setMessages(prev => ({
        ...prev,
        [chatId]: (prev[chatId] || []).map(msg => ({
          ...msg,
          isRead: msg.senderId === userId ? true : msg.isRead
        }))
      }));
    };    const handleNewChat = async ({ chatId }) => {
      console.log('🎯 handleNewChat called with chatId:', chatId);
      console.log('🎯 Current chats count:', chats.length);
      
      try {
        // Fetch the new chat details
        console.log('🎯 Fetching chat details from API...');
        const response = await fetch(`https://api.marcelpeterson.me/api/chat/${chatId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const newChat = await response.json();
          console.log('🎯 Fetched new chat details:', newChat);
          
          // Add the new chat to the existing chats list
          setChats(prevChats => {
            console.log('🎯 Previous chats:', prevChats.length);
            
            // Check if chat already exists to avoid duplicates
            const chatExists = prevChats.some(chat => chat.chatId === newChat.chatId);
            if (chatExists) {
              console.log('🎯 Chat already exists, skipping addition');
              return prevChats;
            }
            
            console.log('🎯 Adding new chat to the list');
            // Add new chat at the beginning since it's the most recent
            const updatedChats = [newChat, ...prevChats];
            console.log('🎯 Updated chats count:', updatedChats.length);
            return updatedChats;
          });
        } else {
          console.error('🎯 Failed to fetch new chat details, status:', response.status);
          // Fallback to reloading all chats
          loadUserChats();
        }
      } catch (error) {
        console.error('Error handling new chat:', error);
        // Fallback to reloading all chats
        loadUserChats();
      }
    };

    // Register event listeners
    chatService.on('connectionStateChanged', handleConnectionStateChanged);
    chatService.on('messageReceived', handleMessageReceived);
    chatService.on('userTyping', handleUserTyping);
    chatService.on('userStoppedTyping', handleUserStoppedTyping);
    chatService.on('userOnline', handleUserOnline);
    chatService.on('userOffline', handleUserOffline);
    chatService.on('unreadCountUpdate', handleUnreadCountUpdate);
    chatService.on('chatRead', handleChatRead);
    chatService.on('newChat', handleNewChat);    return () => {
      chatService.off('connectionStateChanged', handleConnectionStateChanged);
      chatService.off('messageReceived', handleMessageReceived);
      chatService.off('userTyping', handleUserTyping);
      chatService.off('userStoppedTyping', handleUserStoppedTyping);
      chatService.off('userOnline', handleUserOnline);
      chatService.off('userOffline', handleUserOffline);
      chatService.off('unreadCountUpdate', handleUnreadCountUpdate);
      chatService.off('chatRead', handleChatRead);
      chatService.off('newChat', handleNewChat);
    };
  }, [activeChat]);

  // Initialize chat service with authentication
  const initializeChatService = async () => {
    try {
      // Get auth token from localStorage or your auth service
      const token = localStorage.getItem('token');
      if (token) {
        await chatService.connect(token);
      }
    } catch (error) {
      console.error('Failed to connect to chat service:', error);
    }
  };

  // Load user's chats
  const loadUserChats = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.marcelpeterson.me/api/chat', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);
        setTotalUnreadCount(data.totalUnreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for a specific chat
  const loadChatMessages = async (chatId) => {
    try {
      const response = await fetch(`https://api.marcelpeterson.me/api/chat/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const messages = await response.json();
        setMessages(prev => ({
          ...prev,
          [chatId]: messages
        }));
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  // Handle chat selection
  const handleChatSelect = async (chat) => {
    setActiveChat(chat);
    
    // Join the chat room for real-time updates
    try {
      await chatService.joinChat(chat.chatId);
    } catch (error) {
      console.error('Failed to join chat:', error);
    }
    
    // Load messages if not already loaded
    if (!messages[chat.chatId]) {
      await loadChatMessages(chat.chatId);
    }
    
    // Mark chat as read
    try {
      await chatService.markChatAsRead(chat.chatId);
      setChats(prev => prev.map(c => 
        c.chatId === chat.chatId ? { ...c, unreadCount: 0 } : c
      ));
    } catch (error) {
      console.error('Failed to mark chat as read:', error);
    }
    
    scrollToBottom();
  };

  // Toggle chat box visibility
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen && !activeChat && chats.length > 0) {
      handleChatSelect(chats[0]);
    }
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !activeChat) return;
    
    try {
      const messageData = {
        chatId: activeChat.chatId,
        content: newMessage.trim(),
        messageType: 'text'
      };
      
      // Send via SignalR for real-time delivery
      await chatService.sendMessage(messageData);
      
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle typing indicators
  const handleTyping = () => {
    if (!activeChat || !connectionStatus.connected) return;
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Send typing indicator
    chatService.startTyping(activeChat.chatId);
    
    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      chatService.stopTyping(activeChat.chatId);
    }, 3000);
  };

  // Handle Enter key press to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    } else {
      handleTyping();
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  // Get chat display name
  const getChatDisplayName = (chat) => {
    if (chat.participantDetails && chat.participantDetails.length > 0) {
      // Find the participant who is NOT the current user
      const currentUserId = getCurrentUserId();
      const otherParticipant = chat.participantDetails.find(p => p.userId !== currentUserId);
      
      if (otherParticipant) {
        return otherParticipant.name;
      }
      
      // Fallback to first participant if can't find other
      return chat.participantDetails[0].name;
    }
    return 'Unknown User';
  };

  // Check if user is online
  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  return (
    <div className="chat-wrapper">
      {/* Inbox Button (Bottom Right) */}
      <button className="inbox-button" onClick={toggleChat}>
        <span>Inbox</span>
        {!connectionStatus.connected && (
          <span className="connection-status offline">●</span>
        )}
        {connectionStatus.connected && (
          <span className="connection-status online">●</span>
        )}
        {totalUnreadCount > 0 && (
          <span className="inbox-badge">{totalUnreadCount}</span>
        )}
      </button>

      {/* Chat Box Interface */}
      {isChatOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <h3>
              Chat 
              {connectionStatus.reconnecting && <span className="reconnecting"> (Reconnecting...)</span>}
            </h3>
            <button className="close-button" onClick={toggleChat}>×</button>
          </div>
          <div className="chat-body">
            {/* Left Panel - Chats */}
            <div className="chat-contacts">
              {loading ? (
                <div className="loading">Loading chats...</div>
              ) : chats.length === 0 ? (
                <div className="no-chats">No chats available</div>
              ) : (
                chats.map(chat => (
                  <div
                    key={chat.chatId}
                    className={`contact-item ${activeChat?.chatId === chat.chatId ? 'active' : ''}`}
                    onClick={() => handleChatSelect(chat)}
                  >
                    <div className="contact-avatar">
                      {getChatDisplayName(chat).charAt(0).toUpperCase()}
                      {chat.participantDetails?.some(p => isUserOnline(p.userId)) && (
                        <span className="online-indicator">●</span>
                      )}
                    </div>
                    <div className="contact-info">
                      <div className="contact-name">{getChatDisplayName(chat)}</div>
                      <div className="contact-last-message">
                        {chat.lastMessage || 'No messages yet'}
                      </div>
                      <div className="contact-time">
                        {chat.lastMessageTime && formatTime(chat.lastMessageTime)}
                      </div>
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className="unread-badge">{chat.unreadCount}</div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            {/* Right Panel - Messages */}
            <div className="chat-messages">
              {activeChat ? (
                <>
                  <div className="message-header">
                    <span>{getChatDisplayName(activeChat)}</span>
                    {activeChat.participantDetails?.some(p => isUserOnline(p.userId)) && (
                      <span className="online-status">● Online</span>
                    )}
                  </div>
                  <div className="message-list">
                    {(messages[activeChat.chatId] || []).map((message, index) => (
                      <div 
                        key={message.messageId || index} 
                        className={`message ${message.senderId === getCurrentUserId() ? 'sent' : 'received'}`}
                      >
                        <div className="message-content">
                          <div className="message-sender">{message.senderName}</div>
                          <p>{message.content}</p>
                          <div className="message-meta">
                            <span className="message-time">
                              {formatTime(message.timestamp)}
                            </span>
                            {message.editedAt && (
                              <span className="edited-indicator">(edited)</span>
                            )}
                            {message.senderId === getCurrentUserId() && message.isRead && (
                              <span className="read-indicator">✓✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Typing indicators */}
                    {typingUsers.size > 0 && (
                      <div className="typing-indicators">
                        {Array.from(typingUsers).map((text, index) => (
                          <div key={index} className="typing-indicator">
                            {text}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="message-input">
                    <input 
                      ref={messageInputRef}
                      type="text" 
                      placeholder={connectionStatus.connected ? "Type a message..." : "Connecting..."}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={!connectionStatus.connected}
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={!connectionStatus.connected || !newMessage.trim()}
                    >
                      Send
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-chat-selected">
                  Select a chat to start messaging
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper function to get current user ID
  function getCurrentUserId() {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.userId || user.uid || 'current-user';
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
    }
    return 'current-user';
  }
};

export default Chat;