const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: [100, 'Team name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['leader', 'senior', 'junior', 'intern'],
      default: 'junior'
    },
    specialization: {
      type: String,
      enum: ['ui_ux_designer', 'software_engineer', 'qa_engineer', 'devops_engineer', 'product_manager', 'business_analyst', 'data_analyst', 'marketing_specialist', 'general'],
      default: 'general'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    capacity: {
      maxProjects: { type: Number, default: 4 },
      weeklyHours: { type: Number, default: 40 }
    }
  }],
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  capacity: {
    total: { type: Number, default: 0 }, // total team capacity in hours
    available: { type: Number, default: 0 }, // available capacity
    utilization: { type: Number, default: 0 } // utilization percentage
  },
  performance: {
    velocity: { type: Number, default: 0 }, // average story points per sprint
    quality: { type: Number, default: 0 }, // quality score 0-100
    collaboration: { type: Number, default: 0 }, // collaboration score 0-100
    lastUpdated: { type: Date, default: Date.now }
  },
  settings: {
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
      timezone: { type: String, default: 'UTC' }
    },
    communication: {
      preferredChannel: { type: String, enum: ['slack', 'email', 'chat'], default: 'slack' },
      dailyStandup: { type: Boolean, default: true },
      weeklyRetrospective: { type: Boolean, default: true }
    },
    notifications: {
      taskUpdates: { type: Boolean, default: true },
      deadlineReminders: { type: Boolean, default: true },
      teamAnnouncements: { type: Boolean, default: true }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Indexes
teamSchema.index({ organization: 1 });
teamSchema.index({ leader: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ isActive: 1 });
teamSchema.index({ isArchived: 1 });

// Virtual for member count
teamSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for project count
teamSchema.virtual('projectCount').get(function() {
  return this.projects.length;
});

// Virtual for team utilization
teamSchema.virtual('utilizationPercentage').get(function() {
  if (this.capacity.total === 0) return 0;
  return Math.round((this.capacity.utilization / this.capacity.total) * 100);
});

// Methods
teamSchema.methods.addMember = function(userId, role = 'junior', specialization = 'general') {
  // Check if user is already a member
  if (this.members.some(member => member.user.toString() === userId.toString())) {
    throw new Error('User is already a team member');
  }
  
  this.members.push({
    user: userId,
    role,
    specialization,
    joinedAt: new Date(),
    capacity: {
      maxProjects: 4,
      weeklyHours: 40
    }
  });
  
  this.updateCapacity();
  return this.save();
};

teamSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => member.user.toString() !== userId.toString());
  this.updateCapacity();
  return this.save();
};

teamSchema.methods.updateCapacity = function() {
  let totalCapacity = 0;
  let availableCapacity = 0;
  
  this.members.forEach(member => {
    totalCapacity += member.capacity.weeklyHours;
    // Calculate available capacity based on current projects
    // This would need to be calculated from actual project assignments
    availableCapacity += member.capacity.weeklyHours;
  });
  
  this.capacity.total = totalCapacity;
  this.capacity.available = availableCapacity;
  this.capacity.utilization = totalCapacity - availableCapacity;
};

teamSchema.methods.canAddProject = function() {
  // Check if team has capacity for new projects
  return this.capacity.available > 0;
};

teamSchema.methods.getMemberBySpecialization = function(specialization) {
  return this.members.filter(member => member.specialization === specialization);
};

teamSchema.methods.getAvailableMembers = function() {
  return this.members.filter(member => {
    // Check if member has capacity for more projects
    return member.capacity.maxProjects > 0; // This would need actual project count
  });
};

teamSchema.methods.updatePerformance = function(velocity, quality, collaboration) {
  this.performance.velocity = velocity;
  this.performance.quality = quality;
  this.performance.collaboration = collaboration;
  this.performance.lastUpdated = new Date();
  return this.save();
};

module.exports = mongoose.model('Team', teamSchema);