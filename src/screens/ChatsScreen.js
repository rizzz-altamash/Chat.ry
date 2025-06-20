// src/screens/ChatsScreen.js
import React, {useState, useEffect} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import ChatItem from '../components/ChatItem';
import FloatingButton from '../components/FloatingButton';
import colors from '../styles/colors';
import api from '../services/api';
import websocket from '../services/websocket';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatsScreen = ({navigation}) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  useEffect(() => {
    loadUserData();
    loadChats();
    setupWebSocketListeners();
    
    // Cleanup
    return () => {
      // Remove WebSocket listeners if needed
    };
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUserId(user._id || user.id);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Generate color based on user ID for consistency
  const getColorForUser = (userId) => {
    if (!userId) return '#FF6B6B';
    
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    
    // Generate consistent index from user ID
    let hash = 0;
    const userIdStr = String(userId);
    for (let i = 0; i < userIdStr.length; i++) {
      hash = userIdStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await api.getChats();
      
      // Add validation
      if (!response || !response.chats) {
        console.error('Invalid response structure:', response);
        setChats([]);
        return;
      }
      
      // Transform chats data for display with safety checks
      const transformedChats = response.chats
        .filter(chat => {
          // Filter out invalid chats
          if (!chat || !chat.participant) {
            console.warn('Invalid chat structure:', chat);
            return false;
          }
          return true;
        })
        .map((chat, index) => {
          try {
            // Safely extract participant data
            const participantId = chat.participant?._id || chat.participant?.id;
            const participantName = chat.participant?.name || chat.participant?.username || 'Unknown User';
            
            return {
              id: chat._id || `chat_${index}`,
              chatId: participantId || 'unknown',
              name: participantName,
              username: chat.participant?.username || null,
              avatar: chat.participant?.avatar || null,
              lastMessage: chat.lastMessage?.text || '',
              time: formatMessageTime(chat.lastMessage?.createdAt || chat.lastActivity),
              unreadCount: chat.unreadCount || 0,
              isOnline: chat.participant?.isOnline || false,
              isTyping: chat.isTyping || false,
              color: getColorForUser(participantId),
              participant: chat.participant || {}
            };
          } catch (err) {
            console.error('Error transforming chat:', err, chat);
            return null;
          }
        })
        .filter(chat => chat !== null); // Remove any failed transformations
      
      setChats(transformedChats);
    } catch (error) {
      console.error('Error loading chats:', error);
      Alert.alert('Error', 'Failed to load chats');
      setChats([]); // Set empty array on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const setupWebSocketListeners = () => {
    const handleWebSocketEvent = (event, data) => {
      switch (event) {
        case 'new_message':
          // Reload chats to update last message
          loadChats();
          break;
          
        case 'typing_indicator':
          updateTypingStatus(data.userId, data.isTyping);
          break;
          
        case 'user_online':
          updateOnlineStatus(data.userId, true);
          break;
          
        case 'user_offline':
          updateOnlineStatus(data.userId, false);
          break;
          
        case 'messages_read':
          // Update read status
          loadChats();
          break;
      }
    };
    
    websocket.onMessage(handleWebSocketEvent);
  };

  const updateTypingStatus = (userId, isTyping) => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.chatId === userId 
          ? {...chat, isTyping} 
          : chat
      )
    );
  };

  const updateOnlineStatus = (userId, isOnline) => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.chatId === userId 
          ? {...chat, isOnline} 
          : chat
      )
    );
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        // Today - show time
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else if (diffInHours < 168) { // 7 days
        return date.toLocaleDateString([], { weekday: 'long' });
      } else {
        return date.toLocaleDateString();
      }
    } catch (err) {
      console.error('Error formatting time:', err);
      return '';
    }
  };

  const handleChatPress = (chat) => {
    // Validate chat data before navigation
    if (!chat || !chat.chatId || chat.chatId === 'unknown') {
      Alert.alert('Error', 'Cannot open this chat');
      return;
    }
    
    navigation.navigate('ChatDetail', {
      chatId: chat.chatId,
      chatName: chat.name,
      chatColor: chat.color,
      username: chat.username,
      participant: chat.participant,
      isContact: true // You can determine this based on your logic
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadChats();
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="chatbubbles-outline" size={80} color={colors.gray4} />
      <Text style={styles.emptyText}>No chats yet</Text>
      <Text style={styles.emptySubtext}>
        Start a new conversation by tapping the + button
      </Text>
    </View>
  );

  const renderChatItem = ({item}) => {
    if (!item) return null;
    
    return (
      <ChatItem 
        chat={item} 
        onPress={() => handleChatPress(item)} 
      />
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Chats</Text>
          </View>
        </LinearGradient>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Chats</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Icon name="search" size={24} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Settings')}>
              <Icon name="settings-outline" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={[
          styles.listContent,
          chats.length === 0 && styles.emptyListContent
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyComponent}
      />
      
      <FloatingButton 
        icon="create-outline" 
        onPress={() => navigation.navigate('Contacts')} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.gray1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 20,
    padding: 8,
  },
  listContent: {
    paddingVertical: 10,
  },
  emptyListContent: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray6,
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.gray5,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default ChatsScreen;