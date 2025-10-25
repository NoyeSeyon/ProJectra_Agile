const mongoose = require('mongoose');

const sprintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sprint name is required'],
    trim: true,
    maxlength: [100, 'Sprint name cannot exceed 100 characters']
  },
  goal: {
    type: String,
    maxlength: [500, 'Sprint goal cannot exceed 500 characters']
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'cancelled'],
    default: 'planning'
  },
  plannedStoryPoints: {
    type: Number,
    default: 0
  },
  completedStoryPoints: {
    type: Number,
    default: 0
  },
  velocity: {
    type: Number,
    default: 0
  },
  capacity: {
    totalHours: { type: Number, default: 0 },
    allocatedHours: { type: Number, default: 0 },
    remainingHours: { type: Number, default: 0 }
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  burndownData: [{
    date: Date,
    remainingStoryPoints: Number,
    idealRemaining: Number
  }],
  retrospective: {
    whatWentWell: [String],
    whatCouldImprove: [String],
    actionItems: [{
      description: String,
      assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      completed: { type: Boolean, default: false }
    }],
    teamSentiment: {
      happy: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      sad: { type: Number, default: 0 }
    }
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
sprintSchema.index({ project: 1 });
sprintSchema.index({ organization: 1 });
sprintSchema.index({ status: 1 });
sprintSchema.index({ startDate: 1, endDate: 1 });

// Virtual for duration in days
sprintSchema.virtual('duration').get(function() {
  if (!this.startDate || !this.endDate) return 0;
  const diff = this.endDate - this.startDate;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual for days remaining
sprintSchema.virtual('daysRemaining').get(function() {
  if (!this.endDate) return 0;
  const now = new Date();
  if (now > this.endDate) return 0;
  const diff = this.endDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Calculate velocity (story points completed / sprint duration in weeks)
sprintSchema.methods.calculateVelocity = function() {
  if (this.status !== 'completed') return 0;
  const durationInWeeks = this.duration / 7;
  this.velocity = durationInWeeks > 0 ? this.completedStoryPoints / durationInWeeks : 0;
  return this.velocity;
};

// Generate burndown chart data
sprintSchema.methods.getBurndownData = function() {
  if (!this.startDate || !this.endDate) return [];
  
  const days = this.duration;
  const burndownData = [];
  const dailyIdealBurn = this.plannedStoryPoints / days;
  
  for (let i = 0; i <= days; i++) {
    const date = new Date(this.startDate);
    date.setDate(date.getDate() + i);
    
    const existingData = this.burndownData.find(d => 
      d.date.toDateString() === date.toDateString()
    );
    
    burndownData.push({
      date: date,
      remainingStoryPoints: existingData ? existingData.remainingStoryPoints : this.plannedStoryPoints - (i * dailyIdealBurn),
      idealRemaining: this.plannedStoryPoints - (i * dailyIdealBurn)
    });
  }
  
  return burndownData;
};

// Get sprint health status
sprintSchema.methods.getSprintHealth = function() {
  if (this.status !== 'active') {
    return { status: this.status, message: 'Sprint not active' };
  }
  
  const daysElapsed = this.duration - this.daysRemaining;
  const progressPercentage = (daysElapsed / this.duration) * 100;
  const completionPercentage = (this.completedStoryPoints / this.plannedStoryPoints) * 100;
  
  let status = 'on_track';
  let message = 'Sprint is on track';
  
  if (completionPercentage < progressPercentage - 15) {
    status = 'behind';
    message = 'Sprint is behind schedule';
  } else if (completionPercentage < progressPercentage - 5) {
    status = 'at_risk';
    message = 'Sprint is at risk';
  } else if (completionPercentage > progressPercentage + 10) {
    status = 'ahead';
    message = 'Sprint is ahead of schedule';
  }
  
  return {
    status,
    message,
    progressPercentage: Math.round(progressPercentage),
    completionPercentage: Math.round(completionPercentage),
    daysRemaining: this.daysRemaining,
    daysElapsed
  };
};

// Update burndown data for a specific date
sprintSchema.methods.updateBurndown = async function(remainingStoryPoints, date = new Date()) {
  const existingIndex = this.burndownData.findIndex(d => 
    d.date.toDateString() === date.toDateString()
  );
  
  const daysElapsed = Math.ceil((date - this.startDate) / (1000 * 60 * 60 * 24));
  const idealRemaining = this.plannedStoryPoints - (daysElapsed * (this.plannedStoryPoints / this.duration));
  
  if (existingIndex >= 0) {
    this.burndownData[existingIndex].remainingStoryPoints = remainingStoryPoints;
    this.burndownData[existingIndex].idealRemaining = idealRemaining;
  } else {
    this.burndownData.push({
      date,
      remainingStoryPoints,
      idealRemaining
    });
  }
  
  return this.save();
};

module.exports = mongoose.model('Sprint', sprintSchema);
