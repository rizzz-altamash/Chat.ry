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

    // Add group to users' groups array
    await User.updateMany(
      { _id: { $in: [creatorId, ...memberIds] } },
      { $push: { groups: group._id } }
    );

    await group.populate('members.user', 'name avatar');

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
        { path: 'members.user', select: 'name avatar' }
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

    // Check if user is admin
    if (!group.admins.includes(userId)) {
      return res.status(403).json({ error: 'Only admins can add members' });
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

    // Check if user is admin or removing themselves
    if (!group.admins.includes(userId) && userId.toString() !== memberId) {
      return res.status(403).json({ error: 'Only admins can remove members' });
    }

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

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    next(error);
  }
};

const updateGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { name, description, avatar } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is admin
    if (!group.admins.includes(userId)) {
      return res.status(403).json({ error: 'Only admins can update group' });
    }

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (avatar) group.avatar = avatar;

    await group.save();

    res.json({
      message: 'Group updated successfully',
      group
    });
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
  updateGroup
};