// // ===== src/components/ChatItem.js =====
// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import colors from '../styles/colors';

// const ChatItem = ({chat, onPress}) => {
//   return (
//     <TouchableOpacity style={styles.container} onPress={onPress}>
//       <View style={styles.avatarContainer}>
//         {chat.avatar ? (
//           <Image source={{uri: chat.avatar}} style={styles.avatar} />
//         ) : (
//           <View style={styles.avatarPlaceholder}>
//             <Icon name="person" size={30} color={colors.white} />
//           </View>
//         )}
//         {chat.isOnline && <View style={styles.onlineIndicator} />}
//       </View>
      
//       <View style={styles.contentContainer}>
//         <View style={styles.topRow}>
//           <Text style={styles.name} numberOfLines={1}>{chat.name}</Text>
//           <Text style={styles.time}>{chat.time}</Text>
//         </View>
//         <View style={styles.bottomRow}>
//           <Text style={styles.lastMessage} numberOfLines={1}>
//             {chat.lastMessage}
//           </Text>
//           {chat.unreadCount > 0 && (
//             <View style={styles.unreadBadge}>
//               <Text style={styles.unreadText}>{chat.unreadCount}</Text>
//             </View>
//           )}
//         </View>
//       </View>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     padding: 16,
//     backgroundColor: colors.white,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.borderColor,
//   },
//   avatarContainer: {
//     position: 'relative',
//     marginRight: 12,
//   },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//   },
//   avatarPlaceholder: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: colors.gray,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   onlineIndicator: {
//     position: 'absolute',
//     bottom: 2,
//     right: 2,
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: colors.online,
//     borderWidth: 2,
//     borderColor: colors.white,
//   },
//   contentContainer: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   topRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 4,
//   },
//   bottomRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   name: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: colors.textPrimary,
//     flex: 1,
//   },
//   time: {
//     fontSize: 12,
//     color: colors.textSecondary,
//   },
//   lastMessage: {
//     fontSize: 14,
//     color: colors.textSecondary,
//     flex: 1,
//   },
//   unreadBadge: {
//     backgroundColor: colors.secondary,
//     borderRadius: 10,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     minWidth: 20,
//     alignItems: 'center',
//   },
//   unreadText: {
//     color: colors.white,
//     fontSize: 12,
//     fontWeight: '600',
//   },
// });

// export default ChatItem;





















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

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
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
            <Text style={styles.lastMessage} numberOfLines={1}>
              {chat.lastMessage}
            </Text>
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
});

export default ChatItem;