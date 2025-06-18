// // ===== src/screens/GroupsScreen.js =====
// import React from 'react';
// import {View, FlatList, StyleSheet} from 'react-native';
// import ChatItem from '../components/ChatItem';
// import FloatingButton from '../components/FloatingButton';
// import colors from '../styles/colors';

// const GroupsScreen = ({navigation}) => {
//   // Mock data - replace with real data
//   const groups = [
//     {
//       id: '1',
//       name: 'Family Group',
//       lastMessage: 'Mom: See you all on Sunday!',
//       time: '2:30 PM',
//       unreadCount: 5,
//     },
//     {
//       id: '2',
//       name: 'Work Team',
//       lastMessage: 'Boss: Meeting at 3 PM',
//       time: '1:00 PM',
//       unreadCount: 0,
//     },
//     {
//       id: '3',
//       name: 'College Friends',
//       lastMessage: 'Anyone up for reunion?',
//       time: 'Yesterday',
//       unreadCount: 12,
//     },
//   ];

//   const handleGroupPress = (group) => {
//     navigation.navigate('ChatDetail', {
//       chatId: group.id,
//       chatName: group.name,
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={groups}
//         keyExtractor={(item) => item.id}
//         renderItem={({item}) => (
//           <ChatItem chat={item} onPress={() => handleGroupPress(item)} />
//         )}
//       />
//       <FloatingButton icon="group-add" onPress={() => {}} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.white,
//   },
// });

// export default GroupsScreen;






















// ===== src/screens/GroupsScreen.js =====
import React from 'react';
import {View, FlatList, StyleSheet, Text, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ChatItem from '../components/ChatItem';
import FloatingButton from '../components/FloatingButton';
import colors from '../styles/colors';

const GroupsScreen = ({navigation}) => {
  const chatColors = ['#96CEB4', '#DDA0DD', '#FFB347', '#87CEEB'];
  
  const groups = [
    {
      id: '1',
      name: 'Family Group',
      lastMessage: 'Mom: See you all on Sunday!',
      time: '2:30 PM',
      unreadCount: 5,
      color: chatColors[0],
    },
    {
      id: '2',
      name: 'Work Team',
      lastMessage: 'Boss: Meeting at 3 PM',
      time: '1:00 PM',
      unreadCount: 0,
      color: chatColors[1],
    },
    {
      id: '3',
      name: 'College Friends',
      lastMessage: 'Anyone up for reunion?',
      time: 'Yesterday',
      unreadCount: 12,
      color: chatColors[2],
    },
    {
      id: '4',
      name: 'Book Club',
      lastMessage: 'Next book: The Great Gatsby',
      time: '3 days ago',
      unreadCount: 0,
      color: chatColors[3],
    },
  ];

  const handleGroupPress = (group) => {
    navigation.navigate('ChatDetail', {
      chatId: group.id,
      chatName: group.name,
      chatColor: group.color,
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}>
        <Text style={styles.headerTitle}>Groups</Text>
      </LinearGradient>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <ChatItem chat={item} onPress={() => handleGroupPress(item)} />
        )}
        contentContainerStyle={styles.listContent}
      />
      
      <FloatingButton icon="people-outline" onPress={() => {}} />
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
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
  },
  listContent: {
    paddingVertical: 10,
  },
});

export default GroupsScreen;