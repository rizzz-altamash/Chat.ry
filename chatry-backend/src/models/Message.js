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
  },
  deliveredTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveredAt: {
      type: Date,
      default: Date.now
    }
  }],
});

// Index for faster queries
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ group: 1, createdAt: -1 });

// Add a virtual field to calculate group message status
messageSchema.virtual('groupStatus').get(function() {
  if (!this.group) return this.status;
  
  // Get from populated group or assume we'll populate it
  const totalMembers = this.totalGroupMembers || 0;
  const sender = this.sender;
  
  // Exclude sender from count
  const otherMembersCount = totalMembers - 1;
  
  if (otherMembersCount === 0) return 'read'; // Only sender in group
  
  const deliveredCount = this.deliveredTo?.length || 0;
  const readCount = this.readBy?.length || 0;

  // Debug log
  console.log('Virtual groupStatus calculation:', {
    totalMembers,
    otherMembersCount,
    deliveredCount,
    readCount
  });
  
  if (readCount >= otherMembersCount) return 'read';
  if (deliveredCount >= otherMembersCount) return 'delivered';
  return 'sent';
});

// Update toJSON to include virtual fields
messageSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Message', messageSchema);