// ===== src/controllers/userController.js =====
const User = require('../models/User');
const Chat = require('../models/Chat');

const getProfile = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, status, avatar } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (status) user.status = status;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({ users: [] });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { phone: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).select('name phone avatar status isOnline').limit(20);

    res.json({ users });
  } catch (error) {
    next(error);
  }
};

const addContact = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = req.user;

    if (userId === user._id.toString()) {
      return res.status(400).json({ error: 'Cannot add yourself as contact' });
    }

    const contactUser = await User.findById(userId);
    if (!contactUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.contacts.includes(userId)) {
      return res.status(400).json({ error: 'Contact already added' });
    }

    user.contacts.push(userId);
    await user.save();

    // Create or find chat
    let chat = await Chat.findOne({
      participants: { $all: [user._id, userId] }
    });

    if (!chat) {
      chat = new Chat({
        participants: [user._id, userId],
        unreadCount: new Map([[user._id.toString(), 0], [userId, 0]])
      });
      await chat.save();
    }

    res.json({
      message: 'Contact added successfully',
      contact: contactUser,
      chatId: chat._id
    });
  } catch (error) {
    next(error);
  }
};

const getContacts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('contacts.user', 'name phone avatar status isOnline lastSeen');

    res.json({ contacts: user.contacts });
  } catch (error) {
    next(error);
  }
};

const blockUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = req.user;

    if (!user.blockedUsers.includes(userId)) {
      user.blockedUsers.push(userId);
      await user.save();
    }

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    next(error);
  }
};

const unblockUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = req.user;

    user.blockedUsers = user.blockedUsers.filter(
      id => id.toString() !== userId
    );
    await user.save();

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  searchUsers,
  addContact,
  getContacts,
  blockUser,
  unblockUser
};