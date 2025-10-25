const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    unique: true
  },
  general: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    dateFormat: {
      type: String,
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
      default: 'MM/DD/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '12h'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  notifications: {
    email: {
      enabled: { type: Boolean, default: true },
      taskUpdates: { type: Boolean, default: true },
      deadlineReminders: { type: Boolean, default: true },
      statusChanges: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true },
      projectUpdates: { type: Boolean, default: true }
    },
    push: {
      enabled: { type: Boolean, default: true },
      taskUpdates: { type: Boolean, default: true },
      deadlineReminders: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true }
    },
    slack: {
      enabled: { type: Boolean, default: false },
      taskUpdates: { type: Boolean, default: true },
      deadlineReminders: { type: Boolean, default: true },
      statusChanges: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true }
    }
  },
  security: {
    requireMFA: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 24 }, // hours
    passwordPolicy: {
      minLength: { type: Number, default: 8 },
      requireUppercase: { type: Boolean, default: true },
      requireLowercase: { type: Boolean, default: true },
      requireNumbers: { type: Boolean, default: true },
      requireSymbols: { type: Boolean, default: false }
    },
    ipWhitelist: [String],
    allowedDomains: [String]
  },
  integrations: {
    slack: {
      enabled: { type: Boolean, default: false },
      botToken: { type: String, default: null },
      signingSecret: { type: String, default: null },
      clientId: { type: String, default: null },
      clientSecret: { type: String, default: null },
      webhookUrl: { type: String, default: null },
      channels: [{
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
        channelId: String,
        channelName: String,
        enabled: { type: Boolean, default: true }
      }]
    },
    openai: {
      enabled: { type: Boolean, default: false },
      apiKey: { type: String, default: null },
      model: { type: String, default: 'gpt-3.5-turbo' },
      maxTokens: { type: Number, default: 1000 },
      temperature: { type: Number, default: 0.7 }
    },
    email: {
      enabled: { type: Boolean, default: false },
      smtpHost: { type: String, default: null },
      smtpPort: { type: Number, default: 587 },
      smtpUser: { type: String, default: null },
      smtpPass: { type: String, default: null },
      fromEmail: { type: String, default: null },
      fromName: { type: String, default: 'Projectra' }
    }
  },
  features: {
    kanban: { type: Boolean, default: true },
    analytics: { type: Boolean, default: true },
    chat: { type: Boolean, default: true },
    aiAssistant: { type: Boolean, default: true },
    timeTracking: { type: Boolean, default: true },
    fileSharing: { type: Boolean, default: true },
    reporting: { type: Boolean, default: true }
  },
  limits: {
    maxUsers: { type: Number, default: 5 },
    maxProjects: { type: Number, default: 3 },
    maxStorage: { type: Number, default: 1024 }, // MB
    maxFileSize: { type: Number, default: 10 }, // MB
    maxTasksPerProject: { type: Number, default: 100 }
  },
  backup: {
    enabled: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    },
    retention: { type: Number, default: 30 }, // days
    lastBackup: { type: Date, default: null }
  }
}, {
  timestamps: true
});

// Indexes
settingsSchema.index({ organization: 1 });

// Methods
settingsSchema.methods.isFeatureEnabled = function(feature) {
  return this.features[feature] === true;
};

settingsSchema.methods.canAddUser = function(currentUserCount) {
  return currentUserCount < this.limits.maxUsers;
};

settingsSchema.methods.canAddProject = function(currentProjectCount) {
  return currentProjectCount < this.limits.maxProjects;
};

settingsSchema.methods.updateBackupStatus = function() {
  this.backup.lastBackup = new Date();
  return this.save();
};

module.exports = mongoose.model('Settings', settingsSchema);
