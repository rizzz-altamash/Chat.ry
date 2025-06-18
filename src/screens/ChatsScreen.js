// // ===== src/screens/ChatsScreen.js =====
// import React from 'react';
// import {
//   View,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import ChatItem from '../components/ChatItem';
// import FloatingButton from '../components/FloatingButton';
// import colors from '../styles/colors';

// const ChatsScreen = ({navigation}) => {
//   // Mock data - replace with real data from WebSocket
//   const chats = [
//     {
//       id: '1',
//       name: 'John Doe',
//       lastMessage: 'Hey, how are you doing?',
//       time: '10:30 AM',
//       unreadCount: 2,
//       isOnline: true,
//     },
//     {
//       id: '2',
//       name: 'Jane Smith',
//       lastMessage: 'See you tomorrow!',
//       time: 'Yesterday',
//       unreadCount: 0,
//       isOnline: false,
//     },
//     {
//       id: '3',
//       name: 'Mike Johnson',
//       lastMessage: 'Thanks for the help',
//       time: 'Monday',
//       unreadCount: 0,
//       isOnline: true,
//     },
//   ];

//   React.useLayoutEffect(() => {
//     navigation.setOptions({
//       headerRight: () => (
//         <TouchableOpacity
//           onPress={() => navigation.navigate('Settings')}
//           style={{marginRight: 16}}>
//           <Icon name="more-vert" size={24} color={colors.white} />
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   const handleChatPress = (chat) => {
//     navigation.navigate('ChatDetail', {
//       chatId: chat.id,
//       chatName: chat.name,
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={chats}
//         keyExtractor={(item) => item.id}
//         renderItem={({item}) => (
//           <ChatItem chat={item} onPress={() => handleChatPress(item)} />
//         )}
//       />
//       <FloatingButton icon="message" onPress={() => {}} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.white,
//   },
// });

// export default ChatsScreen;























// ===== src/screens/ChatsScreen.js =====
import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import ChatItem from '../components/ChatItem';
import FloatingButton from '../components/FloatingButton';
import colors from '../styles/colors';

const ChatsScreen = ({navigation}) => {
  const chatColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  
  const chats = [
    {
      id: '1',
      name: 'John Doe',
      lastMessage: 'Hey, how are you doing?',
      time: '10:30 AM',
      unreadCount: 2,
      isOnline: true,
      color: chatColors[0],
    },
    {
      id: '2',
      name: 'Jane Smith',
      lastMessage: 'See you tomorrow!',
      time: 'Yesterday',
      unreadCount: 0,
      isOnline: false,
      color: chatColors[1],
    },
    {
      id: '3',
      name: 'Mike Johnson',
      lastMessage: 'Thanks for the help',
      time: 'Monday',
      unreadCount: 0,
      isOnline: true,
      isTyping: true,
      color: chatColors[2],
    },
    {
      id: '4',
      name: 'Sarah Williams',
      lastMessage: 'That sounds great! Let me know when you\'re free',
      time: '2 days ago',
      unreadCount: 5,
      isOnline: false,
      color: chatColors[3],
    },
  ];

  const handleChatPress = (chat) => {
    navigation.navigate('ChatDetail', {
      chatId: chat.id,
      chatName: chat.name,
      chatColor: chat.color,
    });
  };

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
        renderItem={({item}) => (
          <ChatItem chat={item} onPress={() => handleChatPress(item)} />
        )}
        contentContainerStyle={styles.listContent}
      />
      
      <FloatingButton icon="create-outline" onPress={() => navigation.navigate('Contacts')} />
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
});

export default ChatsScreen;