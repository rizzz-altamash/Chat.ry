// src/screens/GroupDetailScreen.js
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  TextInput,
  ActivityIndicator,
  FlatList,
  Image,
  Switch,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import colors from '../styles/colors';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GroupDetailScreen = ({navigation, route}) => {
  const {groupId, groupData: initialGroupData} = route.params;
  
  // Initialize groupData with default settings if not present
  const [groupData, setGroupData] = useState({
    ...initialGroupData,
    settings: {
      onlyAdminsCanEditInfo: initialGroupData?.settings?.onlyAdminsCanEditInfo ?? false,
      onlyAdminsCanSend: initialGroupData?.settings?.onlyAdminsCanSend ?? false,
      onlyAdminsCanAddMembers: initialGroupData?.settings?.onlyAdminsCanAddMembers ?? false,
      ...initialGroupData?.settings
    }
  });
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [newGroupName, setNewGroupName] = useState(initialGroupData?.name || '');
  const [newDescription, setNewDescription] = useState(initialGroupData?.description || '');
  const [muteNotifications, setMuteNotifications] = useState(false);
  
  // New state for report functionality
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingMember, setReportingMember] = useState(null);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    loadGroupDetails(); // Load group details first, it will also load user data
    
    // Refresh when coming back from other screens
    const unsubscribe = navigation.addListener('focus', () => {
      loadGroupDetails();
    });
    
    return unsubscribe;
  }, [navigation, groupId]);

  const loadGroupDetails = async () => {
    try {
      setLoading(true);
      const response = await api.getGroups();
      const group = response.groups.find(g => g._id === groupId);
      if (group) {
        // Ensure settings have default values
        const updatedGroup = {
          ...group,
          settings: {
            onlyAdminsCanEditInfo: group.settings?.onlyAdminsCanEditInfo ?? false,
            onlyAdminsCanSend: group.settings?.onlyAdminsCanSend ?? false,
            onlyAdminsCanAddMembers: group.settings?.onlyAdminsCanAddMembers ?? false,
            ...group.settings
          }
        };
        
        setGroupData(updatedGroup);
        setNewGroupName(group.name);
        setNewDescription(group.description || '');
        
        // Make sure to check admin status with current user ID
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          const userId = user._id || user.id;
          setCurrentUserId(userId);
          
          // Convert IDs to strings for reliable comparison
          const userIdStr = String(userId);
          
          // Check if user is admin
          const isUserAdmin = group.admins?.some(adminId => {
            const adminIdStr = String(adminId?._id || adminId?.id || adminId);
            return adminIdStr === userIdStr;
          });
          
          // Check if user is creator
          const creatorIdStr = String(group.creator?._id || group.creator?.id || group.creator);
          const isUserCreator = creatorIdStr === userIdStr;
          
          setIsAdmin(isUserAdmin || isUserCreator); // Creator is always admin
          setIsCreator(isUserCreator);
          
          console.log('Group permissions updated:', {
            userId: userIdStr,
            isAdmin: isUserAdmin || isUserCreator,
            isCreator: isUserCreator,
            groupAdmins: group.admins,
            groupCreator: group.creator
          });
        }
      }
    } catch (error) {
      console.error('Error loading group details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGroupName = async () => {
    if (!newGroupName.trim() || newGroupName.trim() === groupData.name) {
      setEditingName(false);
      setNewGroupName(groupData.name); // Reset to original
      return;
    }

    try {
      setUpdating(true);
      await api.updateGroup(groupId, { name: newGroupName.trim() });
      setGroupData({...groupData, name: newGroupName.trim()});
      setEditingName(false);
      Alert.alert('Success', 'Group name updated');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update group name');
      setNewGroupName(groupData.name);
      setEditingName(false);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateDescription = async () => {
    if (newDescription.trim() === (groupData.description || '')) {
      setEditingDescription(false);
      return;
    }

    try {
      setUpdating(true);
      await api.updateGroup(groupId, { description: newDescription.trim() });
      setGroupData({...groupData, description: newDescription.trim()});
      setEditingDescription(false);
      Alert.alert('Success', 'Description updated');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update description');
      setNewDescription(groupData.description || '');
      setEditingDescription(false);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddMembers = () => {
    navigation.navigate('AddGroupMembers', {
      groupId,
      existingMembers: groupData.members,
    });
  };

  const handleRemoveMember = (memberId) => {
    const member = groupData.members.find(m => m.user._id === memberId);
    const memberName = member?.user?.name || 'this member';
    
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName} from the group?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.removeGroupMember(groupId, memberId);
              loadGroupDetails();
              Alert.alert('Success', 'Member removed');
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to remove member');
            }
          }
        }
      ]
    );
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.removeGroupMember(groupId, currentUserId);
              navigation.navigate('Main', { screen: 'Groups' });
            } catch (error) {
              Alert.alert('Error', 'Failed to leave group');
            }
          }
        }
      ]
    );
  };

  // New function to handle member report
  const handleReportMember = async (memberId) => {
    try {
      const response = await api.reportGroupMember(groupId, memberId, reportReason);
      
      if (response.removed) {
        Alert.alert(
          'Member Removed',
          'The member has been automatically removed due to multiple reports.'
        );
        loadGroupDetails();
      } else {
        Alert.alert(
          'Member Reported',
          `Report submitted. ${response.reportPercentage}% of members have reported this user.`
        );
      }
      
      setShowReportModal(false);
      setReportingMember(null);
      setReportReason('');
    } catch (error) {
      Alert.alert('Error', 'Failed to report member');
    }
  };

  // New function to view member profile
  const handleViewMember = (member) => {
    navigation.navigate('UserInfo', {
      userId: member._id || member.id,
      fromGroup: true
    });
  };

  // New function to toggle admin status
  const handleToggleAdmin = async (memberId, isCurrentlyAdmin) => {
    try {
      if (isCurrentlyAdmin) {
        // Remove admin
        Alert.alert(
          'Remove Admin',
          'Remove admin privileges from this member?',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Remove',
              style: 'destructive',
              onPress: async () => {
                await api.removeAdmin(groupId, memberId);
                loadGroupDetails();
                Alert.alert('Success', 'Admin privileges removed');
              }
            }
          ]
        );
      } else {
        // Make admin
        Alert.alert(
          'Make Admin',
          'Make this member an admin?',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Make Admin',
              onPress: async () => {
                await api.makeAdmin(groupId, memberId);
                loadGroupDetails();
                Alert.alert('Success', 'Member is now an admin');
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update admin status');
    }
  };

  // New function to update settings
  const handleUpdateSettings = async (setting, value) => {
    try {
      await api.updateGroupSettings(groupId, { [setting]: value });
      loadGroupDetails();
      Alert.alert('Success', 'Settings updated');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update settings');
    }
  };

  const renderMember = ({item}) => {
    const member = item.user;
    if (!member) return null;
    
    const memberId = member._id || member.id;
    const memberIdStr = String(memberId);
    const currentUserIdStr = String(currentUserId);
    const isCurrentUser = memberIdStr === currentUserIdStr;
    
    // Check if member is admin
    const isMemberAdmin = groupData.admins?.some(adminId => {
      const adminIdStr = String(adminId?._id || adminId?.id || adminId);
      return adminIdStr === memberIdStr;
    });
    
    // Check if member is creator
    const creatorIdStr = String(groupData.creator?._id || groupData.creator?.id || groupData.creator);
    const isMemberCreator = creatorIdStr === memberIdStr;

    // Determine what actions current user can perform
    const canRemoveMember = () => {
      if (isCurrentUser) return true; // Can always leave
      if (isMemberCreator) return false; // No one can remove creator
      if (isCreator) return true; // Creator can remove anyone
      if (isAdmin && !isMemberAdmin) return true; // Admin can remove non-admins
      return false;
    };

    const canToggleAdmin = () => {
      if (isCurrentUser) return false; // Can't change own admin status
      if (isMemberCreator) return false; // Creator is always admin
      return isAdmin || isCreator; // Only admins/creator can toggle admin status
    };
    
    return (
      <TouchableOpacity 
        style={styles.memberItem}
        onPress={() => handleViewMember(member)}
        activeOpacity={0.7}>
        <View style={styles.memberLeft}>
          {member.avatar ? (
            <Image source={{uri: member.avatar}} style={styles.memberAvatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, {backgroundColor: colors.accent}]}>
              <Text style={styles.avatarText}>
                {member.name?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <View style={styles.memberInfo}>
            <View style={styles.memberNameRow}>
              <Text style={styles.memberName}>
                {member.name} {isCurrentUser && '(You)'}
              </Text>
              {isMemberCreator && (
                <View style={styles.creatorBadge}>
                  <Text style={styles.creatorText}>Creator</Text>
                </View>
              )}
              {!isMemberCreator && isMemberAdmin && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminText}>Admin</Text>
                </View>
              )}
            </View>
            {member.status && (
              <Text style={styles.memberStatus} numberOfLines={1}>
                {member.status}
              </Text>
            )}
          </View>
        </View>
        
        {!isCurrentUser && (
          <View style={styles.memberActions}>
            {canToggleAdmin() && (
              <TouchableOpacity 
                style={styles.actionIcon}
                onPress={() => handleToggleAdmin(memberId, isMemberAdmin)}>
                <Icon 
                  name={isMemberAdmin ? "shield-remove" : "shield-checkmark"} 
                  size={22} 
                  color={colors.gradientStart} 
                />
              </TouchableOpacity>
            )}
            {canRemoveMember() && (
              <TouchableOpacity 
                style={styles.actionIcon}
                onPress={() => handleRemoveMember(memberId)}>
                <Icon name="close-circle" size={24} color={colors.danger} />
              </TouchableOpacity>
            )}
            {!isMemberCreator && (
              <TouchableOpacity 
                style={styles.actionIcon}
                onPress={() => {
                  setReportingMember(member);
                  setShowReportModal(true);
                }}>
                <Icon name="warning-outline" size={24} color={colors.warning} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  const canEditInfo = () => {
    // If settings say only admins can edit, check if user is admin
    const canEdit = groupData?.settings?.onlyAdminsCanEditInfo 
      ? isAdmin 
      : true;
    
    console.log('Can edit info:', {
      onlyAdminsCanEditInfo: groupData?.settings?.onlyAdminsCanEditInfo,
      isAdmin,
      canEdit
    });
    
    return canEdit;
  };

  const canAddMembers = () => {
    if (groupData?.settings?.onlyAdminsCanAddMembers) {
      return isAdmin || isCreator;
    }
    return true; // Any member can add if setting is off
  };

  if (loading || !groupData) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Group Info</Text>
            <View style={{width: 24}} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Group Info</Text>
          <View style={styles.headerActions}>
            {canAddMembers() && (
              <TouchableOpacity onPress={handleAddMembers}>
                <Icon name="person-add-outline" size={24} color={colors.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Group Header */}
        <View style={styles.groupHeader}>
          <TouchableOpacity style={styles.groupAvatarContainer}>
            <View style={[styles.groupAvatar, {backgroundColor: route.params.chatColor || colors.accent}]}>
              <Text style={styles.groupAvatarText}>
                {getInitials(groupData?.name)}
              </Text>
            </View>
            {canEditInfo() && (
              <TouchableOpacity style={styles.editAvatarButton}>
                <Icon name="camera" size={16} color={colors.white} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* Group Name */}
          {editingName ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.editInput}
                value={newGroupName}
                onChangeText={setNewGroupName}
                onBlur={handleUpdateGroupName}
                autoFocus
                maxLength={25}
                editable={!updating}
              />
            </View>
          ) : (
            <View style={styles.nameContainer}>
              <Text style={styles.groupName}>{groupData?.name}</Text>
              {canEditInfo() && (
                <TouchableOpacity 
                  onPress={() => setEditingName(true)}
                  style={styles.editIconButton}>
                  <Icon name="pencil" size={20} color={colors.gradientStart} />
                </TouchableOpacity>
              )}
            </View>
          )}

          <Text style={styles.memberCount}>
            {groupData?.members?.length || 0} participants
          </Text>
          
          {/* Show user's role */}
          {currentUserId && (
            <View style={styles.userRoleContainer}>
              {isCreator && (
                <View style={styles.roleBadge}>
                  <Icon name="star" size={14} color={colors.white} />
                  <Text style={styles.roleText}>You are the creator</Text>
                </View>
              )}
              {!isCreator && isAdmin && (
                <View style={styles.roleBadge}>
                  <Icon name="shield-checkmark" size={14} color={colors.white} />
                  <Text style={styles.roleText}>You are an admin</Text>
                </View>
              )}
            </View>
          )}
          
          {/* Show edit permission info */}
          {!canEditInfo() && (
            <Text style={styles.editPermissionInfo}>
              Only admins can edit group info
            </Text>
          )}
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Description</Text>
            {canEditInfo() && !editingDescription && (
              <TouchableOpacity 
                onPress={() => setEditingDescription(true)}
                style={styles.editButton}>
                <Icon name="pencil" size={18} color={colors.gradientStart} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {editingDescription ? (
            <TextInput
              style={styles.descriptionInput}
              value={newDescription}
              onChangeText={setNewDescription}
              onBlur={handleUpdateDescription}
              placeholder="Add group description"
              multiline
              autoFocus
              maxLength={100}
            />
          ) : (
            <TouchableOpacity 
              onPress={() => canEditInfo() && setEditingDescription(true)}
              disabled={!canEditInfo()}>
              <Text style={[styles.description, !groupData?.description && styles.placeholderText]}>
                {groupData?.description || (canEditInfo() ? 'Tap to add description' : 'No description')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="notifications-off" size={20} color={colors.gray6} />
              <Text style={styles.settingText}>Mute notifications</Text>
            </View>
            <Switch
              value={muteNotifications}
              onValueChange={setMuteNotifications}
              trackColor={{false: colors.gray3, true: colors.gradientStart}}
              thumbColor={muteNotifications ? colors.white : colors.gray5}
            />
          </View>
          
          {(isAdmin || isCreator) && (
            <>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Icon name="create-outline" size={20} color={colors.gray6} />
                  <Text style={styles.settingText}>Only admins can edit info</Text>
                </View>
                <Switch
                  value={groupData?.settings?.onlyAdminsCanEditInfo}
                  onValueChange={(value) => handleUpdateSettings('onlyAdminsCanEditInfo', value)}
                  trackColor={{false: colors.gray3, true: colors.gradientStart}}
                  thumbColor={groupData?.settings?.onlyAdminsCanEditInfo ? colors.white : colors.gray5}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Icon name="chatbubble-outline" size={20} color={colors.gray6} />
                  <Text style={styles.settingText}>Only admins can send messages</Text>
                </View>
                <Switch
                  value={groupData?.settings?.onlyAdminsCanSend}
                  onValueChange={(value) => handleUpdateSettings('onlyAdminsCanSend', value)}
                  trackColor={{false: colors.gray3, true: colors.gradientStart}}
                  thumbColor={groupData?.settings?.onlyAdminsCanSend ? colors.white : colors.gray5}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Icon name="person-add-outline" size={20} color={colors.gray6} />
                  <Text style={styles.settingText}>Only admins can add members</Text>
                </View>
                <Switch
                  value={groupData?.settings?.onlyAdminsCanAddMembers}
                  onValueChange={(value) => handleUpdateSettings('onlyAdminsCanAddMembers', value)}
                  trackColor={{false: colors.gray3, true: colors.gradientStart}}
                  thumbColor={groupData?.settings?.onlyAdminsCanAddMembers ? colors.white : colors.gray5}
                />
              </View>
            </>
          )}
        </View>

        {/* Members Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                {groupData?.members?.length || 0} Participants ({groupData?.maxMembers || 100} max)
              </Text>
              {groupData?.settings?.onlyAdminsCanAddMembers && (
                <Text style={styles.settingHint}>Only admins can add members</Text>
              )}
            </View>
            {canAddMembers() && (
              <TouchableOpacity 
                onPress={handleAddMembers}
                style={styles.addMemberButton}>
                <Icon name="person-add" size={20} color={colors.gradientStart} />
                <Text style={styles.addMemberText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Add Members Button - More prominent */}
          {canAddMembers() && (
            <TouchableOpacity 
              style={styles.addMemberRow}
              onPress={handleAddMembers}>
              <View style={styles.addMemberIcon}>
                <Icon name="person-add-outline" size={24} color={colors.white} />
              </View>
              <Text style={styles.addMemberRowText}>Add Participants</Text>
              <Icon name="chevron-forward" size={20} color={colors.gray5} />
            </TouchableOpacity>
          )}

          <FlatList
            data={groupData?.members || []}
            renderItem={renderMember}
            keyExtractor={(item) => item.user?._id || item.user?.id || Math.random().toString()}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.memberSeparator} />}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLeaveGroup}>
            <Icon name="exit-outline" size={20} color={colors.danger} />
            <Text style={styles.leaveText}>Leave Group</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Report Modal */}
      {showReportModal && (
        <Modal
          visible={showReportModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowReportModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Report {reportingMember?.name}</Text>
              
              <TextInput
                style={styles.reportInput}
                placeholder="Reason for reporting (optional)"
                value={reportReason}
                onChangeText={setReportReason}
                multiline
                maxLength={200}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowReportModal(false);
                    setReportingMember(null);
                    setReportReason('');
                  }}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.reportButton]}
                  onPress={() => {
                    const memberId = reportingMember._id || reportingMember.id;
                    handleReportMember(memberId);
                  }}>
                  <Text style={styles.reportButtonText}>Report</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Loading Overlay */}
      {updating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>Updating...</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerActions: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  groupHeader: {
    backgroundColor: colors.white,
    alignItems: 'center',
    paddingVertical: 30,
  },
  groupAvatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  groupAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupAvatarText: {
    color: colors.white,
    fontSize: 36,
    fontWeight: '700',
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
  groupName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray9,
    marginBottom: 5,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIconButton: {
    marginLeft: 10,
    padding: 5,
  },
  memberCount: {
    fontSize: 16,
    color: colors.gray6,
  },
  userRoleContainer: {
    marginTop: 10,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gradientStart,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  roleText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  editPermissionInfo: {
    fontSize: 14,
    color: colors.warning,
    marginTop: 5,
    fontStyle: 'italic',
  },
  editContainer: {
    paddingHorizontal: 40,
    width: '100%',
  },
  editInput: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray9,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.gradientStart,
    paddingBottom: 5,
  },
  section: {
    backgroundColor: colors.white,
    marginTop: 10,
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray6,
    textTransform: 'uppercase',
  },
  settingHint: {
    fontSize: 12,
    color: colors.gray6,
    marginTop: 2,
    fontStyle: 'italic',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    color: colors.gradientStart,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  placeholderText: {
    fontStyle: 'italic',
    color: colors.gray5,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gradientStart,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  addMemberText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  addMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray2,
  },
  addMemberIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: colors.gradientStart,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addMemberRowText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray9,
  },
  description: {
    fontSize: 16,
    color: colors.gray7,
    paddingHorizontal: 20,
  },
  descriptionInput: {
    fontSize: 16,
    color: colors.gray7,
    paddingHorizontal: 20,
    minHeight: 40,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: colors.gray8,
    marginLeft: 12,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  memberSeparator: {
    height: 1,
    backgroundColor: colors.gray2,
    marginLeft: 77, // Align with text after avatar
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
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
    fontSize: 18,
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray9,
  },
  memberStatus: {
    fontSize: 13,
    color: colors.gray6,
    marginTop: 2,
  },
  creatorBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  creatorText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  adminBadge: {
    backgroundColor: colors.gradientStart,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  adminText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginLeft: 10,
    padding: 5,
  },
  removeButton: {
    padding: 5,
  },
  actions: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  leaveText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray9,
    marginBottom: 15,
    textAlign: 'center',
  },
  reportInput: {
    borderWidth: 1,
    borderColor: colors.gray3,
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.gray2,
    marginRight: 10,
  },
  reportButton: {
    backgroundColor: colors.danger,
    marginLeft: 10,
  },
  cancelButtonText: {
    color: colors.gray7,
    fontSize: 16,
    fontWeight: '600',
  },
  reportButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Loading overlay styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.white,
    fontSize: 16,
    marginTop: 10,
  },
});

export default GroupDetailScreen;