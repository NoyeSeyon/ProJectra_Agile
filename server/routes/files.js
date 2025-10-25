const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const File = require('../models/File');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv', 'application/json', 'application/xml',
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
    'audio/mp3', 'audio/wav', 'audio/ogg'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Upload single file
router.post('/upload', authenticate, upload.single('file'), [
  body('resourceType').isIn(['project', 'task', 'comment', 'message', 'general']).withMessage('Invalid resource type'),
  body('resourceId').isMongoId().withMessage('Invalid resource ID'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('tags').optional().isString().withMessage('Tags must be a string'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { resourceType, resourceId, description, tags, isPublic } = req.body;
    const orgId = req.user.organization;
    const userId = req.user._id;

    // Create file record
    const file = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `/uploads/${req.file.filename}`,
      organization: orgId,
      uploadedBy: userId,
      resource: {
        type: resourceType,
        id: resourceId
      },
      description: description || '',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isPublic: isPublic === 'true' || false
    });

    await file.save();
    await file.populate('uploadedBy', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: { file }
    });

  } catch (error) {
    console.error('File upload error:', error);
    
    // Clean up uploaded file if database save failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Upload multiple files
router.post('/upload-multiple', authenticate, upload.array('files', 10), [
  body('resourceType').isIn(['project', 'task', 'comment', 'message', 'general']).withMessage('Invalid resource type'),
  body('resourceId').isMongoId().withMessage('Invalid resource ID'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('tags').optional().isString().withMessage('Tags must be a string'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { resourceType, resourceId, description, tags, isPublic } = req.body;
    const orgId = req.user.organization;
    const userId = req.user._id;

    const files = [];
    const uploadedFiles = [];

    for (const file of req.files) {
      const fileRecord = new File({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/uploads/${file.filename}`,
        organization: orgId,
        uploadedBy: userId,
        resource: {
          type: resourceType,
          id: resourceId
        },
        description: description || '',
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        isPublic: isPublic === 'true' || false
      });

      await fileRecord.save();
      await fileRecord.populate('uploadedBy', 'firstName lastName avatar');
      uploadedFiles.push(fileRecord);
    }

    res.json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      data: { files: uploadedFiles }
    });

  } catch (error) {
    console.error('Multiple file upload error:', error);
    
    // Clean up uploaded files if database save failed
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get files by resource
router.get('/resource/:resourceType/:resourceId', authenticate, async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;
    const orgId = req.user.organization;
    const { page = 1, limit = 20, mimeType, category, tags, uploadedBy, isPublic } = req.query;

    const result = await File.getFilesByResource(resourceType, resourceId, orgId, {
      page: parseInt(page),
      limit: parseInt(limit),
      mimeType,
      category,
      tags,
      uploadedBy,
      isPublic: isPublic === 'true'
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get files by resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get user files
router.get('/user', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const orgId = req.user.organization;
    const { page = 1, limit = 20, resourceType, mimeType, category, tags } = req.query;

    const result = await File.getUserFiles(userId, orgId, {
      page: parseInt(page),
      limit: parseInt(limit),
      resourceType,
      mimeType,
      category,
      tags
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get user files error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get file by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      organization: req.user.organization
    }).populate('uploadedBy', 'firstName lastName avatar');

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.json({
      success: true,
      data: { file }
    });

  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Download file
router.get('/:id/download', authenticate, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check if file exists on disk
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Increment download count
    await file.incrementDownloadCount();

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Length', file.size);

    // Stream the file
    const fileStream = fs.createReadStream(file.path);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update file
router.put('/:id', authenticate, [
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('tags').optional().isString().withMessage('Tags must be a string'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { description, tags, isPublic } = req.body;
    const file = await File.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Update file properties
    if (description !== undefined) file.description = description;
    if (tags !== undefined) file.tags = tags.split(',').map(tag => tag.trim());
    if (isPublic !== undefined) file.isPublic = isPublic;

    await file.save();
    await file.populate('uploadedBy', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'File updated successfully',
      data: { file }
    });

  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete file
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete file from disk
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete file record from database
    await File.findByIdAndDelete(file._id);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get storage statistics
router.get('/stats/storage', authenticate, async (req, res) => {
  try {
    const orgId = req.user.organization;
    const stats = await File.getStorageStats(orgId);

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get storage stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Archive file
router.put('/:id/archive', authenticate, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    await file.archive();

    res.json({
      success: true,
      message: 'File archived successfully'
    });

  } catch (error) {
    console.error('Archive file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Restore file
router.put('/:id/restore', authenticate, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    await file.restore();

    res.json({
      success: true,
      message: 'File restored successfully'
    });

  } catch (error) {
    console.error('Restore file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;

