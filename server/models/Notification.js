const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'task_assigned', 'task_updated', 'task_completed', 'task_overdue',
      'project_created', 'project_updated', 'project_completed',
      'sprint_started', 'sprint_completed', 'sprint_overdue',
      'team_invitation', 'team_joined', 'team_left',
      'comment_added', 'mention', 'status_change',
      'deadline_reminder', 'milestone_reached', 'budget_alert',
      'system_update', 'security_alert', 'integration_connected',
      'report_ready', 'export_completed', 'backup_completed',
      'role_assignment', 'role_changed', 'role_removed',
      'user_invited', 'account_activated', 'account_deactivated',
      'capacity_updated'
    ]
  },
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  data: {
    resource: {
      type: {
        type: String,
        enum: ['user', 'project', 'task', 'sprint', 'team', 'organization', 'system']
      },
      id: mongoose.Schema.Types.ObjectId,
      name: String
    },
    action: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  channels: {
    inApp: {
      enabled: { type: Boolean, default: true },
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    email: {
      enabled: { type: Boolean, default: true },
      sent: { type: Boolean, default: false },
      sentAt: Date,
      subject: String
    },
    push: {
      enabled: { type: Boolean, default: false },
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    slack: {
      enabled: { type: Boolean, default: false },
      sent: { type: Boolean, default: false },
      sentAt: Date,
      channel: String
    }
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'cancelled'],
    default: 'pending'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  clicked: {
    type: Boolean,
    default: false
  },
  clickedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  retryCount: {
    type: Number,
    default: 0,
    max: 3
  },
  lastRetryAt: {
    type: Date,
    default: null
  },
  error: {
    message: String,
    code: String,
    details: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ organization: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ status: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ 'data.resource.type': 1, 'data.resource.id': 1 });

// Virtual for notification age
notificationSchema.virtual('age').get(function() {
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
notificationSchema.statics.create = async function(data) {
  const notification = new this({
    recipient: data.recipient,
    organization: data.organization,
    type: data.type,
    title: data.title,
    message: data.message,
    data: data.data,
    priority: data.priority || 'medium',
    channels: data.channels || {
      inApp: { enabled: true },
      email: { enabled: true },
      push: { enabled: false },
      slack: { enabled: false }
    },
    expiresAt: data.expiresAt
  });
  
  return await notification.save();
};

notificationSchema.statics.getUserNotifications = async function(userId, organizationId, options = {}) {
  const {
    limit = 50,
    offset = 0,
    type,
    status,
    isRead,
    priority
  } = options;
  
  const query = {
    recipient: userId,
    organization: organizationId
  };
  
  if (type) query.type = type;
  if (status) query.status = status;
  if (isRead !== undefined) query.isRead = isRead;
  if (priority) query.priority = priority;
  
  return await this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset);
};

notificationSchema.statics.markAsRead = async function(notificationIds, userId) {
  return await this.updateMany(
    { _id: { $in: notificationIds }, recipient: userId },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );
};

notificationSchema.statics.markAllAsRead = async function(userId, organizationId) {
  return await this.updateMany(
    { recipient: userId, organization: organizationId, isRead: false },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );
};

notificationSchema.statics.getUnreadCount = async function(userId, organizationId) {
  return await this.countDocuments({
    recipient: userId,
    organization: organizationId,
    isRead: false
  });
};

// Instance methods
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsClicked = function() {
  this.clicked = true;
  this.clickedAt = new Date();
  return this.save();
};

notificationSchema.methods.retry = function() {
  this.retryCount += 1;
  this.lastRetryAt = new Date();
  this.status = 'pending';
  return this.save();
};

notificationSchema.methods.markAsSent = function(channel) {
  if (this.channels[channel]) {
    this.channels[channel].sent = true;
    this.channels[channel].sentAt = new Date();
  }
  
  // Check if all enabled channels are sent
  const enabledChannels = Object.keys(this.channels).filter(
    channel => this.channels[channel].enabled
  );
  const sentChannels = enabledChannels.filter(
    channel => this.channels[channel].sent
  );
  
  if (sentChannels.length === enabledChannels.length) {
    this.status = 'sent';
  }
  
  return this.save();
};

notificationSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  return this.save();
};

notificationSchema.methods.markAsFailed = function(error) {
  this.status = 'failed';
  this.error = error;
  return this.save();
};

notificationSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);

