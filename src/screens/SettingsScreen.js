// ===== src/screens/SettingsScreen.js =====
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import colors from '../styles/colors';

const SettingsScreen = ({navigation}) => {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [vibration, setVibration] = React.useState(true);

  const settingsSections = [
    {
      title: 'Preferences',
      items: [
        {
          icon: 'notifications-outline',
          label: 'Push Notifications',
          type: 'switch',
          value: notifications,
          onValueChange: setNotifications,
        },
        {
          icon: 'moon-outline',
          label: 'Dark Mode',
          type: 'switch',
          value: darkMode,
          onValueChange: setDarkMode,
        },
        {
          icon: 'volume-high-outline',
          label: 'Message Sounds',
          type: 'switch',
          value: soundEnabled,
          onValueChange: setSoundEnabled,
        },
        {
          icon: 'phone-portrait-outline',
          label: 'Vibration',
          type: 'switch',
          value: vibration,
          onValueChange: setVibration,
        },
      ],
    },
    {
      title: 'Chat Settings',
      items: [
        {icon: 'color-palette-outline', label: 'Chat Themes', type: 'navigation'},
        {icon: 'text-outline', label: 'Font Size', type: 'navigation'},
        {icon: 'download-outline', label: 'Auto-Download Media', type: 'navigation'},
        {icon: 'cloud-upload-outline', label: 'Backup Chats', type: 'navigation'},
      ],
    },
    {
      title: 'Storage',
      items: [
        {icon: 'folder-outline', label: 'Storage Usage', type: 'navigation'},
        {icon: 'trash-outline', label: 'Clear Cache', type: 'navigation'},
      ],
    },
  ];

  const renderSettingItem = (item) => {
    if (item.type === 'switch') {
      return (
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={styles.iconContainer}>
              <Icon name={item.icon} size={20} color={colors.gradientStart} />
            </View>
            <Text style={styles.settingLabel}>{item.label}</Text>
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onValueChange}
            trackColor={{false: colors.gray3, true: colors.gradientStart}}
            thumbColor={item.value ? colors.white : colors.gray5}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
        <View style={styles.settingLeft}>
          <View style={styles.iconContainer}>
            <Icon name={item.icon} size={20} color={colors.gradientStart} />
          </View>
          <Text style={styles.settingLabel}>{item.label}</Text>
        </View>
        <Icon name="chevron-forward" size={20} color={colors.gray5} />
      </TouchableOpacity>
    );
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
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  {renderSettingItem(item)}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
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
    alignItems: 'center',
  },
  backButton: {
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray6,
    marginBottom: 10,
    marginHorizontal: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.gray1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.gray8,
    fontWeight: '500',
  },
});

export default SettingsScreen;