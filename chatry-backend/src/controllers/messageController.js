// ===== src/controllers/messageController.js =====
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

const sendMessage = async (req, res, next) => {
  try {
    const { recipientId, text, type = 'text' } = req.body;
    const senderId = req.user._id;

    // Check if recipient is blocked
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    if (recipient.blockedUsers.includes(senderId)) {
      return res.status(403).json({ error: 'You are blocked by this user' });
    }

    // Create message
    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      text,
      type
    });

    await message.save();

    // Update chat
    let chat = await Chat.findOne({
      participants: { $all: [senderId, recipientId] }
    });

    if (!chat) {
      chat = new Chat({
        participants: [senderId, recipientId],
        unreadCount: new Map([[senderId.toString(), 0], [recipientId.toString(), 0]])
      });
    }

    chat.lastMessage = message._id;
    chat.lastActivity = new Date();
    
    // Increment unread count for recipient
    const currentUnread = chat.unreadCount.get(recipientId.toString()) || 0;
    chat.unreadCount.set(recipientId.toString(), currentUnread + 1);
    
    await chat.save();

    // Populate message before sending response
    await message.populate('sender', 'name avatar');

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await Message.find({
      $or: [
        { sender: chat.participants[0], recipient: chat.participants[1] },
        { sender: chat.participants[1], recipient: chat.participants[0] }
      ],
      deletedFor: { $ne: userId }
    })
    .populate('sender', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    // Reset unread count for current user
    chat.unreadCount.set(userId.toString(), 0);
    await chat.save();

    res.json({
      messages: messages.reverse(),
      page: parseInt(page),
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    next(error);
  }
};

const getChats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({
      participants: userId
    })
    .populate('participants', 'name avatar status isOnline lastSeen')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'name'
      }
    })
    .sort({ lastActivity: -1 });

    // Format chats for response
    const formattedChats = chats.map(chat => {
      const otherParticipant = chat.participants.find(
        p => p._id.toString() !== userId.toString()
      );

      return {
        _id: chat._id,
        participant: otherParticipant,
        lastMessage: chat.lastMessage,
        lastActivity: chat.lastActivity,
        unreadCount: chat.unreadCount.get(userId.toString()) || 0,
        isTyping: chat.isTyping.get(otherParticipant._id.toString()) || false
      };
    });

    res.json({ chats: formattedChats });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user._id;

    await Message.updateMany(
      {
        _id: { $in: messageIds },
        recipient: userId,
        status: { $ne: 'read' }
      },
      {
        status: 'read',
        $push: {
          readBy: {
            user: userId,
            readAt: new Date()
          }
        }
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Soft delete - add user to deletedFor array
    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
      await message.save();
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getChats,
  markAsRead,
  deleteMessage
};