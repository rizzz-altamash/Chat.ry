// src/components/MessageBubble.js
import React from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../styles/colors';

const MessageBubble = ({message, isSent, isGroup = false}) => {
  const getStatusIcon = () => {
    if (!isSent) return null;
    
    if (message.sending) {
      return <ActivityIndicator size="small" color={colors.gray4} style={styles.statusIcon} />;
    }

    // Use groupStatus for groups, regular status for private chats
    const status = isGroup ? message.groupStatus : message.status;
    
    switch (status) {
      case 'sent':
        return (
          <Icon 
            name="checkmark" 
            size={16} 
            color={colors.gray4}
            style={styles.statusIcon}
          />
        );
      case 'delivered':
        return (
          <Icon 
            name="checkmark-done" 
            size={16} 
            color={colors.gray4}
            style={styles.statusIcon}
          />
        );
      case 'read':
        return (
          <Icon 
            name="checkmark-done" 
            size={16} 
            color={colors.info}
            style={styles.statusIcon}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View
      style={[
        styles.container,
        isSent ? styles.sentContainer : styles.receivedContainer,
      ]}>
      <View
        style={[
          styles.bubble,
          isSent ? styles.sentBubble : styles.receivedBubble,
          message.sending && styles.sendingBubble,
        ]}>
        <Text style={[styles.messageText, isSent ? styles.sentText : styles.receivedText]}>
          {message.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[styles.time, isSent ? styles.sentTime : styles.receivedTime]}>
            {message.time}
          </Text>
          {getStatusIcon()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  sentContainer: {
    alignItems: 'flex-end',
  },
  receivedContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 1,
    shadowColor: colors.shadowColor,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  sentBubble: {
    backgroundColor: colors.sentMessage,
    borderBottomRightRadius: 5,
  },
  receivedBubble: {
    backgroundColor: colors.receivedMessage,
    borderBottomLeftRadius: 5,
  },
  sendingBubble: {
    opacity: 0.7,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  sentText: {
    color: colors.sentMessageText,
  },
  receivedText: {
    color: colors.receivedMessageText,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  time: {
    fontSize: 12,
  },
  sentTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  receivedTime: {
    color: colors.gray5,
  },
  statusIcon: {
    marginLeft: 4,
  },
});

export default MessageBubble;