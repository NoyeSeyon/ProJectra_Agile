const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [100, 'Organization name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Organization slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  logo: {
    type: String,
    default: null
  },
  settings: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    features: {
      kanban: { type: Boolean, default: true },
      analytics: { type: Boolean, default: true },
      chat: { type: Boolean, default: true },
      aiAssistant: { type: Boolean, default: true },
      slackIntegration: { type: Boolean, default: false }
    }
  },
  plan: {
    type: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    limits: {
      users: { type: Number, default: 5 },
      projects: { type: Number, default: 3 },
      storage: { type: Number, default: 1024 } // MB
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly'
    }
  },
  integrations: {
    slack: {
      enabled: { type: Boolean, default: false },
      botToken: { type: String, default: null },
      signingSecret: { type: String, default: null },
      clientId: { type: String, default: null },
      clientSecret: { type: String, default: null },
      channels: [{
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
        channelId: String,
        channelName: String
      }]
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow null initially during registration
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  domain: {
    type: String,
    trim: true,
    lowercase: true
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    expiresAt: Date,
    startedAt: {
      type: Date,
      default: Date.now
    }
  },
  maxUsers: {
    type: Number,
    default: 50
  },
  maxProjects: {
    type: Number,
    default: 100
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Super Admin who created this organization
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
organizationSchema.index({ slug: 1 });
organizationSchema.index({ owner: 1 });
organizationSchema.index({ isActive: 1 });

// Virtual for member count
organizationSchema.virtual('memberCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'organization',
  count: true
});

// Methods
organizationSchema.methods.canAddUser = function() {
  return this.memberCount < this.plan.limits.users;
};

organizationSchema.methods.canAddProject = function() {
  return this.memberCount < this.plan.limits.projects;
};

organizationSchema.methods.isFeatureEnabled = function(feature) {
  return this.settings.features[feature] === true;
};

module.exports = mongoose.model('Organization', organizationSchema);
