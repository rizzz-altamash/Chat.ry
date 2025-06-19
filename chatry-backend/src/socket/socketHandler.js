// ===== src/socket/socketHandler.js =====
const socketEvents = require('./socketEvents');
const User = require('../models/User');
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
      user.groups.forEach(group => {
        const roomName = `group_${group._id}`;
        socket.join(roomName);
        activeUsers.get(socket.userId).rooms.add(roomName);
      });
    }

    // Notify contacts about online status
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      isOnline: true
    });

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