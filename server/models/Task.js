const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
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
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'completed', 'cancelled'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['task', 'bug', 'feature', 'epic', 'story', 'subtask'],
    default: 'task'
  },
  parentTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  subtasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  sprint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint',
    default: null
  },
  storyPoints: {
    type: Number,
    enum: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89], // Fibonacci sequence
    default: 0
  },
  isSubtask: {
    type: Boolean,
    default: false
  },
  mainTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  requiredSpecialization: {
    type: String,
    enum: ['ui_ux_designer', 'software_engineer', 'qa_engineer', 'devops_engineer', 'product_manager', 'business_analyst', 'data_analyst', 'marketing_specialist', 'any'],
    default: 'any'
  },
  acceptanceCriteria: [{
    description: String,
    completed: { type: Boolean, default: false }
  }],
  effort: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium'
  },
  businessValue: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  timeTracking: {
    estimatedHours: { type: Number, default: 0 },
    loggedHours: { type: Number, default: 0 },
    logs: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      hours: { type: Number, required: true },
      date: { type: Date, default: Date.now },
      description: String,
      billable: { type: Boolean, default: true }
    }]
  },
  epic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  dueDate: {
    type: Date,
    default: null
  },
  startDate: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  estimatedHours: {
    type: Number,
    min: 0,
    default: 0
  },
  actualHours: {
    type: Number,
    min: 0,
    default: 0
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  tags: [String],
  labels: [{
    name: String,
    color: { type: String, default: '#6B7280' }
  }],
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  blockedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  blockingStatus: {
    type: String,
    enum: ['not_blocked', 'waiting', 'blocked'],
    default: 'not_blocked'
  },
  checklist: [{
    text: String,
    completed: { type: Boolean, default: false },
    completedAt: Date
  }],
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    mimeType: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    text: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    isEdited: {
      type: Boolean,
      default: false
    }
  }],
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dependencies: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    type: {
      type: String,
      enum: ['blocks', 'blocked_by', 'relates_to'],
      default: 'relates_to'
    }
  }],
  customFields: [{
    name: String,
    value: mongoose.Schema.Types.Mixed,
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'boolean', 'select']
    }
  }],
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
taskSchema.index({ organization: 1 });
taskSchema.index({ project: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ reporter: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ isArchived: 1 });
taskSchema.index({ 'watchers': 1 });

// Virtual for completion status
taskSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'completed';
});

// Virtual for checklist completion
taskSchema.virtual('checklistProgress').get(function() {
  if (this.checklist.length === 0) return 0;
  const completed = this.checklist.filter(item => item.completed).length;
  return Math.round((completed / this.checklist.length) * 100);
});

// Methods
taskSchema.methods.canUserAccess = function(userId, userRole) {
  // Admin can access all tasks
  if (userRole === 'admin') return true;
  
  // Assignee, reporter, and watchers can access
  if (this.assignee && this.assignee.toString() === userId.toString()) return true;
  if (this.reporter.toString() === userId.toString()) return true;
  if (this.watchers.some(watcher => watcher.toString() === userId.toString())) return true;
  
  return false;
};

taskSchema.methods.updateProgress = function() {
  // Update progress based on checklist completion
  if (this.checklist.length > 0) {
    this.progress = this.checklistProgress;
  }
  return this.progress;
};

taskSchema.methods.addComment = function(text, authorId) {
  this.comments.push({
    text,
    author: authorId,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return this.save();
};

taskSchema.methods.toggleChecklistItem = function(itemIndex) {
  if (itemIndex >= 0 && itemIndex < this.checklist.length) {
    this.checklist[itemIndex].completed = !this.checklist[itemIndex].completed;
    this.checklist[itemIndex].completedAt = this.checklist[itemIndex].completed ? new Date() : null;
    this.updateProgress();
  }
  return this.save();
};

module.exports = mongoose.model('Task', taskSchema);
