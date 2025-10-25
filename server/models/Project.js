const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamLeader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['manager', 'member', 'viewer'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  budget: {
    planned: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    spent: { type: Number, default: 0 },
    estimated: { type: Number, default: 0 },
    alertThreshold: { type: Number, default: 80, min: 0, max: 100 } // Alert at 80% spent
  },
  weight: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  complexity: {
    type: String,
    enum: ['light', 'medium', 'heavy'],
    default: 'medium'
  },
  projectWeight: {
    estimatedHours: { type: Number, default: 0 },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    complexity: { type: Number, min: 1, max: 10, default: 5 },
    teamSize: { type: Number, min: 1, default: 1 }
  },
  agileConfig: {
    methodology: { type: String, enum: ['scrum', 'kanban', 'scrumban'], default: 'scrum' },
    sprintDuration: { type: Number, default: 2 }, // weeks
    sprintCapacity: { type: Number, default: 40 }, // hours per sprint
    storyPoints: { type: Number, default: 0 },
    velocity: { type: Number, default: 0 }
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  tags: [String],
  settings: {
    allowSelfAssignment: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    autoArchive: { type: Boolean, default: false },
    allowTeamLeaderSubtasks: { type: Boolean, default: true },
    notifications: {
      taskUpdates: { type: Boolean, default: true },
      deadlineReminders: { type: Boolean, default: true },
      statusChanges: { type: Boolean, default: true }
    }
  },
  kanbanSettings: {
    columns: [{
      id: String,
      title: String,
      order: Number,
      color: { type: String, default: '#6B7280' },
      isDefault: { type: Boolean, default: false }
    }],
    cardSettings: {
      showAssignee: { type: Boolean, default: true },
      showDueDate: { type: Boolean, default: true },
      showPriority: { type: Boolean, default: true },
      showProgress: { type: Boolean, default: true }
    }
  },
  milestones: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    dueDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  clientVisibleFields: {
    type: [String],
    default: ['name', 'description', 'status', 'progress', 'startDate', 'endDate', 'budget', 'milestones']
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
projectSchema.index({ organization: 1 });
projectSchema.index({ team: 1 });
projectSchema.index({ manager: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ isArchived: 1 });
projectSchema.index({ 'members.user': 1 });

// Virtual for member count
projectSchema.virtual('memberCount', {
  ref: 'User',
  localField: 'members.user',
  foreignField: '_id',
  count: true
});

// Virtual for task count
projectSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  count: true
});

// Methods
projectSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString());
};

projectSchema.methods.getMemberRole = function(userId) {
  const member = this.members.find(member => member.user.toString() === userId.toString());
  return member ? member.role : null;
};

projectSchema.methods.canUserAccess = function(userId, userRole) {
  // Admin can access all projects
  if (userRole === 'admin') return true;
  
  // Project manager can access their projects
  if (this.manager.toString() === userId.toString()) return true;
  
  // Client can access their project
  if (userRole === 'client' && this.client && this.client.toString() === userId.toString()) return true;
  
  // Team members can access if they're project members
  return this.isMember(userId);
};

// Get client-filtered view (only show allowed fields)
projectSchema.methods.getClientView = function() {
  const visibleFields = this.clientVisibleFields || ['name', 'description', 'status', 'progress'];
  const clientData = {};
  
  visibleFields.forEach(field => {
    if (this[field] !== undefined) {
      clientData[field] = this[field];
    }
  });
  
  // Always include essential fields
  clientData._id = this._id;
  clientData.manager = this.manager;
  clientData.createdAt = this.createdAt;
  clientData.updatedAt = this.updatedAt;
  
  return clientData;
};

projectSchema.methods.updateProgress = function() {
  // This would be called when tasks are updated
  // Implementation depends on task completion logic
  return this.progress;
};

// Calculate complexity based on weight (1-3: light, 4-7: medium, 8-10: heavy)
projectSchema.methods.calculateComplexity = function() {
  if (this.weight <= 3) {
    this.complexity = 'light';
  } else if (this.weight <= 7) {
    this.complexity = 'medium';
  } else {
    this.complexity = 'heavy';
  }
  return this.complexity;
};

// Get budget status with alert indication
projectSchema.methods.getBudgetStatus = function() {
  const planned = this.budget.planned || this.budget.amount || 0;
  const spent = this.budget.spent || 0;
  
  if (planned === 0) {
    return {
      percentage: 0,
      remaining: 0,
      isAlert: false,
      status: 'no_budget'
    };
  }
  
  const percentage = (spent / planned) * 100;
  const remaining = planned - spent;
  const alertThreshold = this.budget.alertThreshold || 80;
  
  let status = 'ok';
  if (percentage >= 95) {
    status = 'critical';
  } else if (percentage >= alertThreshold) {
    status = 'warning';
  } else if (percentage >= 70) {
    status = 'caution';
  }
  
  return {
    percentage: Math.round(percentage * 10) / 10,
    remaining,
    planned,
    spent,
    isAlert: percentage >= alertThreshold,
    status,
    alertThreshold
  };
};

// Check if user is team leader
projectSchema.methods.isTeamLeader = function(userId) {
  return this.teamLeader && this.teamLeader.toString() === userId.toString();
};

module.exports = mongoose.model('Project', projectSchema);
