// // ===== src/screens/ProfileScreen.js =====
// import React from 'react';
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import colors from '../styles/colors';

// const ProfileScreen = ({navigation}) => {
//   const profileOptions = [
//     {icon: 'person', label: 'Account', onPress: () => {}},
//     {icon: 'lock', label: 'Privacy', onPress: () => {}},
//     {icon: 'notifications', label: 'Notifications', onPress: () => {}},
//     {icon: 'settings', label: 'Settings', onPress: () => navigation.navigate('Settings')},
//     {icon: 'help', label: 'Help', onPress: () => {}},
//   ];

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.profileHeader}>
//         <TouchableOpacity style={styles.avatarContainer}>
//           <View style={styles.avatarPlaceholder}>
//             <Icon name="camera-alt" size={30} color={colors.white} />
//           </View>
//         </TouchableOpacity>
//         <Text style={styles.userName}>John Doe</Text>
//         <Text style={styles.userStatus}>Hey there! I'm using Chatry</Text>
//       </View>

//       <View style={styles.optionsContainer}>
//         {profileOptions.map((option, index) => (
//           <TouchableOpacity
//             key={index}
//             style={styles.optionItem}
//             onPress={option.onPress}>
//             <Icon name={option.icon} size={24} color={colors.primary} />
//             <Text style={styles.optionLabel}>{option.label}</Text>
//             <Icon name="chevron-right" size={24} color={colors.gray} />
//           </TouchableOpacity>
//         ))}
//       </View>

//       <TouchableOpacity style={styles.logoutButton}>
//         <Text style={styles.logoutText}>Log Out</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.white,
//   },
//   profileHeader: {
//     alignItems: 'center',
//     paddingVertical: 30,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.borderColor,
//   },
//   avatarContainer: {
//     marginBottom: 16,
//   },
//   avatarPlaceholder: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     backgroundColor: colors.gray,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   userName: {
//     fontSize: 24,
//     fontWeight: '600',
//     color: colors.textPrimary,
//     marginBottom: 4,
//   },
//   userStatus: {
//     fontSize: 14,
//     color: colors.textSecondary,
//   },
//   optionsContainer: {
//     marginTop: 20,
//   },
//   optionItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.borderColor,
//   },
//   optionLabel: {
//     flex: 1,
//     fontSize: 16,
//     color: colors.textPrimary,
//     marginLeft: 20,
//   },
//   logoutButton: {
//     margin: 20,
//     padding: 16,
//     backgroundColor: colors.danger,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   logoutText: {
//     color: colors.white,
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// export default ProfileScreen;


















// ===== src/screens/ProfileScreen.js =====
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import colors from '../styles/colors';

const ProfileScreen = ({navigation}) => {
  const profileOptions = [
    {icon: 'person-outline', label: 'Edit Profile', onPress: () => {}},
    {icon: 'image-outline', label: 'Change Avatar', onPress: () => {}},
    {icon: 'lock-closed-outline', label: 'Privacy', onPress: () => {}},
    {icon: 'notifications-outline', label: 'Notifications', onPress: () => {}},
    {icon: 'shield-checkmark-outline', label: 'Security', onPress: () => {}},
    {icon: 'settings-outline', label: 'Settings', onPress: () => navigation.navigate('Settings')},
    {icon: 'help-circle-outline', label: 'Help & Support', onPress: () => {}},
    {icon: 'information-circle-outline', label: 'About', onPress: () => {}},
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#FF6B6B', '#4ECDC4']}
              style={styles.avatarGradient}>
              <Text style={styles.avatarText}>JD</Text>
            </LinearGradient>
            <TouchableOpacity style={styles.cameraButton}>
              <Icon name="camera" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userPhone}>+1 234 567 890</Text>
          <View style={styles.statusContainer}>
            <Icon name="chatbubble-ellipses-outline" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.userStatus}>Hey there! I'm using Chatry</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.optionsContainer}>
        {profileOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionItem}
            onPress={option.onPress}
            activeOpacity={0.7}>
            <View style={styles.optionIcon}>
              <Icon name={option.icon} size={24} color={colors.gradientStart} />
            </View>
            <Text style={styles.optionLabel}>{option.label}</Text>
            <Icon name="chevron-forward" size={20} color={colors.gray5} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8}>
        <Icon name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 30,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.white,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gradientEnd,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  userStatus: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 6,
  },
  optionsContainer: {
    backgroundColor: colors.white,
    marginTop: -20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray2,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.gray1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.gray8,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen;