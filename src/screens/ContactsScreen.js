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
  const [searchMode, setSearchMode] = useState('username'); // 'username' or 'contacts'

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
      const response = await api.searchByUsername(query);
      setSearchResults(response.users);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleContactPress = async (contact) => {
    // Check if this is a username search result (not in contacts)
    if (!contact.isContact && searchMode === 'username') {
      // Show confirmation
      Alert.alert(
        'Start Chat',
        `Start chatting with @${contact.username}? They are not in your contacts.`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Start Chat',
            onPress: async () => {
              // Navigate to chat
              navigation.navigate('ChatDetail', {
                chatId: contact._id || contact.id,
                chatName: contact.name || contact.username,
                chatColor: colors.accent,
                username: contact.username,
                isContact: false
              });
            }
          }
        ]
      );
    } else {
      // Regular contact - add if needed and navigate
      if (!contact.isContact) {
        await api.addContact(contact._id || contact.id);
      }

      navigation.navigate('ChatDetail', {
        chatId: contact._id || contact.id,
        chatName: contact.savedName || contact.name || contact.username,
        chatColor: colors.accent,
        username: contact.username,
        participant: contact, // Pass full user object
        isContact: true
      });
    }
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
        {!item.isContact && searchMode === 'username' && (
          <View style={styles.notContactBadge}>
            <Icon name="at" size={12} color={colors.warning} />
            <Text style={styles.notContactText}>Not in contacts</Text>
          </View>
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
          <Text style={styles.headerTitle}>
            {searchMode === 'username' ? 'Find by Username' : 'Select Contact'}
          </Text>
          <TouchableOpacity onPress={loadContacts}>
            <Icon name="refresh" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.searchSection}>
        {/* Search Mode Toggle */}
        <View style={styles.searchModeToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, searchMode === 'username' && styles.activeToggle]}
            onPress={() => {
              setSearchMode('username');
              setSearchQuery('');
              setSearchResults([]);
            }}>
            <Icon name="at" size={16} color={searchMode === 'username' ? colors.white : colors.gray6} />
            <Text style={[styles.toggleText, searchMode === 'username' && styles.activeToggleText]}>
              Username
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toggleButton, searchMode === 'contacts' && styles.activeToggle]}
            onPress={() => {
              setSearchMode('contacts');
              setSearchQuery('');
              setSearchResults([]);
            }}>
            <Icon name="people" size={16} color={searchMode === 'contacts' ? colors.white : colors.gray6} />
            <Text style={[styles.toggleText, searchMode === 'contacts' && styles.activeToggleText]}>
              Contacts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.gray6} />
          <TextInput
            style={styles.searchInput}
            placeholder={searchMode === 'username' ? "Search by @username..." : "Search contacts..."}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (searchMode === 'username') {
                searchByUsername(text);
              }
            }}
            placeholderTextColor={colors.gray5}
            autoCapitalize="none"
          />
          {searching && <ActivityIndicator size="small" color={colors.primary} />}
        </View>
      </View>

      {loading && searchMode === 'contacts' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Syncing contacts...</Text>
        </View>
      ) : (
        <FlatList
          data={searchMode === 'username' ? searchResults : 
                searchQuery ? contacts.filter(c => 
                  c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.savedName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.username?.toLowerCase().includes(searchQuery.toLowerCase())
                ) : contacts}
          renderItem={renderContact}
          keyExtractor={(item) => item._id || item.id || item.phone}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon 
                name={searchMode === 'username' ? "search-outline" : "people-outline"} 
                size={64} 
                color={colors.gray5} 
              />
              <Text style={styles.emptyText}>
                {searchMode === 'username' 
                  ? (searchQuery.length < 3 
                      ? 'Type at least 3 characters to search' 
                      : 'No users found with this username')
                  : (searchQuery 
                      ? 'No contacts found' 
                      : 'No contacts using Chatry')}
              </Text>
              {searchMode === 'contacts' && !searchQuery && (
                <TouchableOpacity style={styles.inviteButton}>
                  <Text style={styles.inviteText}>Invite Friends</Text>
                </TouchableOpacity>
              )}
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
    marginBottom: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
  },
  searchSection: {
    backgroundColor: colors.white,
    paddingBottom: 10,
    elevation: 2,
    shadowColor: colors.shadowColor,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchModeToggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    backgroundColor: colors.gray1,
    borderRadius: 10,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeToggle: {
    backgroundColor: colors.gradientStart,
  },
  toggleText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.gray6,
  },
  activeToggleText: {
    color: colors.white,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray1,
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  notContactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  notContactText: {
    fontSize: 12,
    color: colors.warning,
    marginLeft: 4,
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
    textAlign: 'center',
    paddingHorizontal: 40,
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