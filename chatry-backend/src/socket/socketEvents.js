// // ===== src/socket/socketEvents.js =====
// const Message = require('../models/Message');
// const Chat = require('../models/Chat');
// const User = require('../models/User');
// const Group = require('../models/Group');

// const socketEvents = (io, socket) => {
//   // Handle private message
//   socket.on('send_message', async (data) => {
//     try {
//       const { recipientId, text, type = 'text', tempId } = data;
//       const senderId = socket.userId;

//       // Ensure recipientId is in string format
//       const recipientIdStr = recipientId.toString();

//       // Check if recipient is blocked
//       const recipient = await User.findById(recipientId);
//       if (!recipient || recipient.blockedUsers.includes(senderId)) {
//         return socket.emit('message_error', {
//           tempId,
//           error: 'Message could not be sent'
//         });
//       }

//       // Create message
//       const message = new Message({
//         sender: senderId,
//         recipient: recipientId,
//         text,
//         type
//       });

//       await message.save();

//       // Update chat
//       let chat = await Chat.findOne({
//         participants: { $all: [senderId, recipientId] }
//       });

//       if (!chat) {
//         chat = new Chat({
//           participants: [senderId, recipientId],
//           unreadCount: new Map([[senderId.toString(), 0], [recipientId.toString(), 0]])
//         });
//       }

//       chat.lastMessage = message._id;
//       chat.lastActivity = new Date();
//       const currentUnread = chat.unreadCount.get(recipientId.toString()) || 0;
//       chat.unreadCount.set(recipientId.toString(), currentUnread + 1);
//       await chat.save();

//       await message.populate('sender', 'name avatar');

//       // Emit to sender
//       socket.emit('message_sent', {
//         tempId,
//         message,
//         chatId: chat._id
//       });

//       // Emit to recipient if online
//       io.to(recipientIdStr).emit('new_message', {
//         message,
//         chatId: chat._id
//       });

//     } catch (error) {
//       console.error('Send message error:', error);
//       socket.emit('message_error', {
//         tempId: data.tempId,
//         error: 'Failed to send message'
//       });
//     }
//   });

//   // Handle group message
//   socket.on('send_group_message', async (data) => {
//     try {
//       const { groupId, text, type = 'text', tempId } = data;
//       const senderId = socket.userId;

//       // Check if user is member
//       const group = await Group.findById(groupId);
//       if (!group || !group.members.some(m => m.user.toString() === senderId)) {
//         return socket.emit('message_error', {
//           tempId,
//           error: 'You are not a member of this group'
//         });
//       }

//       // Create message
//       const message = new Message({
//         sender: senderId,
//         group: groupId,
//         text,
//         type
//       });

//       await message.save();

//       // Update group
//       group.lastMessage = message._id;
//       group.lastActivity = new Date();
//       await group.save();

//       await message.populate('sender', 'name avatar');

//       // Emit to all group members
//       io.to(`group_${groupId}`).emit('new_group_message', {
//         message,
//         groupId
//       });

//       // Confirm to sender
//       socket.emit('message_sent', {
//         tempId,
//         message,
//         groupId
//       });

//     } catch (error) {
//       console.error('Send group message error:', error);
//       socket.emit('message_error', {
//         tempId: data.tempId,
//         error: 'Failed to send message'
//       });
//     }
//   });

//   // Handle typing indicator
//   socket.on('typing', async (data) => {
//     const { recipientId, isTyping } = data;
//     const senderId = socket.userId;

//     const recipientIdStr = recipientId.toString();

//     // Update chat typing status
//     const chat = await Chat.findOne({
//       participants: { $all: [senderId, recipientId] }
//     });

//     if (chat) {
//       chat.isTyping.set(senderId, isTyping);
//       await chat.save();
//     }

//     // Emit to recipient
//     io.to(recipientIdStr).emit('typing_indicator', {
//       userId: senderId,
//       isTyping
//     });
//   });

//   // Handle read receipts
//   socket.on('mark_read', async (data) => {
//     const { messageIds, chatId } = data;
//     const userId = socket.userId;

//     try {
//       // Update messages
//       await Message.updateMany(
//         {
//           _id: { $in: messageIds },
//           recipient: userId,
//           status: { $ne: 'read' }
//         },
//         {
//           status: 'read',
//           $push: {
//             readBy: {
//               user: userId,
//               readAt: new Date()
//             }
//           }
//         }
//       );

//       // Update chat unread count
//       const chat = await Chat.findById(chatId);
//       if (chat) {
//         chat.unreadCount.set(userId, 0);
//         await chat.save();
//       }

//       // Get messages to find senders
//       const messages = await Message.find({ _id: { $in: messageIds } });
//       const senderIds = [...new Set(messages.map(m => m.sender.toString()))];

//       // Notify senders about read receipts
//       senderIds.forEach(senderId => {
//         io.to(senderId.toString()).emit('messages_read', {
//           messageIds,
//           readBy: userId,
//           chatId
//         });
//       });

//     } catch (error) {
//       console.error('Mark read error:', error);
//     }
//   });

//   // Handle message delivered status
//   socket.on('message_delivered', async (data) => {
//     const { messageIds } = data;

//     try {
//       await Message.updateMany(
//         {
//           _id: { $in: messageIds },
//           status: 'sent'
//         },
//         { status: 'delivered' }
//       );
//     } catch (error) {
//       console.error('Message delivered error:', error);
//     }
//   });

//   // Join a specific chat room
//   socket.on('join_chat', (chatId) => {
//     socket.join(`chat_${chatId}`);
//   });

//   // Leave a specific chat room
//   socket.on('leave_chat', (chatId) => {
//     socket.leave(`chat_${chatId}`);
//   });

//   // Handle user presence updates
//   socket.on('update_presence', async (data) => {
//     const { status } = data;
//     const userId = socket.userId;

//     try {
//       await User.findByIdAndUpdate(userId, {
//         isOnline: status === 'online',
//         lastSeen: new Date()
//       });

//       socket.broadcast.emit('presence_update', {
//         userId,
//         status,
//         lastSeen: new Date()
//       });
//     } catch (error) {
//       console.error('Update presence error:', error);
//     }
//   });
// };

// module.exports = socketEvents;










// ===== src/socket/socketEvents.js =====
// const Message = require('../models/Message');
// const Chat = require('../models/Chat');
// const User = require('../models/User');
// const Group = require('../models/Group');

// const socketEvents = (io, socket) => {
//   // Handle private message
//   socket.on('send_message', async (data) => {
//     try {
//       const { recipientId, text, type = 'text', tempId } = data;
//       const senderId = socket.userId;

//       // Ensure recipientId is in string format
//       const recipientIdStr = recipientId.toString();

//       // Check if recipient is blocked
//       const recipient = await User.findById(recipientId);
//       if (!recipient || recipient.blockedUsers.includes(senderId)) {
//         return socket.emit('message_error', {
//           tempId,
//           error: 'Message could not be sent'
//         });
//       }

//       // Create message
//       const message = new Message({
//         sender: senderId,
//         recipient: recipientId,
//         text,
//         type,
//         status: 'sent'
//       });

//       await message.save();

//       // Update chat
//       let chat = await Chat.findOne({
//         participants: { $all: [senderId, recipientId] }
//       });

//       if (!chat) {
//         chat = new Chat({
//           participants: [senderId, recipientId],
//           unreadCount: new Map([[senderId.toString(), 0], [recipientId.toString(), 0]])
//         });
//       }

//       chat.lastMessage = message._id;
//       chat.lastActivity = new Date();
//       const currentUnread = chat.unreadCount.get(recipientId.toString()) || 0;
//       chat.unreadCount.set(recipientId.toString(), currentUnread + 1);
//       await chat.save();

//       await message.populate('sender', 'name avatar');

//       // Emit to sender
//       socket.emit('message_sent', {
//         tempId,
//         message,
//         chatId: chat._id
//       });

//       // // Emit to recipient if online
//       // io.to(recipientIdStr).emit('new_message', {
//       //   message,
//       //   chatId: chat._id
//       // });

//       // 🆕 Check if recipient is online and emit to them
//       const recipientSocket = [...io.sockets.sockets.values()]
//         .find(s => s.userId === recipientIdStr);
      
//       if (recipientSocket) {
//         // Recipient is online, emit new message
//         recipientSocket.emit('new_message', {
//           message,
//           chatId: chat._id
//         });
        
//         // 🆕 IMPORTANT: Mark as delivered after short delay
//         setTimeout(async () => {
//           message.status = 'delivered';
//           await message.save();
          
//           // Notify sender about delivery
//           socket.emit('message_status_update', {
//             messageId: message._id,
//             status: 'delivered'
//           });
//         }, 100);
//       } else {
//         // Recipient offline, just emit to their room
//         io.to(recipientIdStr).emit('new_message', {
//           message,
//           chatId: chat._id
//         });
//       }

//     } catch (error) {
//       console.error('Send message error:', error);
//       socket.emit('message_error', {
//         tempId: data.tempId,
//         error: 'Failed to send message'
//       });
//     }
//   });

//   // Handle group message
//   socket.on('send_group_message', async (data) => {
//     try {
//       const { groupId, text, type = 'text', tempId } = data;
//       const senderId = socket.userId;

//       // Check if user is member
//       const group = await Group.findById(groupId);
//       if (!group || !group.members.some(m => m.user.toString() === senderId)) {
//         return socket.emit('message_error', {
//           tempId,
//           error: 'You are not a member of this group'
//         });
//       }

//       // Create message and save message
//       const message = new Message({
//         sender: senderId,
//         group: groupId,
//         text,
//         type,
//         status: 'sent',
//         deliveredTo: [],
//         readBy: []
//       });

//       await message.save();

//       // Update group
//       group.lastMessage = message._id;
//       group.lastActivity = new Date();
//       await group.save();

//       await message.populate('sender', 'name avatar');

//       // Add total members count for status calculation
//       message.totalGroupMembers = group.members.length;

//       // Get all online members except sender
//       const onlineMembers = [];
//       group.members.forEach(member => {
//         const memberId = member.user._id.toString();
//         if (memberId !== senderId) {
//           const memberSocket = [...io.sockets.sockets.values()]
//             .find(s => s.userId === memberId);
//           if (memberSocket) {
//             onlineMembers.push(memberId);
//           }
//         }
//       });

//       // Mark as delivered to online members
//       if (onlineMembers.length > 0) {
//         message.deliveredTo = onlineMembers.map(memberId => ({
//           user: memberId,
//           deliveredAt: new Date()
//         }));
//         await message.save();
//       }

//       // Emit to all group members EXCEPT sender 
//       socket.to(`group_${groupId}`).emit('new_group_message', {
//         message: {
//           ...message.toObject(),
//           groupStatus: message.groupStatus
//         },
//         groupId
//       });

//       // Confirm to sender with status
//       socket.emit('message_sent', {
//         tempId,
//         message: {
//           ...message.toObject(),
//           groupStatus: message.groupStatus
//         },
//         groupId
//       });

//     } catch (error) {
//       console.error('Send group message error:', error);
//       socket.emit('message_error', {
//         tempId: data.tempId,
//         error: 'Failed to send message'
//       });
//     }
//   });

//   // Handle typing indicator
//   socket.on('typing', async (data) => {
//     const { recipientId, isTyping } = data;
//     const senderId = socket.userId;

//     const recipientIdStr = recipientId.toString();

//     // Update chat typing status
//     const chat = await Chat.findOne({
//       participants: { $all: [senderId, recipientId] }
//     });

//     if (chat) {
//       chat.isTyping.set(senderId.toString(), isTyping);
//       await chat.save();
//     }

//     // Emit to recipient
//     io.to(recipientIdStr).emit('typing_indicator', {
//       userId: senderId,
//       isTyping
//     });
//   });

//   // Handle read receipts
//   socket.on('mark_read', async (data) => {
//     const { messageIds, chatId } = data;
//     const userId = socket.userId;

//     try {
//       // Update messages
//       await Message.updateMany(
//         {
//           _id: { $in: messageIds },
//           recipient: userId,
//           status: { $ne: 'read' }
//         },
//         {
//           status: 'read',
//           $push: {
//             readBy: {
//               user: userId,
//               readAt: new Date()
//             }
//           }
//         }
//       );

//       // Update chat unread count
//       const chat = await Chat.findById(chatId);
//       if (chat) {
//         chat.unreadCount.set(userId.toString(), 0);
//         await chat.save();
//       }

//       // Get messages to find senders
//       const messages = await Message.find({ _id: { $in: messageIds } });
//       const senderIds = [...new Set(messages.map(m => m.sender.toString()))];

//       // Notify senders about read receipts
//       senderIds.forEach(senderId => {
//         io.to(senderId.toString()).emit('messages_read', {
//           messageIds,
//           readBy: userId,
//           chatId
//         });
//       });

//     } catch (error) {
//       console.error('Mark read error:', error);
//     }
//   });

//   // Update mark_read for groups
//   socket.on('mark_group_read', async (data) => {
//     const { messageIds, groupId } = data;
//     const userId = socket.userId;

//     try {
//       // Get group for member count
//       const group = await Group.findById(groupId);
      
//       for (const messageId of messageIds) {
//         const message = await Message.findById(messageId);
//         if (!message || message.sender.toString() === userId) continue;

//         // Check if already marked as read
//         const alreadyRead = message.readBy.some(
//           r => r.user.toString() === userId
//         );

//         if (!alreadyRead) {
//           // First mark as delivered if not already
//           const alreadyDelivered = message.deliveredTo.some(
//             d => d.user.toString() === userId
//           );
          
//           if (!alreadyDelivered) {
//             message.deliveredTo.push({
//               user: userId,
//               deliveredAt: new Date()
//             });
//           }

//           // Mark as read
//           message.readBy.push({
//             user: userId,
//             readAt: new Date()
//           });
          
//           await message.save();
          
//           message.totalGroupMembers = group.members.length;

//           // Notify sender about read status update
//           io.to(message.sender.toString()).emit('group_message_status_update', {
//             messageId: message._id,
//             groupStatus: message.groupStatus,
//             groupId
//           });
//         }
//       }
//     } catch (error) {
//       console.error('Mark group read error:', error);
//     }
//   });

//   // Handle message delivered status
//   socket.on('message_delivered', async (data) => {
//     const { messageIds } = data;

//     try {
//       // Update messages to delivered
//       const messages = await Message.updateMany(
//         {
//           _id: { $in: messageIds },
//           status: 'sent'
//         },
//         { status: 'delivered' }
//       );

//       // 🆕 Get sender IDs and notify them
//       const updatedMessages = await Message.find({ 
//         _id: { $in: messageIds } 
//       }).select('sender');
      
//       // Notify each sender about delivery
//       const senderIds = [...new Set(updatedMessages.map(m => m.sender.toString()))];
      
//       senderIds.forEach(senderId => {
//         io.to(senderId).emit('messages_delivered', {
//           messageIds,
//           deliveredTo: socket.userId
//         });
//       });

//     } catch (error) {
//       console.error('Message delivered error:', error);
//     }
//   });

//   // Add group message delivered event
//   socket.on('group_message_delivered', async (data) => {
//     const { messageId, groupId } = data;
//     const userId = socket.userId;

//     try {
//       const message = await Message.findById(messageId);
//       if (!message || message.sender.toString() === userId) return;

//       // Check if already marked as delivered
//       const alreadyDelivered = message.deliveredTo.some(
//         d => d.user.toString() === userId
//       );

//       if (!alreadyDelivered) {
//         message.deliveredTo.push({
//           user: userId,
//           deliveredAt: new Date()
//         });
//         await message.save();

//         // Get group for member count
//         const group = await Group.findById(groupId);
//         message.totalGroupMembers = group.members.length;

//         // Notify sender about delivery status update
//         io.to(message.sender.toString()).emit('group_message_status_update', {
//           messageId: message._id,
//           groupStatus: message.groupStatus,
//           groupId
//         });
//       }
//     } catch (error) {
//       console.error('Group message delivered error:', error);
//     }
//   });

//   // Join a specific chat room
//   socket.on('join_chat', (chatId) => {
//     socket.join(`chat_${chatId}`);
//   });

//   // When user joins group room (comes online)
//   socket.on('join_group', async (groupId) => {
//     socket.join(`group_${groupId}`);
    
//     // Mark recent messages as delivered
//     const userId = socket.userId;
//     const recentMessages = await Message.find({
//       group: groupId,
//       sender: { $ne: userId },
//       createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
//     });

//     const group = await Group.findById(groupId);
    
//     for (const message of recentMessages) {
//       const alreadyDelivered = message.deliveredTo.some(
//         d => d.user.toString() === userId
//       );

//       if (!alreadyDelivered) {
//         message.deliveredTo.push({
//           user: userId,
//           deliveredAt: new Date()
//         });
//         await message.save();
        
//         // message.totalGroupMembers = group.members.length;

//         if (group && group.members) {
//           message.totalGroupMembers = group.members.length;
//         }

//         // Notify sender
//         io.to(message.sender.toString()).emit('group_message_status_update', {
//           messageId: message._id,
//           groupStatus: message.groupStatus,
//           groupId
//         });
//       }
//     }
//   });

//   // Leave a specific chat room
//   socket.on('leave_chat', (chatId) => {
//     socket.leave(`chat_${chatId}`);
//   });

//   // Handle user presence updates
//   socket.on('update_presence', async (data) => {
//     const { status } = data;
//     const userId = socket.userId;

//     try {
//       await User.findByIdAndUpdate(userId, {
//         isOnline: status === 'online',
//         lastSeen: new Date()
//       });

//       socket.broadcast.emit('presence_update', {
//         userId,
//         status,
//         lastSeen: new Date()
//       });
//     } catch (error) {
//       console.error('Update presence error:', error);
//     }
//   });

//   // Group member events
//   socket.on('member_added', async (data) => {
//     const { groupId, memberIds } = data;
//     const addedById = socket.userId;
    
//     try {
//       const addedBy = await User.findById(addedById).select('name');
//       const members = await User.find({ _id: { $in: memberIds } }).select('name');
      
//       // Notify all group members
//       io.to(`group_${groupId}`).emit('group_member_added', {
//         groupId,
//         memberIds,
//         memberNames: members.map(m => m.name).join(', '),
//         memberName: members[0]?.name, // For single member
//         addedBy: addedById,
//         addedByName: addedBy.name
//       });
      
//       // Join new members to group room
//       memberIds.forEach(memberId => {
//         const memberSocket = [...io.sockets.sockets.values()]
//           .find(s => s.userId === memberId.toString());
//         if (memberSocket) {
//           memberSocket.join(`group_${groupId}`);
//         }
//       });
      
//     } catch (error) {
//       console.error('Member added event error:', error);
//     }
//   });

//   socket.on('member_removed', async (data) => {
//     const { groupId, memberId } = data;
//     const removedById = socket.userId;
    
//     try {
//       const removedBy = await User.findById(removedById).select('name');
//       const member = await User.findById(memberId).select('name');
      
//       // Notify all group members
//       io.to(`group_${groupId}`).emit('group_member_removed', {
//         groupId,
//         memberId,
//         memberName: member.name,
//         removedBy: removedById,
//         removedByName: removedBy.name
//       });
      
//       // Remove member from group room
//       const memberSocket = [...io.sockets.sockets.values()]
//         .find(s => s.userId === memberId.toString());
//       if (memberSocket) {
//         memberSocket.leave(`group_${groupId}`);
//       }
      
//     } catch (error) {
//       console.error('Member removed event error:', error);
//     }
//   });

//   socket.on('member_left', async (data) => {
//     const { groupId } = data;
//     const memberId = socket.userId;
    
//     try {
//       const member = await User.findById(memberId).select('name');
      
//       // Notify all group members
//       io.to(`group_${groupId}`).emit('group_member_left', {
//         groupId,
//         memberId,
//         memberName: member.name
//       });
      
//       // Leave group room
//       socket.leave(`group_${groupId}`);
      
//     } catch (error) {
//       console.error('Member left event error:', error);
//     }
//   });
// };

// module.exports = socketEvents;












// // src/socket/socketEvents.js - Complete fixed implementation

// const Message = require('../models/Message');
// const Chat = require('../models/Chat');
// const User = require('../models/User');
// const Group = require('../models/Group');

// const socketEvents = (io, socket) => {
//   // Handle private message
//   socket.on('send_message', async (data) => {
//     try {
//       const { recipientId, text, type = 'text', tempId } = data;
//       const senderId = socket.userId;

//       // Ensure recipientId is in string format
//       const recipientIdStr = recipientId.toString();

//       // Check if recipient is blocked
//       const recipient = await User.findById(recipientId);
//       if (!recipient || recipient.blockedUsers.includes(senderId)) {
//         return socket.emit('message_error', {
//           tempId,
//           error: 'Message could not be sent'
//         });
//       }

//       // Create message
//       const message = new Message({
//         sender: senderId,
//         recipient: recipientId,
//         text,
//         type,
//         status: 'sent'
//       });

//       await message.save();

//       // Update chat
//       let chat = await Chat.findOne({
//         participants: { $all: [senderId, recipientId] }
//       });

//       if (!chat) {
//         chat = new Chat({
//           participants: [senderId, recipientId],
//           unreadCount: new Map([[senderId.toString(), 0], [recipientId.toString(), 0]])
//         });
//       }

//       chat.lastMessage = message._id;
//       chat.lastActivity = new Date();
//       const currentUnread = chat.unreadCount.get(recipientId.toString()) || 0;
//       chat.unreadCount.set(recipientId.toString(), currentUnread + 1);
//       await chat.save();

//       await message.populate('sender', 'name avatar');

//       // Emit to sender
//       socket.emit('message_sent', {
//         tempId,
//         message,
//         chatId: chat._id
//       });

//       // Check if recipient is online and emit to them
//       const recipientSocket = [...io.sockets.sockets.values()]
//         .find(s => s.userId === recipientIdStr);
      
//       if (recipientSocket) {
//         // Recipient is online, emit new message
//         recipientSocket.emit('new_message', {
//           message,
//           chatId: chat._id
//         });
        
//         // Mark as delivered after short delay
//         setTimeout(async () => {
//           message.status = 'delivered';
//           await message.save();
          
//           // Notify sender about delivery
//           socket.emit('message_status_update', {
//             messageId: message._id,
//             status: 'delivered'
//           });
//         }, 100);
//       } else {
//         // Recipient offline, just emit to their room
//         io.to(recipientIdStr).emit('new_message', {
//           message,
//           chatId: chat._id
//         });
//       }

//     } catch (error) {
//       console.error('Send message error:', error);
//       socket.emit('message_error', {
//         tempId: data.tempId,
//         error: 'Failed to send message'
//       });
//     }
//   });

//   // Handle group message with complete read receipts
//   socket.on('send_group_message', async (data) => {
//     try {
//       const { groupId, text, type = 'text', tempId } = data;
//       const senderId = socket.userId;

//       // Check if user is member
//       const group = await Group.findById(groupId).populate('members.user', '_id');
//       if (!group || !group.members.some(m => m.user && m.user._id && m.user._id.toString() === senderId)) {
//         return socket.emit('message_error', {
//           tempId,
//           error: 'You are not a member of this group'
//         });
//       }

//       // Check if only admins can send
//       if (group.settings && group.settings.onlyAdminsCanSend) {
//         const isAdmin = group.admins && group.admins.includes(senderId);
//         if (!isAdmin) {
//           return socket.emit('message_error', {
//             tempId,
//             error: 'Only admins can send messages in this group'
//           });
//         }
//       }

//       // Create message
//       const message = new Message({
//         sender: senderId,
//         group: groupId,
//         text,
//         type,
//         status: 'sent',
//         deliveredTo: [],
//         readBy: []
//       });

//       await message.save();

//       // Update group
//       group.lastMessage = message._id;
//       group.lastActivity = new Date();
//       await group.save();

//       await message.populate('sender', 'name avatar');
      
//       // Add total members count for status calculation
//       if (group && group.members) {
//         message.totalGroupMembers = group.members.length;
//       }

//       // Get all online members except sender
//       const onlineMembers = [];
//       if (group && group.members) {
//         group.members.forEach(member => {
//           if (member.user && member.user._id) {
//             const memberId = member.user._id.toString();
//             if (memberId !== senderId) {
//               const memberSocket = [...io.sockets.sockets.values()]
//                 .find(s => s.userId === memberId);
//               if (memberSocket) {
//                 onlineMembers.push(memberId);
//               }
//             }
//           }
//         });
//       }

//       // Mark as delivered to online members
//       if (onlineMembers.length > 0) {
//         message.deliveredTo = onlineMembers.map(memberId => ({
//           user: memberId,
//           deliveredAt: new Date()
//         }));
//         await message.save();
//       }

//       // Calculate group status
//       const messageObj = message.toObject();
//       if (message.totalGroupMembers) {
//         const otherMembers = message.totalGroupMembers - 1;
//         const deliveredCount = message.deliveredTo ? message.deliveredTo.length : 0;
//         const readCount = message.readBy ? message.readBy.length : 0;
        
//         if (otherMembers === 0) {
//           messageObj.groupStatus = 'read';
//         } else if (readCount >= otherMembers) {
//           messageObj.groupStatus = 'read';
//         } else if (deliveredCount >= otherMembers) {
//           messageObj.groupStatus = 'delivered';
//         } else {
//           messageObj.groupStatus = 'sent';
//         }
//       } else {
//         messageObj.groupStatus = 'sent';
//       }

//       // Emit to all group members EXCEPT sender
//       socket.to(`group_${groupId}`).emit('new_group_message', {
//         message: messageObj,
//         groupId
//       });

//       // Confirm to sender with status
//       socket.emit('message_sent', {
//         tempId,
//         message: messageObj,
//         groupId
//       });

//     } catch (error) {
//       console.error('Send group message error:', error);
//       socket.emit('message_error', {
//         tempId: data.tempId,
//         error: 'Failed to send message'
//       });
//     }
//   });

//   // Add group message delivered event
//   socket.on('group_message_delivered', async (data) => {
//     const { messageId, groupId } = data;
//     const userId = socket.userId;

//     try {
//       const message = await Message.findById(messageId);
//       if (!message || !message.sender || message.sender.toString() === userId) return;

//       // Initialize arrays if not exists
//       if (!message.deliveredTo) {
//         message.deliveredTo = [];
//       }

//       // Check if already marked as delivered
//       const alreadyDelivered = message.deliveredTo.some(
//         d => d.user && d.user.toString() === userId
//       );

//       if (!alreadyDelivered) {
//         message.deliveredTo.push({
//           user: userId,
//           deliveredAt: new Date()
//         });
//         await message.save();

//         // Get group for member count
//         const group = await Group.findById(groupId);
//         if (group && group.members) {
//           message.totalGroupMembers = group.members.length;
          
//           // Calculate group status
//           const otherMembers = message.totalGroupMembers - 1;
//           const deliveredCount = message.deliveredTo.length;
//           const readCount = message.readBy ? message.readBy.length : 0;
          
//           let groupStatus = 'sent';
//           if (otherMembers === 0 || readCount >= otherMembers) {
//             groupStatus = 'read';
//           } else if (deliveredCount >= otherMembers) {
//             groupStatus = 'delivered';
//           }

//           // Notify sender about delivery status update
//           if (message.sender) {
//             io.to(message.sender.toString()).emit('group_message_status_update', {
//               messageId: message._id,
//               groupStatus: groupStatus,
//               groupId
//             });
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Group message delivered error:', error);
//     }
//   });

//   // Update mark_read for groups
//   socket.on('mark_group_read', async (data) => {
//     const { messageIds, groupId } = data;
//     const userId = socket.userId;

//     try {
//       // Get group for member count
//       const group = await Group.findById(groupId);
//       if (!group) return;
      
//       for (const messageId of messageIds) {
//         const message = await Message.findById(messageId);
//         if (!message || !message.sender || message.sender.toString() === userId) continue;

//         // Initialize arrays if not exists
//         if (!message.readBy) {
//           message.readBy = [];
//         }
//         if (!message.deliveredTo) {
//           message.deliveredTo = [];
//         }

//         // Check if already marked as read
//         const alreadyRead = message.readBy.some(
//           r => r.user && r.user.toString() === userId
//         );

//         if (!alreadyRead) {
//           // First mark as delivered if not already
//           const alreadyDelivered = message.deliveredTo.some(
//             d => d.user && d.user.toString() === userId
//           );
          
//           if (!alreadyDelivered) {
//             message.deliveredTo.push({
//               user: userId,
//               deliveredAt: new Date()
//             });
//           }

//           // Mark as read
//           message.readBy.push({
//             user: userId,
//             readAt: new Date()
//           });
          
//           await message.save();
          
//           if (group.members) {
//             message.totalGroupMembers = group.members.length;
            
//             // Calculate group status
//             const otherMembers = message.totalGroupMembers - 1;
//             const deliveredCount = message.deliveredTo.length;
//             const readCount = message.readBy.length;
            
//             let groupStatus = 'sent';
//             if (otherMembers === 0 || readCount >= otherMembers) {
//               groupStatus = 'read';
//             } else if (deliveredCount >= otherMembers) {
//               groupStatus = 'delivered';
//             }

//             // Notify sender about read status update
//             if (message.sender) {
//               io.to(message.sender.toString()).emit('group_message_status_update', {
//                 messageId: message._id,
//                 groupStatus: groupStatus,
//                 groupId
//               });
//             }
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Mark group read error:', error);
//     }
//   });

//   // Handle typing indicator
//   socket.on('typing', async (data) => {
//     const { recipientId, isTyping } = data;
//     const senderId = socket.userId;

//     const recipientIdStr = recipientId.toString();

//     // Update chat typing status
//     const chat = await Chat.findOne({
//       participants: { $all: [senderId, recipientId] }
//     });

//     if (chat) {
//       chat.isTyping.set(senderId.toString(), isTyping);
//       await chat.save();
//     }

//     // Emit to recipient
//     io.to(recipientIdStr).emit('typing_indicator', {
//       userId: senderId,
//       isTyping
//     });
//   });

//   // Handle read receipts
//   socket.on('mark_read', async (data) => {
//     const { messageIds, chatId } = data;
//     const userId = socket.userId;

//     try {
//       // Update messages
//       await Message.updateMany(
//         {
//           _id: { $in: messageIds },
//           recipient: userId,
//           status: { $ne: 'read' }
//         },
//         {
//           status: 'read',
//           $push: {
//             readBy: {
//               user: userId,
//               readAt: new Date()
//             }
//           }
//         }
//       );

//       // Update chat unread count
//       const chat = await Chat.findById(chatId);
//       if (chat) {
//         chat.unreadCount.set(userId.toString(), 0);
//         await chat.save();
//       }

//       // Get messages to find senders
//       const messages = await Message.find({ _id: { $in: messageIds } });
//       const senderIds = [...new Set(messages.map(m => m.sender ? m.sender.toString() : null).filter(id => id))];

//       // Notify senders about read receipts
//       senderIds.forEach(senderId => {
//         if (senderId) {
//           io.to(senderId).emit('messages_read', {
//             messageIds,
//             readBy: userId,
//             chatId
//           });
//         }
//       });

//     } catch (error) {
//       console.error('Mark read error:', error);
//     }
//   });

//   // Handle message delivered status
//   socket.on('message_delivered', async (data) => {
//     const { messageIds } = data;

//     try {
//       await Message.updateMany(
//         {
//           _id: { $in: messageIds },
//           status: 'sent'
//         },
//         { status: 'delivered' }
//       );
//     } catch (error) {
//       console.error('Message delivered error:', error);
//     }
//   });

//   // Join a specific chat room
//   socket.on('join_chat', (chatId) => {
//     socket.join(`chat_${chatId}`);
//   });

//   // Leave a specific chat room
//   socket.on('leave_chat', (chatId) => {
//     socket.leave(`chat_${chatId}`);
//   });

//   // Handle user presence updates
//   socket.on('update_presence', async (data) => {
//     const { status } = data;
//     const userId = socket.userId;

//     try {
//       await User.findByIdAndUpdate(userId, {
//         isOnline: status === 'online',
//         lastSeen: new Date()
//       });

//       socket.broadcast.emit('presence_update', {
//         userId,
//         status,
//         lastSeen: new Date()
//       });
//     } catch (error) {
//       console.error('Update presence error:', error);
//     }
//   });

//   // When user joins group room (comes online)
//   socket.on('join_group', async (groupId) => {
//     socket.join(`group_${groupId}`);
    
//     // Mark recent messages as delivered
//     const userId = socket.userId;
    
//     try {
//       const recentMessages = await Message.find({
//         group: groupId,
//         sender: { $ne: userId },
//         createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
//       });

//       const group = await Group.findById(groupId);
//       if (!group) return;
      
//       for (const message of recentMessages) {
//         if (!message.deliveredTo) {
//           message.deliveredTo = [];
//         }
        
//         const alreadyDelivered = message.deliveredTo.some(
//           d => d.user && d.user.toString() === userId
//         );

//         if (!alreadyDelivered) {
//           message.deliveredTo.push({
//             user: userId,
//             deliveredAt: new Date()
//           });
//           await message.save();
          
//           if (group.members) {
//             message.totalGroupMembers = group.members.length;
            
//             // Calculate group status
//             const otherMembers = message.totalGroupMembers - 1;
//             const deliveredCount = message.deliveredTo.length;
//             const readCount = message.readBy ? message.readBy.length : 0;
            
//             let groupStatus = 'sent';
//             if (otherMembers === 0 || readCount >= otherMembers) {
//               groupStatus = 'read';
//             } else if (deliveredCount >= otherMembers) {
//               groupStatus = 'delivered';
//             }

//             // Notify sender
//             if (message.sender) {
//               io.to(message.sender.toString()).emit('group_message_status_update', {
//                 messageId: message._id,
//                 groupStatus: groupStatus,
//                 groupId
//               });
//             }
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Join group error:', error);
//     }
//   });

//   // Group member events
//   socket.on('member_added', async (data) => {
//     const { groupId, memberIds } = data;
//     const addedById = socket.userId;
    
//     try {
//       const addedBy = await User.findById(addedById).select('name');
//       const members = await User.find({ _id: { $in: memberIds } }).select('name');
      
//       // Notify all group members
//       io.to(`group_${groupId}`).emit('group_member_added', {
//         groupId,
//         memberIds,
//         memberNames: members.map(m => m.name).join(', '),
//         memberName: members[0]?.name, // For single member
//         addedBy: addedById,
//         addedByName: addedBy.name
//       });
      
//       // Join new members to group room
//       memberIds.forEach(memberId => {
//         const memberSocket = [...io.sockets.sockets.values()]
//           .find(s => s.userId === memberId.toString());
//         if (memberSocket) {
//           memberSocket.join(`group_${groupId}`);
//         }
//       });
      
//     } catch (error) {
//       console.error('Member added event error:', error);
//     }
//   });

//   socket.on('member_removed', async (data) => {
//     const { groupId, memberId } = data;
//     const removedById = socket.userId;
    
//     try {
//       const removedBy = await User.findById(removedById).select('name');
//       const member = await User.findById(memberId).select('name');
      
//       // Notify all group members
//       io.to(`group_${groupId}`).emit('group_member_removed', {
//         groupId,
//         memberId,
//         memberName: member.name,
//         removedBy: removedById,
//         removedByName: removedBy.name
//       });
      
//       // Remove member from group room
//       const memberSocket = [...io.sockets.sockets.values()]
//         .find(s => s.userId === memberId.toString());
//       if (memberSocket) {
//         memberSocket.leave(`group_${groupId}`);
//       }
      
//     } catch (error) {
//       console.error('Member removed event error:', error);
//     }
//   });

//   socket.on('member_left', async (data) => {
//     const { groupId } = data;
//     const memberId = socket.userId;
    
//     try {
//       const member = await User.findById(memberId).select('name');
      
//       // Notify all group members
//       io.to(`group_${groupId}`).emit('group_member_left', {
//         groupId,
//         memberId,
//         memberName: member.name
//       });
      
//       // Leave group room
//       socket.leave(`group_${groupId}`);
      
//     } catch (error) {
//       console.error('Member left event error:', error);
//     }
//   });
// };

// module.exports = socketEvents;















// src/socket/socketEvents.js - Complete Updated File

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

      // Ensure recipientId is in string format
      const recipientIdStr = recipientId.toString();

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
        type,
        status: 'sent'
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

      // Check if recipient is online and emit to them
      const recipientSocket = [...io.sockets.sockets.values()]
        .find(s => s.userId === recipientIdStr);
      
      if (recipientSocket) {
        // Recipient is online, emit new message
        recipientSocket.emit('new_message', {
          message,
          chatId: chat._id
        });
        
        // Mark as delivered after short delay
        setTimeout(async () => {
          message.status = 'delivered';
          await message.save();
          
          // Notify sender about delivery
          socket.emit('message_status_update', {
            messageId: message._id,
            status: 'delivered'
          });
        }, 100);
      } else {
        // Recipient offline, just emit to their room
        io.to(recipientIdStr).emit('new_message', {
          message,
          chatId: chat._id
        });
      }

    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('message_error', {
        tempId: data.tempId,
        error: 'Failed to send message'
      });
    }
  });

  // Handle group message with complete read receipts
  // socket.on('send_group_message', async (data) => {
  //   try {
  //     const { groupId, text, type = 'text', tempId } = data;
  //     const senderId = socket.userId;

  //     // Check if user is member
  //     const group = await Group.findById(groupId).populate('members.user', '_id');
  //     if (!group || !group.members.some(m => m.user && m.user._id && m.user._id.toString() === senderId)) {
  //       return socket.emit('message_error', {
  //         tempId,
  //         error: 'You are not a member of this group'
  //       });
  //     }

  //     // Check if only admins can send
  //     if (group.settings && group.settings.onlyAdminsCanSend) {
  //       const isAdmin = group.admins && group.admins.includes(senderId);
  //       if (!isAdmin) {
  //         return socket.emit('message_error', {
  //           tempId,
  //           error: 'Only admins can send messages in this group'
  //         });
  //       }
  //     }

  //     // Create message
  //     const message = new Message({
  //       sender: senderId,
  //       group: groupId,
  //       text,
  //       type,
  //       status: 'sent',
  //       deliveredTo: [],
  //       readBy: []
  //     });

  //     await message.save();

  //     // Update group
  //     group.lastMessage = message._id;
  //     group.lastActivity = new Date();
  //     await group.save();

  //     message.totalGroupMembers = group.members.length;

  //     await message.populate('sender', 'name avatar');
      
  //     // Add total members count for status calculation
  //     if (group && group.members) {
  //       message.totalGroupMembers = group.members.length;
  //     }

  //     // // Get all online members (regardless of whether they're in group room)
  //     // const onlineMembers = [];
  //     // if (group && group.members) {
  //     //   group.members.forEach(member => {
  //     //     if (member.user && member.user._id) {
  //     //       const memberId = member.user._id.toString();
  //     //       if (memberId !== senderId) {
  //     //         // Check if member is online (has an active socket connection)
  //     //         const memberSocket = [...io.sockets.sockets.values()]
  //     //           .find(s => s.userId === memberId);
  //     //         if (memberSocket) {
  //     //           onlineMembers.push(memberId);
  //     //         }
  //     //       }
  //     //     }
  //     //   });
  //     // }

  //     // // Immediately mark as delivered to all online members
  //     // if (onlineMembers.length > 0) {
  //     //   message.deliveredTo = onlineMembers.map(memberId => ({
  //     //     user: memberId,
  //     //     deliveredAt: new Date()
  //     //   }));
  //     //   await message.save();
  //     // }

  //     // Calculate group status
  //     const messageObj = message.toObject();
      
  //     messageObj.groupStatus = 'sent'; // Always 'sent' initially


  //     // if (message.totalGroupMembers) {
  //     //   const otherMembers = message.totalGroupMembers - 1;
  //     //   const deliveredCount = message.deliveredTo ? message.deliveredTo.length : 0;
  //     //   const readCount = message.readBy ? message.readBy.length : 0;
        
  //     //   if (otherMembers === 0) {
  //     //     messageObj.groupStatus = 'read';
  //     //   } else if (readCount >= otherMembers) {
  //     //     messageObj.groupStatus = 'read';
  //     //   } else if (deliveredCount >= otherMembers) {
  //     //     messageObj.groupStatus = 'delivered';
  //     //   } else {
  //     //     messageObj.groupStatus = 'sent';
  //     //   }
  //     // } else {
  //     //   messageObj.groupStatus = 'sent';
  //     // }

  //     // Emit to all group members EXCEPT sender
  //     socket.to(`group_${groupId}`).emit('new_group_message', {
  //       message: messageObj,
  //       groupId
  //     });

  //     // Also emit to individual sockets for offline delivery tracking
  //     group.members.forEach(member => {
  //       if (member.user && member.user._id) {
  //         const memberId = member.user._id.toString();
  //         if (memberId !== senderId) {
  //           io.to(memberId).emit('new_group_message', {
  //             message: messageObj,
  //             groupId
  //           });
  //         }
  //       }
  //     });

  //     // Confirm to sender with status
  //     socket.emit('message_sent', {
  //       tempId,
  //       message: messageObj,
  //       groupId
  //     });

  //   } catch (error) {
  //     console.error('Send group message error:', error);
  //     socket.emit('message_error', {
  //       tempId: data.tempId,
  //       error: 'Failed to send message'
  //     });
  //   }
  // });

  socket.on('send_group_message', async (data) => {
    try {
      const { groupId, text, type = 'text', tempId } = data;
      const senderId = socket.userId;

      // Check if user is member
      const group = await Group.findById(groupId).populate('members.user', '_id');
      if (!group || !group.members.some(m => m.user && m.user._id && m.user._id.toString() === senderId)) {
        return socket.emit('message_error', {
          tempId,
          error: 'You are not a member of this group'
        });
      }

      // Check if only admins can send
      if (group.settings && group.settings.onlyAdminsCanSend) {
        const isAdmin = group.admins && group.admins.includes(senderId);
        if (!isAdmin) {
          return socket.emit('message_error', {
            tempId,
            error: 'Only admins can send messages in this group'
          });
        }
      }

      // Create message
      const message = new Message({
        sender: senderId,
        group: groupId,
        text,
        type,
        status: 'sent',
        deliveredTo: [],
        readBy: []
      });

      await message.save();

      // Update group
      group.lastMessage = message._id;
      group.lastActivity = new Date();
      await group.save();

      await message.populate('sender', 'name avatar');
      
      // Add total members count for status calculation
      if (group && group.members) {
        message.totalGroupMembers = group.members.length;
      }

      // Get all ONLINE members for immediate delivery
      const onlineMembers = [];
      if (group && group.members) {
        for (const member of group.members) {
          if (member.user && member.user._id) {
            const memberId = member.user._id.toString();
            if (memberId !== senderId) {
              // Check if member is online
              const memberSocket = [...io.sockets.sockets.values()]
                .find(s => s.userId === memberId);
              if (memberSocket) {
                onlineMembers.push(memberId);
              }
            }
          }
        }
      }

      // Mark as delivered to all ONLINE members immediately
      if (onlineMembers.length > 0) {
        message.deliveredTo = onlineMembers.map(memberId => ({
          user: memberId,
          deliveredAt: new Date()
        }));
        await message.save();
      }

      // Calculate initial group status
      const messageObj = message.toObject();
      if (message.totalGroupMembers) {
        const otherMembers = message.totalGroupMembers - 1;
        const deliveredCount = message.deliveredTo.length;
        
        if (otherMembers === 0 || deliveredCount >= otherMembers) {
          messageObj.groupStatus = 'delivered';
        } else {
          messageObj.groupStatus = 'sent';
        }
      } else {
        messageObj.groupStatus = 'sent';
      }

      // Emit to all group members
      socket.to(`group_${groupId}`).emit('new_group_message', {
        message: messageObj,
        groupId
      });

      // Also emit to individual sockets
      group.members.forEach(member => {
        if (member.user && member.user._id) {
          const memberId = member.user._id.toString();
          if (memberId !== senderId) {
            io.to(memberId).emit('new_group_message', {
              message: messageObj,
              groupId
            });
          }
        }
      });

      // Confirm to sender
      socket.emit('message_sent', {
        tempId,
        message: messageObj,
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

  // Add this new event handler
  socket.on('mark_group_delivered', async (data) => {
    const { messageIds, groupId } = data;
    const userId = socket.userId;

    try {
      const group = await Group.findById(groupId);
      if (!group) return;
      
      // Verify user is still a member
      const isMember = group.members.some(m => 
        m.user.toString() === userId
      );
      if (!isMember) return;

      // Mark messages as delivered
      for (const messageId of messageIds) {
        const message = await Message.findById(messageId);
        if (!message || !message.sender) continue;

        if (message.sender.toString() === userId) continue;

        if (!message.deliveredTo) {
          message.deliveredTo = [];
        }

        // Check if not already delivered
        const alreadyDelivered = message.deliveredTo.some(
          d => d.user && d.user.toString() === userId
        );

        if (!alreadyDelivered) {
          message.deliveredTo.push({
            user: userId,
            deliveredAt: new Date()
          });
          
          await message.save();
          
          // Calculate and emit status update
          if (group.members) {
            message.totalGroupMembers = group.members.length;
            
            const otherMembers = message.totalGroupMembers - 1;
            const deliveredCount = message.deliveredTo.length;
            const readCount = message.readBy ? message.readBy.length : 0;
            
            let groupStatus = 'sent';
            if (otherMembers === 0) {
              groupStatus = 'delivered'; // or 'read' if only sender
            } else if (readCount >= otherMembers) {
              groupStatus = 'read';
            } else if (deliveredCount >= otherMembers) {
              groupStatus = 'delivered';
            }

            // Notify sender
            if (message.sender) {
              io.to(message.sender.toString()).emit('group_message_status_update', {
                messageId: message._id,
                groupStatus: groupStatus,
                groupId
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Mark group delivered error:', error);
    }
  });

  // Mark group messages as read (only when chat is open)
  // socket.on('mark_group_read', async (data) => {
  //   const { messageIds, groupId } = data;
  //   const userId = socket.userId;

  //   try {
  //     // Get group for member count
  //     const group = await Group.findById(groupId);
  //     if (!group) return;

  //     // Verify user is still a member
  //     const isMember = group.members.some(m => 
  //       m.user.toString() === userId
  //     );
  //     if (!isMember) return;
      
  //     for (const messageId of messageIds) {
  //       const message = await Message.findById(messageId);
  //       if (!message || !message.sender || message.sender.toString() === userId) continue;

  //       // Initialize arrays if not exists
  //       if (!message.readBy) {
  //         message.readBy = [];
  //       }
  //       if (!message.deliveredTo) {
  //         message.deliveredTo = [];
  //       }

  //       // Check if already marked as read
  //       const alreadyRead = message.readBy.some(
  //         r => r.user && r.user.toString() === userId
  //       );

  //       if (!alreadyRead) {
  //         // First mark as delivered if not already
  //         const alreadyDelivered = message.deliveredTo.some(
  //           d => d.user && d.user.toString() === userId
  //         );
          
  //         if (!alreadyDelivered) {
  //           message.deliveredTo.push({
  //             user: userId,
  //             deliveredAt: new Date()
  //           });
  //         }

  //         // Mark as read
  //         message.readBy.push({
  //           user: userId,
  //           readAt: new Date()
  //         });
          
  //         await message.save();
          
  //         if (group.members) {
  //           message.totalGroupMembers = group.members.length;
            
  //           // Calculate group status
  //           const otherMembers = message.totalGroupMembers - 1;
  //           const deliveredCount = message.deliveredTo.length;
  //           const readCount = message.readBy.length;
            
  //           let groupStatus = 'sent';
  //           if (otherMembers === 0 || readCount >= otherMembers) {
  //             groupStatus = 'read';
  //           } else if (deliveredCount >= otherMembers) {
  //             groupStatus = 'delivered';
  //           }

  //           // Notify sender about read status update
  //           if (message.sender) {
  //             // Calculate the status before emitting
  //             const totalMembers = group.members.length;
  //             message.totalGroupMembers = totalMembers;

  //             io.to(message.sender.toString()).emit('group_message_status_update', {
  //               messageId: message._id,
  //               groupStatus: message.groupStatus,
  //               groupId,
  //               deliveredCount: message.deliveredTo.length,
  //               readCount: message.readBy.length,
  //               totalMembers: totalMembers
  //             });
  //           }
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Mark group read error:', error);
  //   }
  // });

  socket.on('mark_group_read', async (data) => {
    const { messageIds, groupId } = data;
    const userId = socket.userId;

    try {
      // Get group for member count
      const group = await Group.findById(groupId);
      if (!group) return;
      
      // Verify user is still a member
      const isMember = group.members.some(m => 
        m.user.toString() === userId
      );
      if (!isMember) return;
      
      for (const messageId of messageIds) {
        const message = await Message.findById(messageId);
        if (!message || !message.sender) continue;

        // IMPORTANT: Debug log to check the comparison
        console.log('Checking message:', {
          messageId: message._id,
          senderId: message.sender.toString(),
          userId: userId,
          isSender: message.sender.toString() === userId
        });

        if (message.sender.toString() === userId) {
          console.log('Skipping - user is the sender');
          continue;
        }

        // Initialize arrays if not exists
        if (!message.readBy) {
          message.readBy = [];
        }
        if (!message.deliveredTo) {
          message.deliveredTo = [];
        }

        // First mark as delivered if not already
        const alreadyDelivered = message.deliveredTo.some(
          d => d.user && d.user.toString() === userId
        );
        
        if (!alreadyDelivered) {
          message.deliveredTo.push({
            user: userId,
            deliveredAt: new Date()
          });
        }

        // Check if already marked as read
        const alreadyRead = message.readBy.some(
          r => r.user && r.user.toString() === userId
        );

        if (!alreadyRead) {
          // Mark as read
          message.readBy.push({
            user: userId,
            readAt: new Date()
          });
        }
        
        await message.save();
        
        if (group.members) {
          message.totalGroupMembers = group.members.length;
          
          // Calculate group status
          const otherMembers = message.totalGroupMembers - 1;
          const deliveredCount = message.deliveredTo ? message.deliveredTo.length : 0;
          const readCount = message.readBy.length;
          
          let groupStatus = 'sent';

          // IMPORTANT: Check the actual logic here
          console.log('Status calculation:', {
            totalMembers: message.totalGroupMembers,
            otherMembers: otherMembers,
            readCount: readCount,
            deliveredCount: deliveredCount
          });

          if (otherMembers === 0) {
            // Only sender in group
            groupStatus = 'read';
          } else if (readCount >= otherMembers) {
            // All other members have read
            groupStatus = 'read';
          } else if (deliveredCount >= otherMembers) {
            groupStatus = 'delivered';
          }

          // Notify sender about read status update
          if (message.sender) {
            io.to(message.sender.toString()).emit('group_message_status_update', {
              messageId: message._id,
              groupStatus: groupStatus,
              groupId,
              readCount,
              totalMembers: message.totalGroupMembers
            });
          }
        }
      }
    } catch (error) {
      console.error('Mark group read error:', error);
    }
  });

  // Handle typing indicator
  socket.on('typing', async (data) => {
    const { recipientId, isTyping } = data;
    const senderId = socket.userId;

    const recipientIdStr = recipientId.toString();

    // Update chat typing status
    const chat = await Chat.findOne({
      participants: { $all: [senderId, recipientId] }
    });

    if (chat) {
      chat.isTyping.set(senderId.toString(), isTyping);
      await chat.save();
    }

    // Emit to recipient
    io.to(recipientIdStr).emit('typing_indicator', {
      userId: senderId,
      isTyping
    });
  });

  // Handle read receipts for private messages
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
        chat.unreadCount.set(userId.toString(), 0);
        await chat.save();
      }

      // Get messages to find senders
      const messages = await Message.find({ _id: { $in: messageIds } });
      const senderIds = [...new Set(messages.map(m => m.sender ? m.sender.toString() : null).filter(id => id))];

      // Notify senders about read receipts
      senderIds.forEach(senderId => {
        if (senderId) {
          io.to(senderId).emit('messages_read', {
            messageIds,
            readBy: userId,
            chatId
          });
        }
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

  // Join group room (for receiving real-time updates)
  socket.on('join_group', (groupId) => {
    socket.join(`group_${groupId}`);
  });

  // Leave group room
  socket.on('leave_group', (groupId) => {
    socket.leave(`group_${groupId}`);
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

  // Group member events
  socket.on('member_added', async (data) => {
    const { groupId, memberIds } = data;
    const addedById = socket.userId;
    
    try {
      const addedBy = await User.findById(addedById).select('name');
      const members = await User.find({ _id: { $in: memberIds } }).select('name');
      
      // Notify all group members
      io.to(`group_${groupId}`).emit('group_member_added', {
        groupId,
        memberIds,
        memberNames: members.map(m => m.name).join(', '),
        memberName: members[0]?.name,
        addedBy: addedById,
        addedByName: addedBy.name
      });
      
      // Join new members to group room
      memberIds.forEach(memberId => {
        const memberSocket = [...io.sockets.sockets.values()]
          .find(s => s.userId === memberId.toString());
        if (memberSocket) {
          memberSocket.join(`group_${groupId}`);
        }
      });
      
    } catch (error) {
      console.error('Member added event error:', error);
    }
  });

  socket.on('member_removed', async (data) => {
    const { groupId, memberId } = data;
    const removedById = socket.userId;
    
    try {
      const removedBy = await User.findById(removedById).select('name');
      const member = await User.findById(memberId).select('name');
      
      // Notify all group members
      io.to(`group_${groupId}`).emit('group_member_removed', {
        groupId,
        memberId,
        memberName: member.name,
        removedBy: removedById,
        removedByName: removedBy.name
      });
      
      // Remove member from group room
      const memberSocket = [...io.sockets.sockets.values()]
        .find(s => s.userId === memberId.toString());
      if (memberSocket) {
        memberSocket.leave(`group_${groupId}`);
      }
      
    } catch (error) {
      console.error('Member removed event error:', error);
    }
  });

  socket.on('member_left', async (data) => {
    const { groupId } = data;
    const memberId = socket.userId;
    
    try {
      const member = await User.findById(memberId).select('name');
      
      // Notify all group members
      io.to(`group_${groupId}`).emit('group_member_left', {
        groupId,
        memberId,
        memberName: member.name
      });
      
      // Leave group room
      socket.leave(`group_${groupId}`);
      
    } catch (error) {
      console.error('Member left event error:', error);
    }
  });
};

module.exports = socketEvents;