const mongoose = require('mongoose');

const systemFeatureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['core', 'collaboration', 'analytics', 'integration', 'ai', 'security'],
    default: 'core'
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  pricing: {
    monthly: {
      type: Number,
      default: 0
    },
    yearly: {
      type: Number,
      default: 0
    }
  },
  permissions: {
    roles: [{
      type: String,
      enum: ['projectra_admin', 'admin', 'project_manager', 'team_leader', 'member', 'client', 'guest']
    }],
    organizations: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization'
    }]
  },
  configuration: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  dependencies: [{
    type: String,
    ref: 'SystemFeature'
  }],
  version: {
    type: String,
    default: '1.0.0'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Index for efficient queries
systemFeatureSchema.index({ name: 1 });
systemFeatureSchema.index({ category: 1 });
systemFeatureSchema.index({ isEnabled: 1 });

module.exports = mongoose.model('SystemFeature', systemFeatureSchema);

