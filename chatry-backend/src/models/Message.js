// // ===== src/models/Message.js =====
// const mongoose = require('mongoose');

// const messageSchema = new mongoose.Schema({
//   sender: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   recipient: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   group: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Group'
//   },
//   text: {
//     type: String,
//     required: true
//   },
//   type: {
//     type: String,
//     enum: ['text', 'image', 'video', 'audio', 'document'],
//     default: 'text'
//   },
//   mediaUrl: {
//     type: String
//   },
//   status: {
//     type: String,
//     enum: ['sent', 'delivered', 'read'],
//     default: 'sent'
//   },
//   readBy: [{
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     },
//     readAt: {
//       type: Date,
//       default: Date.now
//     }
//   }],
//   deletedFor: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }],
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   editedAt: {
//     type: Date
//   }
// });

// // Index for faster queries
// messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
// messageSchema.index({ group: 1, createdAt: -1 });

// module.exports = mongoose.model('Message', messageSchema);








// ===== src/models/Message.js =====
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.type !== 'system';
    }
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'document', 'system'],
    default: 'text'
  },
  mediaUrl: {
    type: String
  },
  // For system messages
  metadata: {
    action: {
      type: String,
      enum: ['member_added', 'member_removed', 'member_left', 'group_created', 'group_updated', 'member_made_admin', 'admin_removed', 'member_auto_removed', 'group_name_changed', 'group_description_changed']
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    removedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedMembers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    removedMember: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  editedAt: {
    type: Date
  }
});

// Index for faster queries
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ group: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);