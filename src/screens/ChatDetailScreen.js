// src/screens/ChatDetailScreen.js
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
//     chatId, // <-- This is also the group ID 
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
//   const [isLeftGroup, setIsLeftGroup] = useState(groupData?.isLeft || false);
//   const [actualChatId, setActualChatId] = useState(null); // Store the real chat ID
  
//   const flatListRef = useRef(null);
//   const typingTimeoutRef = useRef(null);

//   useEffect(() => {
//     const initializeChat = async () => {
//       await loadUserData();
//     };
//     initializeChat();

//     setupWebSocketListeners();

//     // Join/leave group room for real-time updates
//     if (isGroup && websocket.isConnected()) {
//       websocket.joinGroup(chatId);
//     }
    
//     return () => {
//       // Send typing stopped when leaving screen
//       if (!isGroup) {
//         websocket.sendTypingIndicator(chatId, false);
//       }

//       // Leave group room when leaving screen
//       if (isGroup && websocket.isConnected()) {
//         websocket.leaveGroup(chatId);
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

//   // Mark messages as read when chat becomes visible
//   useEffect(() => {
//     if (!loading && messages.length > 0 && !isGroup && currentUserId && actualChatId && navigation.isFocused()) {
//       // Mark unread messages as read after a short delay
//       const timer = setTimeout(() => {
//         const unreadMessageIds = messages
//           .filter(msg => !msg.isSent && msg.status !== 'read')
//           .map(msg => msg.id);
        
//         if (unreadMessageIds.length > 0) {
//           websocket.markAsRead(unreadMessageIds, actualChatId);
//         }
//       }, 500); // 500ms delay to ensure user actually sees the messages
      
//       return () => clearTimeout(timer);
//     }
//   }, [loading, messages, isGroup, currentUserId, actualChatId, navigation]);

//   // Mark group messages as read when visible
//   useEffect(() => {
//     if (!loading && messages.length > 0 && isGroup && currentUserId && navigation.isFocused()) {
//       const timer = setTimeout(() => {
//         const unreadMessageIds = messages
//           .filter(msg => !msg.isSent && msg.type !== 'system')
//           .map(msg => msg.id);
        
//         if (unreadMessageIds.length > 0) {
//           websocket.markGroupMessagesRead(unreadMessageIds, chatId);
//         }
//       }, 500);
      
//       return () => clearTimeout(timer);
//     }
//   }, [loading, messages, isGroup, currentUserId, navigation]);

//   // Add this useEffect after the existing useEffects
//   useEffect(() => {
//     if (!loading && isGroup && currentUserId && messages.length > 0 && navigation.isFocused()) {
//       // Mark undelivered messages as delivered when group is opened
//       const markAsDelivered = async () => {
//         try {
//           const undeliveredMessageIds = messages
//             .filter(msg => {
//               if (msg.type === 'system' || msg.isSent) return false;
              
//               // Check if message is not yet delivered to current user
//               const isDelivered = msg.deliveredTo?.some(
//                 d => d.user === currentUserId || d.user?._id === currentUserId
//               );
//               return !isDelivered;
//             })
//             .map(msg => msg.id);

//           if (undeliveredMessageIds.length > 0) {
//             websocket.markGroupMessagesDelivered(undeliveredMessageIds, chatId);
//           }
//         } catch (error) {
//           console.error('Error marking messages as delivered:', error);
//         }
//       };

//       markAsDelivered();
//     }
//   }, [loading, isGroup, currentUserId, messages, navigation]);

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
//       let chatIdForMessages; // Store the actual chat ID
      
//       if (isGroup) {
//         try {
//           response = await api.getGroupMessages(chatId, pageNum);
//           chatIdForMessages = chatId; // For groups, chatId is the groupId
//           setActualChatId(chatId);
//         } catch (error) {
//           if (error.message === 'Access denied' && isLeftGroup) {
//             setMessages([]);
//             setHasMore(false);
//             return;
//           }
//           throw error;
//         }
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
        
//         chatIdForMessages = chatInfo._id; // Store the actual chat ID
//         setActualChatId(chatInfo._id);
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
//         groupStatus: msg.groupStatus,
//         sending: false,
//         sender: msg.sender,
//         senderName: msg.sender?.name || 'Unknown',
//         type: msg.type || 'text',
//         metadata: msg.metadata,
//       }));
      
//       if (pageNum === 1) {
//         setMessages(transformedMessages);
        
//         // Add initial group created message if it's a new group with no messages
//         if (isGroup && transformedMessages.length === 0 && groupData) {
//           const createdMessage = {
//             id: `system_created_${groupData._id}`,
//             text: `${groupData.creator?.name || 'Someone'} created this group`,
//             time: new Date(groupData.createdAt).toLocaleTimeString([], {
//               hour: '2-digit',
//               minute: '2-digit'
//             }),
//             type: 'system',
//             isSent: false,
//           };
//           setMessages([createdMessage]);
//         }
//       } else {
//         setMessages(prev => [...transformedMessages, ...prev]);
//       }
      
//       setPage(response.page);
//       setHasMore(response.hasMore);
      
//       // Only mark messages as read for private chats when screen is focused
//       if (!isGroup && !isLeftGroup && navigation.isFocused() && pageNum === 1) {
//         const unreadMessageIds = response.messages
//           .filter(msg => {
//             const isSentByOther = !isSentByCurrentUser(msg, currentUserId);
//             return isSentByOther && msg.status !== 'read';
//           })
//           .map(msg => msg._id || msg.id);
        
//         if (unreadMessageIds.length > 0) {
//           // Use actualChatId instead of trying to get it again
//           setTimeout(() => {
//             websocket.markAsRead(unreadMessageIds, chatIdForMessages);
//           }, 500);
//         }
//       }
      
//     } catch (error) {
//       console.error('Failed to load messages:', error);
//       if (pageNum === 1) {
//         setMessages([]);
//         setHasMore(false);

//         // Show appropriate error only for non-left groups
//         if (!isLeftGroup) {
//           Alert.alert('Error', 'Failed to load messages');
//         }
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

//             // // 🆕 YEH ADD KARO - Immediately send delivered acknowledgment
//             // if (data.message.status === 'sent') {
//             //   websocket.markAsDelivered([newMessage.id]);
//             // }
            
//             // Only mark as read if chat is currently visible and focused
//             const isScreenFocused = navigation.isFocused();
//             if (isScreenFocused && data.chatId) {
//               // Wait a bit before marking as read
//               setTimeout(() => {
//                 websocket.markAsRead([newMessage.id], data.chatId);
//               }, 1000);
//             }
            
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
//               groupStatus: data.message.groupStatus,
//               sender: data.message.sender,
//               senderName: data.message.sender?.name || 'Unknown',
//               type: data.message.type || 'text',
//               deliveredTo: data.message.deliveredTo || [],
//             };
            
//             setMessages(prev => [...prev, newMessage]);

//             // // Mark as delivered
//             // if (!newMessage.isSent) {
//             //   websocket.markGroupMessagesDelivered(newMessage.id, chatId);
//             // }

//             // Mark as delivered if chat is open and visible
//             if (!newMessage.isSent && navigation.isFocused()) {
//               setTimeout(() => {
//                 websocket.markGroupMessagesDelivered([newMessage.id], chatId);
//               }, 100);
//             }
            
//             setTimeout(() => {
//               flatListRef.current?.scrollToEnd();
//             }, 100);
//           }
//           break;
        
//         case 'group_message_status_update':
//           if (isGroup && data.groupId === chatId) {
//             setMessages(prev => prev.map(msg => {
//               if (msg.id === data.messageId) {
//                 return {...msg, groupStatus: data.groupStatus};
//               }
//               return msg;
//             }));
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
          
//         case 'group_member_added':
//           if (isGroup && data.groupId === chatId) {
//             const systemMessage = {
//               id: `system_${Date.now()}`,
//               text: data.addedBy === currentUserId 
//                 ? `You added ${data.memberName}` 
//                 : `${data.addedByName} added ${data.memberName}`,
//               time: new Date().toLocaleTimeString([], {
//                 hour: '2-digit',
//                 minute: '2-digit'
//               }),
//               type: 'system',
//               isSent: false,
//             };
            
//             setMessages(prev => [...prev, systemMessage]);
//           }
//           break;
          
//         case 'group_member_removed':
//           if (isGroup && data.groupId === chatId) {
//             const systemMessage = {
//               id: `system_${Date.now()}`,
//               text: data.removedBy === currentUserId
//                 ? `You removed ${data.memberName}`
//                 : data.memberId === currentUserId
//                   ? `You were removed from the group`
//                   : `${data.removedByName} removed ${data.memberName}`,
//               time: new Date().toLocaleTimeString([], {
//                 hour: '2-digit',
//                 minute: '2-digit'
//               }),
//               type: 'system',
//               isSent: false,
//             };
            
//             setMessages(prev => [...prev, systemMessage]);
            
//             // If current user was removed, update state before navigation
//             if (data.memberId === currentUserId) {
//               setIsLeftGroup(true);
//               setTimeout(() => {
//                 Alert.alert('Removed from group', 'You have been removed from this group', [
//                   {text: 'OK', onPress: () => navigation.goBack()}
//                 ]);
//               }, 100);
//             }
//           }
//           break;
          
//         case 'group_member_left':
//           if (isGroup && data.groupId === chatId) {
//             const systemMessage = {
//               id: `system_${Date.now()}`,
//               text: `${data.memberName} left the group`,
//               time: new Date().toLocaleTimeString([], {
//                 hour: '2-digit',
//                 minute: '2-digit'
//               }),
//               type: 'system',
//               isSent: false,
//             };
            
//             setMessages(prev => [...prev, systemMessage]);
//           }
//           break;
          
//         case 'group_created':
//           if (isGroup && data.groupId === chatId) {
//             const systemMessage = {
//               id: `system_${Date.now()}`,
//               text: `${data.creatorName} created this group`,
//               time: new Date().toLocaleTimeString([], {
//                 hour: '2-digit',
//                 minute: '2-digit'
//               }),
//               type: 'system',
//               isSent: false,
//             };
            
//             setMessages(prev => [...prev, systemMessage]);
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
//                   status: data.message.status,
//                   groupStatus: data.message.groupStatus,
//                   tempId: data.tempId // Keep tempId for key
//                 };
//               }
//               return msg;
//             }));
//           }
//           break;
        
//         case 'messages_delivered':
//           if (!isGroup) {
//             setMessages(prev => prev.map(msg => {
//               if (data.messageIds.includes(msg.id) && msg.isSent) {
//                 return {...msg, status: 'delivered'};
//               }
//               return msg;
//             }));
//           }
//           break;
        
//         case 'message_status_update':
//           if (!isGroup && data.messageId) {
//             setMessages(prev => prev.map(msg => {
//               if (msg.id === data.messageId) {
//                 return {...msg, status: data.status};
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

//         case 'member_made_admin':
//           if (isGroup && data.groupId === chatId) {
//             const adminMessage = {
//               id: data.systemMessage._id,
//               text: data.systemMessage.text,
//               time: new Date(data.systemMessage.createdAt).toLocaleTimeString([], {
//                 hour: '2-digit',
//                 minute: '2-digit'
//               }),
//               type: 'system',
//               isSent: false,
//             };
            
//             setMessages(prev => [...prev, adminMessage]);
//           }
//           break;

//         case 'admin_removed':
//           if (isGroup && data.groupId === chatId) {
//             const adminRemovedMessage = {
//               id: data.systemMessage._id,
//               text: data.systemMessage.text,
//               time: new Date(data.systemMessage.createdAt).toLocaleTimeString([], {
//                 hour: '2-digit',
//                 minute: '2-digit'
//               }),
//               type: 'system',
//               isSent: false,
//             };
            
//             setMessages(prev => [...prev, adminRemovedMessage]);
//           }
//           break;

//         case 'group_updated':
//           if (isGroup && data.groupId === chatId) {
//             const updateMessage = {
//               id: data.systemMessage._id,
//               text: data.systemMessage.text,
//               time: new Date(data.systemMessage.createdAt).toLocaleTimeString([], {
//                 hour: '2-digit',
//                 minute: '2-digit'
//               }),
//               type: 'system',
//               isSent: false,
//             };
            
//             setMessages(prev => [...prev, updateMessage]);
            
//             // Update group name if changed
//             if (data.updates.name) {
//               navigation.setParams({ chatName: data.updates.name });
//             }
//           }
//           break;

//         case 'removed_from_group':
//           if (isGroup && data.groupId === chatId) {
//             setIsLeftGroup(true);
            
//             Alert.alert(
//               'Removed from Group',
//               data.reason,
//               [{text: 'OK'}]
//             );
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
//     if (isLeftGroup) {
//       Alert.alert('Cannot Send', 'You are no longer a member of this group');
//       return;
//     }

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
//         tempId: tempId, // Keep tempId for keyExtractor
//         text: inputText.trim(),
//         time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
//         isSent: true,
//         read: false,
//         sending: true,
//         status: 'sending',
//         type: 'text'
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
//     // System messages (member added, left, etc.)
//     if (item.type === 'system') {
//       return (
//         <View style={styles.systemMessageContainer}>
//           <View style={styles.systemMessageBubble}>
//             <Icon name="information-circle" size={14} color={colors.gray5} />
//             <Text style={styles.systemMessageText}>{item.text}</Text>
//           </View>
//         </View>
//       );
//     }
    
//     // Regular messages
//     if (isGroup && !item.isSent) {
//       // Show sender name for group messages from others
//       return (
//         <View>
//           <Text style={styles.senderName}>{item.senderName}</Text>
//           <MessageBubble message={item} isSent={item.isSent} isGroup={isGroup} />
//         </View>
//       );
//     }
    
//     return <MessageBubble message={item} isSent={item.isSent} isGroup={isGroup} />;
//   };

//   const handleDeleteGroup = () => {
//     Alert.alert(
//       'Delete Group',
//       'This will remove the group from your chats. You won\'t be able to see these messages again.',
//       [
//         {text: 'Cancel', style: 'cancel'},
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               // Use chatId instead of groupId 
//               await api.deleteGroupFromList(chatId);
//               navigation.goBack();
//             } catch (error) {
//               console.error('Delete group error:', error);
//               Alert.alert('Error', 'Failed to delete group');
//             }
//           }
//         }
//       ]
//     );
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
//               } else {
//                 // Navigate to user info for personal chats
//                 navigation.navigate('UserInfo', {
//                   userId: participant?._id || participant?.id || chatId,
//                   fromChat: true
//                 });
//               }
//             }}
//             disabled={false}>
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
//             {/* Add left group indicator in header */}
//             {isLeftGroup && (
//               <View style={styles.leftGroupBanner}>
//                 <Icon name="information-circle" size={16} color={colors.warning} />
//                 <Text style={styles.leftGroupText}>
//                   You {groupData?.leftReason === 'removed' ? 'were removed from' : 'left'} this group
//                 </Text>
//               </View>
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
//             keyExtractor={(item) => item.tempId || item.id}
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
        
//         {isLeftGroup ? (
//           <View style={styles.leftGroupFooter}>
//             <Text style={styles.leftGroupFooterText}>You can't send messages to this group</Text>
//             <TouchableOpacity 
//               style={styles.deleteGroupButton}
//               onPress={() => handleDeleteGroup()}>
//               <Icon name="trash-outline" size={20} color={colors.danger} />
//               <Text style={styles.deleteGroupText}>Delete Group</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <View style={styles.inputContainer}>
//             <TouchableOpacity style={styles.attachButton}>
//               <Icon name="add-circle-outline" size={28} color={colors.gray6} />
//             </TouchableOpacity>
            
//             <View style={styles.inputWrapper}>
//               <TextInput
//                 style={styles.textInput}
//                 placeholder={isGroup ? "Type a message to the group..." : "Type a message..."}
//                 value={inputText}
//                 onChangeText={handleTyping}
//                 multiline
//                 maxHeight={100}
//                 placeholderTextColor={colors.gray5}
//               />
//               <TouchableOpacity style={styles.emojiButton}>
//                 <Icon name="happy-outline" size={24} color={colors.gray6} />
//               </TouchableOpacity>
//             </View>
            
//             <TouchableOpacity
//               style={[styles.sendButton, sendingMessage && styles.sendButtonDisabled]}
//               onPress={sendMessage}
//               disabled={sendingMessage}>
//               <LinearGradient
//                 colors={[colors.gradientStart, colors.gradientEnd]}
//                 style={styles.sendButtonGradient}>
//                 <Icon
//                   name={inputText.trim() ? 'send' : 'mic'}
//                   size={20}
//                   color={colors.white}
//                 />
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>
//         )}
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
//   systemMessageContainer: {
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 20,
//   },
//   systemMessageBubble: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.gray2,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 15,
//   },
//   systemMessageText: {
//     fontSize: 13,
//     color: colors.gray6,
//     marginLeft: 6,
//   },
//   leftGroupBanner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.warning + '20',
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     marginTop: -10,
//   },
//   leftGroupText: {
//     fontSize: 14,
//     color: colors.warning,
//     marginLeft: 8,
//     fontWeight: '500',
//   },
//   leftGroupFooter: {
//     backgroundColor: colors.gray2,
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     alignItems: 'center',
//   },
//   leftGroupFooterText: {
//     fontSize: 14,
//     color: colors.gray6,
//     marginBottom: 10,
//   },
//   deleteGroupButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.white,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: colors.danger,
//   },
//   deleteGroupText: {
//     color: colors.danger,
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 8,
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
    chatId, // <-- This is also the group ID 
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
  const [isLeftGroup, setIsLeftGroup] = useState(groupData?.isLeft || false);
  const [actualChatId, setActualChatId] = useState(null); // Store the real chat ID
  
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const initializeChat = async () => {
      await loadUserData();
    };
    initializeChat();

    setupWebSocketListeners();

    // Join/leave group room for real-time updates
    if (isGroup && websocket.isConnected()) {
      websocket.joinGroup(chatId);
    }
    
    return () => {
      // Send typing stopped when leaving screen
      if (!isGroup) {
        websocket.sendTypingIndicator(chatId, false);
      }

      // Leave group room when leaving screen
      if (isGroup && websocket.isConnected()) {
        websocket.leaveGroup(chatId);
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

  // Mark messages as read when chat becomes visible (for private chats)
  useEffect(() => {
    if (!loading && messages.length > 0 && !isGroup && currentUserId && actualChatId && navigation.isFocused()) {
      // Mark unread messages as read after a short delay
      const timer = setTimeout(() => {
        const unreadMessageIds = messages
          .filter(msg => !msg.isSent && msg.status !== 'read')
          .map(msg => msg.id);
        
        if (unreadMessageIds.length > 0) {
          websocket.markAsRead(unreadMessageIds, actualChatId);
        }
      }, 500); // 500ms delay to ensure user actually sees the messages
      
      return () => clearTimeout(timer);
    }
  }, [loading, messages, isGroup, currentUserId, actualChatId, navigation]);

  // Mark group messages as READ when visible (only read, not delivered)
  useEffect(() => {
    if (!loading && messages.length > 0 && isGroup && currentUserId && navigation.isFocused()) {
      const timer = setTimeout(() => {
        const unreadMessageIds = messages
          .filter(msg => {
            if (msg.type === 'system') return false;

            // Skip messages sent by current user
            if (msg.isSent) return false;

            // IMPORTANT: Check the actual sender ID, not just isSent flag
            const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
            if (String(senderId) === String(currentUserId)) return false;
            
            // // Check if already read by current user
            // const isRead = msg.readBy?.some(
            //   r => (r.user === currentUserId || r.user?._id === currentUserId)
            // );
            
            // return !isRead;

            // Check if already read by current user
            if (msg.readBy && msg.readBy.length > 0) {
              const isAlreadyRead = msg.readBy.some(r => {
                const readerId = r.user?._id || r.user?.id || r.user;
                return String(readerId) === String(currentUserId);
              });
              if (isAlreadyRead) return false;
            }
            
            return true; // This message needs to be marked as read
          })
          .map(msg => msg.id);
        
        if (unreadMessageIds.length > 0) {
          websocket.markGroupMessagesRead(unreadMessageIds, chatId);
        }
      }, 500); // 500ms delay before marking as read
      
      return () => clearTimeout(timer);
    }
  }, [loading, messages, isGroup, currentUserId, navigation]);

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
      let chatIdForMessages; // Store the actual chat ID
      
      if (isGroup) {
        try {
          response = await api.getGroupMessages(chatId, pageNum);
          chatIdForMessages = chatId; // For groups, chatId is the groupId
          setActualChatId(chatId);
        } catch (error) {
          if (error.message === 'Access denied' && isLeftGroup) {
            setMessages([]);
            setHasMore(false);
            return;
          }
          throw error;
        }
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
        
        chatIdForMessages = chatInfo._id; // Store the actual chat ID
        setActualChatId(chatInfo._id);
        response = await api.getChatMessages(chatInfo._id, pageNum);
      }
      
      // Transform messages for display
      // const transformedMessages = response.messages.map(msg => ({
      //   id: msg._id || msg.id,
      //   text: msg.text,
      //   time: new Date(msg.createdAt).toLocaleTimeString([], {
      //     hour: '2-digit',
      //     minute: '2-digit'
      //   }),
      //   isSent: isSentByCurrentUser(msg, currentUserId),
      //   read: msg.status === 'read',
      //   status: msg.status,
      //   groupStatus: msg.groupStatus,
      //   sending: false,
      //   sender: msg.sender,
      //   senderName: msg.sender?.name || 'Unknown',
      //   type: msg.type || 'text',
      //   metadata: msg.metadata,
      //   deliveredTo: msg.deliveredTo || [], // Add this for group delivery tracking
      //   readBy: msg.readBy || [], // Add this for group read tracking
      // }));

      // In loadMessages function, add logging when transforming messages:
      const transformedMessages = response.messages.map(msg => {
        const transformed = {
          id: msg._id || msg.id,
          text: msg.text,
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          isSent: isSentByCurrentUser(msg, currentUserId),
          read: msg.status === 'read',
          status: msg.status,
          groupStatus: msg.groupStatus,
          sending: false,
          sender: msg.sender,
          senderName: msg.sender?.name || 'Unknown',
          type: msg.type || 'text',
          metadata: msg.metadata,
          deliveredTo: msg.deliveredTo || [],
          readBy: msg.readBy || [],
        };
        
        // Debug log
        if (transformed.isSent) {
          console.log('Own message:', {
            id: transformed.id,
            text: transformed.text.substring(0, 20),
            groupStatus: transformed.groupStatus,
            readByCount: transformed.readBy.length
          });
        }
        
        return transformed;
      });
      
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
      
      // Only mark messages as read for private chats when screen is focused
      if (!isGroup && !isLeftGroup && navigation.isFocused() && pageNum === 1) {
        const unreadMessageIds = response.messages
          .filter(msg => {
            const isSentByOther = !isSentByCurrentUser(msg, currentUserId);
            return isSentByOther && msg.status !== 'read';
          })
          .map(msg => msg._id || msg.id);
        
        if (unreadMessageIds.length > 0) {
          // Use actualChatId instead of trying to get it again
          setTimeout(() => {
            websocket.markAsRead(unreadMessageIds, chatIdForMessages);
          }, 500);
        }
      }
      
    } catch (error) {
      console.error('Failed to load messages:', error);
      if (pageNum === 1) {
        setMessages([]);
        setHasMore(false);

        // Show appropriate error only for non-left groups
        if (!isLeftGroup) {
          Alert.alert('Error', 'Failed to load messages');
        }
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
            
            // Only mark as read if chat is currently visible and focused
            const isScreenFocused = navigation.isFocused();
            if (isScreenFocused && data.chatId) {
              // Wait a bit before marking as read
              setTimeout(() => {
                websocket.markAsRead([newMessage.id], data.chatId);
              }, 1000);
            }
            
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
              groupStatus: data.message.groupStatus,
              sender: data.message.sender,
              senderName: data.message.sender?.name || 'Unknown',
              type: data.message.type || 'text',
              deliveredTo: data.message.deliveredTo || [],
              readBy: data.message.readBy || [],
            };
            
            setMessages(prev => [...prev, newMessage]);
            
            // No need to mark as delivered here - it's handled on server when user is online
            
            setTimeout(() => {
              flatListRef.current?.scrollToEnd();
            }, 100);
          }
          break;
        
        case 'group_message_status_update':
          if (isGroup && data.groupId === chatId) {
            setMessages(prev => prev.map(msg => {
              if (msg.id === data.messageId) {
                return {...msg, groupStatus: data.groupStatus};
              }
              return msg;
            }));
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
            
            // If current user was removed, update state before navigation
            if (data.memberId === currentUserId) {
              setIsLeftGroup(true);
              setTimeout(() => {
                Alert.alert('Removed from group', 'You have been removed from this group', [
                  {text: 'OK', onPress: () => navigation.goBack()}
                ]);
              }, 100);
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
                  groupStatus: data.message.groupStatus,
                  tempId: data.tempId // Keep tempId for key
                };
              }
              return msg;
            }));
          }
          break;
        
        case 'messages_delivered':
          if (!isGroup) {
            setMessages(prev => prev.map(msg => {
              if (data.messageIds.includes(msg.id) && msg.isSent) {
                return {...msg, status: 'delivered'};
              }
              return msg;
            }));
          }
          break;
        
        case 'message_status_update':
          if (!isGroup && data.messageId) {
            setMessages(prev => prev.map(msg => {
              if (msg.id === data.messageId) {
                return {...msg, status: data.status};
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

        case 'member_made_admin':
          if (isGroup && data.groupId === chatId) {
            const adminMessage = {
              id: data.systemMessage._id,
              text: data.systemMessage.text,
              time: new Date(data.systemMessage.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              }),
              type: 'system',
              isSent: false,
            };
            
            setMessages(prev => [...prev, adminMessage]);
          }
          break;

        case 'admin_removed':
          if (isGroup && data.groupId === chatId) {
            const adminRemovedMessage = {
              id: data.systemMessage._id,
              text: data.systemMessage.text,
              time: new Date(data.systemMessage.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              }),
              type: 'system',
              isSent: false,
            };
            
            setMessages(prev => [...prev, adminRemovedMessage]);
          }
          break;

        case 'group_updated':
          if (isGroup && data.groupId === chatId) {
            const updateMessage = {
              id: data.systemMessage._id,
              text: data.systemMessage.text,
              time: new Date(data.systemMessage.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              }),
              type: 'system',
              isSent: false,
            };
            
            setMessages(prev => [...prev, updateMessage]);
            
            // Update group name if changed
            if (data.updates.name) {
              navigation.setParams({ chatName: data.updates.name });
            }
          }
          break;

        case 'removed_from_group':
          if (isGroup && data.groupId === chatId) {
            setIsLeftGroup(true);
            
            Alert.alert(
              'Removed from Group',
              data.reason,
              [{text: 'OK'}]
            );
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
    if (isLeftGroup) {
      Alert.alert('Cannot Send', 'You are no longer a member of this group');
      return;
    }

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
        groupStatus: 'sending',
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
          <MessageBubble message={item} isSent={item.isSent} isGroup={isGroup} />
        </View>
      );
    }
    
    return <MessageBubble message={item} isSent={item.isSent} isGroup={isGroup} />;
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      'This will remove the group from your chats. You won\'t be able to see these messages again.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Use chatId instead of groupId 
              await api.deleteGroupFromList(chatId);
              navigation.goBack();
            } catch (error) {
              console.error('Delete group error:', error);
              Alert.alert('Error', 'Failed to delete group');
            }
          }
        }
      ]
    );
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
            {/* Add left group indicator in header */}
            {isLeftGroup && (
              <View style={styles.leftGroupBanner}>
                <Icon name="information-circle" size={16} color={colors.warning} />
                <Text style={styles.leftGroupText}>
                  You {groupData?.leftReason === 'removed' ? 'were removed from' : 'left'} this group
                </Text>
              </View>
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
        
        {isLeftGroup ? (
          <View style={styles.leftGroupFooter}>
            <Text style={styles.leftGroupFooterText}>You can't send messages to this group</Text>
            <TouchableOpacity 
              style={styles.deleteGroupButton}
              onPress={() => handleDeleteGroup()}>
              <Icon name="trash-outline" size={20} color={colors.danger} />
              <Text style={styles.deleteGroupText}>Delete Group</Text>
            </TouchableOpacity>
          </View>
        ) : (
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
        )}
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
  leftGroupBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginTop: -10,
  },
  leftGroupText: {
    fontSize: 14,
    color: colors.warning,
    marginLeft: 8,
    fontWeight: '500',
  },
  leftGroupFooter: {
    backgroundColor: colors.gray2,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  leftGroupFooterText: {
    fontSize: 14,
    color: colors.gray6,
    marginBottom: 10,
  },
  deleteGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  deleteGroupText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ChatDetailScreen;