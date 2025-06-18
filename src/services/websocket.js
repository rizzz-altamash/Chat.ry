// // ===== src/services/websocket.js =====
// class WebSocketService {
//   constructor() {
//     this.ws = null;
//     this.url = 'ws://your-websocket-server-url'; // Replace with your WebSocket server URL
//     this.reconnectInterval = 5000;
//     this.shouldReconnect = true;
//     this.messageHandlers = [];
//   }

//   connect() {
//     try {
//       this.ws = new WebSocket(this.url);

//       this.ws.onopen = () => {
//         console.log('WebSocket Connected');
//         this.shouldReconnect = true;
//       };

//       this.ws.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         this.handleMessage(data);
//       };

//       this.ws.onerror = (error) => {
//         console.error('WebSocket Error:', error);
//       };

//       this.ws.onclose = () => {
//         console.log('WebSocket Disconnected');
//         if (this.shouldReconnect) {
//           setTimeout(() => this.connect(), this.reconnectInterval);
//         }
//       };
//     } catch (error) {
//       console.error('WebSocket Connection Error:', error);
//     }
//   }

//   disconnect() {
//     this.shouldReconnect = false;
//     if (this.ws) {
//       this.ws.close();
//     }
//   }

//   sendMessage(message) {
//     if (this.ws && this.ws.readyState === WebSocket.OPEN) {
//       this.ws.send(JSON.stringify(message));
//     } else {
//       console.warn('WebSocket is not connected');
//     }
//   }

//   onMessage(handler) {
//     this.messageHandlers.push(handler);
//   }

//   handleMessage(data) {
//     this.messageHandlers.forEach(handler => handler(data));
//   }

//   // Message types
//   sendChatMessage(recipientId, text) {
//     this.sendMessage({
//       type: 'chat_message',
//       recipientId,
//       text,
//       timestamp: new Date().toISOString(),
//     });
//   }

//   sendGroupMessage(groupId, text) {
//     this.sendMessage({
//       type: 'group_message',
//       groupId,
//       text,
//       timestamp: new Date().toISOString(),
//     });
//   }

//   sendTypingIndicator(recipientId, isTyping) {
//     this.sendMessage({
//       type: 'typing',
//       recipientId,
//       isTyping,
//     });
//   }

//   markAsRead(chatId, messageId) {
//     this.sendMessage({
//       type: 'mark_read',
//       chatId,
//       messageId,
//     });
//   }

//   updatePresence(status) {
//     this.sendMessage({
//       type: 'presence',
//       status, // 'online', 'away', 'offline'
//     });
//   }
// }

// export default new WebSocketService();

























// ===== src/services/websocket.js =====
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

class WebSocketService {
  constructor() {
    this.socket = null;
    // Replace with your computer's IP address
    this.url = 'http://192.168.1.7:3000'; // CHANGE THIS TO YOUR IP!
    this.token = null;
    this.messageHandlers = [];
    this.connected = false;
  }

  async connect() {
    try {
      // Get token from AsyncStorage
      this.token = await AsyncStorage.getItem('authToken');
      
      if (!this.token) {
        console.log('No auth token found');
        return false;
      }

      // Connect to socket server
      this.socket = io(this.url, {
        auth: {
          token: this.token
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 5000,
      });

      // Connection events
      this.socket.on('connect', () => {
        console.log('Connected to server');
        this.connected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
        this.connected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
      });

      // Message events
      this.socket.on('new_message', (data) => {
        console.log('New message received:', data);
        this.notifyHandlers('new_message', data);
      });

      this.socket.on('new_group_message', (data) => {
        console.log('New group message:', data);
        this.notifyHandlers('new_group_message', data);
      });

      this.socket.on('typing_indicator', (data) => {
        this.notifyHandlers('typing_indicator', data);
      });

      this.socket.on('user_online', (data) => {
        this.notifyHandlers('user_online', data);
      });

      this.socket.on('user_offline', (data) => {
        this.notifyHandlers('user_offline', data);
      });

      this.socket.on('messages_read', (data) => {
        this.notifyHandlers('messages_read', data);
      });

      this.socket.on('message_sent', (data) => {
        console.log('Message sent confirmation:', data);
        this.notifyHandlers('message_sent', data);
      });

      this.socket.on('message_error', (data) => {
        console.error('Message error:', data);
        this.notifyHandlers('message_error', data);
      });

      return true;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      return false;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Send private message
  sendMessage(recipientId, text) {
    if (!this.socket || !this.connected) {
      console.warn('WebSocket not connected');
      return false;
    }

    const tempId = Date.now().toString();
    
    this.socket.emit('send_message', {
      recipientId,
      text,
      type: 'text',
      tempId
    });

    return tempId;
  }

  // Send group message
  sendGroupMessage(groupId, text) {
    if (!this.socket || !this.connected) {
      console.warn('WebSocket not connected');
      return false;
    }

    const tempId = Date.now().toString();
    
    this.socket.emit('send_group_message', {
      groupId,
      text,
      type: 'text',
      tempId
    });

    return tempId;
  }

  // Send typing indicator
  sendTypingIndicator(recipientId, isTyping) {
    if (!this.socket || !this.connected) return;

    this.socket.emit('typing', {
      recipientId,
      isTyping
    });
  }

  // Mark messages as read
  markAsRead(messageIds, chatId) {
    if (!this.socket || !this.connected) return;

    this.socket.emit('mark_read', {
      messageIds,
      chatId
    });
  }

  // Update presence
  updatePresence(status) {
    if (!this.socket || !this.connected) return;

    this.socket.emit('update_presence', {
      status // 'online', 'away', 'offline'
    });
  }

  // Event handlers
  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  removeHandler(handler) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  notifyHandlers(event, data) {
    this.messageHandlers.forEach(handler => {
      handler(event, data);
    });
  }

  // Check connection status
  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

export default new WebSocketService();