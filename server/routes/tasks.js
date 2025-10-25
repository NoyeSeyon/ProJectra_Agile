const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { authenticate, checkOrganization, authorize } = require('../middleware/auth');

const router = express.Router();

// Get tasks
router.get('/', authenticate, checkOrganization, async (req, res) => {
  try {
    const { orgId } = req;
    const { projectId, status, priority, assignee, search, page = 1, limit = 20 } = req.query;

    let query = {
      organization: orgId,
      isArchived: false
    };

    if (projectId) {
      query.project = projectId;
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (assignee) {
      query.assignee = assignee;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignee', 'firstName lastName avatar')
      .populate('reporter', 'firstName lastName avatar')
      .populate('project', 'name')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Filter tasks user can access
    const accessibleTasks = tasks.filter(task => 
      task.canUserAccess(req.user._id, req.user.role)
    );

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      data: {
        tasks: accessibleTasks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create task
router.post('/', authenticate, checkOrganization, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Task title is required'),
  body('description').optional().isLength({ max: 2000 }),
  body('projectId').isMongoId().withMessage('Valid project ID is required'),
  body('assignee').optional().isMongoId().withMessage('Valid assignee ID is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('type').optional().isIn(['task', 'bug', 'feature', 'epic', 'story']),
  body('dueDate').optional().isISO8601().withMessage('Valid due date is required')
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

    const { title, description, projectId, assignee, priority, type, dueDate } = req.body;
    const { orgId } = req;

    // Verify project belongs to organization and user can access
    const project = await Project.findOne({
      _id: projectId,
      organization: orgId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (!project.canUserAccess(req.user._id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this project'
      });
    }

    // Check permission
    if (!req.user.hasPermission('tasks', 'create')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to create tasks'
      });
    }

    const task = new Task({
      title,
      description,
      organization: orgId,
      project: projectId,
      assignee: assignee || null,
      reporter: req.user._id,
      priority: priority || 'medium',
      type: type || 'task',
      dueDate: dueDate ? new Date(dueDate) : null
    });

    await task.save();

    await task.populate([
      { path: 'assignee', select: 'firstName lastName avatar' },
      { path: 'reporter', select: 'firstName lastName avatar' },
      { path: 'project', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get task details
router.get('/:taskId', authenticate, checkOrganization, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { orgId } = req;

    const task = await Task.findOne({
      _id: taskId,
      organization: orgId,
      isArchived: false
    })
    .populate('assignee', 'firstName lastName avatar')
    .populate('reporter', 'firstName lastName avatar')
    .populate('project', 'name')
    .populate('comments.author', 'firstName lastName avatar')
    .populate('watchers', 'firstName lastName avatar');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user can access task
    if (!task.canUserAccess(req.user._id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this task'
      });
    }

    res.json({
      success: true,
      data: { task }
    });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update task
router.put('/:taskId', authenticate, checkOrganization, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().isLength({ max: 2000 }),
  body('status').optional().isIn(['todo', 'in_progress', 'review', 'completed', 'cancelled']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('assignee').optional().isMongoId().withMessage('Valid assignee ID is required'),
  body('dueDate').optional().isISO8601().withMessage('Valid due date is required')
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

    const { taskId } = req.params;
    const { orgId } = req;

    const task = await Task.findOne({
      _id: taskId,
      organization: orgId,
      isArchived: false
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user can access task
    if (!task.canUserAccess(req.user._id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this task'
      });
    }

    // Check permission
    // Allow assignees to update status, or users with full task update permission
    const isAssignee = task.assignee && task.assignee.toString() === req.user._id.toString();
    const hasFullPermission = req.user.hasPermission('tasks', 'update');
    const isStatusOnlyUpdate = Object.keys(req.body).length === 1 && req.body.status;
    
    if (!hasFullPermission && !(isAssignee && isStatusOnlyUpdate)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to update tasks'
      });
    }

    const allowedUpdates = ['title', 'description', 'status', 'priority', 'assignee', 'dueDate', 'progress', 'tags', 'labels'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Set completion date if status changed to completed
    if (updates.status === 'completed' && task.status !== 'completed') {
      updates.completedAt = new Date();
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      updates,
      { new: true, runValidators: true }
    )
    .populate('assignee', 'firstName lastName avatar')
    .populate('reporter', 'firstName lastName avatar')
    .populate('project', 'name');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task: updatedTask }
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add comment to task
router.post('/:taskId/comments', authenticate, checkOrganization, [
  body('text').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment text is required')
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

    const { taskId } = req.params;
    const { text } = req.body;
    const { orgId } = req;

    const task = await Task.findOne({
      _id: taskId,
      organization: orgId,
      isArchived: false
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user can access task
    if (!task.canUserAccess(req.user._id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this task'
      });
    }

    await task.addComment(text, req.user._id);

    await task.populate('comments.author', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: { task }
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Archive task
router.delete('/:taskId', authenticate, checkOrganization, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { orgId } = req;

    const task = await Task.findOne({
      _id: taskId,
      organization: orgId,
      isArchived: false
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user can access task
    if (!task.canUserAccess(req.user._id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this task'
      });
    }

    // Check permission
    if (!req.user.hasPermission('tasks', 'delete')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to archive tasks'
      });
    }

    task.isArchived = true;
    task.archivedAt = new Date();
    await task.save();

    res.json({
      success: true,
      message: 'Task archived successfully'
    });

  } catch (error) {
    console.error('Archive task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
