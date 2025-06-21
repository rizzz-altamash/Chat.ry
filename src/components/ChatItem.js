// ===== src/components/ChatItem.js =====
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../styles/colors';

const ChatItem = ({chat, onPress}) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isLeftGroup = chat.isLeftGroup;

  // 🆕 Function to get status icon
  const getStatusIcon = () => {
    if (!chat.isLastMessageMine || !chat.lastMessageStatus) return null;
    
    switch (chat.lastMessageStatus) {
      case 'sent':
        return <Icon name="checkmark" size={14} color={colors.gray5} style={styles.statusIcon} />;
      case 'delivered':
        return <Icon name="checkmark-done" size={14} color={colors.gray5} style={styles.statusIcon} />;
      case 'read':
        return <Icon name="checkmark-done" size={14} color={colors.info} style={styles.statusIcon} />;
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity style={[styles.container, isLeftGroup && styles.leftGroupContainer]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftSection}>
        <View style={styles.avatarContainer}>
          {chat.avatar ? (
            <Image source={{uri: chat.avatar}} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, {backgroundColor: chat.color || colors.gradientStart}]}>
              <Text style={styles.avatarText}>{getInitials(chat.name)}</Text>
            </View>
          )}
          {chat.isOnline && <View style={styles.onlineIndicator} />}
        </View>
      </View>
      
      <View style={styles.middleSection}>
        <Text style={styles.name} numberOfLines={1}>{chat.name}</Text>
        <View style={styles.messageRow}>
          {chat.isTyping ? (
            <Text style={styles.typingText}>typing...</Text>
          ) : (
            <View style={styles.lastMessageContainer}>
              {getStatusIcon()} 
              <Text style={styles.lastMessage} numberOfLines={1}>
                {chat.lastMessage}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={[styles.time, chat.unreadCount > 0 && styles.unreadTime]}>
          {chat.time}
        </Text>
        {chat.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </Text>
          </View>
        )}
      </View>

      {isLeftGroup && (
        <View style={styles.leftGroupBadge}>
          <Text style={styles.leftGroupBadgeText}>
            {chat.leftReason === 'removed' ? 'Removed' : 'Left'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.white,
  },
  leftSection: {
    marginRight: 15,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.online,
    borderWidth: 3,
    borderColor: colors.white,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.gray9,
    marginBottom: 4,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // flex: 1,
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    marginRight: 4,
  },
  lastMessage: {
    fontSize: 15,
    color: colors.gray6,
  },
  typingText: {
    fontSize: 15,
    color: colors.typing,
    fontStyle: 'italic',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  time: {
    fontSize: 13,
    color: colors.gray5,
    marginBottom: 4,
  },
  unreadTime: {
    color: colors.gradientStart,
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: colors.gradientStart,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  unreadText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  leftGroupContainer: {
    opacity: 0.7,
    backgroundColor: colors.gray1,
  },
  leftGroupBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  leftGroupBadgeText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '600',
  },
});

export default ChatItem;