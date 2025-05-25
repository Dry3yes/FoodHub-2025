import * as signalR from '@microsoft/signalr';

class ChatService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.eventHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async connect(token) {
    if (this.connection) {
      await this.disconnect();
    }    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:5001/chathub', {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        withServerTimeoutInMilliseconds: 60000, // Increase the server timeout to 60 seconds
        skipNegotiation: false,
        withCredentials: false
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount < 3) {
            return Math.random() * 10000;
          } else {
            return null; // Stop retrying
          }
        }
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Set up event handlers
    this.setupEventHandlers();

    try {
      await this.connection.start();
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('SignalR Connected');
      this.emit('connectionStateChanged', { connected: true });
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
      this.isConnected = false;
      this.emit('connectionStateChanged', { connected: false, error: err });
      throw err;
    }
  }

  async disconnect() {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (err) {
        console.error('Error stopping SignalR connection:', err);
      }
      this.connection = null;
      this.isConnected = false;
      this.emit('connectionStateChanged', { connected: false });
    }
  }

  setupEventHandlers() {
    if (!this.connection) return;

    // Connection state handlers
    this.connection.onreconnecting((error) => {
      console.log('SignalR Reconnecting...', error);
      this.isConnected = false;
      this.emit('connectionStateChanged', { connected: false, reconnecting: true });
    });

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR Reconnected:', connectionId);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connectionStateChanged', { connected: true });
    });

    this.connection.onclose((error) => {
      console.log('SignalR Connection Closed:', error);
      this.isConnected = false;
      this.emit('connectionStateChanged', { connected: false, error });
      
      // Attempt manual reconnection if needed
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnection();
      }
    });

    // Chat event handlers
    this.connection.on('ReceiveMessage', (message) => {
      this.emit('messageReceived', message);
    });

    this.connection.on('MessageRead', (messageId, userId) => {
      this.emit('messageRead', { messageId, userId });
    });

    this.connection.on('ChatRead', (chatId, userId) => {
      this.emit('chatRead', { chatId, userId });
    });

    this.connection.on('UserTyping', (chatId, userId, userName) => {
      this.emit('userTyping', { chatId, userId, userName });
    });

    this.connection.on('UserStoppedTyping', (chatId, userId) => {
      this.emit('userStoppedTyping', { chatId, userId });
    });

    this.connection.on('UserOnline', (userId) => {
      this.emit('userOnline', { userId });
    });

    this.connection.on('UserOffline', (userId) => {
      this.emit('userOffline', { userId });
    });

    this.connection.on('NewChat', (chatId) => {
      this.emit('newChat', { chatId });
    });

    this.connection.on('JoinedChat', (chatId) => {
      this.emit('joinedChat', { chatId });
    });

    this.connection.on('LeftChat', (chatId) => {
      this.emit('leftChat', { chatId });
    });

    this.connection.on('UnreadCountUpdate', (count) => {
      this.emit('unreadCountUpdate', { count });
    });

    this.connection.on('Error', (message) => {
      this.emit('error', { message });
    });
  }

  async attemptReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(async () => {
      try {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Disconnected) {
          await this.connection.start();
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('Manual reconnection successful');
          this.emit('connectionStateChanged', { connected: true });
        }
      } catch (err) {
        console.error('Manual reconnection failed:', err);
        this.attemptReconnection();
      }
    }, delay);
  }

  // Chat methods
  async joinChat(chatId) {
    if (!this.isConnected || !this.connection) {
      throw new Error('Not connected to chat server');
    }
    await this.connection.invoke('JoinChat', chatId);
  }

  async leaveChat(chatId) {
    if (!this.isConnected || !this.connection) {
      throw new Error('Not connected to chat server');
    }
    await this.connection.invoke('LeaveChat', chatId);
  }

  async sendMessage(messageData) {
    if (!this.isConnected || !this.connection) {
      throw new Error('Not connected to chat server');
    }
    await this.connection.invoke('SendMessage', messageData);
  }

  async markMessageAsRead(messageId) {
    if (!this.isConnected || !this.connection) {
      throw new Error('Not connected to chat server');
    }
    await this.connection.invoke('MarkMessageAsRead', messageId);
  }

  async markChatAsRead(chatId) {
    if (!this.isConnected || !this.connection) {
      throw new Error('Not connected to chat server');
    }
    await this.connection.invoke('MarkChatAsRead', chatId);
  }

  async startTyping(chatId) {
    if (!this.isConnected || !this.connection) {
      return;
    }
    await this.connection.invoke('StartTyping', chatId);
  }

  async stopTyping(chatId) {
    if (!this.isConnected || !this.connection) {
      return;
    }
    await this.connection.invoke('StopTyping', chatId);
  }

  // Event system
  on(eventName, handler) {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, []);
    }
    this.eventHandlers.get(eventName).push(handler);
  }

  off(eventName, handler) {
    if (this.eventHandlers.has(eventName)) {
      const handlers = this.eventHandlers.get(eventName);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(eventName, data) {
    if (this.eventHandlers.has(eventName)) {
      this.eventHandlers.get(eventName).forEach(handler => {
        try {
          handler(data);
        } catch (err) {
          console.error(`Error in event handler for ${eventName}:`, err);
        }
      });
    }
  }

  getConnectionState() {
    return {
      isConnected: this.isConnected,
      state: this.connection?.state || 'Disconnected'
    };
  }
}

// Create singleton instance
const chatService = new ChatService();
export default chatService;
