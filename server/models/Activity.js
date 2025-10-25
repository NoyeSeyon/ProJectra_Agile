const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'user', 'project', 'task', 'sprint', 'team', 'organization',
      'system', 'security', 'integration', 'communication'
    ]
  },
  action: {
    type: String,
    required: true,
    enum: [
      'created', 'updated', 'deleted', 'assigned', 'unassigned',
      'completed', 'started', 'paused', 'cancelled', 'archived',
      'restored', 'commented', 'attached', 'detached', 'moved',
      'joined', 'left', 'invited', 'accepted', 'rejected',
      'logged_in', 'logged_out', 'password_changed', 'role_changed',
      'feature_enabled', 'feature_disabled', 'integration_connected',
      'notification_sent', 'report_generated', 'export_created'
    ]
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  resource: {
    type: {
      type: String,
      enum: ['user', 'project', 'task', 'sprint', 'team', 'organization', 'system'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: String // For display purposes
  },
  target: {
    type: {
      type: String,
      enum: ['user', 'project', 'task', 'sprint', 'team', 'organization', 'system']
    },
    id: mongoose.Schema.Types.ObjectId,
    name: String
  },
  details: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    changes: [{
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed
    }],
    metadata: mongoose.Schema.Types.Mixed
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info'
  },
  visibility: {
    type: String,
    enum: ['public', 'organization', 'team', 'private'],
    default: 'organization'
  },
  tags: [String],
  ipAddress: String,
  userAgent: String,
  location: {
    country: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  isRead: {
    type: Boolean,
    default: false
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
  expiresAt: {
    type: Date,
    default: null // For temporary activities
  }
}, { timestamps: true });

// Indexes for efficient querying
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ organization: 1, createdAt: -1 });
activitySchema.index({ actor: 1, createdAt: -1 });
activitySchema.index({ 'resource.type': 1, 'resource.id': 1 });
activitySchema.index({ visibility: 1, createdAt: -1 });
activitySchema.index({ severity: 1, createdAt: -1 });
activitySchema.index({ isRead: 1, createdAt: -1 });
activitySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for activity age
activitySchema.virtual('age').get(function() {
  const now = new Date();
  const diffMs = now - this.createdAt;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Static methods
activitySchema.statics.log = async function(data) {
  const activity = new this({
    type: data.type,
    action: data.action,
    actor: data.actor,
    organization: data.organization,
    resource: data.resource,
    target: data.target,
    details: data.details,
    message: data.message,
    severity: data.severity || 'info',
    visibility: data.visibility || 'organization',
    tags: data.tags || [],
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    location: data.location,
    expiresAt: data.expiresAt
  });
  
  return await activity.save();
};

activitySchema.statics.getUserActivity = async function(userId, organizationId, options = {}) {
  const {
    limit = 50,
    offset = 0,
    type,
    action,
    severity,
    visibility = 'organization'
  } = options;
  
  const query = {
    organization: organizationId,
    visibility: { $in: [visibility, 'public'] }
  };
  
  if (type) query.type = type;
  if (action) query.action = action;
  if (severity) query.severity = severity;
  
  return await this.find(query)
    .populate('actor', 'firstName lastName avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset);
};

activitySchema.statics.getProjectActivity = async function(projectId, organizationId, options = {}) {
  const {
    limit = 50,
    offset = 0,
    action,
    severity
  } = options;
  
  const query = {
    organization: organizationId,
    'resource.type': 'project',
    'resource.id': projectId
  };
  
  if (action) query.action = action;
  if (severity) query.severity = severity;
  
  return await this.find(query)
    .populate('actor', 'firstName lastName avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset);
};

activitySchema.statics.getSystemActivity = async function(organizationId, options = {}) {
  const {
    limit = 100,
    offset = 0,
    severity,
    type = 'system'
  } = options;
  
  const query = {
    organization: organizationId,
    type,
    visibility: 'organization'
  };
  
  if (severity) query.severity = severity;
  
  return await this.find(query)
    .populate('actor', 'firstName lastName avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset);
};

// Instance methods
activitySchema.methods.markAsRead = function(userId) {
  if (!this.readBy.some(read => read.user.toString() === userId.toString())) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    this.isRead = true;
    return this.save();
  }
  return Promise.resolve(this);
};

activitySchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    return this.save();
  }
  return Promise.resolve(this);
};

activitySchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

module.exports = mongoose.model('Activity', activitySchema);

