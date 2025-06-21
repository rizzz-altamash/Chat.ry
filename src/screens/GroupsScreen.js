// src/screens/GroupsScreen.js
import React, {useState, useEffect} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import ChatItem from '../components/ChatItem';
import FloatingButton from '../components/FloatingButton';
import colors from '../styles/colors';
import api from '../services/api';
import websocket from '../services/websocket';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GroupsScreen = ({navigation}) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const chatColors = ['#96CEB4', '#DDA0DD', '#FFB347', '#87CEEB', '#FF6B6B', '#4ECDC4'];
  
  useEffect(() => {
    loadUserData();
    loadGroups();
    setupWebSocketListeners();
    
    return () => {
      // Cleanup listeners if needed
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

  const getColorForGroup = (groupId) => {
    if (!groupId) return chatColors[0];
    
    let hash = 0;
    for (let i = 0; i < groupId.length; i++) {
      hash = groupId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % chatColors.length;
    return chatColors[index];
  };

  // const loadGroups = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await api.getGroups();

  //     // Add validation
  //     if (!response || !response.groups) {
  //       console.error('Invalid response structure:', response);
  //       setGroups([]);
  //       return;
  //     }
      
  //     // Transform groups data for display
  //     const transformedGroups = response.groups.map(group => {
  //       // Check if this is a left group for current user
  //       const isLeftGroup = group.isLeft || false;
  //       const leftReason = group.leftReason || null;
        
  //       return {
  //         id: group._id,
  //         name: group.name,
  //         description: group.description,
  //         avatar: group.avatar,
  //         lastMessage: group.lastMessage?.text || 'No messages yet',
  //         lastMessageSender: group.lastMessage?.sender?.name || '',
  //         time: formatMessageTime(group.lastMessage?.createdAt || group.lastActivity),
  //         unreadCount: 0,
  //         color: getColorForGroup(group._id),
  //         memberCount: group.members?.length || 0,
  //         isAdmin: group.admins?.includes(currentUserId),
  //         members: group.members,
  //         admins: group.admins,
  //         creator: group.creator,
  //         createdAt: group.createdAt,
  //         settings: group.settings,
  //         isTyping: false,
  //         isLeft: isLeftGroup,
  //         leftReason: leftReason,
  //       };
  //     });
      
  //     setGroups(transformedGroups);
  //   } catch (error) {
  //     console.error('Error loading groups:', error);
  //     Alert.alert('Error', 'Failed to load groups');
  //     setGroups([]); // Set empty array on error
  //   } finally {
  //     setLoading(false);
  //     setRefreshing(false);
  //   }
  // };

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await api.getGroups();

      if (!response || !response.groups) {
        console.error('Invalid response structure:', response);
        setGroups([]);
        return;
      }
      
      // Transform groups data for display
      const transformedGroups = response.groups.map(group => {
        const isLeftGroup = group.isLeft || false;
        const leftReason = group.leftReason || null;

        // Check if last message is mine and get its status
        let isLastMessageMine = false;
        let lastMessageStatus = null;
        
        if (group.lastMessage) {
          const senderId = group.lastMessage.sender?._id || group.lastMessage.sender?.id || group.lastMessage.sender;
          isLastMessageMine = String(senderId) === String(currentUserId);
          
          if (isLastMessageMine) {
            // For groups, we need to check the group status
            lastMessageStatus = group.lastMessage.groupStatus || 'sent';
          }
        }
        
        return {
          id: group._id,
          name: group.name,
          description: group.description,
          avatar: group.avatar,
          lastMessage: group.lastMessage?.text || 'No messages yet',
          lastMessageSender: group.lastMessage?.sender?.name || '',
          lastMessageStatus: lastMessageStatus, // Add this
          isLastMessageMine: isLastMessageMine, // Add this
          time: formatMessageTime(group.lastMessage?.createdAt || group.lastActivity),
          unreadCount: group.unreadCount || 0, // Use backend unread count
          color: getColorForGroup(group._id),
          memberCount: group.members?.length || 0,
          isAdmin: group.admins?.includes(currentUserId),
          members: group.members,
          admins: group.admins,
          creator: group.creator,
          createdAt: group.createdAt,
          settings: group.settings,
          isTyping: false,
          isLeft: isLeftGroup,
          leftReason: leftReason,
        };
      });
      
      setGroups(transformedGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
      Alert.alert('Error', 'Failed to load groups');
      setGroups([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const setupWebSocketListeners = () => {
    const handleWebSocketEvent = (event, data) => {
      switch (event) {
        // case 'new_group_message':
        //   // Reload groups to update last message
        //   loadGroups();
        //   break;

        case 'new_group_message':
          // Reload groups to update unread count
          if (data.message.sender !== currentUserId) {
            loadGroups();
          }
          break;
          
        case 'group_message_status_update':
          // Reload if messages were read
          if (data.groupStatus === 'read') {
            loadGroups();
          }
          break;
          
        case 'group_created':
          // Reload groups when a new group is created
          loadGroups();
          break;
          
        case 'group_updated':
          // Update specific group
          updateGroup(data.groupId, data.updates);
          break;
          
        case 'group_member_added':
        case 'group_member_removed':
          // Reload groups to update member count
          loadGroups();
          break;
      }
    };
    
    websocket.onMessage(handleWebSocketEvent);
  };

  const updateGroup = (groupId, updates) => {
    setGroups(prevGroups => 
      prevGroups.map(group => 
        group.id === groupId 
          ? {...group, ...updates} 
          : group
      )
    );
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleGroupPress = (group) => {
    navigation.navigate('ChatDetail', {
      chatId: group.id,
      chatName: group.name,
      chatColor: group.color,
      isGroup: true,
      groupData: group,
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadGroups();
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="people-outline" size={80} color={colors.gray4} />
      <Text style={styles.emptyText}>No groups yet</Text>
      <Text style={styles.emptySubtext}>
        Create a group to start chatting with multiple people
      </Text>
    </View>
  );

  const renderGroupItem = ({item}) => {
    if (!item) return null;

    const isLeftGroup = item.isLeft || false;
    const lastMessageDisplay = item.lastMessageSender 
      ? `${item.lastMessageSender}: ${item.lastMessage}`
      : item.lastMessage || 'No messages yet'; // Add fallback

    return (
      <ChatItem
        chat={{
          ...item,
          lastMessage: lastMessageDisplay,
          isLeftGroup: isLeftGroup,
          leftReason: item.leftReason,
        }}
        onPress={() => handleGroupPress(item)}
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
            <Text style={styles.headerTitle}>Groups</Text>
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
          <Text style={styles.headerTitle}>Groups</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Icon name="search" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={renderGroupItem}
        contentContainerStyle={[
          styles.listContent,
          groups.length === 0 && styles.emptyListContent
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
        icon="people-outline" 
        onPress={() => navigation.navigate('CreateGroup')} 
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

export default GroupsScreen;