// // ===== src/controllers/groupController.js =====
// const Group = require('../models/Group');
// const Message = require('../models/Message');
// const User = require('../models/User');

// const createGroup = async (req, res, next) => {
//   try {
//     const { name, description, memberIds } = req.body;
//     const creatorId = req.user._id;

//     // Create group
//     const group = new Group({
//       name,
//       description,
//       creator: creatorId,
//       admins: [creatorId],
//       members: [
//         { user: creatorId, role: 'admin' },
//         ...memberIds.map(id => ({ user: id, role: 'member' }))
//       ]
//     });

//     await group.save();

//     // Add group to users' groups array
//     await User.updateMany(
//       { _id: { $in: [creatorId, ...memberIds] } },
//       { $push: { groups: group._id } }
//     );

//     await group.populate('members.user', 'name avatar');

//     res.status(201).json({
//       message: 'Group created successfully',
//       group
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const getGroups = async (req, res, next) => {
//   try {
//     const userId = req.user._id;

//     const user = await User.findById(userId).populate({
//       path: 'groups',
//       populate: [
//         { path: 'lastMessage' },
//         { path: 'members.user', select: 'name avatar' }
//       ]
//     });

//     res.json({ groups: user.groups });
//   } catch (error) {
//     next(error);
//   }
// };

// const getGroupMessages = async (req, res, next) => {
//   try {
//     const { groupId } = req.params;
//     const { page = 1, limit = 50 } = req.query;
//     const userId = req.user._id;

//     // Check if user is member of group
//     const group = await Group.findById(groupId);
//     if (!group || !group.members.some(m => m.user.toString() === userId.toString())) {
//       return res.status(403).json({ error: 'Access denied' });
//     }

//     const messages = await Message.find({
//       group: groupId,
//       deletedFor: { $ne: userId }
//     })
//     .populate('sender', 'name avatar')
//     .sort({ createdAt: -1 })
//     .limit(limit * 1)
//     .skip((page - 1) * limit);

//     res.json({
//       messages: messages.reverse(),
//       page: parseInt(page),
//       hasMore: messages.length === parseInt(limit)
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const sendGroupMessage = async (req, res, next) => {
//   try {
//     const { groupId, text, type = 'text' } = req.body;
//     const senderId = req.user._id;

//     // Check if user is member of group
//     const group = await Group.findById(groupId);
//     if (!group || !group.members.some(m => m.user.toString() === senderId.toString())) {
//       return res.status(403).json({ error: 'You are not a member of this group' });
//     }

//     // Check if only admins can send
//     if (group.settings.onlyAdminsCanSend) {
//       const isAdmin = group.admins.includes(senderId);
//       if (!isAdmin) {
//         return res.status(403).json({ error: 'Only admins can send messages in this group' });
//       }
//     }

//     // Create message
//     const message = new Message({
//       sender: senderId,
//       group: groupId,
//       text,
//       type
//     });

//     await message.save();

//     // Update group
//     group.lastMessage = message._id;
//     group.lastActivity = new Date();
//     await group.save();

//     await message.populate('sender', 'name avatar');

//     res.status(201).json({
//       message: 'Message sent successfully',
//       data: message
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const addGroupMembers = async (req, res, next) => {
//   try {
//     const { groupId } = req.params;
//     const { memberIds } = req.body;
//     const userId = req.user._id;

//     const group = await Group.findById(groupId);
//     if (!group) {
//       return res.status(404).json({ error: 'Group not found' });
//     }

//     // Check if user is admin
//     if (!group.admins.includes(userId)) {
//       return res.status(403).json({ error: 'Only admins can add members' });
//     }

//     // Add new members
//     const newMembers = memberIds.filter(id => 
//       !group.members.some(m => m.user.toString() === id)
//     );

//     if (newMembers.length > 0) {
//       group.members.push(...newMembers.map(id => ({ user: id, role: 'member' })));
//       await group.save();

//       // Update users' groups array
//       await User.updateMany(
//         { _id: { $in: newMembers } },
//         { $push: { groups: group._id } }
//       );
//     }

//     res.json({
//       message: 'Members added successfully',
//       addedCount: newMembers.length
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const removeGroupMember = async (req, res, next) => {
//   try {
//     const { groupId, memberId } = req.params;
//     const userId = req.user._id;

//     const group = await Group.findById(groupId);
//     if (!group) {
//       return res.status(404).json({ error: 'Group not found' });
//     }

//     // Check if user is admin or removing themselves
//     if (!group.admins.includes(userId) && userId.toString() !== memberId) {
//       return res.status(403).json({ error: 'Only admins can remove members' });
//     }

//     // Remove member
//     group.members = group.members.filter(
//       m => m.user.toString() !== memberId
//     );
    
//     // Remove from admins if applicable
//     group.admins = group.admins.filter(
//       id => id.toString() !== memberId
//     );

//     await group.save();

//     // Update user's groups array
//     await User.findByIdAndUpdate(memberId, {
//       $pull: { groups: group._id }
//     });

//     res.json({ message: 'Member removed successfully' });
//   } catch (error) {
//     next(error);
//   }
// };

// const updateGroup = async (req, res, next) => {
//   try {
//     const { groupId } = req.params;
//     const { name, description, avatar } = req.body;
//     const userId = req.user._id;

//     const group = await Group.findById(groupId);
//     if (!group) {
//       return res.status(404).json({ error: 'Group not found' });
//     }

//     // Check if user is admin
//     if (!group.admins.includes(userId)) {
//       return res.status(403).json({ error: 'Only admins can update group' });
//     }

//     if (name) group.name = name;
//     if (description !== undefined) group.description = description;
//     if (avatar) group.avatar = avatar;

//     await group.save();

//     res.json({
//       message: 'Group updated successfully',
//       group
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   createGroup,
//   getGroups,
//   getGroupMessages,
//   sendGroupMessage,
//   addGroupMembers,
//   removeGroupMember,
//   updateGroup
// };















// ===== src/controllers/groupController.js =====
const Group = require('../models/Group');
const Message = require('../models/Message');
const User = require('../models/User');

const createGroup = async (req, res, next) => {
  try {
    const { name, description, memberIds } = req.body;
    const creatorId = req.user._id;

    // Create group
    const group = new Group({
      name,
      description,
      creator: creatorId,
      admins: [creatorId],
      members: [
        { user: creatorId, role: 'admin' },
        ...memberIds.map(id => ({ user: id, role: 'member' }))
      ]
    });

    await group.save();

    // Create initial system message
    const systemMessage = new Message({
      group: group._id,
      text: `${req.user.name} created this group`,
      type: 'system',
      metadata: {
        action: 'group_created'
      }
    });
    await systemMessage.save();

    // Add group to users' groups array
    await User.updateMany(
      { _id: { $in: [creatorId, ...memberIds] } },
      { $push: { groups: group._id } }
    );

    await group.populate('members.user', 'name avatar');

    // Emit group created event
    const io = req.app.get('io');
    if (io) {
      // Notify all members
      [...memberIds, creatorId].forEach(memberId => {
        io.to(memberId.toString()).emit('group_created', {
          groupId: group._id,
          groupName: group.name,
          creatorName: req.user.name
        });
      });
    }

    res.status(201).json({
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    next(error);
  }
};

const getGroups = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: 'groups',
      populate: [
        { path: 'lastMessage' },
        { path: 'members.user', select: 'name avatar' },
        { path: 'creator', select: 'name' }
      ]
    });

    res.json({ groups: user.groups });
  } catch (error) {
    next(error);
  }
};

const getGroupMessages = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id;

    // Check if user is member of group
    const group = await Group.findById(groupId);
    if (!group || !group.members.some(m => m.user.toString() === userId.toString())) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await Message.find({
      group: groupId,
      deletedFor: { $ne: userId }
    })
    .populate('sender', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    res.json({
      messages: messages.reverse(),
      page: parseInt(page),
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    next(error);
  }
};

const sendGroupMessage = async (req, res, next) => {
  try {
    const { groupId, text, type = 'text' } = req.body;
    const senderId = req.user._id;

    // Check if user is member of group
    const group = await Group.findById(groupId);
    if (!group || !group.members.some(m => m.user.toString() === senderId.toString())) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    // Check if only admins can send
    if (group.settings.onlyAdminsCanSend) {
      const isAdmin = group.admins.includes(senderId);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only admins can send messages in this group' });
      }
    }

    // Create message
    const message = new Message({
      sender: senderId,
      group: groupId,
      text,
      type
    });

    await message.save();

    // Update group
    group.lastMessage = message._id;
    group.lastActivity = new Date();
    await group.save();

    await message.populate('sender', 'name avatar');

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    next(error);
  }
};

const addGroupMembers = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is member
    if (!group.members.some(m => m.user.toString() === userId.toString())) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    // Check add member permissions
    if (group.settings.onlyAdminsCanAddMembers) {
      const isUserAdmin = group.admins.includes(userId);
      const isUserCreator = group.creator.toString() === userId.toString();
      
      if (!isUserAdmin && !isUserCreator) {
        return res.status(403).json({ error: 'Only admins can add members to this group' });
      }
    }

    // Check member limit
    const currentMemberCount = group.members.length;
    const newMembersToAdd = memberIds.filter(id => 
      !group.members.some(m => m.user.toString() === id)
    );

    if (currentMemberCount + newMembersToAdd.length > group.maxMembers) {
      return res.status(400).json({ 
        error: `Cannot add members. Group limit is ${group.maxMembers} members.`,
        currentCount: currentMemberCount,
        maxMembers: group.maxMembers
      });
    }

    // Add new members
    const newMembers = memberIds.filter(id => 
      !group.members.some(m => m.user.toString() === id)
    );

    if (newMembers.length > 0) {
      group.members.push(...newMembers.map(id => ({ user: id, role: 'member' })));
      await group.save();

      // Update users' groups array
      await User.updateMany(
        { _id: { $in: newMembers } },
        { $push: { groups: group._id } }
      );

      // Emit socket event
      const io = req.app.get('io');
      if (io) {
        const addedMembers = await User.find({ _id: { $in: newMembers } }).select('name');
        
        // Create system message
        const systemMessage = new Message({
          sender: userId,
          group: groupId,
          text: `${req.user.name} added ${addedMembers.map(m => m.name).join(', ')}`,
          type: 'system',
          metadata: {
            action: 'member_added',
            addedBy: userId,
            addedMembers: newMembers
          }
        });
        await systemMessage.save();

        // Emit to all group members
        const allMemberIds = group.members.map(m => m.user.toString());
        io.to(`group_${groupId}`).emit('group_member_added', {
          groupId,
          memberIds: newMembers,
          memberName: addedMembers[0]?.name,
          addedBy: userId,
          addedByName: req.user.name
        });
      }
    }

    res.json({
      message: 'Members added successfully',
      addedCount: newMembers.length
    });
  } catch (error) {
    next(error);
  }
};

const removeGroupMember = async (req, res, next) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isUserAdmin = group.admins.includes(userId);
    const isUserCreator = group.creator.toString() === userId.toString();
    const isMemberAdmin = group.admins.includes(memberId);
    const isMemberCreator = group.creator.toString() === memberId;

    // Cannot remove creator
    if (isMemberCreator && userId.toString() !== memberId) {
      return res.status(403).json({ error: 'Cannot remove group creator' });
    }

    // Check permissions
    if (userId.toString() !== memberId) { // Not removing self
      if (isUserCreator) {
        // Creator can remove anyone
      } else if (isUserAdmin) {
        // Admin can only remove non-admins
        if (isMemberAdmin) {
          return res.status(403).json({ error: 'Admins cannot remove other admins' });
        }
      } else {
        return res.status(403).json({ error: 'Only admins can remove members' });
      }
    }

    // Get member info before removing
    const removedMember = await User.findById(memberId).select('name');
    
    // Remove member
    group.members = group.members.filter(
      m => m.user.toString() !== memberId
    );
    
    // Remove from admins if applicable
    group.admins = group.admins.filter(
      id => id.toString() !== memberId
    );

    await group.save();

    // Update user's groups array
    await User.findByIdAndUpdate(memberId, {
      $pull: { groups: group._id }
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      // Create system message
      const systemMessage = new Message({
        sender: userId,
        group: groupId,
        text: userId.toString() === memberId 
          ? `${removedMember.name} left the group`
          : `${req.user.name} removed ${removedMember.name}`,
        type: 'system',
        metadata: {
          action: userId.toString() === memberId ? 'member_left' : 'member_removed',
          removedBy: userId,
          removedMember: memberId
        }
      });
      await systemMessage.save();

      // Emit appropriate event
      if (userId.toString() === memberId) {
        io.to(`group_${groupId}`).emit('group_member_left', {
          groupId,
          memberId,
          memberName: removedMember.name
        });
      } else {
        io.to(`group_${groupId}`).emit('group_member_removed', {
          groupId,
          memberId,
          memberName: removedMember.name,
          removedBy: userId,
          removedByName: req.user.name
        });
      }
    }

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    next(error);
  }
};

// const updateGroup = async (req, res, next) => {
//   try {
//     const { groupId } = req.params;
//     const { name, description, avatar } = req.body;
//     const userId = req.user._id;

//     const group = await Group.findById(groupId);
//     if (!group) {
//       return res.status(404).json({ error: 'Group not found' });
//     }

//     // Check if user is admin
//     if (!group.admins.includes(userId)) {
//       return res.status(403).json({ error: 'Only admins can update group' });
//     }

//     if (name) group.name = name;
//     if (description !== undefined) group.description = description;
//     if (avatar) group.avatar = avatar;

//     await group.save();

//     res.json({
//       message: 'Group updated successfully',
//       group
//     });
//   } catch (error) {
//     next(error);
//   }
// };

const updateGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { name, description, avatar } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is a member
    if (!group.members.some(m => m.user.toString() === userId.toString())) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    // Check edit permissions
    if (group.settings.onlyAdminsCanEditInfo && !group.admins.includes(userId)) {
      return res.status(403).json({ error: 'Only admins can edit group info' });
    }

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (avatar) group.avatar = avatar;

    await group.save();

    // Emit update event
    const io = req.app.get('io');
    if (io) {
      io.to(`group_${groupId}`).emit('group_updated', {
        groupId,
        updates: { name, description, avatar },
        updatedBy: req.user.name
      });
    }

    res.json({
      message: 'Group updated successfully',
      group
    });
  } catch (error) {
    next(error);
  }
};

// Report a group member
const reportGroupMember = async (req, res, next) => {
  try {
    const { groupId, memberId } = req.params;
    const { reason } = req.body;
    const reporterId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if reporter is a member
    if (!group.members.some(m => m.user.toString() === reporterId.toString())) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    // Check if member exists
    if (!group.members.some(m => m.user.toString() === memberId)) {
      return res.status(404).json({ error: 'Member not found in group' });
    }

    // Can't report yourself
    if (reporterId.toString() === memberId) {
      return res.status(400).json({ error: 'You cannot report yourself' });
    }

    // Find or create report entry
    let reportEntry = group.reportedMembers.find(
      r => r.member.toString() === memberId
    );

    if (!reportEntry) {
      reportEntry = {
        member: memberId,
        reportedBy: []
      };
      group.reportedMembers.push(reportEntry);
    }

    // Check if already reported by this user
    if (reportEntry.reportedBy.some(r => r.user.toString() === reporterId.toString())) {
      return res.status(400).json({ error: 'You have already reported this member' });
    }

    // Add report
    reportEntry.reportedBy.push({
      user: reporterId,
      reason: reason || 'Inappropriate behavior'
    });

    // Check if member should be auto-removed (>35% of members reported)
    const totalMembers = group.members.length;
    const reportCount = reportEntry.reportedBy.length;
    const reportPercentage = (reportCount / totalMembers) * 100;

    if (reportPercentage > 35) {
      // Auto-remove member
      group.members = group.members.filter(
        m => m.user.toString() !== memberId
      );
      
      // Remove from admins if applicable
      group.admins = group.admins.filter(
        id => id.toString() !== memberId
      );

      // Clear reports for this member
      group.reportedMembers = group.reportedMembers.filter(
        r => r.member.toString() !== memberId
      );

      await group.save();

      // Update user's groups
      await User.findByIdAndUpdate(memberId, {
        $pull: { groups: group._id }
      });

      // Create system message
      const systemMessage = new Message({
        group: groupId,
        text: 'A member was removed due to multiple reports',
        type: 'system',
        metadata: {
          action: 'member_auto_removed',
          removedMember: memberId,
          reason: 'multiple_reports'
        }
      });
      await systemMessage.save();

      // Emit socket event
      const io = req.app.get('io');
      if (io) {
        io.to(`group_${groupId}`).emit('group_member_auto_removed', {
          groupId,
          memberId,
          reason: 'Removed due to inappropriate behavior'
        });

        // Notify the removed user
        io.to(memberId.toString()).emit('removed_from_group', {
          groupId,
          groupName: group.name,
          reason: 'You were removed from the group due to multiple reports for inappropriate behavior'
        });
      }

      res.json({ 
        message: 'Member reported and automatically removed',
        removed: true 
      });
    } else {
      await group.save();
      res.json({ 
        message: 'Member reported successfully',
        removed: false,
        reportPercentage: reportPercentage.toFixed(1)
      });
    }
  } catch (error) {
    next(error);
  }
};

// Update group settings
const updateGroupSettings = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { onlyAdminsCanEditInfo, onlyAdminsCanSend, onlyAdminsCanAddMembers } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Only admins and creator can change settings
    const isUserAdmin = group.admins.includes(userId);
    const isUserCreator = group.creator.toString() === userId.toString();
    
    if (!isUserAdmin && !isUserCreator) {
      return res.status(403).json({ error: 'Only admins can change group settings' });
    }

    if (onlyAdminsCanEditInfo !== undefined) {
      group.settings.onlyAdminsCanEditInfo = onlyAdminsCanEditInfo;
    }

    if (onlyAdminsCanSend !== undefined) {
      group.settings.onlyAdminsCanSend = onlyAdminsCanSend;
    }

    if (onlyAdminsCanAddMembers !== undefined) {
      group.settings.onlyAdminsCanAddMembers = onlyAdminsCanAddMembers;
    }

    await group.save();

    res.json({
      message: 'Settings updated successfully',
      settings: group.settings
    });
  } catch (error) {
    next(error);
  }
};

// Make member admin
const makeAdmin = async (req, res, next) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is admin or creator
    const isUserAdmin = group.admins.includes(userId);
    const isUserCreator = group.creator.toString() === userId.toString();
    
    if (!isUserAdmin && !isUserCreator) {
      return res.status(403).json({ error: 'Only admins can make other members admin' });
    }

    // Check if member exists in group
    if (!group.members.some(m => m.user.toString() === memberId)) {
      return res.status(404).json({ error: 'Member not found in group' });
    }

    // Check if already admin
    if (group.admins.includes(memberId)) {
      return res.status(400).json({ error: 'Member is already an admin' });
    }

    // Add to admins
    group.admins.push(memberId);
    
    // Update member role
    const memberIndex = group.members.findIndex(m => m.user.toString() === memberId);
    if (memberIndex !== -1) {
      group.members[memberIndex].role = 'admin';
    }
    
    await group.save();

    // Create system message
    const systemMessage = new Message({
      group: groupId,
      text: `${req.user.name} made someone an admin`,
      type: 'system',
      metadata: {
        action: 'member_made_admin',
        promotedBy: userId,
        promotedMember: memberId
      }
    });
    await systemMessage.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`group_${groupId}`).emit('member_made_admin', {
        groupId,
        memberId,
        promotedBy: userId,
        promotedByName: req.user.name
      });
    }

    res.json({ message: 'Member made admin successfully' });
  } catch (error) {
    next(error);
  }
};

// Remove admin (demote to member)
const removeAdmin = async (req, res, next) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is admin or creator
    const isUserAdmin = group.admins.includes(userId);
    const isUserCreator = group.creator.toString() === userId.toString();
    
    if (!isUserAdmin && !isUserCreator) {
      return res.status(403).json({ error: 'Only admins can remove admin privileges' });
    }

    // Cannot remove creator's admin status
    if (group.creator.toString() === memberId) {
      return res.status(403).json({ error: 'Cannot remove admin privileges from group creator' });
    }

    // Check if member is admin
    if (!group.admins.includes(memberId)) {
      return res.status(400).json({ error: 'Member is not an admin' });
    }

    // Remove from admins
    group.admins = group.admins.filter(id => id.toString() !== memberId);
    
    // Update member role
    const memberIndex = group.members.findIndex(m => m.user.toString() === memberId);
    if (memberIndex !== -1) {
      group.members[memberIndex].role = 'member';
    }
    
    await group.save();

    // Create system message
    const systemMessage = new Message({
      group: groupId,
      text: `${req.user.name} removed someone's admin privileges`,
      type: 'system',
      metadata: {
        action: 'admin_removed',
        demotedBy: userId,
        demotedMember: memberId
      }
    });
    await systemMessage.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`group_${groupId}`).emit('admin_removed', {
        groupId,
        memberId,
        demotedBy: userId,
        demotedByName: req.user.name
      });
    }

    res.json({ message: 'Admin privileges removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupMessages,
  sendGroupMessage,
  addGroupMembers,
  removeGroupMember,
  updateGroup,
  reportGroupMember,
  updateGroupSettings,
  makeAdmin,
  removeAdmin
};