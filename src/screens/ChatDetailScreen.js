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
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import MessageBubble from '../components/MessageBubble';
// import colors from '../styles/colors';

// const ChatDetailScreen = ({route, navigation}) => {
//   const {chatName} = route.params;
//   const [inputText, setInputText] = useState('');
//   const flatListRef = useRef(null);
  
//   // Mock messages - replace with real data from WebSocket
//   const [messages, setMessages] = useState([
//     {
//       id: '1',
//       text: 'Hey, how are you doing?',
//       time: '10:30 AM',
//       isSent: false,
//     },
//     {
//       id: '2',
//       text: "I'm doing great! How about you?",
//       time: '10:31 AM',
//       isSent: true,
//     },
//     {
//       id: '3',
//       text: 'Pretty good, just working on some projects',
//       time: '10:32 AM',
//       isSent: false,
//     },
//   ]);

//   React.useLayoutEffect(() => {
//     navigation.setOptions({
//       title: chatName,
//       headerRight: () => (
//         <View style={styles.headerRight}>
//           <TouchableOpacity style={styles.headerButton}>
//             <Icon name="videocam" size={24} color={colors.white} />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.headerButton}>
//             <Icon name="call" size={24} color={colors.white} />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.headerButton}>
//             <Icon name="more-vert" size={24} color={colors.white} />
//           </TouchableOpacity>
//         </View>
//       ),
//     });
//   }, [navigation, chatName]);

//   const sendMessage = () => {
//     if (inputText.trim()) {
//       const newMessage = {
//         id: Date.now().toString(),
//         text: inputText,
//         time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
//         isSent: true,
//       };
      
//       setMessages([...messages, newMessage]);
//       setInputText('');
      
//       // TODO: Send message via WebSocket
      
//       setTimeout(() => {
//         flatListRef.current?.scrollToEnd();
//       }, 100);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       keyboardVerticalOffset={90}>
//       <View style={styles.messagesContainer}>
//         <FlatList
//           ref={flatListRef}
//           data={messages}
//           keyExtractor={(item) => item.id}
//           renderItem={({item}) => (
//             <MessageBubble message={item} isSent={item.isSent} />
//           )}
//           contentContainerStyle={styles.messagesList}
//         />
//       </View>
      
//       <View style={styles.inputContainer}>
//         <TouchableOpacity style={styles.attachButton}>
//           <Icon name="attach-file" size={24} color={colors.gray} />
//         </TouchableOpacity>
        
//         <TextInput
//           style={styles.textInput}
//           placeholder="Type a message"
//           value={inputText}
//           onChangeText={setInputText}
//           multiline
//           maxHeight={100}
//           placeholderTextColor={colors.gray}
//         />
        
//         <TouchableOpacity
//           style={styles.sendButton}
//           onPress={sendMessage}>
//           <Icon
//             name={inputText.trim() ? 'send' : 'mic'}
//             size={24}
//             color={colors.white}
//           />
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.chatBackground,
//   },
//   headerRight: {
//     flexDirection: 'row',
//     marginRight: 8,
//   },
//   headerButton: {
//     padding: 8,
//   },
//   messagesContainer: {
//     flex: 1,
//   },
//   messagesList: {
//     paddingVertical: 10,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     paddingHorizontal: 8,
//     paddingVertical: 8,
//     backgroundColor: colors.white,
//     borderTopWidth: 1,
//     borderTopColor: colors.borderColor,
//   },
//   attachButton: {
//     padding: 8,
//   },
//   textInput: {
//     flex: 1,
//     minHeight: 40,
//     maxHeight: 100,
//     backgroundColor: colors.inputBackground,
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     marginHorizontal: 8,
//     fontSize: 16,
//     color: colors.textPrimary,
//   },
//   sendButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: colors.primary,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

// export default ChatDetailScreen;



















// ===== src/screens/ChatDetailScreen.js =====
import React, {useState, useRef} from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import MessageBubble from '../components/MessageBubble';
import colors from '../styles/colors';

const ChatDetailScreen = ({route, navigation}) => {
  const {chatName, chatColor} = route.params;
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);
  
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hey, how are you doing?',
      time: '10:30 AM',
      isSent: false,
      read: true,
    },
    {
      id: '2',
      text: "I'm doing great! How about you?",
      time: '10:31 AM',
      isSent: true,
      read: true,
    },
    {
      id: '3',
      text: 'Pretty good, just working on some projects',
      time: '10:32 AM',
      isSent: false,
      read: true,
    },
    {
      id: '4',
      text: 'That sounds interesting! What kind of projects?',
      time: '10:33 AM',
      isSent: true,
      read: false,
    },
  ]);

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: inputText,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
        isSent: true,
        read: false,
      };
      
      setMessages([...messages, newMessage]);
      setInputText('');
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd();
      }, 100);
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
              <Text style={styles.headerStatus}>Online</Text>
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
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({item}) => (
            <MessageBubble message={item} isSent={item.isSent} />
          )}
          contentContainerStyle={styles.messagesList}
        />
        
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Icon name="add-circle-outline" size={28} color={colors.gray6} />
          </TouchableOpacity>
          
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              value={inputText}
              onChangeText={setInputText}
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
  headerStatus: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
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