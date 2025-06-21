// ===== src/socket/socketHandler.js =====
const socketEvents = require('./socketEvents');
const User = require('../models/User');
const Message = require('../models/Message');
const { verifyToken } = require('../config/auth');

const activeUsers = new Map(); // Track user's rooms

const socketHandler = (io) => {
  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Track this user's socket
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      rooms: new Set()
    });

    // Initialize socket events
    socketEvents(io, socket);

    // Update user's online status and socketId
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      socketId: socket.id,
      lastSeen: new Date()
    });

    // Join user's personal room
    socket.join(socket.userId);
    activeUsers.get(socket.userId).rooms.add(socket.userId);

    // Join user's groups
    const user = await User.findById(socket.userId).populate('groups');
    if (user.groups) {
      // Get active groups (not in leftGroups)
      const leftGroupIds = user.leftGroups?.map(lg => lg.group.toString()) || [];
      
      user.groups.forEach(group => {
        if (!leftGroupIds.includes(group._id.toString())) {
          const roomName = `group_${group._id}`;
          socket.join(roomName);
          activeUsers.get(socket.userId).rooms.add(roomName);
        }
      });
    }

    // After user joins their groups
    // Mark pending messages as delivered when user comes online
    try {
      const userId = socket.userId;
      
      if (user && user.groups) {
        for (const group of user.groups) {
          // Find messages that are not yet delivered to this user
          const undeliveredMessages = await Message.find({
            group: group._id,
            sender: { $ne: userId },
            'deliveredTo.user': { $ne: userId },
            type: { $ne: 'system' },
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
          }).limit(100); // Limit to prevent performance issues
          
          // Mark them as delivered
          for (const message of undeliveredMessages) {
            if (!message.deliveredTo) {
              message.deliveredTo = [];
            }
            
            message.deliveredTo.push({
              user: userId,
              deliveredAt: new Date()
            });
            await message.save();
            
            // Calculate new group status
            const totalMembers = group.members.length;
            const otherMembers = totalMembers - 1;
            const deliveredCount = message.deliveredTo.length;
            const readCount = message.readBy ? message.readBy.length : 0;
            
            let groupStatus = 'sent';
            if (readCount >= otherMembers) {
              groupStatus = 'read';
            } else if (deliveredCount >= otherMembers) {
              groupStatus = 'delivered';
            }
            
            // Notify sender about status update
            if (message.sender) {
              io.to(message.sender.toString()).emit('group_message_status_update', {
                messageId: message._id,
                groupStatus: groupStatus,
                groupId: group._id
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error delivering pending messages:', error);
    }

    // Notify contacts about online status
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      isOnline: true
    });

    // IMPORTANT: Deliver pending group messages when user comes online
    // try {
    //   const userId = socket.userId;
      
    //   // Get user's groups
    //   if (user && user.groups) {
    //     // For each group, find undelivered messages
    //     for (const group of user.groups) {
    //       // Verify user is still a member
    //       const currentGroup = await Group.findById(group._id);
    //       if (!currentGroup || !currentGroup.members.some(m => 
    //         m.user.toString() === userId
    //       )) {
    //         continue;
    //       }

    //       const undeliveredMessages = await Message.find({
    //         group: group._id,
    //         sender: { $ne: userId },
    //         'deliveredTo.user': { $ne: userId },
    //         createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    //       });
          
    //       // Mark them as delivered
    //       for (const message of undeliveredMessages) {
    //         if (!message.deliveredTo) {
    //           message.deliveredTo = [];
    //         }
            
    //         message.deliveredTo.push({
    //           user: userId,
    //           deliveredAt: new Date()
    //         });
    //         await message.save();
            
    //         // Calculate new group status
    //         const totalMembers = group.members.length;
    //         const otherMembers = totalMembers - 1;
    //         const deliveredCount = message.deliveredTo.length;
    //         const readCount = message.readBy ? message.readBy.length : 0;
            
    //         let groupStatus = 'sent';
    //         if (otherMembers === 0 || readCount >= otherMembers) {
    //           groupStatus = 'read';
    //         } else if (deliveredCount >= otherMembers) {
    //           groupStatus = 'delivered';
    //         }
            
    //         // Notify sender about status update
    //         if (message.sender) {
    //           io.to(message.sender.toString()).emit('group_message_status_update', {
    //             messageId: message._id,
    //             groupStatus: groupStatus,
    //             groupId: group._id
    //           });
    //         }
    //       }
    //     }
    //   }
    // } catch (error) {
    //   console.error('Error delivering pending messages:', error);
    // }

    // Handle disconnect with cleanup
    socket.on('disconnect', async () => {
      console.log(`User ${socket.userId} disconnected`);

      // Clean up all rooms for this user
      const userInfo = activeUsers.get(socket.userId);
      if (userInfo) {
        userInfo.rooms.forEach(room => {
          socket.leave(room);
        });
        activeUsers.delete(socket.userId);
      }

      // Update user's offline status
      try {
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          socketId: null,
          lastSeen: new Date()
        });
      } catch (error) {
        console.error('Error updating user status:', error);
      }

      // Notify contacts about offline status
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        isOnline: false,
        lastSeen: new Date()
      });
    });
  });

  return io;
};

module.exports = socketHandler;