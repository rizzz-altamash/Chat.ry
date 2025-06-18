// src/screens/ContactsScreen.js

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import colors from '../styles/colors';
import contactService from '../services/contactService';
import api from '../services/api';

const ContactsScreen = ({navigation}) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const syncedContacts = await contactService.syncContacts();
      setContacts(syncedContacts);
    } catch (error) {
      Alert.alert('Error', 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const searchByUsername = async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await api.searchUsers(query);
      setSearchResults(response.users);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleContactPress = async (contact) => {
    // Add to contacts if not already added
    if (!contact.isContact) {
      await api.addContact(contact._id);
    }

    // Navigate to chat
    navigation.navigate('ChatDetail', {
      chatId: contact._id,
      chatName: contact.name || contact.username,
      chatColor: colors.accent
    });
  };

  const renderContact = ({item}) => (
    <TouchableOpacity style={styles.contactItem} onPress={() => handleContactPress(item)}>
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{uri: item.avatar}} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, {backgroundColor: colors.accent}]}>
            <Text style={styles.avatarText}>
              {(item.savedName || item.name || item.username || '?')[0].toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>
          {item.savedName || item.name || item.username}
        </Text>
        {item.username && (
          <Text style={styles.username}>@{item.username}</Text>
        )}
        <Text style={styles.status} numberOfLines={1}>
          {item.status || 'Hey there!'}
        </Text>
      </View>

      <TouchableOpacity style={styles.messageButton}>
        <Icon name="chatbubble-outline" size={24} color={colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Contact</Text>
          <TouchableOpacity onPress={loadContacts}>
            <Icon name="refresh" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.gray6} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by username..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              searchByUsername(text);
            }}
            placeholderTextColor={colors.gray5}
          />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Syncing contacts...</Text>
        </View>
      ) : (
        <FlatList
          data={searchQuery ? searchResults : contacts}
          renderItem={renderContact}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="people-outline" size={64} color={colors.gray5} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No users found' : 'No contacts using Chatry'}
              </Text>
              <TouchableOpacity style={styles.inviteButton}>
                <Text style={styles.inviteText}>Invite Friends</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
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
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    height: 45,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: colors.gray9,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: colors.gray6,
    fontSize: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray2,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '600',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.gray9,
  },
  username: {
    fontSize: 14,
    color: colors.gradientStart,
    marginTop: 2,
  },
  status: {
    fontSize: 14,
    color: colors.gray6,
    marginTop: 2,
  },
  messageButton: {
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray6,
    marginTop: 10,
  },
  inviteButton: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 25,
  },
  inviteText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ContactsScreen;