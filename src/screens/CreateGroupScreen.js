// // src/screens/CreateGroupScreen.js
// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Platform,
//   Alert,
//   ActivityIndicator,
//   FlatList,
//   Image,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
// import colors from '../styles/colors';
// import api from '../services/api';
// import contactService from '../services/contactService';

// const CreateGroupScreen = ({navigation}) => {
//   const [groupName, setGroupName] = useState('');
//   const [groupDescription, setGroupDescription] = useState('');
//   const [contacts, setContacts] = useState([]);
//   const [selectedContacts, setSelectedContacts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [creating, setCreating] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');

//   useEffect(() => {
//     loadContacts();
//   }, []);

//   const loadContacts = async () => {
//     try {
//       setLoading(true);
//       const syncedContacts = await contactService.syncContacts();
//       setContacts(syncedContacts);
//     } catch (error) {
//       console.error('Error loading contacts:', error);
//       Alert.alert('Error', 'Failed to load contacts');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleContactSelection = (contact) => {
//     const contactId = contact._id || contact.id;
    
//     if (selectedContacts.find(c => c._id === contactId || c.id === contactId)) {
//       setSelectedContacts(selectedContacts.filter(c => 
//         c._id !== contactId && c.id !== contactId
//       ));
//     } else {
//       setSelectedContacts([...selectedContacts, contact]);
//     }
//   };

//   const createGroup = async () => {
//     if (!groupName.trim()) {
//       Alert.alert('Error', 'Please enter a group name');
//       return;
//     }

//     if (selectedContacts.length === 0) {
//       Alert.alert('Error', 'Please select at least one contact');
//       return;
//     }

//     try {
//       setCreating(true);
      
//       const memberIds = selectedContacts.map(c => c._id || c.id);
//       const response = await api.createGroup(
//         groupName.trim(),
//         groupDescription.trim(),
//         memberIds
//       );

//       Alert.alert('Success', 'Group created successfully', [
//         {
//           text: 'OK',
//           onPress: () => {
//             navigation.replace('ChatDetail', {
//               chatId: response.group._id,
//               chatName: response.group.name,
//               chatColor: '#96CEB4',
//               isGroup: true,
//               groupData: response.group,
//             });
//           }
//         }
//       ]);
//     } catch (error) {
//       console.error('Error creating group:', error);
//       Alert.alert('Error', error.message || 'Failed to create group');
//     } finally {
//       setCreating(false);
//     }
//   };

//   const getInitials = (name) => {
//     if (!name) return '?';
//     return name
//       .split(' ')
//       .map(word => word[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   const filteredContacts = contacts.filter(contact => {
//     const name = (contact.savedName || contact.name || '').toLowerCase();
//     const username = (contact.username || '').toLowerCase();
//     const query = searchQuery.toLowerCase();
//     return name.includes(query) || username.includes(query);
//   });

//   const renderContact = ({item}) => {
//     const isSelected = selectedContacts.find(c => 
//       (c._id === item._id || c._id === item.id) || 
//       (c.id === item._id || c.id === item.id)
//     );

//     return (
//       <TouchableOpacity
//         style={[styles.contactItem, isSelected && styles.selectedContact]}
//         onPress={() => toggleContactSelection(item)}
//         activeOpacity={0.7}>
//         <View style={styles.contactLeft}>
//           {item.avatar ? (
//             <Image source={{uri: item.avatar}} style={styles.avatar} />
//           ) : (
//             <View style={[styles.avatarPlaceholder, {backgroundColor: colors.accent}]}>
//               <Text style={styles.avatarText}>
//                 {getInitials(item.savedName || item.name)}
//               </Text>
//             </View>
//           )}
//           <View style={styles.contactInfo}>
//             <Text style={styles.contactName}>
//               {item.savedName || item.name || item.username}
//             </Text>
//             {item.status && (
//               <Text style={styles.contactStatus} numberOfLines={1}>
//                 {item.status}
//               </Text>
//             )}
//           </View>
//         </View>
//         <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
//           {isSelected && <Icon name="checkmark" size={18} color={colors.white} />}
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   const renderSelectedContact = (contact) => {
//     const name = contact.savedName || contact.name || contact.username || 'Unknown';
//     return (
//       <TouchableOpacity
//         key={contact._id || contact.id}
//         style={styles.selectedChip}
//         onPress={() => toggleContactSelection(contact)}>
//         <Text style={styles.selectedChipText}>{name.split(' ')[0]}</Text>
//         <Icon name="close" size={16} color={colors.white} />
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <LinearGradient
//         colors={[colors.gradientStart, colors.gradientEnd]}
//         style={styles.header}>
//         <View style={styles.headerContent}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Icon name="arrow-back" size={24} color={colors.white} />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>New Group</Text>
//           <TouchableOpacity 
//             onPress={createGroup} 
//             disabled={!groupName.trim() || selectedContacts.length === 0 || creating}>
//             <Text style={[
//               styles.createButton,
//               (!groupName.trim() || selectedContacts.length === 0 || creating) && styles.createButtonDisabled
//             ]}>
//               {creating ? 'Creating...' : 'Create'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </LinearGradient>

//       <ScrollView style={styles.content}>
//         {/* Group Info Section */}
//         <View style={styles.groupInfoSection}>
//           <View style={styles.groupAvatarContainer}>
//             <View style={styles.groupAvatar}>
//               <Icon name="camera" size={30} color={colors.gray5} />
//             </View>
//             <TouchableOpacity style={styles.editAvatarButton}>
//               <Icon name="pencil" size={16} color={colors.white} />
//             </TouchableOpacity>
//           </View>
          
//           <View style={styles.inputContainer}>
//             <TextInput
//               style={styles.groupNameInput}
//               placeholder="Group name"
//               value={groupName}
//               onChangeText={setGroupName}
//               placeholderTextColor={colors.gray5}
//               maxLength={25}
//             />
//             <Text style={styles.charCount}>{groupName.length}/25</Text>
//           </View>

//           <TextInput
//             style={styles.descriptionInput}
//             placeholder="Add group description (optional)"
//             value={groupDescription}
//             onChangeText={setGroupDescription}
//             placeholderTextColor={colors.gray5}
//             multiline
//             maxLength={100}
//           />
//         </View>

//         {/* Selected Contacts */}
//         {selectedContacts.length > 0 && (
//           <View style={styles.selectedSection}>
//             <Text style={styles.sectionTitle}>
//               {selectedContacts.length} participant{selectedContacts.length !== 1 ? 's' : ''} selected
//             </Text>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//               <View style={styles.selectedChips}>
//                 {selectedContacts.map(renderSelectedContact)}
//               </View>
//             </ScrollView>
//           </View>
//         )}

//         {/* Search Bar */}
//         <View style={styles.searchContainer}>
//           <Icon name="search" size={20} color={colors.gray6} />
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search contacts..."
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             placeholderTextColor={colors.gray5}
//           />
//         </View>

//         {/* Contacts List */}
//         <Text style={styles.sectionTitle}>Add participants</Text>
        
//         {loading ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color={colors.primary} />
//           </View>
//         ) : (
//           <FlatList
//             data={filteredContacts}
//             renderItem={renderContact}
//             keyExtractor={(item) => item._id || item.id || item.phone}
//             contentContainerStyle={styles.contactsList}
//             scrollEnabled={false}
//             ListEmptyComponent={
//               <Text style={styles.emptyText}>No contacts found</Text>
//             }
//           />
//         )}
//       </ScrollView>

//       {creating && (
//         <View style={styles.creatingOverlay}>
//           <ActivityIndicator size="large" color={colors.white} />
//           <Text style={styles.creatingText}>Creating group...</Text>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.gray1,
//   },
//   header: {
//     paddingTop: Platform.OS === 'ios' ? 50 : 30,
//     paddingBottom: 20,
//     paddingHorizontal: 20,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: colors.white,
//   },
//   createButton: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: colors.white,
//   },
//   createButtonDisabled: {
//     opacity: 0.5,
//   },
//   content: {
//     flex: 1,
//   },
//   groupInfoSection: {
//     backgroundColor: colors.white,
//     padding: 20,
//     alignItems: 'center',
//   },
//   groupAvatarContainer: {
//     position: 'relative',
//     marginBottom: 20,
//   },
//   groupAvatar: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     backgroundColor: colors.gray2,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   editAvatarButton: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: colors.gradientStart,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   inputContainer: {
//     width: '100%',
//     marginBottom: 15,
//   },
//   groupNameInput: {
//     fontSize: 18,
//     fontWeight: '600',
//     textAlign: 'center',
//     color: colors.gray9,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.gray3,
//     paddingBottom: 10,
//   },
//   charCount: {
//     position: 'absolute',
//     right: 0,
//     bottom: 2,
//     fontSize: 12,
//     color: colors.gray5,
//   },
//   descriptionInput: {
//     fontSize: 14,
//     color: colors.gray7,
//     textAlign: 'center',
//     minHeight: 40,
//     maxHeight: 80,
//   },
//   selectedSection: {
//     backgroundColor: colors.white,
//     padding: 15,
//     marginTop: 10,
//   },
//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: colors.gray6,
//     marginBottom: 10,
//     paddingHorizontal: 20,
//     textTransform: 'uppercase',
//   },
//   selectedChips: {
//     flexDirection: 'row',
//     paddingHorizontal: 15,
//   },
//   selectedChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.gradientStart,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     marginRight: 8,
//   },
//   selectedChipText: {
//     color: colors.white,
//     fontSize: 14,
//     marginRight: 6,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.white,
//     marginHorizontal: 20,
//     marginVertical: 15,
//     paddingHorizontal: 15,
//     borderRadius: 10,
//     height: 45,
//   },
//   searchInput: {
//     flex: 1,
//     marginLeft: 10,
//     fontSize: 16,
//     color: colors.gray9,
//   },
//   contactsList: {
//     paddingBottom: 20,
//   },
//   contactItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: colors.white,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.gray2,
//   },
//   selectedContact: {
//     backgroundColor: colors.gray1,
//   },
//   contactLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   avatar: {
//     width: 45,
//     height: 45,
//     borderRadius: 22.5,
//     marginRight: 12,
//   },
//   avatarPlaceholder: {
//     width: 45,
//     height: 45,
//     borderRadius: 22.5,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },
//   avatarText: {
//     color: colors.white,
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   contactInfo: {
//     flex: 1,
//   },
//   contactName: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: colors.gray9,
//   },
//   contactStatus: {
//     fontSize: 13,
//     color: colors.gray6,
//     marginTop: 2,
//   },
//   checkbox: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: colors.gray4,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   checkboxSelected: {
//     backgroundColor: colors.gradientStart,
//     borderColor: colors.gradientStart,
//   },
//   loadingContainer: {
//     padding: 50,
//     alignItems: 'center',
//   },
//   emptyText: {
//     textAlign: 'center',
//     color: colors.gray5,
//     fontSize: 16,
//     padding: 20,
//   },
//   creatingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0, 0, 0, 0.7)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   creatingText: {
//     color: colors.white,
//     fontSize: 16,
//     marginTop: 10,
//   },
// });

// export default CreateGroupScreen;











// // src/screens/CreateGroupScreen.js
// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Platform,
//   Alert,
//   ActivityIndicator,
//   FlatList,
//   Image,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
// import colors from '../styles/colors';
// import api from '../services/api';
// import contactService from '../services/contactService';

// const CreateGroupScreen = ({navigation}) => {
//   const [groupName, setGroupName] = useState('');
//   const [groupDescription, setGroupDescription] = useState('');
//   const [contacts, setContacts] = useState([]);
//   const [selectedContacts, setSelectedContacts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [creating, setCreating] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchMode, setSearchMode] = useState('contacts'); // 'contacts' or 'username'
//   const [searchResults, setSearchResults] = useState([]);
//   const [searching, setSearching] = useState(false);

//   useEffect(() => {
//     loadContacts();
//   }, []);

//   const loadContacts = async () => {
//     try {
//       setLoading(true);
//       console.log('🔍 Loading contacts...');
      
//       const syncedContacts = await contactService.syncContacts();
//       console.log('📞 Synced contacts:', syncedContacts);
//       console.log('📊 Total contacts found:', syncedContacts.length);
      
//       setContacts(syncedContacts);
      
//       // If no contacts found, switch to username search
//       if (syncedContacts.length === 0) {
//         setSearchMode('username');
//         Alert.alert(
//           'No Contacts Found', 
//           'No contacts using Chatry found. You can search users by username instead.',
//           [{text: 'OK'}]
//         );
//       }
//     } catch (error) {
//       console.error('❌ Error loading contacts:', error);
//       setSearchMode('username'); // Switch to username search on error
//       Alert.alert('Info', 'Unable to sync contacts. You can search users by username.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const searchByUsername = async (query) => {
//     if (query.length < 3) {
//       setSearchResults([]);
//       return;
//     }

//     try {
//       setSearching(true);
//       const response = await api.searchByUsername(query);
//       setSearchResults(response.users);
//     } catch (error) {
//       console.error('Search error:', error);
//     } finally {
//       setSearching(false);
//     }
//   };

//   const toggleContactSelection = (contact) => {
//     const contactId = contact._id || contact.id;
    
//     if (selectedContacts.find(c => c._id === contactId || c.id === contactId)) {
//       setSelectedContacts(selectedContacts.filter(c => 
//         c._id !== contactId && c.id !== contactId
//       ));
//     } else {
//       setSelectedContacts([...selectedContacts, contact]);
//     }
//   };

//   const createGroup = async () => {
//     if (!groupName.trim()) {
//       Alert.alert('Error', 'Please enter a group name');
//       return;
//     }

//     if (selectedContacts.length === 0) {
//       Alert.alert('Error', 'Please select at least one contact');
//       return;
//     }

//     try {
//       setCreating(true);
      
//       const memberIds = selectedContacts.map(c => c._id || c.id);
//       const response = await api.createGroup(
//         groupName.trim(),
//         groupDescription.trim(),
//         memberIds
//       );

//       Alert.alert('Success', 'Group created successfully', [
//         {
//           text: 'OK',
//           onPress: () => {
//             navigation.replace('ChatDetail', {
//               chatId: response.group._id,
//               chatName: response.group.name,
//               chatColor: '#96CEB4',
//               isGroup: true,
//               groupData: response.group,
//             });
//           }
//         }
//       ]);
//     } catch (error) {
//       console.error('Error creating group:', error);
//       Alert.alert('Error', error.message || 'Failed to create group');
//     } finally {
//       setCreating(false);
//     }
//   };

//   const getInitials = (name) => {
//     if (!name) return '?';
//     return name
//       .split(' ')
//       .map(word => word[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   const getFilteredData = () => {
//     if (searchMode === 'username') {
//       return searchResults;
//     }
    
//     // Filter contacts
//     return contacts.filter(contact => {
//       const name = (contact.savedName || contact.name || '').toLowerCase();
//       const username = (contact.username || '').toLowerCase();
//       const query = searchQuery.toLowerCase();
//       return name.includes(query) || username.includes(query);
//     });
//   };

//   const renderContact = ({item}) => {
//     const isSelected = selectedContacts.find(c => 
//       (c._id === item._id || c._id === item.id) || 
//       (c.id === item._id || c.id === item.id)
//     );

//     return (
//       <TouchableOpacity
//         style={[styles.contactItem, isSelected && styles.selectedContact]}
//         onPress={() => toggleContactSelection(item)}
//         activeOpacity={0.7}>
//         <View style={styles.contactLeft}>
//           {item.avatar ? (
//             <Image source={{uri: item.avatar}} style={styles.avatar} />
//           ) : (
//             <View style={[styles.avatarPlaceholder, {backgroundColor: colors.accent}]}>
//               <Text style={styles.avatarText}>
//                 {getInitials(item.savedName || item.name)}
//               </Text>
//             </View>
//           )}
//           <View style={styles.contactInfo}>
//             <Text style={styles.contactName}>
//               {item.savedName || item.name || item.username}
//             </Text>
//             {item.username && (
//               <Text style={styles.username}>@{item.username}</Text>
//             )}
//             {item.status && (
//               <Text style={styles.contactStatus} numberOfLines={1}>
//                 {item.status}
//               </Text>
//             )}
//           </View>
//         </View>
//         <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
//           {isSelected && <Icon name="checkmark" size={18} color={colors.white} />}
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   const renderSelectedContact = (contact) => {
//     const name = contact.savedName || contact.name || contact.username || 'Unknown';
//     return (
//       <TouchableOpacity
//         key={contact._id || contact.id}
//         style={styles.selectedChip}
//         onPress={() => toggleContactSelection(contact)}>
//         <Text style={styles.selectedChipText}>{name.split(' ')[0]}</Text>
//         <Icon name="close" size={16} color={colors.white} />
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <LinearGradient
//         colors={[colors.gradientStart, colors.gradientEnd]}
//         style={styles.header}>
//         <View style={styles.headerContent}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Icon name="arrow-back" size={24} color={colors.white} />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>New Group</Text>
//           <TouchableOpacity 
//             onPress={createGroup} 
//             disabled={!groupName.trim() || selectedContacts.length === 0 || creating}>
//             <Text style={[
//               styles.createButton,
//               (!groupName.trim() || selectedContacts.length === 0 || creating) && styles.createButtonDisabled
//             ]}>
//               {creating ? 'Creating...' : 'Create'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </LinearGradient>

//       <ScrollView style={styles.content}>
//         {/* Group Info Section */}
//         <View style={styles.groupInfoSection}>
//           <View style={styles.groupAvatarContainer}>
//             <View style={styles.groupAvatar}>
//               <Icon name="camera" size={30} color={colors.gray5} />
//             </View>
//             <TouchableOpacity style={styles.editAvatarButton}>
//               <Icon name="pencil" size={16} color={colors.white} />
//             </TouchableOpacity>
//           </View>
          
//           <View style={styles.inputContainer}>
//             <TextInput
//               style={styles.groupNameInput}
//               placeholder="Group name"
//               value={groupName}
//               onChangeText={setGroupName}
//               placeholderTextColor={colors.gray5}
//               maxLength={25}
//             />
//             <Text style={styles.charCount}>{groupName.length}/25</Text>
//           </View>

//           <TextInput
//             style={styles.descriptionInput}
//             placeholder="Add group description (optional)"
//             value={groupDescription}
//             onChangeText={setGroupDescription}
//             placeholderTextColor={colors.gray5}
//             multiline
//             maxLength={100}
//           />
//         </View>

//         {/* Selected Contacts */}
//         {selectedContacts.length > 0 && (
//           <View style={styles.selectedSection}>
//             <Text style={styles.sectionTitle}>
//               {selectedContacts.length} participant{selectedContacts.length !== 1 ? 's' : ''} selected
//             </Text>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//               <View style={styles.selectedChips}>
//                 {selectedContacts.map(renderSelectedContact)}
//               </View>
//             </ScrollView>
//           </View>
//         )}

//         {/* Search Mode Toggle */}
//         <View style={styles.searchModeToggle}>
//           <TouchableOpacity
//             style={[styles.toggleButton, searchMode === 'contacts' && styles.activeToggle]}
//             onPress={() => {
//               setSearchMode('contacts');
//               setSearchQuery('');
//               setSearchResults([]);
//             }}>
//             <Icon name="people" size={16} color={searchMode === 'contacts' ? colors.white : colors.gray6} />
//             <Text style={[styles.toggleText, searchMode === 'contacts' && styles.activeToggleText]}>
//               Contacts ({contacts.length})
//             </Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity
//             style={[styles.toggleButton, searchMode === 'username' && styles.activeToggle]}
//             onPress={() => {
//               setSearchMode('username');
//               setSearchQuery('');
//               setSearchResults([]);
//             }}>
//             <Icon name="at" size={16} color={searchMode === 'username' ? colors.white : colors.gray6} />
//             <Text style={[styles.toggleText, searchMode === 'username' && styles.activeToggleText]}>
//               Username
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Search Bar */}
//         <View style={styles.searchContainer}>
//           <Icon name="search" size={20} color={colors.gray6} />
//           <TextInput
//             style={styles.searchInput}
//             placeholder={searchMode === 'username' ? "Search by @username..." : "Search contacts..."}
//             value={searchQuery}
//             onChangeText={(text) => {
//               setSearchQuery(text);
//               if (searchMode === 'username') {
//                 searchByUsername(text);
//               }
//             }}
//             placeholderTextColor={colors.gray5}
//             autoCapitalize="none"
//           />
//           {searching && <ActivityIndicator size="small" color={colors.primary} />}
//         </View>

//         {/* Contacts List */}
//         <Text style={styles.sectionTitle}>Add participants</Text>
        
//         {loading ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color={colors.primary} />
//             <Text style={styles.loadingText}>Loading contacts...</Text>
//           </View>
//         ) : (
//           <FlatList
//             data={getFilteredData()}
//             renderItem={renderContact}
//             keyExtractor={(item) => item._id || item.id || item.phone}
//             contentContainerStyle={styles.contactsList}
//             scrollEnabled={false}
//             ListEmptyComponent={
//               <Text style={styles.emptyText}>
//                 {searchMode === 'username' 
//                   ? (searchQuery.length < 3 
//                       ? 'Type at least 3 characters to search users' 
//                       : searching ? 'Searching...' : 'No users found')
//                   : 'No contacts found'}
//               </Text>
//             }
//           />
//         )}
//       </ScrollView>

//       {creating && (
//         <View style={styles.creatingOverlay}>
//           <ActivityIndicator size="large" color={colors.white} />
//           <Text style={styles.creatingText}>Creating group...</Text>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.gray1,
//   },
//   header: {
//     paddingTop: Platform.OS === 'ios' ? 50 : 30,
//     paddingBottom: 20,
//     paddingHorizontal: 20,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: colors.white,
//   },
//   createButton: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: colors.white,
//   },
//   createButtonDisabled: {
//     opacity: 0.5,
//   },
//   content: {
//     flex: 1,
//   },
//   groupInfoSection: {
//     backgroundColor: colors.white,
//     padding: 20,
//     alignItems: 'center',
//   },
//   groupAvatarContainer: {
//     position: 'relative',
//     marginBottom: 20,
//   },
//   groupAvatar: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     backgroundColor: colors.gray2,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   editAvatarButton: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: colors.gradientStart,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   inputContainer: {
//     width: '100%',
//     marginBottom: 15,
//   },
//   groupNameInput: {
//     fontSize: 18,
//     fontWeight: '600',
//     textAlign: 'center',
//     color: colors.gray9,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.gray3,
//     paddingBottom: 10,
//   },
//   charCount: {
//     position: 'absolute',
//     right: 0,
//     bottom: 2,
//     fontSize: 12,
//     color: colors.gray5,
//   },
//   descriptionInput: {
//     fontSize: 14,
//     color: colors.gray7,
//     textAlign: 'center',
//     minHeight: 40,
//     maxHeight: 80,
//   },
//   selectedSection: {
//     backgroundColor: colors.white,
//     padding: 15,
//     marginTop: 10,
//   },
//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: colors.gray6,
//     marginBottom: 10,
//     paddingHorizontal: 20,
//     textTransform: 'uppercase',
//   },
//   selectedChips: {
//     flexDirection: 'row',
//     paddingHorizontal: 15,
//   },
//   selectedChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.gradientStart,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     marginRight: 8,
//   },
//   selectedChipText: {
//     color: colors.white,
//     fontSize: 14,
//     marginRight: 6,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.white,
//     marginHorizontal: 20,
//     marginVertical: 15,
//     paddingHorizontal: 15,
//     borderRadius: 10,
//     height: 45,
//   },
//   searchInput: {
//     flex: 1,
//     marginLeft: 10,
//     fontSize: 16,
//     color: colors.gray9,
//   },
//   contactsList: {
//     paddingBottom: 20,
//   },
//   contactItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: colors.white,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.gray2,
//   },
//   selectedContact: {
//     backgroundColor: colors.gray1,
//   },
//   contactLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   avatar: {
//     width: 45,
//     height: 45,
//     borderRadius: 22.5,
//     marginRight: 12,
//   },
//   avatarPlaceholder: {
//     width: 45,
//     height: 45,
//     borderRadius: 22.5,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },
//   avatarText: {
//     color: colors.white,
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   contactInfo: {
//     flex: 1,
//   },
//   contactName: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: colors.gray9,
//   },
//   contactStatus: {
//     fontSize: 13,
//     color: colors.gray6,
//     marginTop: 2,
//   },
//   checkbox: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: colors.gray4,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   checkboxSelected: {
//     backgroundColor: colors.gradientStart,
//     borderColor: colors.gradientStart,
//   },
//   loadingContainer: {
//     padding: 50,
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     color: colors.gray6,
//     fontSize: 16,
//   },
//   searchModeToggle: {
//     flexDirection: 'row',
//     marginHorizontal: 20,
//     marginTop: 15,
//     marginBottom: 10,
//     backgroundColor: colors.gray2,
//     borderRadius: 10,
//     padding: 4,
//   },
//   toggleButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 8,
//     borderRadius: 8,
//   },
//   activeToggle: {
//     backgroundColor: colors.gradientStart,
//   },
//   toggleText: {
//     marginLeft: 6,
//     fontSize: 14,
//     color: colors.gray6,
//   },
//   activeToggleText: {
//     color: colors.white,
//     fontWeight: '600',
//   },
//   username: {
//     fontSize: 14,
//     color: colors.gradientStart,
//     marginTop: 2,
//   },
//   emptyText: {
//     textAlign: 'center',
//     color: colors.gray5,
//     fontSize: 16,
//     padding: 20,
//   },
//   creatingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0, 0, 0, 0.7)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   creatingText: {
//     color: colors.white,
//     fontSize: 16,
//     marginTop: 10,
//   },
// });

// export default CreateGroupScreen;














// // src/screens/CreateGroupScreen.js
// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Platform,
//   Alert,
//   ActivityIndicator,
//   FlatList,
//   Image,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
// import colors from '../styles/colors';
// import api from '../services/api';
// import contactService from '../services/contactService';

// const CreateGroupScreen = ({navigation}) => {
//   const [groupName, setGroupName] = useState('');
//   const [groupDescription, setGroupDescription] = useState('');
//   const [contacts, setContacts] = useState([]);
//   const [selectedContacts, setSelectedContacts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [creating, setCreating] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchMode, setSearchMode] = useState('contacts'); // 'contacts' or 'username'
//   const [searchResults, setSearchResults] = useState([]);
//   const [searching, setSearching] = useState(false);

//   useEffect(() => {
//     loadContacts();
//   }, []);

//   const loadContacts = async () => {
//     try {
//       setLoading(true);
//       console.log('🔍 Loading contacts...');
      
//       const syncedContacts = await contactService.syncContacts();
//       console.log('📞 Synced contacts:', syncedContacts);
//       console.log('📊 Total contacts found:', syncedContacts.length);
      
//       // Mark contacts as "isContact: true"
//       const markedContacts = syncedContacts.map(contact => ({
//         ...contact,
//         isContact: true
//       }));
      
//       setContacts(markedContacts);
      
//       // If no contacts found, switch to username search
//       if (syncedContacts.length === 0) {
//         setSearchMode('username');
//         Alert.alert(
//           'No Contacts Found', 
//           'No contacts using Chatry found. You can search users by username instead.',
//           [{text: 'OK'}]
//         );
//       }
//     } catch (error) {
//       console.error('❌ Error loading contacts:', error);
//       setSearchMode('username'); // Switch to username search on error
//       Alert.alert('Info', 'Unable to sync contacts. You can search users by username.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const searchByUsername = async (query) => {
//     if (query.length < 3) {
//       setSearchResults([]);
//       return;
//     }

//     try {
//       setSearching(true);
//       const response = await api.searchByUsername(query);
      
//       // Mark search results and check if they're already in contacts
//       const markedResults = response.users.map(user => {
//         const isInContacts = contacts.some(contact => 
//           contact._id === user._id || contact.id === user._id ||
//           contact._id === user.id || contact.id === user.id
//         );
        
//         return {
//           ...user,
//           isContact: isInContacts,
//           isFromSearch: true
//         };
//       });
      
//       setSearchResults(markedResults);
//     } catch (error) {
//       console.error('Search error:', error);
//     } finally {
//       setSearching(false);
//     }
//   };

//   const toggleContactSelection = (contact) => {
//     const contactId = contact._id || contact.id;
    
//     const isSelected = selectedContacts.find(c => 
//       c._id === contactId || c.id === contactId
//     );
    
//     if (isSelected) {
//       setSelectedContacts(selectedContacts.filter(c => 
//         c._id !== contactId && c.id !== contactId
//       ));
//     } else {
//       setSelectedContacts([...selectedContacts, contact]);
//     }
//   };

//   const createGroup = async () => {
//     if (!groupName.trim()) {
//       Alert.alert('Error', 'Please enter a group name');
//       return;
//     }

//     if (selectedContacts.length === 0) {
//       Alert.alert('Error', 'Please select at least one participant');
//       return;
//     }

//     try {
//       setCreating(true);
      
//       const memberIds = selectedContacts.map(c => c._id || c.id);
//       const response = await api.createGroup(
//         groupName.trim(),
//         groupDescription.trim(),
//         memberIds
//       );

//       Alert.alert('Success', 'Group created successfully', [
//         {
//           text: 'OK',
//           onPress: () => {
//             navigation.replace('ChatDetail', {
//               chatId: response.group._id,
//               chatName: response.group.name,
//               chatColor: '#96CEB4',
//               isGroup: true,
//               groupData: response.group,
//             });
//           }
//         }
//       ]);
//     } catch (error) {
//       console.error('Error creating group:', error);
//       Alert.alert('Error', error.message || 'Failed to create group');
//     } finally {
//       setCreating(false);
//     }
//   };

//   const getInitials = (name) => {
//     if (!name) return '?';
//     return name
//       .split(' ')
//       .map(word => word[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   const getFilteredData = () => {
//     if (searchMode === 'username') {
//       return searchResults;
//     }
    
//     // Filter contacts
//     return contacts.filter(contact => {
//       const name = (contact.savedName || contact.name || '').toLowerCase();
//       const username = (contact.username || '').toLowerCase();
//       const query = searchQuery.toLowerCase();
//       return name.includes(query) || username.includes(query);
//     });
//   };

//   const renderContact = ({item}) => {
//     const isSelected = selectedContacts.find(c => 
//       (c._id === item._id || c._id === item.id) || 
//       (c.id === item._id || c.id === item.id)
//     );

//     return (
//       <TouchableOpacity
//         style={[styles.contactItem, isSelected && styles.selectedContact]}
//         onPress={() => toggleContactSelection(item)}
//         activeOpacity={0.7}>
//         <View style={styles.contactLeft}>
//           {item.avatar ? (
//             <Image source={{uri: item.avatar}} style={styles.avatar} />
//           ) : (
//             <View style={[styles.avatarPlaceholder, {backgroundColor: colors.accent}]}>
//               <Text style={styles.avatarText}>
//                 {getInitials(item.savedName || item.name)}
//               </Text>
//             </View>
//           )}
//           <View style={styles.contactInfo}>
//             <Text style={styles.contactName}>
//               {item.savedName || item.name || item.username}
//             </Text>
//             {item.username && (
//               <Text style={styles.username}>@{item.username}</Text>
//             )}
//             <View style={styles.statusRow}>
//               {!item.isContact && searchMode === 'username' && (
//                 <View style={styles.notContactBadge}>
//                   <Icon name="at" size={10} color={colors.warning} />
//                   <Text style={styles.notContactText}>Not in contacts</Text>
//                 </View>
//               )}
//               {item.status && (
//                 <Text style={styles.contactStatus} numberOfLines={1}>
//                   {item.status}
//                 </Text>
//               )}
//             </View>
//           </View>
//         </View>
//         <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
//           {isSelected && <Icon name="checkmark" size={18} color={colors.white} />}
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   const renderSelectedContact = (contact) => {
//     const name = contact.savedName || contact.name || contact.username || 'Unknown';
//     const isContact = contact.isContact;
    
//     return (
//       <TouchableOpacity
//         key={contact._id || contact.id}
//         style={styles.selectedChip}
//         onPress={() => toggleContactSelection(contact)}>
//         <View style={styles.chipContent}>
//           <Text style={styles.selectedChipText}>{name.split(' ')[0]}</Text>
//           {!isContact && (
//             <Icon name="at" size={12} color={colors.white} style={styles.chipIcon} />
//           )}
//         </View>
//         <Icon name="close" size={16} color={colors.white} />
//       </TouchableOpacity>
//     );
//   };

//   // Count contacts and non-contacts in selection
//   const selectedContactsCount = selectedContacts.filter(c => c.isContact).length;
//   const selectedNonContactsCount = selectedContacts.filter(c => !c.isContact).length;

//   return (
//     <View style={styles.container}>
//       <LinearGradient
//         colors={[colors.gradientStart, colors.gradientEnd]}
//         style={styles.header}>
//         <View style={styles.headerContent}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Icon name="arrow-back" size={24} color={colors.white} />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>New Group</Text>
//           <TouchableOpacity 
//             onPress={createGroup} 
//             disabled={!groupName.trim() || selectedContacts.length === 0 || creating}>
//             <Text style={[
//               styles.createButton,
//               (!groupName.trim() || selectedContacts.length === 0 || creating) && styles.createButtonDisabled
//             ]}>
//               {creating ? 'Creating...' : 'Create'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </LinearGradient>

//       <ScrollView style={styles.content}>
//         {/* Group Info Section */}
//         <View style={styles.groupInfoSection}>
//           <View style={styles.groupAvatarContainer}>
//             <View style={styles.groupAvatar}>
//               <Icon name="camera" size={30} color={colors.gray5} />
//             </View>
//             <TouchableOpacity style={styles.editAvatarButton}>
//               <Icon name="pencil" size={16} color={colors.white} />
//             </TouchableOpacity>
//           </View>
          
//           <View style={styles.inputContainer}>
//             <TextInput
//               style={styles.groupNameInput}
//               placeholder="Group name"
//               value={groupName}
//               onChangeText={setGroupName}
//               placeholderTextColor={colors.gray5}
//               maxLength={25}
//             />
//             <Text style={styles.charCount}>{groupName.length}/25</Text>
//           </View>

//           <TextInput
//             style={styles.descriptionInput}
//             placeholder="Add group description (optional)"
//             value={groupDescription}
//             onChangeText={setGroupDescription}
//             placeholderTextColor={colors.gray5}
//             multiline
//             maxLength={100}
//           />
//         </View>

//         {/* Selected Contacts */}
//         {selectedContacts.length > 0 && (
//           <View style={styles.selectedSection}>
//             <Text style={styles.sectionTitle}>
//               {selectedContacts.length} participant{selectedContacts.length !== 1 ? 's' : ''} selected
//             </Text>
//             {selectedNonContactsCount > 0 && (
//               <Text style={styles.selectionInfo}>
//                 {selectedContactsCount} from contacts, {selectedNonContactsCount} by username
//               </Text>
//             )}
//             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//               <View style={styles.selectedChips}>
//                 {selectedContacts.map(renderSelectedContact)}
//               </View>
//             </ScrollView>
//           </View>
//         )}

//         {/* Search Mode Toggle */}
//         <View style={styles.searchModeToggle}>
//           <TouchableOpacity
//             style={[styles.toggleButton, searchMode === 'contacts' && styles.activeToggle]}
//             onPress={() => {
//               setSearchMode('contacts');
//               setSearchQuery('');
//             }}>
//             <Icon name="people" size={16} color={searchMode === 'contacts' ? colors.white : colors.gray6} />
//             <Text style={[styles.toggleText, searchMode === 'contacts' && styles.activeToggleText]}>
//               Contacts ({contacts.length})
//             </Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity
//             style={[styles.toggleButton, searchMode === 'username' && styles.activeToggle]}
//             onPress={() => {
//               setSearchMode('username');
//               setSearchQuery('');
//             }}>
//             <Icon name="at" size={16} color={searchMode === 'username' ? colors.white : colors.gray6} />
//             <Text style={[styles.toggleText, searchMode === 'username' && styles.activeToggleText]}>
//               Username
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Search Bar */}
//         <View style={styles.searchContainer}>
//           <Icon name="search" size={20} color={colors.gray6} />
//           <TextInput
//             style={styles.searchInput}
//             placeholder={searchMode === 'username' ? "Search by @username..." : "Search contacts..."}
//             value={searchQuery}
//             onChangeText={(text) => {
//               setSearchQuery(text);
//               if (searchMode === 'username') {
//                 searchByUsername(text);
//               }
//             }}
//             placeholderTextColor={colors.gray5}
//             autoCapitalize="none"
//           />
//           {searching && <ActivityIndicator size="small" color={colors.primary} />}
//         </View>

//         {/* Contacts List */}
//         <Text style={styles.sectionTitle}>Add participants</Text>
        
//         {loading && searchMode === 'contacts' ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color={colors.primary} />
//             <Text style={styles.loadingText}>Loading contacts...</Text>
//           </View>
//         ) : (
//           <FlatList
//             data={getFilteredData()}
//             renderItem={renderContact}
//             keyExtractor={(item) => item._id || item.id || item.phone}
//             contentContainerStyle={styles.contactsList}
//             scrollEnabled={false}
//             ListEmptyComponent={
//               <Text style={styles.emptyText}>
//                 {searchMode === 'username' 
//                   ? (searchQuery.length < 3 
//                       ? 'Type at least 3 characters to search users' 
//                       : searching ? 'Searching...' : 'No users found')
//                   : 'No contacts found'}
//               </Text>
//             }
//           />
//         )}
//       </ScrollView>

//       {creating && (
//         <View style={styles.creatingOverlay}>
//           <ActivityIndicator size="large" color={colors.white} />
//           <Text style={styles.creatingText}>Creating group...</Text>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.gray1,
//   },
//   header: {
//     paddingTop: Platform.OS === 'ios' ? 50 : 30,
//     paddingBottom: 20,
//     paddingHorizontal: 20,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: colors.white,
//   },
//   createButton: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: colors.white,
//   },
//   createButtonDisabled: {
//     opacity: 0.5,
//   },
//   content: {
//     flex: 1,
//   },
//   groupInfoSection: {
//     backgroundColor: colors.white,
//     padding: 20,
//     alignItems: 'center',
//   },
//   groupAvatarContainer: {
//     position: 'relative',
//     marginBottom: 20,
//   },
//   groupAvatar: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     backgroundColor: colors.gray2,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   editAvatarButton: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: colors.gradientStart,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   inputContainer: {
//     width: '100%',
//     marginBottom: 15,
//   },
//   groupNameInput: {
//     fontSize: 18,
//     fontWeight: '600',
//     textAlign: 'center',
//     color: colors.gray9,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.gray3,
//     paddingBottom: 10,
//   },
//   charCount: {
//     position: 'absolute',
//     right: 0,
//     bottom: 2,
//     fontSize: 12,
//     color: colors.gray5,
//   },
//   descriptionInput: {
//     fontSize: 14,
//     color: colors.gray7,
//     textAlign: 'center',
//     minHeight: 40,
//     maxHeight: 80,
//   },
//   selectedSection: {
//     backgroundColor: colors.white,
//     padding: 15,
//     marginTop: 10,
//   },
//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: colors.gray6,
//     marginBottom: 10,
//     paddingHorizontal: 20,
//     textTransform: 'uppercase',
//   },
//   selectionInfo: {
//     fontSize: 12,
//     color: colors.gray5,
//     marginBottom: 10,
//     paddingHorizontal: 20,
//   },
//   selectedChips: {
//     flexDirection: 'row',
//     paddingHorizontal: 15,
//   },
//   selectedChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.gradientStart,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     marginRight: 8,
//   },
//   chipContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   selectedChipText: {
//     color: colors.white,
//     fontSize: 14,
//   },
//   chipIcon: {
//     marginLeft: 4,
//   },
//   searchModeToggle: {
//     flexDirection: 'row',
//     marginHorizontal: 20,
//     marginTop: 15,
//     marginBottom: 10,
//     backgroundColor: colors.gray2,
//     borderRadius: 10,
//     padding: 4,
//   },
//   toggleButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 8,
//     borderRadius: 8,
//   },
//   activeToggle: {
//     backgroundColor: colors.gradientStart,
//   },
//   toggleText: {
//     marginLeft: 6,
//     fontSize: 14,
//     color: colors.gray6,
//   },
//   activeToggleText: {
//     color: colors.white,
//     fontWeight: '600',
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.white,
//     marginHorizontal: 20,
//     marginVertical: 15,
//     paddingHorizontal: 15,
//     borderRadius: 10,
//     height: 45,
//   },
//   searchInput: {
//     flex: 1,
//     marginLeft: 10,
//     fontSize: 16,
//     color: colors.gray9,
//   },
//   contactsList: {
//     paddingBottom: 20,
//   },
//   contactItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: colors.white,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.gray2,
//   },
//   selectedContact: {
//     backgroundColor: colors.gray1,
//   },
//   contactLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   avatar: {
//     width: 45,
//     height: 45,
//     borderRadius: 22.5,
//     marginRight: 12,
//   },
//   avatarPlaceholder: {
//     width: 45,
//     height: 45,
//     borderRadius: 22.5,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },
//   avatarText: {
//     color: colors.white,
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   contactInfo: {
//     flex: 1,
//   },
//   contactName: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: colors.gray9,
//   },
//   username: {
//     fontSize: 14,
//     color: colors.gradientStart,
//     marginTop: 2,
//   },
//   statusRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 2,
//   },
//   notContactBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.warning + '20',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 10,
//     marginRight: 8,
//   },
//   notContactText: {
//     fontSize: 10,
//     color: colors.warning,
//     marginLeft: 2,
//   },
//   contactStatus: {
//     fontSize: 13,
//     color: colors.gray6,
//     flex: 1,
//   },
//   checkbox: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: colors.gray4,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   checkboxSelected: {
//     backgroundColor: colors.gradientStart,
//     borderColor: colors.gradientStart,
//   },
//   loadingContainer: {
//     padding: 50,
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     color: colors.gray6,
//     fontSize: 16,
//   },
//   emptyText: {
//     textAlign: 'center',
//     color: colors.gray5,
//     fontSize: 16,
//     padding: 20,
//   },
//   creatingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0, 0, 0, 0.7)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   creatingText: {
//     color: colors.white,
//     fontSize: 16,
//     marginTop: 10,
//   },
// });

// export default CreateGroupScreen;












// src/screens/CreateGroupScreen.js
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import colors from '../styles/colors';
import api from '../services/api';
import contactService from '../services/contactService';

const CreateGroupScreen = ({navigation}) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
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
      console.log('🔍 Loading contacts...');
      
      const syncedContacts = await contactService.syncContacts();
      console.log('📞 Synced contacts:', syncedContacts);
      console.log('📊 Total contacts found:', syncedContacts.length);
      
      // Mark contacts as "isContact: true"
      const markedContacts = syncedContacts.map(contact => ({
        ...contact,
        isContact: true
      }));
      
      setContacts(markedContacts);
      
      // If no contacts found, switch to username search
      if (syncedContacts.length === 0) {
        setSearchMode('username');
        Alert.alert(
          'No Contacts Found', 
          'No contacts using Chatry found. You can search users by username instead.',
          [{text: 'OK'}]
        );
      }
    } catch (error) {
      console.error('❌ Error loading contacts:', error);
      setSearchMode('username'); // Switch to username search on error
      Alert.alert('Info', 'Unable to sync contacts. You can search users by username.');
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
      
      // Mark search results and check if they're already in contacts
      const markedResults = response.users.map(user => {
        const isInContacts = contacts.some(contact => 
          contact._id === user._id || contact.id === user._id ||
          contact._id === user.id || contact.id === user.id
        );
        
        return {
          ...user,
          isContact: isInContacts,
          isFromSearch: true
        };
      });
      
      setSearchResults(markedResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const toggleContactSelection = (contact) => {
    const contactId = contact._id || contact.id;
    
    const isSelected = selectedContacts.find(c => 
      c._id === contactId || c.id === contactId
    );
    
    if (isSelected) {
      setSelectedContacts(selectedContacts.filter(c => 
        c._id !== contactId && c.id !== contactId
      ));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (selectedContacts.length === 0) {
      Alert.alert('Error', 'Please select at least one participant');
      return;
    }

    try {
      setCreating(true);
      
      const memberIds = selectedContacts.map(c => c._id || c.id);
      const response = await api.createGroup(
        groupName.trim(),
        groupDescription.trim(),
        memberIds
      );

      Alert.alert('Success', 'Group created successfully', [
        {
          text: 'OK',
          onPress: () => {
            navigation.replace('ChatDetail', {
              chatId: response.group._id,
              chatName: response.group.name,
              chatColor: '#96CEB4',
              isGroup: true,
              groupData: response.group,
            });
          }
        }
      ]);
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', error.message || 'Failed to create group');
    } finally {
      setCreating(false);
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
              {!item.isContact && searchMode === 'username' && (
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

  const renderSelectedContact = (contact) => {
    const name = contact.savedName || contact.name || contact.username || 'Unknown';
    const isContact = contact.isContact;
    
    return (
      <TouchableOpacity
        key={contact._id || contact.id}
        style={styles.selectedChip}
        onPress={() => toggleContactSelection(contact)}>
        <View style={styles.chipContent}>
          <Text style={styles.selectedChipText}>{name.split(' ')[0]}</Text>
          {!isContact && (
            <Icon name="at" size={12} color={colors.white} style={styles.chipIcon} />
          )}
        </View>
        <Icon name="close" size={16} color={colors.white} />
      </TouchableOpacity>
    );
  };

  // Count contacts and non-contacts in selection
  const selectedContactsCount = selectedContacts.filter(c => c.isContact).length;
  const selectedNonContactsCount = selectedContacts.filter(c => !c.isContact).length;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Group</Text>
          <TouchableOpacity 
            onPress={createGroup} 
            disabled={!groupName.trim() || selectedContacts.length === 0 || creating}>
            <Text style={[
              styles.createButton,
              (!groupName.trim() || selectedContacts.length === 0 || creating) && styles.createButtonDisabled
            ]}>
              {creating ? 'Creating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Group Info Section */}
        <View style={styles.groupInfoSection}>
          <View style={styles.groupAvatarContainer}>
            <View style={styles.groupAvatar}>
              <Icon name="camera" size={30} color={colors.gray5} />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Icon name="pencil" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.groupNameInput}
              placeholder="Group name"
              value={groupName}
              onChangeText={setGroupName}
              placeholderTextColor={colors.gray5}
              maxLength={25}
            />
            <Text style={styles.charCount}>{groupName.length}/25</Text>
          </View>

          <TextInput
            style={styles.descriptionInput}
            placeholder="Add group description (optional)"
            value={groupDescription}
            onChangeText={setGroupDescription}
            placeholderTextColor={colors.gray5}
            multiline
            maxLength={100}
          />
        </View>

        {/* Selected Contacts */}
        {selectedContacts.length > 0 && (
          <View style={styles.selectedSection}>
            <Text style={styles.sectionTitle}>
              {selectedContacts.length} participant{selectedContacts.length !== 1 ? 's' : ''} selected
            </Text>
            {selectedNonContactsCount > 0 && (
              <Text style={styles.selectionInfo}>
                {selectedContactsCount} from contacts, {selectedNonContactsCount} by username
              </Text>
            )}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.selectedChips}>
                {selectedContacts.map(renderSelectedContact)}
              </View>
            </ScrollView>
          </View>
        )}

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
              Contacts ({contacts.length})
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

        {/* Contacts List */}
        <Text style={styles.sectionTitle}>Add participants</Text>
        
        {loading && searchMode === 'contacts' ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading contacts...</Text>
          </View>
        ) : (
          <FlatList
            data={getFilteredData()}
            renderItem={renderContact}
            keyExtractor={(item) => item._id || item.id || item.phone}
            contentContainerStyle={styles.contactsList}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {searchMode === 'username' 
                  ? (searchQuery.length < 3 
                      ? 'Type at least 3 characters to search users' 
                      : searching ? 'Searching...' : 'No users found')
                  : 'No contacts found'}
              </Text>
            }
          />
        )}
      </ScrollView>

      {creating && (
        <View style={styles.creatingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.creatingText}>Creating group...</Text>
        </View>
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
  createButton: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  groupInfoSection: {
    backgroundColor: colors.white,
    padding: 20,
    alignItems: 'center',
  },
  groupAvatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  groupAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.gray2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gradientStart,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  groupNameInput: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.gray9,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray3,
    paddingBottom: 10,
  },
  charCount: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    fontSize: 12,
    color: colors.gray5,
  },
  descriptionInput: {
    fontSize: 14,
    color: colors.gray7,
    textAlign: 'center',
    minHeight: 40,
    maxHeight: 80,
  },
  selectedSection: {
    backgroundColor: colors.white,
    padding: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray6,
    marginBottom: 10,
    paddingHorizontal: 20,
    textTransform: 'uppercase',
  },
  selectionInfo: {
    fontSize: 12,
    color: colors.gray5,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  selectedChips: {
    flexDirection: 'row',
    paddingHorizontal: 15,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gradientStart,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedChipText: {
    color: colors.white,
    fontSize: 14,
  },
  chipIcon: {
    marginLeft: 4,
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
  loadingContainer: {
    padding: 50,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: colors.gray6,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.gray5,
    fontSize: 16,
    padding: 20,
  },
  creatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatingText: {
    color: colors.white,
    fontSize: 16,
    marginTop: 10,
  },
});

export default CreateGroupScreen;