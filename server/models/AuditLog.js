const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'create', 'read', 'update', 'delete',
      'login', 'logout', 'register',
      'invite', 'accept_invite', 'reject_invite',
      'assign_role', 'change_permission',
      'enable_feature', 'disable_feature',
      'security_breach', 'data_export', 'data_import',
      'system_config', 'version_update'
    ]
  },
  resource: {
    type: String,
    required: true,
    enum: [
      'user', 'organization', 'project', 'task', 'sprint',
      'team', 'invitation', 'settings', 'feature',
      'security', 'system', 'client', 'analytics'
    ]
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userRole: {
    type: String,
    enum: ['projectra_admin', 'admin', 'project_manager', 'team_leader', 'member', 'client', 'guest'],
    required: true
  },
  details: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    changes: [{
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed
    }]
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'warning'],
    default: 'success'
  },
  message: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Indexes for efficient querying
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ organization: 1, createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ severity: 1, status: 1 });
auditLogSchema.index({ createdAt: -1 });

// Static method to log audit events
auditLogSchema.statics.log = async function(data) {
  const auditLog = new this({
    action: data.action,
    resource: data.resource,
    resourceId: data.resourceId,
    organization: data.organization,
    user: data.user,
    userRole: data.userRole,
    details: data.details,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    severity: data.severity || 'low',
    status: data.status || 'success',
    message: data.message,
    metadata: data.metadata || {}
  });
  
  return await auditLog.save();
};

module.exports = mongoose.model('AuditLog', auditLogSchema);

