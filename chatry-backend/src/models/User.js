// ===== src/models/User.js =====
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true, // Allows null but ensures uniqueness when set
    lowercase: true,
    trim: true,
    match: /^[a-zA-Z0-9_]{3,20}$/
  },
  
  // Authentication
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  countryCode: {
    type: String,
    default: '+91'
  },
  password: {
    type: String,
    required: true
  },
  
  // Verification Status
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  phoneVerifiedAt: {
    type: Date
  },
  
  // Profile
  avatar: {
    type: String,
    default: null
  },
  status: {
    type: String,
    default: "Hey there! I'm using Chatry"
  },
  about: {
    type: String,
    maxLength: 150
  },
  
  // Contacts & Privacy
  contacts: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String, // Name saved in phone
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Privacy Settings
  privacy: {
    lastSeen: {
      type: String,
      enum: ['everyone', 'contacts', 'nobody'],
      default: 'everyone'
    },
    profilePhoto: {
      type: String,
      enum: ['everyone', 'contacts', 'nobody'],
      default: 'everyone'
    },
    status: {
      type: String,
      enum: ['everyone', 'contacts', 'nobody'],
      default: 'everyone'
    }
  },
  
  // Status
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  socketId: String,
  
  // Groups
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }],

  leftGroups: [{
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group'
    },
    leftAt: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      enum: ['left', 'removed', 'removed_reports'],
      default: 'left'
    }
  }],
  
  // Push Notifications
  fcmToken: String, // Firebase Cloud Messaging token
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
userSchema.index({ phone: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'contacts.user': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Add toJSON transform
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    delete ret.fcmToken;
    delete ret.socketId;
    delete ret.blockedUsers;
    
    return ret;
  }
});

// Get public profile (hide sensitive data)
userSchema.methods.getPublicProfile = function(requesterId = null) {
  const profile = {
    _id: this._id,
    name: this.name,
    username: this.username,
    avatar: this.avatar,
    isOnline: this.isOnline,
    lastSeen: this.lastSeen
  };
  
  // Check privacy settings
  const isContact = this.contacts.some(c => c.user.toString() === requesterId);
  
  if (this.privacy.status === 'everyone' || 
      (this.privacy.status === 'contacts' && isContact)) {
    profile.status = this.status;
  }
  
  if (this.privacy.lastSeen === 'everyone' || 
      (this.privacy.lastSeen === 'contacts' && isContact)) {
    profile.lastSeen = this.lastSeen;
  }
  
  return profile;
};

module.exports = mongoose.model('User', userSchema);