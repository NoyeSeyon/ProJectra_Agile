const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Message text is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'file', 'image', 'system', 'ai'],
    default: 'text'
  },
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    mimeType: String,
    thumbnail: String
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reactions: [{
    emoji: String,
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  metadata: {
    aiGenerated: { type: Boolean, default: false },
    aiModel: String,
    aiConfidence: Number
  }
}, {
  timestamps: true
});

// Indexes
messageSchema.index({ organization: 1, channel: 1 });
messageSchema.index({ channel: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ mentions: 1 });
messageSchema.index({ isDeleted: 1 });

// Methods
messageSchema.methods.addReaction = function(emoji, userId) {
  const reaction = this.reactions.find(r => r.emoji === emoji);
  if (reaction) {
    if (!reaction.users.includes(userId)) {
      reaction.users.push(userId);
    }
  } else {
    this.reactions.push({ emoji, users: [userId] });
  }
  return this.save();
};

messageSchema.methods.removeReaction = function(emoji, userId) {
  const reaction = this.reactions.find(r => r.emoji === emoji);
  if (reaction) {
    reaction.users = reaction.users.filter(user => user.toString() !== userId.toString());
    if (reaction.users.length === 0) {
      this.reactions = this.reactions.filter(r => r.emoji !== emoji);
    }
  }
  return this.save();
};

messageSchema.methods.edit = function(newText) {
  this.text = newText;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

messageSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

messageSchema.methods.canUserAccess = function(userId, userRole) {
  // Admin can access all messages
  if (userRole === 'admin') return true;
  
  // Sender can access their own messages
  if (this.sender.toString() === userId.toString()) return true;
  
  // Channel members can access (this should be checked at channel level)
  return true;
};

module.exports = mongoose.model('Message', messageSchema);
