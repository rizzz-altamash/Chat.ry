// src/screens/UserInfoScreen.js
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import colors from '../styles/colors';
import api from '../services/api';

const UserInfoScreen = ({navigation, route}) => {
  const {userId, fromGroup = false} = route.params;
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasPhoneSaved, setHasPhoneSaved] = useState(false);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      const response = await api.getUserInfo(userId);
      setUserInfo(response.user);
      setHasPhoneSaved(response.hasPhoneSaved);
    } catch (error) {
      console.error('Error loading user info:', error);
      Alert.alert('Error', 'Failed to load user information');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = () => {
    navigation.navigate('ChatDetail', {
      chatId: userInfo._id,
      chatName: userInfo.name,
      chatColor: colors.accent,
      username: userInfo.username,
      participant: userInfo,
      isContact: hasPhoneSaved
    });
  };

  const handleCall = () => {
    if (hasPhoneSaved && userInfo.phone) {
      Linking.openURL(`tel:${userInfo.phone}`);
    }
  };

  const handleVideoCall = () => {
    Alert.alert('Coming Soon', 'Video calling will be available soon!');
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Unknown';
    
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffHours = (now - lastSeenDate) / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'Recently';
    if (diffHours < 24) return `${Math.floor(diffHours)} hours ago`;
    if (diffHours < 48) return 'Yesterday';
    return lastSeenDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact Info</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Icon name="ellipsis-vertical" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {userInfo?.avatar ? (
            <Image source={{uri: userInfo.avatar}} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, {backgroundColor: colors.accent}]}>
              <Text style={styles.avatarText}>{getInitials(userInfo?.name)}</Text>
            </View>
          )}
          
          <Text style={styles.userName}>{userInfo?.name}</Text>
          {userInfo?.username && (
            <Text style={styles.username}>@{userInfo.username}</Text>
          )}
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleStartChat}>
              <View style={styles.actionIconContainer}>
                <Icon name="chatbubble" size={24} color={colors.gradientStart} />
              </View>
              <Text style={styles.actionText}>Message</Text>
            </TouchableOpacity>
            
            {hasPhoneSaved && (
              <>
                <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                  <View style={styles.actionIconContainer}>
                    <Icon name="call" size={24} color={colors.gradientStart} />
                  </View>
                  <Text style={styles.actionText}>Audio</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton} onPress={handleVideoCall}>
                  <View style={styles.actionIconContainer}>
                    <Icon name="videocam" size={24} color={colors.gradientStart} />
                  </View>
                  <Text style={styles.actionText}>Video</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          {userInfo?.status && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>About</Text>
              <Text style={styles.infoValue}>{userInfo.status}</Text>
            </View>
          )}
          
          {hasPhoneSaved && userInfo?.phone && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Phone</Text>
              <TouchableOpacity onPress={handleCall}>
                <Text style={[styles.infoValue, styles.phoneNumber]}>
                  {userInfo.phone}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Last Seen</Text>
            <Text style={styles.infoValue}>
              {userInfo?.isOnline ? 'Online' : formatLastSeen(userInfo?.lastSeen)}
            </Text>
          </View>
          
          {userInfo?.username && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Username</Text>
              <Text style={styles.infoValue}>@{userInfo.username}</Text>
            </View>
          )}
        </View>

        {/* Additional Actions */}
        <View style={styles.additionalActions}>
          <TouchableOpacity style={styles.actionItem}>
            <Icon name="share-outline" size={24} color={colors.gray6} />
            <Text style={styles.actionItemText}>Share Contact</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <Icon name="ban" size={24} color={colors.danger} />
            <Text style={[styles.actionItemText, styles.dangerText]}>Block</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <Icon name="warning" size={24} color={colors.danger} />
            <Text style={[styles.actionItemText, styles.dangerText]}>Report Contact</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 20,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: colors.white,
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  avatarText: {
    color: colors.white,
    fontSize: 48,
    fontWeight: '700',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray9,
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    color: colors.gray6,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  actionButton: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gray1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: colors.gray7,
  },
  infoSection: {
    backgroundColor: colors.white,
    marginTop: 10,
    paddingVertical: 10,
  },
  infoItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray2,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.gray6,
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: colors.gray8,
  },
  phoneNumber: {
    color: colors.gradientStart,
  },
  additionalActions: {
    backgroundColor: colors.white,
    marginTop: 10,
    paddingVertical: 10,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  actionItemText: {
    fontSize: 16,
    color: colors.gray8,
    marginLeft: 15,
  },
  dangerText: {
    color: colors.danger,
  },
});

export default UserInfoScreen;