// src/screens/ProfileScreen.js
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../styles/colors';
import api from '../services/api';
import websocket from '../services/websocket';

const ProfileScreen = ({navigation}) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadUserData();
  }, []);
  
  const loadUserData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('userData');
      if (userStr) {
        setUserData(JSON.parse(userStr));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };
  
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              // Call logout API
              await api.logout();
              
              // Disconnect websocket
              websocket.disconnect();
              
              // Clear local storage
              await AsyncStorage.multiRemove([
                'authToken',
                'userData',
                'lastUsedCountryCode'
              ]);
              
              // Navigate to login screen and reset navigation stack
              navigation.reset({
                index: 0,
                routes: [{name: 'Login'}],
              });
              
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
              <Text style={styles.avatarText}>
                {getInitials(userData?.name)}
              </Text>
            </LinearGradient>
            <TouchableOpacity style={styles.cameraButton}>
              <Icon name="camera" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{userData?.name || 'Loading...'}</Text>
          {userData?.username && (
            <Text style={styles.userUsername}>@{userData.username}</Text>
          )}
          <Text style={styles.userPhone}>{userData?.phone || ''}</Text>
          <View style={styles.statusContainer}>
            <Icon name="chatbubble-ellipses-outline" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.userStatus}>
              {userData?.status || "Hey there! I'm using Chatry"}
            </Text>
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

      <TouchableOpacity 
        style={[styles.logoutButton, loading && styles.logoutButtonDisabled]} 
        activeOpacity={0.8}
        onPress={handleLogout}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.danger} />
        ) : (
          <>
            <Icon name="log-out-outline" size={20} color={colors.danger} />
            <Text style={styles.logoutText}>Log Out</Text>
          </>
        )}
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
  userUsername: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
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
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen;