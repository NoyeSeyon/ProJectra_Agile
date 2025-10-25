const mongoose = require('mongoose');

const kanbanColumnSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Column title is required'],
    trim: true,
    maxlength: [50, 'Column title cannot exceed 50 characters']
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
  order: {
    type: Number,
    required: true,
    min: 0
  },
  color: {
    type: String,
    default: '#6B7280',
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'completed'],
    default: null
  },
  settings: {
    maxCards: {
      type: Number,
      default: null,
      min: 1
    },
    allowNewCards: {
      type: Boolean,
      default: true
    },
    autoArchive: {
      type: Boolean,
      default: false
    },
    autoArchiveDays: {
      type: Number,
      default: 30,
      min: 1
    }
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
kanbanColumnSchema.index({ organization: 1, project: 1 });
kanbanColumnSchema.index({ project: 1, order: 1 });
kanbanColumnSchema.index({ isArchived: 1 });

// Virtual for card count
kanbanColumnSchema.virtual('cardCount', {
  ref: 'KanbanCard',
  localField: '_id',
  foreignField: 'column',
  count: true
});

// Methods
kanbanColumnSchema.methods.canAddCard = function() {
  if (!this.settings.allowNewCards) return false;
  if (this.settings.maxCards && this.cardCount >= this.settings.maxCards) return false;
  return true;
};

kanbanColumnSchema.methods.updateOrder = function(newOrder) {
  this.order = newOrder;
  return this.save();
};

kanbanColumnSchema.methods.archive = function() {
  this.isArchived = true;
  this.archivedAt = new Date();
  return this.save();
};

kanbanColumnSchema.methods.restore = function() {
  this.isArchived = false;
  this.archivedAt = null;
  return this.save();
};

module.exports = mongoose.model('KanbanColumn', kanbanColumnSchema);
