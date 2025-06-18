// // ===== src/components/MessageBubble.js =====
// import React from 'react';
// import {View, Text, StyleSheet} from 'react-native';
// import colors from '../styles/colors';

// const MessageBubble = ({message, isSent}) => {
//   return (
//     <View
//       style={[
//         styles.container,
//         isSent ? styles.sentContainer : styles.receivedContainer,
//       ]}>
//       <View
//         style={[
//           styles.bubble,
//           isSent ? styles.sentBubble : styles.receivedBubble,
//         ]}>
//         <Text style={styles.messageText}>{message.text}</Text>
//         <Text style={styles.time}>{message.time}</Text>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//   },
//   sentContainer: {
//     alignItems: 'flex-end',
//   },
//   receivedContainer: {
//     alignItems: 'flex-start',
//   },
//   bubble: {
//     maxWidth: '80%',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 8,
//   },
//   sentBubble: {
//     backgroundColor: colors.sentMessage,
//     borderTopRightRadius: 0,
//   },
//   receivedBubble: {
//     backgroundColor: colors.receivedMessage,
//     borderTopLeftRadius: 0,
//   },
//   messageText: {
//     fontSize: 16,
//     color: colors.textPrimary,
//   },
//   time: {
//     fontSize: 11,
//     color: colors.textSecondary,
//     marginTop: 4,
//   },
// });

// export default MessageBubble;

























// ===== src/components/MessageBubble.js =====
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../styles/colors';

const MessageBubble = ({message, isSent}) => {
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
        ]}>
        <Text style={[styles.messageText, isSent ? styles.sentText : styles.receivedText]}>
          {message.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[styles.time, isSent ? styles.sentTime : styles.receivedTime]}>
            {message.time}
          </Text>
          {isSent && (
            <Icon 
              name={message.read ? "checkmark-done" : "checkmark"} 
              size={16} 
              color={message.read ? colors.info : colors.gray4}
              style={styles.readIcon}
            />
          )}
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
  readIcon: {
    marginLeft: 4,
  },
});

export default MessageBubble;