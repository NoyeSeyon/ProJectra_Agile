const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resource: {
    type: {
      type: String,
      enum: ['project', 'task', 'comment', 'message', 'general'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  tags: [String],
  description: String,
  isPublic: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  metadata: {
    width: Number,
    height: Number,
    duration: Number, // for video/audio files
    pages: Number, // for PDF files
    checksum: String
  },
  permissions: {
    view: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    edit: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    delete: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  version: {
    type: Number,
    default: 1
  },
  parentFile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    default: null
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
  expiresAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Indexes for efficient querying
fileSchema.index({ organization: 1, createdAt: -1 });
fileSchema.index({ uploadedBy: 1, createdAt: -1 });
fileSchema.index({ 'resource.type': 1, 'resource.id': 1 });
fileSchema.index({ mimeType: 1 });
fileSchema.index({ tags: 1 });
fileSchema.index({ isPublic: 1 });
fileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for file size in human readable format
fileSchema.virtual('sizeFormatted').get(function() {
  const bytes = this.size;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual for file type category
fileSchema.virtual('category').get(function() {
  const mimeType = this.mimeType.toLowerCase();
  
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'document';
  if (mimeType.includes('text/')) return 'text';
  if (mimeType.includes('application/')) {
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) {
      return 'archive';
    }
    return 'document';
  }
  
  return 'other';
});

// Static methods
fileSchema.statics.getFilesByResource = async function(resourceType, resourceId, organizationId, options = {}) {
  const {
    page = 1,
    limit = 20,
    mimeType,
    category,
    tags,
    uploadedBy,
    isPublic
  } = options;
  
  const skip = (page - 1) * limit;
  const query = {
    'resource.type': resourceType,
    'resource.id': resourceId,
    organization: organizationId,
    isArchived: false
  };
  
  if (mimeType) query.mimeType = mimeType;
  if (category) {
    const categoryMimeTypes = {
      image: { $regex: /^image\// },
      video: { $regex: /^video\// },
      audio: { $regex: /^audio\// },
      document: { $regex: /^(application\/pdf|application\/msword|application\/vnd\.)/ },
      text: { $regex: /^text\// },
      archive: { $regex: /^(application\/zip|application\/x-rar|application\/x-7z)/ }
    };
    query.mimeType = categoryMimeTypes[category];
  }
  if (tags) query.tags = { $in: tags.split(',') };
  if (uploadedBy) query.uploadedBy = uploadedBy;
  if (isPublic !== undefined) query.isPublic = isPublic;
  
  const [files, total] = await Promise.all([
    this.find(query)
      .populate('uploadedBy', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    this.countDocuments(query)
  ]);
  
  return {
    files,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

fileSchema.statics.getUserFiles = async function(userId, organizationId, options = {}) {
  const {
    page = 1,
    limit = 20,
    resourceType,
    mimeType,
    category,
    tags
  } = options;
  
  const skip = (page - 1) * limit;
  const query = {
    uploadedBy: userId,
    organization: organizationId,
    isArchived: false
  };
  
  if (resourceType) query['resource.type'] = resourceType;
  if (mimeType) query.mimeType = mimeType;
  if (category) {
    const categoryMimeTypes = {
      image: { $regex: /^image\// },
      video: { $regex: /^video\// },
      audio: { $regex: /^audio\// },
      document: { $regex: /^(application\/pdf|application\/msword|application\/vnd\.)/ },
      text: { $regex: /^text\// },
      archive: { $regex: /^(application\/zip|application\/x-rar|application\/x-7z)/ }
    };
    query.mimeType = categoryMimeTypes[category];
  }
  if (tags) query.tags = { $in: tags.split(',') };
  
  const [files, total] = await Promise.all([
    this.find(query)
      .populate('uploadedBy', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    this.countDocuments(query)
  ]);
  
  return {
    files,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

fileSchema.statics.getStorageStats = async function(organizationId) {
  const stats = await this.aggregate([
    { $match: { organization: mongoose.Types.ObjectId(organizationId), isArchived: false } },
    {
      $group: {
        _id: null,
        totalFiles: { $sum: 1 },
        totalSize: { $sum: '$size' },
        averageSize: { $avg: '$size' },
        categories: {
          $push: {
            $cond: [
              { $regexMatch: { input: '$mimeType', regex: /^image\// } },
              'image',
              {
                $cond: [
                  { $regexMatch: { input: '$mimeType', regex: /^video\// } },
                  'video',
                  {
                    $cond: [
                      { $regexMatch: { input: '$mimeType', regex: /^audio\// } },
                      'audio',
                      {
                        $cond: [
                          { $regexMatch: { input: '$mimeType', regex: /^text\// } },
                          'text',
                          'document'
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      totalFiles: 0,
      totalSize: 0,
      averageSize: 0,
      categories: {}
    };
  }
  
  const result = stats[0];
  const categoryCounts = result.categories.reduce((acc, category) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  
  return {
    totalFiles: result.totalFiles,
    totalSize: result.totalSize,
    averageSize: Math.round(result.averageSize),
    categories: categoryCounts
  };
};

// Instance methods
fileSchema.methods.incrementDownloadCount = function() {
  this.downloadCount += 1;
  this.lastAccessed = new Date();
  return this.save();
};

fileSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    return this.save();
  }
  return Promise.resolve(this);
};

fileSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

fileSchema.methods.archive = function() {
  this.isArchived = true;
  this.archivedAt = new Date();
  return this.save();
};

fileSchema.methods.restore = function() {
  this.isArchived = false;
  this.archivedAt = null;
  return this.save();
};

fileSchema.methods.updatePermissions = function(permissions) {
  this.permissions = { ...this.permissions, ...permissions };
  return this.save();
};

module.exports = mongoose.model('File', fileSchema);

