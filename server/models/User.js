const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: function() {
      return this.role !== 'super_admin';
    }
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'project_manager', 'team_leader', 'member', 'client', 'guest'],
    default: 'member'
  },
  managedOrganizations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  }], // For Super Admin to manage multiple orgs
  specialization: {
    type: String,
    enum: [
      'general',
      'UI/UX Designer',
      'Software Engineer',
      'QA Engineer',
      'DevOps Engineer',
      'Product Manager',
      'Business Analyst',
      'Data Analyst',
      'Marketing Specialist',
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'Mobile Developer',
      'Database Administrator',
      'System Administrator',
      'Security Engineer',
      'AI/ML Engineer',
      'Data Scientist',
      'Cloud Architect',
      'Technical Writer'
    ],
    default: 'general'
  },
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    }
  }],
  capacity: {
    maxProjects: {
      type: Number,
      default: 5,
      max: 5
    },
    maxTeamLeaderProjects: {
      type: Number,
      default: 1,
      max: 1
    },
    currentProjects: {
      type: Number,
      default: 0
    },
    currentTeamLeaderProjects: {
      type: Number,
      default: 0
    },
    weeklyHours: {
      type: Number,
      default: 40
    }
  },
  permissions: [{
    resource: {
      type: String,
      enum: ['users', 'projects', 'tasks', 'analytics', 'settings', 'integrations']
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'manage']
    }]
  }],
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      slack: { type: Boolean, default: false }
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  mfa: {
    enabled: { type: Boolean, default: false },
    secret: { type: String, default: null },
    backupCodes: [String]
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  slackId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ organization: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.hasPermission = function(resource, action) {
  if (this.role === 'super_admin' || this.role === 'admin') return true;
  
  const permission = this.permissions.find(p => p.resource === resource);
  if (!permission) return false;
  
  return permission.actions.includes(action) || permission.actions.includes('manage');
};

userSchema.methods.canAccessOrganization = function(orgId) {
  return this.organization.toString() === orgId.toString();
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  if (user.mfa) {
    delete user.mfa.secret;
    delete user.mfa.backupCodes;
  }
  return user;
};

module.exports = mongoose.model('User', userSchema);
