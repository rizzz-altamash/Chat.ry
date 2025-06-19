// // src/navigation/AppNavigator.js
// import React, {useState, useEffect} from 'react';
// import {View, ActivityIndicator} from 'react-native';
// import {createStackNavigator} from '@react-navigation/stack';
// import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
// import Icon from 'react-native-vector-icons/Ionicons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {StyleSheet} from 'react-native';
// import colors from '../styles/colors';

// // Screens
// import ChatsScreen from '../screens/ChatsScreen';
// import ChatDetailScreen from '../screens/ChatDetailScreen';
// import ContactsScreen from '../screens/ContactsScreen';
// import GroupsScreen from '../screens/GroupsScreen';
// import ProfileScreen from '../screens/ProfileScreen';
// import SettingsScreen from '../screens/SettingsScreen';
// import LoginScreen from '../screens/LoginScreen';
// import OTPScreen from '../screens/OTPScreen';

// const Stack = createStackNavigator();
// const Tab = createBottomTabNavigator();

// const TabBarIcon = ({name, color, focused}) => {
//   return (
//     <View style={styles.iconContainer}>
//       <Icon name={name} size={focused ? 28 : 24} color={color} />
//       {focused && <View style={styles.activeIndicator} />}
//     </View>
//   );
// };

// const TabNavigator = () => {
//   return (
//     <Tab.Navigator
//       screenOptions={{
//         tabBarActiveTintColor: colors.gradientStart,
//         tabBarInactiveTintColor: colors.gray5,
//         tabBarStyle: {
//           backgroundColor: colors.white,
//           borderTopWidth: 0,
//           elevation: 20,
//           shadowColor: colors.shadowColor,
//           shadowOffset: {width: 0, height: -3},
//           shadowOpacity: 0.1,
//           shadowRadius: 5,
//           height: 65,
//           paddingTop: 10,
//           paddingBottom: 10,
//         },
//         tabBarShowLabel: false,
//         headerShown: false,
//       }}>
//       <Tab.Screen
//         name="Chats"
//         component={ChatsScreen}
//         options={{
//           tabBarIcon: ({color, focused}) => (
//             <TabBarIcon name="chatbubbles" color={color} focused={focused} />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="Groups"
//         component={GroupsScreen}
//         options={{
//           tabBarIcon: ({color, focused}) => (
//             <TabBarIcon name="people" color={color} focused={focused} />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="Profile"
//         component={ProfileScreen}
//         options={{
//           tabBarIcon: ({color, focused}) => (
//             <TabBarIcon name="person" color={color} focused={focused} />
//           ),
//         }}
//       />
//     </Tab.Navigator>
//   );
// };

// const AppNavigator = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [initialRoute, setInitialRoute] = useState('Login');

//   useEffect(() => {
//     checkAuthStatus();
//   }, []);

//   const checkAuthStatus = async () => {
//     try {
//       const token = await AsyncStorage.getItem('authToken');
//       const userData = await AsyncStorage.getItem('userData');
      
//       if (token && userData) {
//         setInitialRoute('Main');
//       } else {
//         setInitialRoute('Login');
//       }
//     } catch (error) {
//       console.error('Auth check error:', error);
//       setInitialRoute('Login');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Show loading screen while checking auth
//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={colors.gradientStart} />
//       </View>
//     );
//   }

//   // Always render all screens but with different initial route
//   return (
//     <Stack.Navigator
//       initialRouteName={initialRoute}
//       screenOptions={{
//         headerShown: false,
//       }}>
//       <Stack.Screen name="Login" component={LoginScreen} />
//       <Stack.Screen name="OTP" component={OTPScreen} />
//       <Stack.Screen name="Main" component={TabNavigator} />
//       <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
//       <Stack.Screen name="Contacts" component={ContactsScreen} />
//       <Stack.Screen name="Settings" component={SettingsScreen} />
//     </Stack.Navigator>
//   );
// };

// const styles = StyleSheet.create({
//   iconContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   activeIndicator: {
//     width: 4,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: colors.gradientStart,
//     marginTop: 4,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: colors.white,
//   },
// });

// export default AppNavigator;












// // src/navigation/AppNavigator.js
// import React, {useState, useEffect} from 'react';
// import {View, ActivityIndicator} from 'react-native';
// import {createStackNavigator} from '@react-navigation/stack';
// import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
// import Icon from 'react-native-vector-icons/Ionicons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {StyleSheet} from 'react-native';
// import colors from '../styles/colors';

// // Screens
// import ChatsScreen from '../screens/ChatsScreen';
// import ChatDetailScreen from '../screens/ChatDetailScreen';
// import ContactsScreen from '../screens/ContactsScreen';
// import GroupsScreen from '../screens/GroupsScreen';
// import CreateGroupScreen from '../screens/CreateGroupScreen';
// import GroupDetailScreen from '../screens/GroupDetailScreen';
// import AddGroupMembersScreen from '../screens/AddGroupMembersScreen';
// import ProfileScreen from '../screens/ProfileScreen';
// import SettingsScreen from '../screens/SettingsScreen';
// import LoginScreen from '../screens/LoginScreen';
// import OTPScreen from '../screens/OTPScreen';

// const Stack = createStackNavigator();
// const Tab = createBottomTabNavigator();

// const TabBarIcon = ({name, color, focused}) => {
//   return (
//     <View style={styles.iconContainer}>
//       <Icon name={name} size={focused ? 28 : 24} color={color} />
//       {focused && <View style={styles.activeIndicator} />}
//     </View>
//   );
// };

// const TabNavigator = () => {
//   return (
//     <Tab.Navigator
//       screenOptions={{
//         tabBarActiveTintColor: colors.gradientStart,
//         tabBarInactiveTintColor: colors.gray5,
//         tabBarStyle: {
//           backgroundColor: colors.white,
//           borderTopWidth: 0,
//           elevation: 20,
//           shadowColor: colors.shadowColor,
//           shadowOffset: {width: 0, height: -3},
//           shadowOpacity: 0.1,
//           shadowRadius: 5,
//           height: 65,
//           paddingTop: 10,
//           paddingBottom: 10,
//         },
//         tabBarShowLabel: false,
//         headerShown: false,
//       }}>
//       <Tab.Screen
//         name="Chats"
//         component={ChatsScreen}
//         options={{
//           tabBarIcon: ({color, focused}) => (
//             <TabBarIcon name="chatbubbles" color={color} focused={focused} />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="Groups"
//         component={GroupsScreen}
//         options={{
//           tabBarIcon: ({color, focused}) => (
//             <TabBarIcon name="people" color={color} focused={focused} />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="Profile"
//         component={ProfileScreen}
//         options={{
//           tabBarIcon: ({color, focused}) => (
//             <TabBarIcon name="person" color={color} focused={focused} />
//           ),
//         }}
//       />
//     </Tab.Navigator>
//   );
// };

// const AppNavigator = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [initialRoute, setInitialRoute] = useState('Login');

//   useEffect(() => {
//     checkAuthStatus();
//   }, []);

//   const checkAuthStatus = async () => {
//     try {
//       const token = await AsyncStorage.getItem('authToken');
//       const userData = await AsyncStorage.getItem('userData');
      
//       if (token && userData) {
//         setInitialRoute('Main');
//       } else {
//         setInitialRoute('Login');
//       }
//     } catch (error) {
//       console.error('Auth check error:', error);
//       setInitialRoute('Login');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Show loading screen while checking auth
//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={colors.gradientStart} />
//       </View>
//     );
//   }

//   // Always render all screens but with different initial route
//   return (
//     <Stack.Navigator
//       initialRouteName={initialRoute}
//       screenOptions={{
//         headerShown: false,
//       }}>
//       <Stack.Screen name="Login" component={LoginScreen} />
//       <Stack.Screen name="OTP" component={OTPScreen} />
//       <Stack.Screen name="Main" component={TabNavigator} />
//       <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
//       <Stack.Screen name="Contacts" component={ContactsScreen} />
//       <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
//       <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
//       <Stack.Screen name="AddGroupMembers" component={AddGroupMembersScreen} />
//       <Stack.Screen name="Settings" component={SettingsScreen} />
//     </Stack.Navigator>
//   );
// };

// const styles = StyleSheet.create({
//   iconContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   activeIndicator: {
//     width: 4,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: colors.gradientStart,
//     marginTop: 4,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: colors.white,
//   },
// });

// export default AppNavigator;










// src/navigation/AppNavigator.js
import React, {useState, useEffect} from 'react';
import {View, ActivityIndicator} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StyleSheet} from 'react-native';
import colors from '../styles/colors';

// Screens
import ChatsScreen from '../screens/ChatsScreen';
import UserInfoScreen from '../screens/UserInfoScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import ContactsScreen from '../screens/ContactsScreen';
import GroupsScreen from '../screens/GroupsScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import GroupDetailScreen from '../screens/GroupDetailScreen';
import AddGroupMembersScreen from '../screens/AddGroupMembersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import OTPScreen from '../screens/OTPScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabBarIcon = ({name, color, focused}) => {
  return (
    <View style={styles.iconContainer}>
      <Icon name={name} size={focused ? 28 : 24} color={color} />
      {focused && <View style={styles.activeIndicator} />}
    </View>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.gradientStart,
        tabBarInactiveTintColor: colors.gray5,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: colors.shadowColor,
          shadowOffset: {width: 0, height: -3},
          shadowOpacity: 0.1,
          shadowRadius: 5,
          height: 65,
          paddingTop: 10,
          paddingBottom: 10,
        },
        tabBarShowLabel: false,
        headerShown: false,
      }}>
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <TabBarIcon name="chatbubbles" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupsScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <TabBarIcon name="people" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <TabBarIcon name="person" color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        setInitialRoute('Main');
      } else {
        setInitialRoute('Login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setInitialRoute('Login');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.gradientStart} />
      </View>
    );
  }

  // Always render all screens but with different initial route
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
      <Stack.Screen name="UserInfo" component={UserInfoScreen} />
      <Stack.Screen name="Contacts" component={ContactsScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <Stack.Screen name="AddGroupMembers" component={AddGroupMembersScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gradientStart,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
});

export default AppNavigator;