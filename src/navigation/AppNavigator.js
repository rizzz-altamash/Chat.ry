// // ===== src/navigation/AppNavigator.js =====
// import React from 'react';
// import {createStackNavigator} from '@react-navigation/stack';
// import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import colors from '../styles/colors';

// // Screens
// import ChatsScreen from '../screens/ChatsScreen';
// import ChatDetailScreen from '../screens/ChatDetailScreen';
// import GroupsScreen from '../screens/GroupsScreen';
// import ProfileScreen from '../screens/ProfileScreen';
// import SettingsScreen from '../screens/SettingsScreen';
// import LoginScreen from '../screens/LoginScreen';

// const Stack = createStackNavigator();
// const Tab = createBottomTabNavigator();

// const TabNavigator = () => {
//   return (
//     <Tab.Navigator
//       screenOptions={{
//         tabBarActiveTintColor: colors.primary,
//         tabBarInactiveTintColor: colors.gray,
//         tabBarStyle: {
//           backgroundColor: colors.white,
//           borderTopWidth: 1,
//           borderTopColor: colors.borderColor,
//         },
//         headerStyle: {
//           backgroundColor: colors.primary,
//         },
//         headerTintColor: colors.white,
//         headerTitleStyle: {
//           fontWeight: '600',
//         },
//       }}>
//       <Tab.Screen
//         name="Chats"
//         component={ChatsScreen}
//         options={{
//           tabBarIcon: ({color, size}) => (
//             <Icon name="chat" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="Groups"
//         component={GroupsScreen}
//         options={{
//           tabBarIcon: ({color, size}) => (
//             <Icon name="group" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="Profile"
//         component={ProfileScreen}
//         options={{
//           tabBarIcon: ({color, size}) => (
//             <Icon name="person" size={size} color={color} />
//           ),
//         }}
//       />
//     </Tab.Navigator>
//   );
// };

// const AppNavigator = () => {
//   return (
//     <Stack.Navigator
//       screenOptions={{
//         headerStyle: {
//           backgroundColor: colors.primary,
//         },
//         headerTintColor: colors.white,
//         headerTitleStyle: {
//           fontWeight: '600',
//         },
//       }}>
//       <Stack.Screen
//         name="Login"
//         component={LoginScreen}
//         options={{headerShown: false}}
//       />
//       <Stack.Screen
//         name="Main"
//         component={TabNavigator}
//         options={{headerShown: false}}
//       />
//       <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
//       <Stack.Screen name="Settings" component={SettingsScreen} />
//     </Stack.Navigator>
//   );
// };

// export default AppNavigator;
























// ===== src/navigation/AppNavigator.js =====
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {View, StyleSheet, Platform } from 'react-native';
import colors from '../styles/colors';

// Screens
import ChatsScreen from '../screens/ChatsScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import GroupsScreen from '../screens/GroupsScreen';
import ContactsScreen from '../screens/ContactsScreen';
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
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
      <Stack.Screen name="Contacts" component={ContactsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} options={{headerShown: false}} />
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
});

export default AppNavigator;