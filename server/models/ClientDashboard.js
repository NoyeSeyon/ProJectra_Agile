const mongoose = require('mongoose');

const clientDashboardSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  projects: [{
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    accessLevel: {
      type: String,
      enum: ['view_only', 'comment', 'approve'],
      default: 'view_only'
    },
    notifications: {
      progress: { type: Boolean, default: true },
      milestones: { type: Boolean, default: true },
      budget: { type: Boolean, default: true },
      delays: { type: Boolean, default: true }
    }
  }],
  widgets: {
    projectProgress: {
      enabled: { type: Boolean, default: true },
      position: { x: Number, y: Number, w: Number, h: Number },
      settings: {
        showMilestones: { type: Boolean, default: true },
        showBudget: { type: Boolean, default: true },
        showTimeline: { type: Boolean, default: true }
      }
    },
    budgetTracker: {
      enabled: { type: Boolean, default: true },
      position: { x: Number, y: Number, w: Number, h: Number },
      settings: {
        showSpent: { type: Boolean, default: true },
        showRemaining: { type: Boolean, default: true },
        showForecast: { type: Boolean, default: true }
      }
    },
    teamActivity: {
      enabled: { type: Boolean, default: true },
      position: { x: Number, y: Number, w: Number, h: Number },
      settings: {
        showRecentActivity: { type: Boolean, default: true },
        showTeamMembers: { type: Boolean, default: true }
      }
    },
    communication: {
      enabled: { type: Boolean, default: true },
      position: { x: Number, y: Number, w: Number, h: Number },
      settings: {
        showMessages: { type: Boolean, default: true },
        showAnnouncements: { type: Boolean, default: true }
      }
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    refreshInterval: {
      type: Number,
      default: 300 // seconds
    },
    emailDigest: {
      enabled: { type: Boolean, default: true },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly'
      },
      day: { type: Number, default: 1 }, // day of week/month
      time: { type: String, default: '09:00' }
    }
  },
  analytics: {
    lastViewed: { type: Date, default: Date.now },
    viewCount: { type: Number, default: 0 },
    favoriteProjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }],
    customReports: [{
      name: String,
      type: {
        type: String,
        enum: ['progress', 'budget', 'timeline', 'team', 'custom'],
        default: 'custom'
      },
      filters: mongoose.Schema.Types.Mixed,
      schedule: {
        enabled: { type: Boolean, default: false },
        frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
        recipients: [String]
      }
    }]
  },
  permissions: {
    canViewBudget: { type: Boolean, default: true },
    canViewTeam: { type: Boolean, default: true },
    canDownloadReports: { type: Boolean, default: true },
    canComment: { type: Boolean, default: true },
    canApprove: { type: Boolean, default: false }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Indexes
clientDashboardSchema.index({ client: 1 });
clientDashboardSchema.index({ organization: 1 });
clientDashboardSchema.index({ 'projects.project': 1 });

// Methods
clientDashboardSchema.methods.addProject = function(projectId, accessLevel = 'view_only') {
  // Check if project is already added
  if (this.projects.some(p => p.project.toString() === projectId.toString())) {
    throw new Error('Project is already added to dashboard');
  }
  
  this.projects.push({
    project: projectId,
    accessLevel,
    notifications: {
      progress: true,
      milestones: true,
      budget: true,
      delays: true
    }
  });
  
  return this.save();
};

clientDashboardSchema.methods.removeProject = function(projectId) {
  this.projects = this.projects.filter(p => p.project.toString() !== projectId.toString());
  return this.save();
};

clientDashboardSchema.methods.updateProjectAccess = function(projectId, accessLevel) {
  const project = this.projects.find(p => p.project.toString() === projectId.toString());
  if (project) {
    project.accessLevel = accessLevel;
    return this.save();
  }
  throw new Error('Project not found in dashboard');
};

clientDashboardSchema.methods.toggleWidget = function(widgetName, enabled) {
  if (this.widgets[widgetName]) {
    this.widgets[widgetName].enabled = enabled;
    return this.save();
  }
  throw new Error('Widget not found');
};

clientDashboardSchema.methods.updateWidgetPosition = function(widgetName, position) {
  if (this.widgets[widgetName]) {
    this.widgets[widgetName].position = position;
    return this.save();
  }
  throw new Error('Widget not found');
};

clientDashboardSchema.methods.recordView = function() {
  this.analytics.lastViewed = new Date();
  this.analytics.viewCount += 1;
  return this.save();
};

clientDashboardSchema.methods.addFavoriteProject = function(projectId) {
  if (!this.analytics.favoriteProjects.includes(projectId)) {
    this.analytics.favoriteProjects.push(projectId);
    return this.save();
  }
};

clientDashboardSchema.methods.removeFavoriteProject = function(projectId) {
  this.analytics.favoriteProjects = this.analytics.favoriteProjects.filter(
    id => id.toString() !== projectId.toString()
  );
  return this.save();
};

clientDashboardSchema.methods.createCustomReport = function(name, type, filters, schedule = null) {
  const report = {
    name,
    type,
    filters,
    schedule: schedule || { enabled: false }
  };
  
  this.analytics.customReports.push(report);
  return this.save();
};

// Static method to get dashboard for client
clientDashboardSchema.statics.getClientDashboard = async function(clientId) {
  return await this.findOne({ client: clientId, isActive: true })
    .populate('projects.project', 'name description status progress budget')
    .populate('organization', 'name slug');
};

module.exports = mongoose.model('ClientDashboard', clientDashboardSchema);

