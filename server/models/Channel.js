const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Channel name is required'],
    trim: true,
    maxlength: [50, 'Channel name cannot exceed 50 characters']
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  type: {
    type: String,
    enum: ['project', 'dm', 'group'],
    default: 'project'
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  settings: {
    isPrivate: { type: Boolean, default: false },
    allowFileUploads: { type: Boolean, default: true },
    allowMentions: { type: Boolean, default: true },
    autoArchive: { type: Boolean, default: false }
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
channelSchema.index({ organization: 1 });
channelSchema.index({ project: 1 });
channelSchema.index({ type: 1 });
channelSchema.index({ members: 1 });
channelSchema.index({ isArchived: 1 });
channelSchema.index({ lastActivity: -1 });

// Virtual for member count
channelSchema.virtual('memberCount', {
  ref: 'User',
  localField: 'members',
  foreignField: '_id',
  count: true
});

// Methods
channelSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.toString() === userId.toString());
};

channelSchema.methods.addMember = function(userId) {
  if (!this.isMember(userId)) {
    this.members.push(userId);
  }
  return this.save();
};

channelSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => member.toString() !== userId.toString());
  return this.save();
};

channelSchema.methods.canUserAccess = function(userId, userRole) {
  // Admin can access all channels
  if (userRole === 'admin') return true;
  
  // Channel members can access
  return this.isMember(userId);
};

channelSchema.methods.updateLastActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

channelSchema.methods.archive = function() {
  this.isArchived = true;
  this.archivedAt = new Date();
  return this.save();
};

channelSchema.methods.restore = function() {
  this.isArchived = false;
  this.archivedAt = null;
  return this.save();
};

module.exports = mongoose.model('Channel', channelSchema);
