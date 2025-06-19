// // src/screens/ChatDetailScreen.js
// import React, {useState, useRef, useEffect} from 'react';
// import {
//   View,
//   FlatList,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   Text,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
// import MessageBubble from '../components/MessageBubble';
// import colors from '../styles/colors';
// import websocket from '../services/websocket';
// import api from '../services/api';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const ChatDetailScreen = ({route, navigation}) => {
//   const {chatId, chatName, chatColor, username, participant} = route.params;
//   const [inputText, setInputText] = useState('');
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isTyping, setIsTyping] = useState(false);
//   const [userStatus, setUserStatus] = useState({
//     isOnline: participant?.isOnline || false,
//     lastSeen: participant?.lastSeen
//   });
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const [sendingMessage, setSendingMessage] = useState(false);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
  
//   const flatListRef = useRef(null);
//   const typingTimeoutRef = useRef(null);

//   useEffect(() => {
//     // loadUserData();
    
//     const initializeChat = async () => {
//       await loadUserData();
//     };
//     initializeChat();

//     setupWebSocketListeners();
    
//     return () => {
//       // Send typing stopped when leaving screen
//       websocket.sendTypingIndicator(chatId, false);
      
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
//     };
//   }, [chatId]);

//   // Add another useEffect to load messages AFTER currentUserId is set
//   useEffect(() => {
//     if (currentUserId) {
//       loadMessages();
//     }
//   }, [currentUserId]);

//   const loadUserData = async () => {
//     try {
//       const userData = await AsyncStorage.getItem('userData');
//       console.log('📱 Raw userData from storage:', userData);

//       if (userData) {
//         const user = JSON.parse(userData);
//         console.log('👤 Parsed user:', user);
//         console.log('🆔 User ID options:', {
//           '_id': user._id,
//           'id': user.id,
//           'type_id': typeof user._id,
//           'type_id2': typeof user.id
//         });
        
//         const userId = user._id || user.id;

//         setCurrentUserId(userId);
//         console.log('✅ Set currentUserId to:', userId, typeof userId);
//       }
//     } catch (error) {
//       console.error('Error loading user data:', error);
//     }
//   };

//   // Add this helper function at the top
//   const isSentByCurrentUser = (message, currentUserId) => {
//     if (!message || !currentUserId) return false;
    
//     // // Get sender ID from different possible formats
//     // const senderId = message.sender?._id || 
//     //                 message.sender?.id || 
//     //                 message.sender;

//     // Handle different sender formats consistently
//     let senderId;
//     if (message.sender && typeof message.sender === 'object') {
//       // Sender is populated object
//       senderId = message.sender._id || message.sender.id;
//     } else {
//       // Sender is just an ID string
//       senderId = message.sender;
//     }

//     // Compare as strings to be safe
//     return String(senderId) === String(currentUserId);
//   };

//   const loadMessages = async (pageNum = 1) => {
//     console.log('📨 LoadMessages called');
//     console.log('Current User ID at load:', currentUserId);
    
//     if (!currentUserId) {
//       console.log('⚠️ WARNING: currentUserId is not set yet!');
//     }

//     try {
//       if (pageNum === 1) {
//         setLoading(true);
//       } else {
//         setLoadingMore(true);
//       }
      
//       // First, check if we need to create/find a chat
//       const chatsResponse = await api.getChats();
//       let chatInfo = chatsResponse.chats.find(c => 
//         c.participant._id === chatId || c.participant.id === chatId
//       );
      
//       if (!chatInfo) {
//         // No existing chat, will create when first message is sent
//         setMessages([]);
//         setHasMore(false);
//         return;
//       }
      
//       // Load messages for this chat
//       const response = await api.getChatMessages(chatInfo._id, pageNum);
      
//       // Transform messages for display
//       const transformedMessages = response.messages.map(msg => ({
//         id: msg._id || msg.id,
//         text: msg.text,
//         time: new Date(msg.createdAt).toLocaleTimeString([], {
//           hour: '2-digit',
//           minute: '2-digit'
//         }),
//         isSent: isSentByCurrentUser(msg, currentUserId),
//         read: msg.status === 'read',
//         status: msg.status,
//         sending: false
//       }));
      
//       if (pageNum === 1) {
//         setMessages(transformedMessages);
//       } else {
//         setMessages(prev => [...transformedMessages, ...prev]);
//       }
      
//       setPage(response.page);
//       setHasMore(response.hasMore);
      
//       // Mark messages as read
//       const unreadMessageIds = response.messages
//         .filter(msg => {
//           const isSentByOther = msg.sender !== currentUserId && msg.sender._id !== currentUserId;
//           return isSentByOther && msg.status !== 'read';
//         })
//         .map(msg => msg._id || msg.id);
      
//       if (unreadMessageIds.length > 0) {
//         websocket.markAsRead(unreadMessageIds, chatInfo._id);
//       }
      
//     } catch (error) {
//       console.error('Failed to load messages:', error);
//       if (pageNum === 1) {
//         // New chat, no messages yet
//         setMessages([]);
//         setHasMore(false);
//       }
//     } finally {
//       setLoading(false);
//       setLoadingMore(false);
//     }
//   };

//   const loadMoreMessages = () => {
//     if (!loadingMore && hasMore) {
//       loadMessages(page + 1);
//     }
//   };

//   const setupWebSocketListeners = () => {
//     const handleMessage = (event, data) => {
//       switch (event) {
//         case 'new_message':
//           if (data.message.sender === chatId || data.message.sender._id === chatId) {
//             const newMessage = {
//               id: data.message._id || data.message.id,
//               text: data.message.text,
//               time: new Date(data.message.createdAt).toLocaleTimeString([], {
//                 hour: '2-digit',
//                 minute: '2-digit'
//               }),
//               isSent: false,
//               read: false,
//               status: data.message.status
//             };
            
//             setMessages(prev => [...prev, newMessage]);
            
//             // Mark as read immediately since we're viewing the chat
//             websocket.markAsRead([newMessage.id], data.chatId);
            
//             // Scroll to bottom
//             setTimeout(() => {
//               flatListRef.current?.scrollToEnd();
//             }, 100);
//           }
//           break;
          
//         case 'typing_indicator':
//           if (data.userId === chatId) {
//             setIsTyping(data.isTyping);
//           }
//           break;
          
//         case 'user_online':
//           if (data.userId === chatId) {
//             setUserStatus({isOnline: true, lastSeen: null});
//           }
//           break;
          
//         case 'user_offline':
//           if (data.userId === chatId) {
//             setUserStatus({isOnline: false, lastSeen: data.lastSeen});
//           }
//           break;
          
//         case 'messages_read':
//           if (data.readBy === chatId) {
//             setMessages(prev => prev.map(msg => {
//               if (data.messageIds.includes(msg.id) && msg.isSent) {
//                 return {...msg, read: true, status: 'read'};
//               }
//               return msg;
//             }));
//           }
//           break;
          
//         case 'message_sent':
//           // Update temporary message with real ID
//           if (data.tempId) {
//             setMessages(prev => prev.map(msg => {
//               if (msg.id === data.tempId) {
//                 return {
//                   ...msg,
//                   id: data.message._id || data.message.id,
//                   sending: false,
//                   status: data.message.status
//                 };
//               }
//               return msg;
//             }));
//           }
//           break;
          
//         case 'message_error':
//           if (data.tempId) {
//             setMessages(prev => prev.filter(msg => msg.id !== data.tempId));
//             Alert.alert('Error', 'Failed to send message');
//           }
//           break;
//       }
//     };
    
//     websocket.onMessage(handleMessage);
    
//     return () => {
//       websocket.removeHandler(handleMessage);
//     };
//   };

//   const sendMessage = async () => {
//     if (inputText.trim() && !sendingMessage) {
//       setSendingMessage(true);
      
//       // Generate temporary ID
//       const tempId = websocket.sendMessage(chatId, inputText.trim());
      
//       // Add optimistic message
//       const newMessage = {
//         id: tempId,
//         text: inputText.trim(),
//         time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
//         isSent: true,
//         read: false,
//         sending: true,
//         status: 'sending'
//       };
      
//       setMessages(prev => [...prev, newMessage]);
//       setInputText('');
      
//       // Stop typing indicator
//       websocket.sendTypingIndicator(chatId, false);
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
      
//       // Scroll to bottom
//       setTimeout(() => {
//         flatListRef.current?.scrollToEnd();
//       }, 100);
      
//       setSendingMessage(false);
//     }
//   };

//   const handleTyping = (text) => {
//     setInputText(text);
    
//     // Send typing indicator
//     if (text.length > 0 && !isTyping) {
//       websocket.sendTypingIndicator(chatId, true);
      
//       // Clear previous timeout
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
      
//       // Set new timeout to stop typing indicator
//       typingTimeoutRef.current = setTimeout(() => {
//         websocket.sendTypingIndicator(chatId, false);
//       }, 3000);
//     } else if (text.length === 0) {
//       websocket.sendTypingIndicator(chatId, false);
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
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

//   const getStatusText = () => {
//     if (isTyping) return 'typing...';
//     if (userStatus.isOnline) return 'Online';
//     if (userStatus.lastSeen) {
//       const lastSeenDate = new Date(userStatus.lastSeen);
//       const now = new Date();
//       const diffHours = (now - lastSeenDate) / (1000 * 60 * 60);
      
//       if (diffHours < 1) return 'Last seen recently';
//       if (diffHours < 24) return `Last seen ${Math.floor(diffHours)} hours ago`;
//       return `Last seen ${lastSeenDate.toLocaleDateString()}`;
//     }
//     return '';
//   };

//   const renderEmptyComponent = () => (
//     <View style={styles.emptyContainer}>
//       <Text style={styles.emptyText}>
//         Send a message to start the conversation
//       </Text>
//     </View>
//   );

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
//               {username && (
//                 <Text style={styles.headerUsername}>@{username}</Text>
//               )}
//               <Text style={[styles.headerStatus, isTyping && styles.typingStatus]}>
//                 {getStatusText()}
//               </Text>
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
        
//         {loading ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color={colors.primary} />
//           </View>
//         ) : (
//           <FlatList
//             ref={flatListRef}
//             data={messages}
//             keyExtractor={(item) => item.id}
//             renderItem={({item}) => (
//               <MessageBubble message={item} isSent={item.isSent} />
//             )}
//             contentContainerStyle={[
//               styles.messagesList,
//               messages.length === 0 && styles.emptyMessagesList
//             ]}
//             onContentSizeChange={() => messages.length > 0 && flatListRef.current?.scrollToEnd()}
//             onLayout={() => messages.length > 0 && flatListRef.current?.scrollToEnd()}
//             ListEmptyComponent={renderEmptyComponent}
//             onEndReached={loadMoreMessages}
//             onEndReachedThreshold={0.1}
//             ListHeaderComponent={
//               loadingMore ? (
//                 <View style={styles.loadingMoreContainer}>
//                   <ActivityIndicator size="small" color={colors.primary} />
//                 </View>
//               ) : null
//             }
//           />
//         )}
        
//         <View style={styles.inputContainer}>
//           <TouchableOpacity style={styles.attachButton}>
//             <Icon name="add-circle-outline" size={28} color={colors.gray6} />
//           </TouchableOpacity>
          
//           <View style={styles.inputWrapper}>
//             <TextInput
//               style={styles.textInput}
//               placeholder="Type a message..."
//               value={inputText}
//               onChangeText={handleTyping}
//               multiline
//               maxHeight={100}
//               placeholderTextColor={colors.gray5}
//             />
//             <TouchableOpacity style={styles.emojiButton}>
//               <Icon name="happy-outline" size={24} color={colors.gray6} />
//             </TouchableOpacity>
//           </View>
          
//           <TouchableOpacity
//             style={[styles.sendButton, sendingMessage && styles.sendButtonDisabled]}
//             onPress={sendMessage}
//             disabled={sendingMessage}>
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
//   headerUsername: {
//     color: 'rgba(255, 255, 255, 0.9)',
//     fontSize: 14,
//   },
//   headerStatus: {
//     color: 'rgba(255, 255, 255, 0.8)',
//     fontSize: 13,
//     marginTop: 2,
//   },
//   typingStatus: {
//     fontStyle: 'italic',
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
//   emptyMessagesList: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   loadingMoreContainer: {
//     paddingVertical: 10,
//     alignItems: 'center',
//   },
//   emptyContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 40,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: colors.gray5,
//     textAlign: 'center',
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
//   sendButtonDisabled: {
//     opacity: 0.6,
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












// // src/screens/ChatDetailScreen.js
// import React, {useState, useRef, useEffect} from 'react';
// import {
//   View,
//   FlatList,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   Text,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
// import MessageBubble from '../components/MessageBubble';
// import colors from '../styles/colors';
// import websocket from '../services/websocket';
// import api from '../services/api';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const ChatDetailScreen = ({route, navigation}) => {
//   const {
//     chatId, 
//     chatName, 
//     chatColor, 
//     username, 
//     participant, 
//     isGroup = false, 
//     groupData
//   } = route.params;
  
//   const [inputText, setInputText] = useState('');
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isTyping, setIsTyping] = useState(false);
//   const [userStatus, setUserStatus] = useState({
//     isOnline: participant?.isOnline || false,
//     lastSeen: participant?.lastSeen
//   });
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const [sendingMessage, setSendingMessage] = useState(false);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [typingUsers, setTypingUsers] = useState([]); // For group typing indicators
  
//   const flatListRef = useRef(null);
//   const typingTimeoutRef = useRef(null);

//   useEffect(() => {
//     const initializeChat = async () => {
//       await loadUserData();
//     };
//     initializeChat();

//     setupWebSocketListeners();
    
//     return () => {
//       // Send typing stopped when leaving screen
//       if (!isGroup) {
//         websocket.sendTypingIndicator(chatId, false);
//       }
      
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
//     };
//   }, [chatId, isGroup]);

//   useEffect(() => {
//     if (currentUserId) {
//       loadMessages();
//     }
//   }, [currentUserId]);

//   const loadUserData = async () => {
//     try {
//       const userData = await AsyncStorage.getItem('userData');
//       if (userData) {
//         const user = JSON.parse(userData);
//         const userId = user._id || user.id;
//         setCurrentUserId(userId);
//       }
//     } catch (error) {
//       console.error('Error loading user data:', error);
//     }
//   };

//   const isSentByCurrentUser = (message, currentUserId) => {
//     if (!message || !currentUserId) return false;
    
//     let senderId;
//     if (message.sender && typeof message.sender === 'object') {
//       senderId = message.sender._id || message.sender.id;
//     } else {
//       senderId = message.sender;
//     }
    
//     return String(senderId) === String(currentUserId);
//   };

//   const loadMessages = async (pageNum = 1) => {
//     try {
//       if (pageNum === 1) {
//         setLoading(true);
//       } else {
//         setLoadingMore(true);
//       }
      
//       let response;
      
//       if (isGroup) {
//         // Load group messages
//         response = await api.getGroupMessages(chatId, pageNum);
//       } else {
//         // Load private chat messages
//         const chatsResponse = await api.getChats();
//         let chatInfo = chatsResponse.chats.find(c => 
//           c.participant._id === chatId || c.participant.id === chatId
//         );
        
//         if (!chatInfo) {
//           setMessages([]);
//           setHasMore(false);
//           return;
//         }
        
//         response = await api.getChatMessages(chatInfo._id, pageNum);
//       }
      
//       // Transform messages for display
//       const transformedMessages = response.messages.map(msg => ({
//         id: msg._id || msg.id,
//         text: msg.text,
//         time: new Date(msg.createdAt).toLocaleTimeString([], {
//           hour: '2-digit',
//           minute: '2-digit'
//         }),
//         isSent: isSentByCurrentUser(msg, currentUserId),
//         read: msg.status === 'read',
//         status: msg.status,
//         sending: false,
//         sender: msg.sender, // Keep sender info for group messages
//         senderName: msg.sender?.name || 'Unknown',
//       }));
      
//       if (pageNum === 1) {
//         setMessages(transformedMessages);
//       } else {
//         setMessages(prev => [...transformedMessages, ...prev]);
//       }
      
//       setPage(response.page);
//       setHasMore(response.hasMore);
      
//       // Mark messages as read (only for private chats)
//       if (!isGroup) {
//         const unreadMessageIds = response.messages
//           .filter(msg => {
//             const isSentByOther = !isSentByCurrentUser(msg, currentUserId);
//             return isSentByOther && msg.status !== 'read';
//           })
//           .map(msg => msg._id || msg.id);
        
//         if (unreadMessageIds.length > 0) {
//           websocket.markAsRead(unreadMessageIds, response.chatId || chatId);
//         }
//       }
      
//     } catch (error) {
//       console.error('Failed to load messages:', error);
//       if (pageNum === 1) {
//         setMessages([]);
//         setHasMore(false);
//       }
//     } finally {
//       setLoading(false);
//       setLoadingMore(false);
//     }
//   };

//   const loadMoreMessages = () => {
//     if (!loadingMore && hasMore) {
//       loadMessages(page + 1);
//     }
//   };

//   const setupWebSocketListeners = () => {
//     const handleMessage = (event, data) => {
//       switch (event) {
//         case 'new_message':
//           if (!isGroup && (data.message.sender === chatId || data.message.sender._id === chatId)) {
//             const newMessage = {
//               id: data.message._id || data.message.id,
//               text: data.message.text,
//               time: new Date(data.message.createdAt).toLocaleTimeString([], {
//                 hour: '2-digit',
//                 minute: '2-digit'
//               }),
//               isSent: false,
//               read: false,
//               status: data.message.status
//             };
            
//             setMessages(prev => [...prev, newMessage]);
//             websocket.markAsRead([newMessage.id], data.chatId);
            
//             setTimeout(() => {
//               flatListRef.current?.scrollToEnd();
//             }, 100);
//           }
//           break;
          
//         case 'new_group_message':
//           if (isGroup && data.groupId === chatId) {
//             const newMessage = {
//               id: data.message._id || data.message.id,
//               text: data.message.text,
//               time: new Date(data.message.createdAt).toLocaleTimeString([], {
//                 hour: '2-digit',
//                 minute: '2-digit'
//               }),
//               isSent: isSentByCurrentUser(data.message, currentUserId),
//               status: data.message.status,
//               sender: data.message.sender,
//               senderName: data.message.sender?.name || 'Unknown',
//             };
            
//             setMessages(prev => [...prev, newMessage]);
            
//             setTimeout(() => {
//               flatListRef.current?.scrollToEnd();
//             }, 100);
//           }
//           break;
          
//         case 'typing_indicator':
//           if (!isGroup && data.userId === chatId) {
//             setIsTyping(data.isTyping);
//           }
//           break;
          
//         case 'group_typing_indicator':
//           if (isGroup && data.groupId === chatId) {
//             if (data.isTyping) {
//               setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), 
//                 {userId: data.userId, userName: data.userName}]);
//             } else {
//               setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
//             }
//           }
//           break;
          
//         case 'user_online':
//           if (!isGroup && data.userId === chatId) {
//             setUserStatus({isOnline: true, lastSeen: null});
//           }
//           break;
          
//         case 'user_offline':
//           if (!isGroup && data.userId === chatId) {
//             setUserStatus({isOnline: false, lastSeen: data.lastSeen});
//           }
//           break;
          
//         case 'messages_read':
//           if (!isGroup && data.readBy === chatId) {
//             setMessages(prev => prev.map(msg => {
//               if (data.messageIds.includes(msg.id) && msg.isSent) {
//                 return {...msg, read: true, status: 'read'};
//               }
//               return msg;
//             }));
//           }
//           break;
          
//         case 'message_sent':
//           if (data.tempId) {
//             setMessages(prev => prev.map(msg => {
//               if (msg.id === data.tempId) {
//                 return {
//                   ...msg,
//                   id: data.message._id || data.message.id,
//                   sending: false,
//                   status: data.message.status
//                 };
//               }
//               return msg;
//             }));
//           }
//           break;
          
//         case 'message_error':
//           if (data.tempId) {
//             setMessages(prev => prev.filter(msg => msg.id !== data.tempId));
//             Alert.alert('Error', 'Failed to send message');
//           }
//           break;
//       }
//     };
    
//     websocket.onMessage(handleMessage);
    
//     return () => {
//       websocket.removeHandler(handleMessage);
//     };
//   };

//   const sendMessage = async () => {
//     if (inputText.trim() && !sendingMessage) {
//       setSendingMessage(true);
      
//       let tempId;
      
//       if (isGroup) {
//         tempId = websocket.sendGroupMessage(chatId, inputText.trim());
//       } else {
//         tempId = websocket.sendMessage(chatId, inputText.trim());
//       }
      
//       // Add optimistic message
//       const newMessage = {
//         id: tempId,
//         text: inputText.trim(),
//         time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
//         isSent: true,
//         read: false,
//         sending: true,
//         status: 'sending'
//       };
      
//       setMessages(prev => [...prev, newMessage]);
//       setInputText('');
      
//       // Stop typing indicator
//       if (!isGroup) {
//         websocket.sendTypingIndicator(chatId, false);
//       }
      
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
      
//       // Scroll to bottom
//       setTimeout(() => {
//         flatListRef.current?.scrollToEnd();
//       }, 100);
      
//       setSendingMessage(false);
//     }
//   };

//   const handleTyping = (text) => {
//     setInputText(text);
    
//     if (!isGroup) {
//       // Send typing indicator for private chats
//       if (text.length > 0 && !isTyping) {
//         websocket.sendTypingIndicator(chatId, true);
        
//         // Clear previous timeout
//         if (typingTimeoutRef.current) {
//           clearTimeout(typingTimeoutRef.current);
//         }
        
//         // Set new timeout to stop typing indicator
//         typingTimeoutRef.current = setTimeout(() => {
//           websocket.sendTypingIndicator(chatId, false);
//         }, 3000);
//       } else if (text.length === 0) {
//         websocket.sendTypingIndicator(chatId, false);
//         if (typingTimeoutRef.current) {
//           clearTimeout(typingTimeoutRef.current);
//         }
//       }
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

//   const getStatusText = () => {
//     if (isGroup) {
//       if (typingUsers.length > 0) {
//         if (typingUsers.length === 1) {
//           return `${typingUsers[0].userName} is typing...`;
//         } else {
//           return `${typingUsers.length} people are typing...`;
//         }
//       }
//       return `${groupData?.members?.length || 0} participants`;
//     }
    
//     if (isTyping) return 'typing...';
//     if (userStatus.isOnline) return 'Online';
//     if (userStatus.lastSeen) {
//       const lastSeenDate = new Date(userStatus.lastSeen);
//       const now = new Date();
//       const diffHours = (now - lastSeenDate) / (1000 * 60 * 60);
      
//       if (diffHours < 1) return 'Last seen recently';
//       if (diffHours < 24) return `Last seen ${Math.floor(diffHours)} hours ago`;
//       return `Last seen ${lastSeenDate.toLocaleDateString()}`;
//     }
//     return '';
//   };

//   const renderEmptyComponent = () => (
//     <View style={styles.emptyContainer}>
//       <Text style={styles.emptyText}>
//         Send a message to start the conversation
//       </Text>
//     </View>
//   );

//   const renderMessage = ({item}) => {
//     if (isGroup && !item.isSent) {
//       // Show sender name for group messages from others
//       return (
//         <View>
//           <Text style={styles.senderName}>{item.senderName}</Text>
//           <MessageBubble message={item} isSent={item.isSent} />
//         </View>
//       );
//     }
    
//     return <MessageBubble message={item} isSent={item.isSent} />;
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
          
//           <TouchableOpacity 
//             style={styles.headerInfo}
//             onPress={() => {
//               if (isGroup) {
//                 navigation.navigate('GroupDetail', {
//                   groupId: chatId,
//                   groupData: groupData,
//                   chatColor: chatColor
//                 });
//               }
//             }}
//             disabled={!isGroup}>
//             <View style={[styles.headerAvatar, {backgroundColor: chatColor}]}>
//               <Text style={styles.headerAvatarText}>{getInitials(chatName)}</Text>
//             </View>
//             <View style={styles.headerTextContainer}>
//               <Text style={styles.headerName}>{chatName}</Text>
//               {username && !isGroup && (
//                 <Text style={styles.headerUsername}>@{username}</Text>
//               )}
//               <Text style={[styles.headerStatus, (isTyping || typingUsers.length > 0) && styles.typingStatus]}>
//                 {getStatusText()}
//               </Text>
//             </View>
//           </TouchableOpacity>

//           <View style={styles.headerActions}>
//             {!isGroup && (
//               <>
//                 <TouchableOpacity style={styles.headerButton}>
//                   <Icon name="videocam" size={24} color={colors.white} />
//                 </TouchableOpacity>
//                 <TouchableOpacity style={styles.headerButton}>
//                   <Icon name="call" size={24} color={colors.white} />
//                 </TouchableOpacity>
//               </>
//             )}
//             {isGroup && (
//               <TouchableOpacity 
//                 style={styles.headerButton}
//                 onPress={() => navigation.navigate('GroupDetail', {
//                   groupId: chatId,
//                   groupData: groupData,
//                   chatColor: chatColor
//                 })}>
//                 <Icon name="information-circle-outline" size={24} color={colors.white} />
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>
//       </LinearGradient>

//       <KeyboardAvoidingView
//         style={styles.messagesSection}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         keyboardVerticalOffset={0}>
        
//         {loading ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color={colors.primary} />
//           </View>
//         ) : (
//           <FlatList
//             ref={flatListRef}
//             data={messages}
//             keyExtractor={(item) => item.id}
//             renderItem={renderMessage}
//             contentContainerStyle={[
//               styles.messagesList,
//               messages.length === 0 && styles.emptyMessagesList
//             ]}
//             onContentSizeChange={() => messages.length > 0 && flatListRef.current?.scrollToEnd()}
//             onLayout={() => messages.length > 0 && flatListRef.current?.scrollToEnd()}
//             ListEmptyComponent={renderEmptyComponent}
//             onEndReached={loadMoreMessages}
//             onEndReachedThreshold={0.1}
//             ListHeaderComponent={
//               loadingMore ? (
//                 <View style={styles.loadingMoreContainer}>
//                   <ActivityIndicator size="small" color={colors.primary} />
//                 </View>
//               ) : null
//             }
//           />
//         )}
        
//         <View style={styles.inputContainer}>
//           <TouchableOpacity style={styles.attachButton}>
//             <Icon name="add-circle-outline" size={28} color={colors.gray6} />
//           </TouchableOpacity>
          
//           <View style={styles.inputWrapper}>
//             <TextInput
//               style={styles.textInput}
//               placeholder={isGroup ? "Type a message to the group..." : "Type a message..."}
//               value={inputText}
//               onChangeText={handleTyping}
//               multiline
//               maxHeight={100}
//               placeholderTextColor={colors.gray5}
//             />
//             <TouchableOpacity style={styles.emojiButton}>
//               <Icon name="happy-outline" size={24} color={colors.gray6} />
//             </TouchableOpacity>
//           </View>
          
//           <TouchableOpacity
//             style={[styles.sendButton, sendingMessage && styles.sendButtonDisabled]}
//             onPress={sendMessage}
//             disabled={sendingMessage}>
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
//   headerUsername: {
//     color: 'rgba(255, 255, 255, 0.9)',
//     fontSize: 14,
//   },
//   headerStatus: {
//     color: 'rgba(255, 255, 255, 0.8)',
//     fontSize: 13,
//     marginTop: 2,
//   },
//   typingStatus: {
//     fontStyle: 'italic',
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
//   emptyMessagesList: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   loadingMoreContainer: {
//     paddingVertical: 10,
//     alignItems: 'center',
//   },
//   emptyContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 40,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: colors.gray5,
//     textAlign: 'center',
//   },
//   senderName: {
//     fontSize: 12,
//     color: colors.gradientStart,
//     marginLeft: 16,
//     marginBottom: 2,
//     fontWeight: '600',
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
//   sendButtonDisabled: {
//     opacity: 0.6,
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
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import MessageBubble from '../components/MessageBubble';
import colors from '../styles/colors';
import websocket from '../services/websocket';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatDetailScreen = ({route, navigation}) => {
  const {
    chatId, 
    chatName, 
    chatColor, 
    username, 
    participant, 
    isGroup = false, 
    groupData
  } = route.params;
  
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [userStatus, setUserStatus] = useState({
    isOnline: participant?.isOnline || false,
    lastSeen: participant?.lastSeen
  });
  const [currentUserId, setCurrentUserId] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]); // For group typing indicators
  
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const initializeChat = async () => {
      await loadUserData();
    };
    initializeChat();

    setupWebSocketListeners();
    
    return () => {
      // Send typing stopped when leaving screen
      if (!isGroup) {
        websocket.sendTypingIndicator(chatId, false);
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chatId, isGroup]);

  useEffect(() => {
    if (currentUserId) {
      loadMessages();
    }
  }, [currentUserId]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        const userId = user._id || user.id;
        setCurrentUserId(userId);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const isSentByCurrentUser = (message, currentUserId) => {
    if (!message || !currentUserId) return false;
    
    let senderId;
    if (message.sender && typeof message.sender === 'object') {
      senderId = message.sender._id || message.sender.id;
    } else {
      senderId = message.sender;
    }
    
    return String(senderId) === String(currentUserId);
  };

  const loadMessages = async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      let response;
      
      if (isGroup) {
        // Load group messages
        response = await api.getGroupMessages(chatId, pageNum);
      } else {
        // Load private chat messages
        const chatsResponse = await api.getChats();
        let chatInfo = chatsResponse.chats.find(c => 
          c.participant._id === chatId || c.participant.id === chatId
        );
        
        if (!chatInfo) {
          setMessages([]);
          setHasMore(false);
          return;
        }
        
        response = await api.getChatMessages(chatInfo._id, pageNum);
      }
      
      // Transform messages for display
      const transformedMessages = response.messages.map(msg => ({
        id: msg._id || msg.id,
        text: msg.text,
        time: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        isSent: isSentByCurrentUser(msg, currentUserId),
        read: msg.status === 'read',
        status: msg.status,
        sending: false,
        sender: msg.sender, // Keep sender info for group messages
        senderName: msg.sender?.name || 'Unknown',
        type: msg.type || 'text', // Add message type
        metadata: msg.metadata, // For system messages
      }));
      
      if (pageNum === 1) {
        setMessages(transformedMessages);
        
        // Add initial group created message if it's a new group with no messages
        if (isGroup && transformedMessages.length === 0 && groupData) {
          const createdMessage = {
            id: `system_created_${groupData._id}`,
            text: `${groupData.creator?.name || 'Someone'} created this group`,
            time: new Date(groupData.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }),
            type: 'system',
            isSent: false,
          };
          setMessages([createdMessage]);
        }
      } else {
        setMessages(prev => [...transformedMessages, ...prev]);
      }
      
      setPage(response.page);
      setHasMore(response.hasMore);
      
      // Mark messages as read (only for private chats)
      if (!isGroup) {
        const unreadMessageIds = response.messages
          .filter(msg => {
            const isSentByOther = !isSentByCurrentUser(msg, currentUserId);
            return isSentByOther && msg.status !== 'read';
          })
          .map(msg => msg._id || msg.id);
        
        if (unreadMessageIds.length > 0) {
          websocket.markAsRead(unreadMessageIds, response.chatId || chatId);
        }
      }
      
    } catch (error) {
      console.error('Failed to load messages:', error);
      if (pageNum === 1) {
        setMessages([]);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreMessages = () => {
    if (!loadingMore && hasMore) {
      loadMessages(page + 1);
    }
  };

  const setupWebSocketListeners = () => {
    const handleMessage = (event, data) => {
      switch (event) {
        case 'new_message':
          if (!isGroup && (data.message.sender === chatId || data.message.sender._id === chatId)) {
            const newMessage = {
              id: data.message._id || data.message.id,
              text: data.message.text,
              time: new Date(data.message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              }),
              isSent: false,
              read: false,
              status: data.message.status
            };
            
            setMessages(prev => [...prev, newMessage]);
            websocket.markAsRead([newMessage.id], data.chatId);
            
            setTimeout(() => {
              flatListRef.current?.scrollToEnd();
            }, 100);
          }
          break;
          
        case 'new_group_message':
          if (isGroup && data.groupId === chatId) {
            const newMessage = {
              id: data.message._id || data.message.id,
              text: data.message.text,
              time: new Date(data.message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              }),
              isSent: isSentByCurrentUser(data.message, currentUserId),
              status: data.message.status,
              sender: data.message.sender,
              senderName: data.message.sender?.name || 'Unknown',
              type: data.message.type || 'text',
            };
            
            setMessages(prev => [...prev, newMessage]);
            
            setTimeout(() => {
              flatListRef.current?.scrollToEnd();
            }, 100);
          }
          break;
          
        case 'typing_indicator':
          if (!isGroup && data.userId === chatId) {
            setIsTyping(data.isTyping);
          }
          break;
          
        case 'group_typing_indicator':
          if (isGroup && data.groupId === chatId) {
            if (data.isTyping) {
              setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), 
                {userId: data.userId, userName: data.userName}]);
            } else {
              setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
            }
          }
          break;
          
        case 'group_member_added':
          if (isGroup && data.groupId === chatId) {
            const systemMessage = {
              id: `system_${Date.now()}`,
              text: data.addedBy === currentUserId 
                ? `You added ${data.memberName}` 
                : `${data.addedByName} added ${data.memberName}`,
              time: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              }),
              type: 'system',
              isSent: false,
            };
            
            setMessages(prev => [...prev, systemMessage]);
          }
          break;
          
        case 'group_member_removed':
          if (isGroup && data.groupId === chatId) {
            const systemMessage = {
              id: `system_${Date.now()}`,
              text: data.removedBy === currentUserId
                ? `You removed ${data.memberName}`
                : data.memberId === currentUserId
                  ? `You were removed from the group`
                  : `${data.removedByName} removed ${data.memberName}`,
              time: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              }),
              type: 'system',
              isSent: false,
            };
            
            setMessages(prev => [...prev, systemMessage]);
            
            // If current user was removed, navigate back
            if (data.memberId === currentUserId) {
              Alert.alert('Removed from group', 'You have been removed from this group', [
                {text: 'OK', onPress: () => navigation.goBack()}
              ]);
            }
          }
          break;
          
        case 'group_member_left':
          if (isGroup && data.groupId === chatId) {
            const systemMessage = {
              id: `system_${Date.now()}`,
              text: `${data.memberName} left the group`,
              time: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              }),
              type: 'system',
              isSent: false,
            };
            
            setMessages(prev => [...prev, systemMessage]);
          }
          break;
          
        case 'group_created':
          if (isGroup && data.groupId === chatId) {
            const systemMessage = {
              id: `system_${Date.now()}`,
              text: `${data.creatorName} created this group`,
              time: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              }),
              type: 'system',
              isSent: false,
            };
            
            setMessages(prev => [...prev, systemMessage]);
          }
          break;
          
        case 'user_online':
          if (!isGroup && data.userId === chatId) {
            setUserStatus({isOnline: true, lastSeen: null});
          }
          break;
          
        case 'user_offline':
          if (!isGroup && data.userId === chatId) {
            setUserStatus({isOnline: false, lastSeen: data.lastSeen});
          }
          break;
          
        case 'messages_read':
          if (!isGroup && data.readBy === chatId) {
            setMessages(prev => prev.map(msg => {
              if (data.messageIds.includes(msg.id) && msg.isSent) {
                return {...msg, read: true, status: 'read'};
              }
              return msg;
            }));
          }
          break;
          
        case 'message_sent':
          if (data.tempId) {
            setMessages(prev => prev.map(msg => {
              if (msg.id === data.tempId) {
                return {
                  ...msg,
                  id: data.message._id || data.message.id,
                  sending: false,
                  status: data.message.status,
                  tempId: data.tempId // Keep tempId for key
                };
              }
              return msg;
            }));
          }
          break;
          
        case 'message_error':
          if (data.tempId) {
            setMessages(prev => prev.filter(msg => msg.id !== data.tempId));
            Alert.alert('Error', 'Failed to send message');
          }
          break;
      }
    };
    
    websocket.onMessage(handleMessage);
    
    return () => {
      websocket.removeHandler(handleMessage);
    };
  };

  const sendMessage = async () => {
    if (inputText.trim() && !sendingMessage) {
      setSendingMessage(true);
      
      let tempId;
      
      if (isGroup) {
        tempId = websocket.sendGroupMessage(chatId, inputText.trim());
      } else {
        tempId = websocket.sendMessage(chatId, inputText.trim());
      }
      
      // Add optimistic message
      const newMessage = {
        id: tempId,
        tempId: tempId, // Keep tempId for keyExtractor
        text: inputText.trim(),
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
        isSent: true,
        read: false,
        sending: true,
        status: 'sending',
        type: 'text'
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      
      // Stop typing indicator
      if (!isGroup) {
        websocket.sendTypingIndicator(chatId, false);
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd();
      }, 100);
      
      setSendingMessage(false);
    }
  };

  const handleTyping = (text) => {
    setInputText(text);
    
    if (!isGroup) {
      // Send typing indicator for private chats
      if (text.length > 0 && !isTyping) {
        websocket.sendTypingIndicator(chatId, true);
        
        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
          websocket.sendTypingIndicator(chatId, false);
        }, 3000);
      } else if (text.length === 0) {
        websocket.sendTypingIndicator(chatId, false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
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
    if (isGroup) {
      if (typingUsers.length > 0) {
        if (typingUsers.length === 1) {
          return `${typingUsers[0].userName} is typing...`;
        } else {
          return `${typingUsers.length} people are typing...`;
        }
      }
      return `${groupData?.members?.length || 0} participants`;
    }
    
    if (isTyping) return 'typing...';
    if (userStatus.isOnline) return 'Online';
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

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        Send a message to start the conversation
      </Text>
    </View>
  );

  const renderMessage = ({item}) => {
    // System messages (member added, left, etc.)
    if (item.type === 'system') {
      return (
        <View style={styles.systemMessageContainer}>
          <View style={styles.systemMessageBubble}>
            <Icon name="information-circle" size={14} color={colors.gray5} />
            <Text style={styles.systemMessageText}>{item.text}</Text>
          </View>
        </View>
      );
    }
    
    // Regular messages
    if (isGroup && !item.isSent) {
      // Show sender name for group messages from others
      return (
        <View>
          <Text style={styles.senderName}>{item.senderName}</Text>
          <MessageBubble message={item} isSent={item.isSent} />
        </View>
      );
    }
    
    return <MessageBubble message={item} isSent={item.isSent} />;
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
          
          <TouchableOpacity 
            style={styles.headerInfo}
            onPress={() => {
              if (isGroup) {
                navigation.navigate('GroupDetail', {
                  groupId: chatId,
                  groupData: groupData,
                  chatColor: chatColor
                });
              } else {
                // Navigate to user info for personal chats
                navigation.navigate('UserInfo', {
                  userId: participant?._id || participant?.id || chatId,
                  fromChat: true
                });
              }
            }}
            disabled={false}>
            <View style={[styles.headerAvatar, {backgroundColor: chatColor}]}>
              <Text style={styles.headerAvatarText}>{getInitials(chatName)}</Text>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerName}>{chatName}</Text>
              {username && !isGroup && (
                <Text style={styles.headerUsername}>@{username}</Text>
              )}
              <Text style={[styles.headerStatus, (isTyping || typingUsers.length > 0) && styles.typingStatus]}>
                {getStatusText()}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            {!isGroup && (
              <>
                <TouchableOpacity style={styles.headerButton}>
                  <Icon name="videocam" size={24} color={colors.white} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton}>
                  <Icon name="call" size={24} color={colors.white} />
                </TouchableOpacity>
              </>
            )}
            {isGroup && (
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => navigation.navigate('GroupDetail', {
                  groupId: chatId,
                  groupData: groupData,
                  chatColor: chatColor
                })}>
                <Icon name="information-circle-outline" size={24} color={colors.white} />
              </TouchableOpacity>
            )}
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
            keyExtractor={(item) => item.tempId || item.id}
            renderItem={renderMessage}
            contentContainerStyle={[
              styles.messagesList,
              messages.length === 0 && styles.emptyMessagesList
            ]}
            onContentSizeChange={() => messages.length > 0 && flatListRef.current?.scrollToEnd()}
            onLayout={() => messages.length > 0 && flatListRef.current?.scrollToEnd()}
            ListEmptyComponent={renderEmptyComponent}
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.1}
            ListHeaderComponent={
              loadingMore ? (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : null
            }
          />
        )}
        
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Icon name="add-circle-outline" size={28} color={colors.gray6} />
          </TouchableOpacity>
          
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder={isGroup ? "Type a message to the group..." : "Type a message..."}
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
            style={[styles.sendButton, sendingMessage && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={sendingMessage}>
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
  headerStatus: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    marginTop: 2,
  },
  typingStatus: {
    fontStyle: 'italic',
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
  emptyMessagesList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMoreContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray5,
    textAlign: 'center',
  },
  senderName: {
    fontSize: 12,
    color: colors.gradientStart,
    marginLeft: 16,
    marginBottom: 2,
    fontWeight: '600',
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
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemMessageContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  systemMessageBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  systemMessageText: {
    fontSize: 13,
    color: colors.gray6,
    marginLeft: 6,
  },
});

export default ChatDetailScreen;