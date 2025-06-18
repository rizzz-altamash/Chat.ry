// ===== src/models/Chat.js =====
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  isTyping: {
    type: Map,
    of: Boolean,
    default: new Map()
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
chatSchema.index({ participants: 1 });
chatSchema.index({ lastActivity: -1 });

module.exports = mongoose.model('Chat', chatSchema);