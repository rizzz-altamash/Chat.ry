// // ===== src/screens/ChatDetailScreen.js =====
// import React, {useState, useRef} from 'react';
// import {
//   View,
//   FlatList,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   Text,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
// import MessageBubble from '../components/MessageBubble';
// import colors from '../styles/colors';

// const ChatDetailScreen = ({route, navigation}) => {
//   const {chatName, chatColor} = route.params;
//   const [inputText, setInputText] = useState('');
//   const flatListRef = useRef(null);
  
//   const [messages, setMessages] = useState([
//     {
//       id: '1',
//       text: 'Hey, how are you doing?',
//       time: '10:30 AM',
//       isSent: false,
//       read: true,
//     },
//     {
//       id: '2',
//       text: "I'm doing great! How about you?",
//       time: '10:31 AM',
//       isSent: true,
//       read: true,
//     },
//     {
//       id: '3',
//       text: 'Pretty good, just working on some projects',
//       time: '10:32 AM',
//       isSent: false,
//       read: true,
//     },
//     {
//       id: '4',
//       text: 'That sounds interesting! What kind of projects?',
//       time: '10:33 AM',
//       isSent: true,
//       read: false,
//     },
//   ]);

//   const sendMessage = () => {
//     if (inputText.trim()) {
//       const newMessage = {
//         id: Date.now().toString(),
//         text: inputText,
//         time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
//         isSent: true,
//         read: false,
//       };
      
//       setMessages([...messages, newMessage]);
//       setInputText('');
      
//       setTimeout(() => {
//         flatListRef.current?.scrollToEnd();
//       }, 100);
//     }
//   };

//   const getInitials = (name) => {
//     return name
//       .split(' ')
//       .map(word => word[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   return (
//     <View style={styles.container}>
//       <LinearGradient
//         colors={[colors.gradientStart, colors.gradientEnd]}
//         style={styles.header}>
//         <View style={styles.headerContent}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//             <Icon name="arrow-back" size={24} color={colors.white} />
//           </TouchableOpacity>
          
//           <View style={styles.headerInfo}>
//             <View style={[styles.headerAvatar, {backgroundColor: chatColor}]}>
//               <Text style={styles.headerAvatarText}>{getInitials(chatName)}</Text>
//             </View>
//             <View style={styles.headerTextContainer}>
//               <Text style={styles.headerName}>{chatName}</Text>
//               <Text style={styles.headerStatus}>Online</Text>
//             </View>
//           </View>

//           <View style={styles.headerActions}>
//             <TouchableOpacity style={styles.headerButton}>
//               <Icon name="videocam" size={24} color={colors.white} />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.headerButton}>
//               <Icon name="call" size={24} color={colors.white} />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </LinearGradient>

//       <KeyboardAvoidingView
//         style={styles.messagesSection}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         keyboardVerticalOffset={0}>
//         <FlatList
//           ref={flatListRef}
//           data={messages}
//           keyExtractor={(item) => item.id}
//           renderItem={({item}) => (
//             <MessageBubble message={item} isSent={item.isSent} />
//           )}
//           contentContainerStyle={styles.messagesList}
//         />
        
//         <View style={styles.inputContainer}>
//           <TouchableOpacity style={styles.attachButton}>
//             <Icon name="add-circle-outline" size={28} color={colors.gray6} />
//           </TouchableOpacity>
          
//           <View style={styles.inputWrapper}>
//             <TextInput
//               style={styles.textInput}
//               placeholder="Type a message..."
//               value={inputText}
//               onChangeText={setInputText}
//               multiline
//               maxHeight={100}
//               placeholderTextColor={colors.gray5}
//             />
//             <TouchableOpacity style={styles.emojiButton}>
//               <Icon name="happy-outline" size={24} color={colors.gray6} />
//             </TouchableOpacity>
//           </View>
          
//           <TouchableOpacity
//             style={styles.sendButton}
//             onPress={sendMessage}>
//             <LinearGradient
//               colors={[colors.gradientStart, colors.gradientEnd]}
//               style={styles.sendButtonGradient}>
//               <Icon
//                 name={inputText.trim() ? 'send' : 'mic'}
//                 size={20}
//                 color={colors.white}
//               />
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.gray1,
//   },
//   header: {
//     paddingTop: Platform.OS === 'ios' ? 50 : 30,
//     paddingBottom: 15,
//     paddingHorizontal: 20,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   backButton: {
//     marginRight: 15,
//   },
//   headerInfo: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerAvatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },
//   headerAvatarText: {
//     color: colors.white,
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   headerTextContainer: {
//     flex: 1,
//   },
//   headerName: {
//     color: colors.white,
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   headerStatus: {
//     color: 'rgba(255, 255, 255, 0.8)',
//     fontSize: 13,
//   },
//   headerActions: {
//     flexDirection: 'row',
//   },
//   headerButton: {
//     marginLeft: 20,
//   },
//   messagesSection: {
//     flex: 1,
//   },
//   messagesList: {
//     paddingVertical: 10,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     paddingHorizontal: 10,
//     paddingVertical: 10,
//     backgroundColor: colors.white,
//     elevation: 8,
//     shadowColor: colors.shadowColor,
//     shadowOffset: {width: 0, height: -3},
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//   },
//   attachButton: {
//     padding: 8,
//   },
//   inputWrapper: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     backgroundColor: colors.gray1,
//     borderRadius: 25,
//     marginHorizontal: 8,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//   },
//   textInput: {
//     flex: 1,
//     maxHeight: 100,
//     fontSize: 16,
//     color: colors.gray9,
//     paddingTop: 0,
//     paddingBottom: 0,
//   },
//   emojiButton: {
//     marginLeft: 8,
//   },
//   sendButton: {
//     padding: 4,
//   },
//   sendButtonGradient: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

// export default ChatDetailScreen;
















// src/screens/ChatDetailScreen.js

import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import MessageBubble from '../components/MessageBubble';
import colors from '../styles/colors';
import websocket from '../services/websocket';
import api from '../services/api';

const ChatDetailScreen = ({route, navigation}) => {
  const {chatId, chatName, chatColor, username, isContact} = route.params;
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [userStatus, setUserStatus] = useState({isOnline: false, lastSeen: null});
  const flatListRef = useRef(null);
  
  // Typing indicator timeout
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    loadMessages();
    setupWebSocketListeners();
    
    return () => {
      // Cleanup
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chatId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await api.getChatMessages(chatId);
      setMessages(response.messages);
      
      // Mark messages as read
      const unreadMessageIds = response.messages
        .filter(msg => !msg.isSent && msg.status !== 'read')
        .map(msg => msg._id || msg.id);
      
      if (unreadMessageIds.length > 0) {
        websocket.markAsRead(unreadMessageIds, chatId);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocketListeners = () => {
    const handleMessage = (event, data) => {
      switch (event) {
        case 'new_message':
          if (data.message.sender === chatId || data.chatId === chatId) {
            setMessages(prev => [...prev, formatMessage(data.message, false)]);
            // Mark as read immediately
            websocket.markAsRead([data.message._id || data.message.id], chatId);
          }
          break;
          
        case 'typing_indicator':
          if (data.userId === chatId) {
            setIsTyping(data.isTyping);
          }
          break;
          
        case 'user_online':
          if (data.userId === chatId) {
            setUserStatus({isOnline: true, lastSeen: null});
          }
          break;
          
        case 'user_offline':
          if (data.userId === chatId) {
            setUserStatus({isOnline: false, lastSeen: data.lastSeen});
          }
          break;
          
        case 'messages_read':
          if (data.readBy === chatId) {
            setMessages(prev => prev.map(msg => {
              if (data.messageIds.includes(msg.id)) {
                return {...msg, read: true};
              }
              return msg;
            }));
          }
          break;
      }
    };
    
    websocket.onMessage(handleMessage);
    
    return () => {
      websocket.removeHandler(handleMessage);
    };
  };

  const formatMessage = (message, isSent) => {
    return {
      id: message._id || message.id || Date.now().toString(),
      text: message.text,
      time: new Date(message.createdAt).toLocaleTimeString([], {
        hour: '2-digit', 
        minute: '2-digit'
      }),
      isSent: isSent,
      read: message.status === 'read',
      status: message.status
    };
  };

  const sendMessage = () => {
    if (inputText.trim()) {
      const tempId = websocket.sendMessage(chatId, inputText);
      
      // Add optimistic message
      const newMessage = {
        id: tempId,
        text: inputText,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
        isSent: true,
        read: false,
        sending: true
      };
      
      setMessages([...messages, newMessage]);
      setInputText('');
      
      // Stop typing indicator
      websocket.sendTypingIndicator(chatId, false);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd();
      }, 100);
    }
  };

  const handleTyping = (text) => {
    setInputText(text);
    
    // Send typing indicator
    if (text.length > 0) {
      websocket.sendTypingIndicator(chatId, true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        websocket.sendTypingIndicator(chatId, false);
      }, 3000);
    } else {
      websocket.sendTypingIndicator(chatId, false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusText = () => {
    if (userStatus.isOnline) return 'Online';
    if (isTyping) return 'typing...';
    if (userStatus.lastSeen) {
      const lastSeenDate = new Date(userStatus.lastSeen);
      const now = new Date();
      const diffHours = (now - lastSeenDate) / (1000 * 60 * 60);
      
      if (diffHours < 1) return 'Last seen recently';
      if (diffHours < 24) return `Last seen ${Math.floor(diffHours)} hours ago`;
      return `Last seen ${lastSeenDate.toLocaleDateString()}`;
    }
    return '';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <View style={[styles.headerAvatar, {backgroundColor: chatColor}]}>
              <Text style={styles.headerAvatarText}>{getInitials(chatName)}</Text>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerName}>{chatName}</Text>
              {username && (
                <Text style={styles.headerUsername}>@{username}</Text>
              )}
              {!isContact && (
                <View style={styles.usernameConnection}>
                  <Icon name="at" size={14} color="rgba(255, 255, 255, 0.7)" />
                  <Text style={styles.connectionText}>Connected via username</Text>
                </View>
              )}
              <Text style={styles.headerStatus}>{getStatusText()}</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Icon name="videocam" size={24} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Icon name="call" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.messagesSection}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => (
              <MessageBubble message={item} isSent={item.isSent} />
            )}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {isContact 
                    ? `Start a conversation with ${chatName}` 
                    : `Start chatting with @${username}`}
                </Text>
                {!isContact && (
                  <Text style={styles.emptySubtext}>
                    You connected via username search
                  </Text>
                )}
              </View>
            }
          />
        )}
        
        {isTyping && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>{chatName} is typing...</Text>
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Icon name="add-circle-outline" size={28} color={colors.gray6} />
          </TouchableOpacity>
          
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              value={inputText}
              onChangeText={handleTyping}
              multiline
              maxHeight={100}
              placeholderTextColor={colors.gray5}
            />
            <TouchableOpacity style={styles.emojiButton}>
              <Icon name="happy-outline" size={24} color={colors.gray6} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendMessage}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.sendButtonGradient}>
              <Icon
                name={inputText.trim() ? 'send' : 'mic'}
                size={20}
                color={colors.white}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerAvatarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerName: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  headerUsername: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  usernameConnection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  connectionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  headerStatus: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 20,
  },
  messagesSection: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray5,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray5,
    marginTop: 5,
    fontStyle: 'italic',
  },
  typingIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 14,
    color: colors.gray6,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: colors.white,
    elevation: 8,
    shadowColor: colors.shadowColor,
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  attachButton: {
    padding: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.gray1,
    borderRadius: 25,
    marginHorizontal: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    fontSize: 16,
    color: colors.gray9,
    paddingTop: 0,
    paddingBottom: 0,
  },
  emojiButton: {
    marginLeft: 8,
  },
  sendButton: {
    padding: 4,
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatDetailScreen;