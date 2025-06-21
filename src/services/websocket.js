// // ===== src/services/websocket.js =====
// import io from 'socket.io-client';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// class WebSocketService {
//   constructor() {
//     this.socket = null;
//     // Replace with your computer's IP address
//     this.url = 'http://192.168.1.6:3000'; // CHANGE THIS TO YOUR IP!
//     this.token = null;
//     this.messageHandlers = [];
//     this.connected = false;
//   }

//   async connect() {
//     try {
//       // Get token from AsyncStorage
//       this.token = await AsyncStorage.getItem('authToken');
      
//       if (!this.token) {
//         console.log('No auth token found');
//         return false;
//       }

//       // Connect to socket server
//       this.socket = io(this.url, {
//         auth: {
//           token: this.token
//         },
//         transports: ['websocket'],
//         reconnection: true,
//         reconnectionAttempts: 5,
//         reconnectionDelay: 5000,
//       });

//       // Connection events
//       this.socket.on('connect', async () => {
//         console.log('Connected to server');
//         this.connected = true;

//         // Join all user's groups
//         try {
//           const userData = await AsyncStorage.getItem('userData');
//           if (userData) {
//             const user = JSON.parse(userData);
//             if (user.groups) {
//               user.groups.forEach(groupId => {
//                 this.joinGroup(groupId);
//               });
//             }
//           }
//         } catch (error) {
//           console.error('Error joining groups:', error);
//         }
//       });

//       this.socket.on('disconnect', () => {
//         console.log('Disconnected from server');
//         this.connected = false;
//       });

//       this.socket.on('connect_error', (error) => {
//         console.error('Connection error:', error.message);
//       });

//       // Message events
//       this.socket.on('new_message', (data) => {
//         console.log('New message received:', data);
//         this.notifyHandlers('new_message', data);
//       });

//       this.socket.on('new_group_message', (data) => {
//         console.log('New group message:', data);
//         this.notifyHandlers('new_group_message', data);
//       });

//       this.socket.on('typing_indicator', (data) => {
//         this.notifyHandlers('typing_indicator', data);
//       });

//       this.socket.on('user_online', (data) => {
//         this.notifyHandlers('user_online', data);
//       });

//       this.socket.on('user_offline', (data) => {
//         this.notifyHandlers('user_offline', data);
//       });

//       this.socket.on('messages_read', (data) => {
//         this.notifyHandlers('messages_read', data);
//       });

//       this.socket.on('message_sent', (data) => {
//         console.log('Message sent confirmation:', data);
//         this.notifyHandlers('message_sent', data);
//       });

//       this.socket.on('message_error', (data) => {
//         console.error('Message error:', data);
//         this.notifyHandlers('message_error', data);
//       });

//       return true;
//     } catch (error) {
//       console.error('WebSocket connection error:', error);
//       return false;
//     }
//   }

//   disconnect() {
//     if (this.socket) {
//       this.socket.disconnect();
//       this.socket = null;
//       this.connected = false;
//     }
//   }

//   // Send private message
//   sendMessage(recipientId, text) {
//     if (!this.socket || !this.connected) {
//       console.warn('WebSocket not connected');
//       return false;
//     }

//     const tempId = Date.now().toString();
    
//     this.socket.emit('send_message', {
//       recipientId,
//       text,
//       type: 'text',
//       tempId
//     });

//     return tempId;
//   }

//   // Send group message
//   sendGroupMessage(groupId, text) {
//     if (!this.socket || !this.connected) {
//       console.warn('WebSocket not connected');
//       return false;
//     }

//     const tempId = Date.now().toString();
    
//     this.socket.emit('send_group_message', {
//       groupId,
//       text,
//       type: 'text',
//       tempId
//     });

//     return tempId;
//   }

//   // Send typing indicator
//   sendTypingIndicator(recipientId, isTyping) {
//     if (!this.socket || !this.connected) return;

//     this.socket.emit('typing', {
//       recipientId,
//       isTyping
//     });
//   }

//   // New method to mark messages as delivered
//   markAsDelivered(messageIds) {
//     if (!this.socket || !this.connected) return;

//     this.socket.emit('message_delivered', {
//       messageIds
//     });
//   }

//   // Mark messages as read
//   markAsRead(messageIds, chatId) {
//     if (!this.socket || !this.connected) return;

//     this.socket.emit('mark_read', {
//       messageIds,
//       chatId
//     });
//   }

//   markGroupMessagesDelivered(messageId, groupId) {
//     if (!this.socket || !this.connected) return;

//     this.socket.emit('group_message_delivered', {
//       messageId,
//       groupId
//     });
//   }

//   markGroupMessagesRead(messageIds, groupId) {
//     if (!this.socket || !this.connected) return;

//     this.socket.emit('mark_group_read', {
//       messageIds,
//       groupId
//     });
//   }

//   joinGroup(groupId) {
//     if (!this.socket || !this.connected) return;

//     this.socket.emit('join_group', groupId);
//   }

//   // Update presence
//   updatePresence(status) {
//     if (!this.socket || !this.connected) return;

//     this.socket.emit('update_presence', {
//       status // 'online', 'away', 'offline'
//     });
//   }

//   // Event handlers
//   onMessage(handler) {
//     this.messageHandlers.push(handler);
//   }

//   removeHandler(handler) {
//     this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
//   }

//   notifyHandlers(event, data) {
//     this.messageHandlers.forEach(handler => {
//       handler(event, data);
//     });
//   }

//   // Check connection status
//   isConnected() {
//     return this.connected && this.socket?.connected;
//   }
// }

// export default new WebSocketService();













// src/services/websocket.js - Complete Updated File

import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

class WebSocketService {
  constructor() {
    this.socket = null;
    // Replace with your computer's IP address
    this.url = 'http://192.168.1.6:3000'; // CHANGE THIS TO YOUR IP!
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
      this.socket.on('connect', async () => {
        console.log('Connected to server');
        this.connected = true;
        
        // Join user's personal room for receiving messages
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          const userId = user._id || user.id;
          
          // Join personal room for private messages
          this.socket.emit('join_chat', userId);
          
          // Join all group rooms for real-time updates
          if (user.groups && user.groups.length > 0) {
            user.groups.forEach(groupId => {
              this.joinGroup(groupId);
            });
          }
        }
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

      this.socket.on('message_status_update', (data) => {
        console.log('Message status update:', data);
        this.notifyHandlers('message_status_update', data);
      });

      this.socket.on('group_message_status_update', (data) => {
        console.log('Group message status update:', data);
        this.notifyHandlers('group_message_status_update', data);
      });

      // Group events
      this.socket.on('group_created', (data) => {
        this.notifyHandlers('group_created', data);
      });

      this.socket.on('group_updated', (data) => {
        this.notifyHandlers('group_updated', data);
      });

      this.socket.on('group_member_added', (data) => {
        this.notifyHandlers('group_member_added', data);
      });

      this.socket.on('group_member_removed', (data) => {
        this.notifyHandlers('group_member_removed', data);
      });

      this.socket.on('group_member_left', (data) => {
        this.notifyHandlers('group_member_left', data);
      });

      this.socket.on('member_made_admin', (data) => {
        this.notifyHandlers('member_made_admin', data);
      });

      this.socket.on('admin_removed', (data) => {
        this.notifyHandlers('admin_removed', data);
      });

      this.socket.on('removed_from_group', (data) => {
        this.notifyHandlers('removed_from_group', data);
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

  // Mark messages as read (private chat)
  markAsRead(messageIds, chatId) {
    if (!this.socket || !this.connected) return;

    this.socket.emit('mark_read', {
      messageIds,
      chatId
    });
  }

  markGroupMessagesDelivered(messageIds, groupId) {
    if (!this.socket || !this.connected) return;
    
    this.socket.emit('mark_group_delivered', {
      messageIds,
      groupId
    });
  }

  // Mark group messages as read
  markGroupMessagesRead(messageIds, groupId) {
    if (!this.socket || !this.connected) return;

    this.socket.emit('mark_group_read', {
      messageIds,
      groupId
    });
  }

  // Join group room for real-time updates
  joinGroup(groupId) {
    if (!this.socket || !this.connected) return;

    this.socket.emit('join_group', groupId);
  }

  // Leave group room
  leaveGroup(groupId) {
    if (!this.socket || !this.connected) return;

    this.socket.emit('leave_group', groupId);
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

  markAsDelivered(messageIds) {
    if (!this.socket || !this.connected) return;
    
    this.socket.emit('message_delivered', {
      messageIds
    });
  }
}

export default new WebSocketService();