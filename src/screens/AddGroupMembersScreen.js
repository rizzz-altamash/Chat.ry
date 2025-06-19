// src/screens/AddGroupMembersScreen.js
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import colors from '../styles/colors';
import api from '../services/api';
import contactService from '../services/contactService';

const AddGroupMembersScreen = ({navigation, route}) => {
  const {groupId, existingMembers} = route.params;
  
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState('contacts'); // 'contacts' or 'username'
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const syncedContacts = await contactService.syncContacts();
      
      // Filter out existing members
      const existingMemberIds = existingMembers.map(m => m.user._id || m.user.id || m.user);
      const availableContacts = syncedContacts.filter(contact => 
        !existingMemberIds.includes(contact._id || contact.id)
      );
      
      setContacts(availableContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
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
      
      // Filter out existing members
      const existingMemberIds = existingMembers.map(m => m.user._id || m.user.id || m.user);
      const filteredResults = response.users.filter(user => 
        !existingMemberIds.includes(user._id || user.id)
      );
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const toggleContactSelection = (contact) => {
    const contactId = contact._id || contact.id;
    
    if (selectedContacts.find(c => c._id === contactId || c.id === contactId)) {
      setSelectedContacts(selectedContacts.filter(c => 
        c._id !== contactId && c.id !== contactId
      ));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const addMembers = async () => {
    if (selectedContacts.length === 0) {
      Alert.alert('Error', 'Please select at least one contact');
      return;
    }

    try {
      setAdding(true);
      
      const memberIds = selectedContacts.map(c => c._id || c.id);
      await api.addGroupMembers(groupId, memberIds);
      
      Alert.alert('Success', 'Members added successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      console.error('Error adding members:', error);
      Alert.alert('Error', error.message || 'Failed to add members');
    } finally {
      setAdding(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getFilteredData = () => {
    if (searchMode === 'username') {
      return searchResults;
    }
    
    // Filter contacts
    return contacts.filter(contact => {
      const name = (contact.savedName || contact.name || '').toLowerCase();
      const username = (contact.username || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return name.includes(query) || username.includes(query);
    });
  };

  const renderContact = ({item}) => {
    const isSelected = selectedContacts.find(c => 
      (c._id === item._id || c._id === item.id) || 
      (c.id === item._id || c.id === item.id)
    );
    const isFromUsername = searchMode === 'username' && !item.isContact;

    return (
      <TouchableOpacity
        style={[styles.contactItem, isSelected && styles.selectedContact]}
        onPress={() => toggleContactSelection(item)}
        activeOpacity={0.7}>
        <View style={styles.contactLeft}>
          {item.avatar ? (
            <Image source={{uri: item.avatar}} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, {backgroundColor: colors.accent}]}>
              <Text style={styles.avatarText}>
                {getInitials(item.savedName || item.name)}
              </Text>
            </View>
          )}
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>
              {item.savedName || item.name || item.username}
            </Text>
            {item.username && (
              <Text style={styles.username}>@{item.username}</Text>
            )}
            <View style={styles.statusRow}>
              {isFromUsername && (
                <View style={styles.notContactBadge}>
                  <Icon name="at" size={10} color={colors.warning} />
                  <Text style={styles.notContactText}>Not in contacts</Text>
                </View>
              )}
              {item.status && (
                <Text style={styles.contactStatus} numberOfLines={1}>
                  {item.status}
                </Text>
              )}
            </View>
          </View>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Icon name="checkmark" size={18} color={colors.white} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Members</Text>
          <TouchableOpacity 
            onPress={addMembers} 
            disabled={selectedContacts.length === 0 || adding}>
            <Text style={[
              styles.addButton,
              (selectedContacts.length === 0 || adding) && styles.addButtonDisabled
            ]}>
              {adding ? 'Adding...' : `Add (${selectedContacts.length})`}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search Mode Toggle */}
      <View style={styles.searchModeToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, searchMode === 'contacts' && styles.activeToggle]}
          onPress={() => {
            setSearchMode('contacts');
            setSearchQuery('');
          }}>
          <Icon name="people" size={16} color={searchMode === 'contacts' ? colors.white : colors.gray6} />
          <Text style={[styles.toggleText, searchMode === 'contacts' && styles.activeToggleText]}>
            Contacts
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.toggleButton, searchMode === 'username' && styles.activeToggle]}
          onPress={() => {
            setSearchMode('username');
            setSearchQuery('');
          }}>
          <Icon name="at" size={16} color={searchMode === 'username' ? colors.white : colors.gray6} />
          <Text style={[styles.toggleText, searchMode === 'username' && styles.activeToggleText]}>
            Username
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
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

      {loading && searchMode === 'contacts' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={getFilteredData()}
          renderItem={renderContact}
          keyExtractor={(item) => item._id || item.id || item.phone}
          contentContainerStyle={styles.contactsList}
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
                      : searching ? 'Searching...' : 'No users found')
                  : (searchQuery 
                      ? 'No contacts found' 
                      : 'All your contacts are already in this group')}
              </Text>
            </View>
          }
        />
      )}

      {adding && (
        <View style={styles.addingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.addingText}>Adding members...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // ... same styles as in CreateGroupScreen but for AddGroupMembers
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
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
  },
  addButton: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  searchModeToggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    backgroundColor: colors.gray2,
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
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginVertical: 15,
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
  contactsList: {
    paddingBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray2,
  },
  selectedContact: {
    backgroundColor: colors.gray1,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray9,
  },
  username: {
    fontSize: 14,
    color: colors.gradientStart,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  notContactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  notContactText: {
    fontSize: 10,
    color: colors.warning,
    marginLeft: 2,
  },
  contactStatus: {
    fontSize: 13,
    color: colors.gray6,
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.gradientStart,
    borderColor: colors.gradientStart,
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
  addingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addingText: {
    color: colors.white,
    fontSize: 16,
    marginTop: 10,
  },
});

export default AddGroupMembersScreen;