const mongoose = require('mongoose');

const kanbanCardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Card title is required'],
    trim: true,
    maxlength: [200, 'Card title cannot exceed 200 characters']
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
  column: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KanbanColumn',
    required: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  assignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  order: {
    type: Number,
    required: true,
    min: 0
  },
  labels: [{
    name: String,
    color: { type: String, default: '#6B7280' }
  }],
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
kanbanCardSchema.index({ organization: 1, project: 1 });
kanbanCardSchema.index({ project: 1, column: 1, order: 1 });
kanbanCardSchema.index({ assignees: 1 });
kanbanCardSchema.index({ reporter: 1 });
kanbanCardSchema.index({ dueDate: 1 });
kanbanCardSchema.index({ isArchived: 1 });

// Virtual for completion status
kanbanCardSchema.virtual('isCompleted').get(function() {
  return this.column && this.column.status === 'completed';
});

// Virtual for overdue status
kanbanCardSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && !this.isCompleted;
});

// Virtual for checklist completion
kanbanCardSchema.virtual('checklistProgress').get(function() {
  if (this.checklist.length === 0) return 0;
  const completed = this.checklist.filter(item => item.completed).length;
  return Math.round((completed / this.checklist.length) * 100);
});

// Methods
kanbanCardSchema.methods.canUserAccess = function(userId, userRole) {
  // Admin can access all cards
  if (userRole === 'admin') return true;
  
  // Assignees, reporter, and watchers can access
  if (this.assignees.some(assignee => assignee.toString() === userId.toString())) return true;
  if (this.reporter.toString() === userId.toString()) return true;
  if (this.watchers.some(watcher => watcher.toString() === userId.toString())) return true;
  
  return false;
};

kanbanCardSchema.methods.moveToColumn = function(newColumnId, newOrder) {
  this.column = newColumnId;
  this.order = newOrder;
  return this.save();
};

kanbanCardSchema.methods.updateOrder = function(newOrder) {
  this.order = newOrder;
  return this.save();
};

kanbanCardSchema.methods.addAssignee = function(userId) {
  if (!this.assignees.includes(userId)) {
    this.assignees.push(userId);
  }
  return this.save();
};

kanbanCardSchema.methods.removeAssignee = function(userId) {
  this.assignees = this.assignees.filter(assignee => assignee.toString() !== userId.toString());
  return this.save();
};

kanbanCardSchema.methods.addComment = function(text, authorId) {
  this.comments.push({
    text,
    author: authorId,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return this.save();
};

kanbanCardSchema.methods.toggleChecklistItem = function(itemIndex) {
  if (itemIndex >= 0 && itemIndex < this.checklist.length) {
    this.checklist[itemIndex].completed = !this.checklist[itemIndex].completed;
    this.checklist[itemIndex].completedAt = this.checklist[itemIndex].completed ? new Date() : null;
  }
  return this.save();
};

kanbanCardSchema.methods.archive = function() {
  this.isArchived = true;
  this.archivedAt = new Date();
  return this.save();
};

kanbanCardSchema.methods.restore = function() {
  this.isArchived = false;
  this.archivedAt = null;
  return this.save();
};

module.exports = mongoose.model('KanbanCard', kanbanCardSchema);
