// ===== src/socket/socketEvents.js =====
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Group = require('../models/Group');

const socketEvents = (io, socket) => {
  // Handle private message
  socket.on('send_message', async (data) => {
    try {
      const { recipientId, text, type = 'text', tempId } = data;
      const senderId = socket.userId;

      // Check if recipient is blocked
      const recipient = await User.findById(recipientId);
      if (!recipient || recipient.blockedUsers.includes(senderId)) {
        return socket.emit('message_error', {
          tempId,
          error: 'Message could not be sent'
        });
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
          unreadCount: new Map([[senderId, 0], [recipientId, 0]])
        });
      }

      chat.lastMessage = message._id;
      chat.lastActivity = new Date();
      const currentUnread = chat.unreadCount.get(recipientId.toString()) || 0;
      chat.unreadCount.set(recipientId.toString(), currentUnread + 1);
      await chat.save();

      await message.populate('sender', 'name avatar');

      // Emit to sender
      socket.emit('message_sent', {
        tempId,
        message,
        chatId: chat._id
      });

      // Emit to recipient if online
      io.to(recipientId).emit('new_message', {
        message,
        chatId: chat._id
      });

    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('message_error', {
        tempId: data.tempId,
        error: 'Failed to send message'
      });
    }
  });

  // Handle group message
  socket.on('send_group_message', async (data) => {
    try {
      const { groupId, text, type = 'text', tempId } = data;
      const senderId = socket.userId;

      // Check if user is member
      const group = await Group.findById(groupId);
      if (!group || !group.members.some(m => m.user.toString() === senderId)) {
        return socket.emit('message_error', {
          tempId,
          error: 'You are not a member of this group'
        });
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

      // Emit to all group members
      io.to(`group_${groupId}`).emit('new_group_message', {
        message,
        groupId
      });

      // Confirm to sender
      socket.emit('message_sent', {
        tempId,
        message,
        groupId
      });

    } catch (error) {
      console.error('Send group message error:', error);
      socket.emit('message_error', {
        tempId: data.tempId,
        error: 'Failed to send message'
      });
    }
  });

  // Handle typing indicator
  socket.on('typing', async (data) => {
    const { recipientId, isTyping } = data;
    const senderId = socket.userId;

    // Update chat typing status
    const chat = await Chat.findOne({
      participants: { $all: [senderId, recipientId] }
    });

    if (chat) {
      chat.isTyping.set(senderId, isTyping);
      await chat.save();
    }

    // Emit to recipient
    io.to(recipientId).emit('typing_indicator', {
      userId: senderId,
      isTyping
    });
  });

  // Handle read receipts
  socket.on('mark_read', async (data) => {
    const { messageIds, chatId } = data;
    const userId = socket.userId;

    try {
      // Update messages
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

      // Update chat unread count
      const chat = await Chat.findById(chatId);
      if (chat) {
        chat.unreadCount.set(userId, 0);
        await chat.save();
      }

      // Get messages to find senders
      const messages = await Message.find({ _id: { $in: messageIds } });
      const senderIds = [...new Set(messages.map(m => m.sender.toString()))];

      // Notify senders about read receipts
      senderIds.forEach(senderId => {
        io.to(senderId).emit('messages_read', {
          messageIds,
          readBy: userId,
          chatId
        });
      });

    } catch (error) {
      console.error('Mark read error:', error);
    }
  });

  // Handle message delivered status
  socket.on('message_delivered', async (data) => {
    const { messageIds } = data;

    try {
      await Message.updateMany(
        {
          _id: { $in: messageIds },
          status: 'sent'
        },
        { status: 'delivered' }
      );
    } catch (error) {
      console.error('Message delivered error:', error);
    }
  });

  // Join a specific chat room
  socket.on('join_chat', (chatId) => {
    socket.join(`chat_${chatId}`);
  });

  // Leave a specific chat room
  socket.on('leave_chat', (chatId) => {
    socket.leave(`chat_${chatId}`);
  });

  // Handle user presence updates
  socket.on('update_presence', async (data) => {
    const { status } = data;
    const userId = socket.userId;

    try {
      await User.findByIdAndUpdate(userId, {
        isOnline: status === 'online',
        lastSeen: new Date()
      });

      socket.broadcast.emit('presence_update', {
        userId,
        status,
        lastSeen: new Date()
      });
    } catch (error) {
      console.error('Update presence error:', error);
    }
  });
};

module.exports = socketEvents;