const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const KanbanColumn = require('../models/KanbanColumn');
const { authenticate, checkOrganization, authorize } = require('../middleware/auth');

const router = express.Router();

// Get projects
router.get('/', authenticate, checkOrganization, async (req, res) => {
  try {
    const { orgId } = req;
    const { status, search, page = 1, limit = 20 } = req.query;

    let query = {
      organization: orgId,
      isArchived: false
    };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by user access
    const projects = await Project.find(query)
      .populate('manager', 'firstName lastName avatar')
      .populate('team', 'name')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Filter projects user can access
    const accessibleProjects = projects.filter(project => 
      project.canUserAccess(req.user._id, req.user.role)
    );

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: {
        projects: accessibleProjects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create project
router.post('/', authenticate, checkOrganization, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Project name is required'),
  body('description').optional().isLength({ max: 1000 }),
  body('teamId').optional().isMongoId().withMessage('Valid team ID is required'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
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

    const { name, description, teamId, startDate, endDate, priority } = req.body;
    const { orgId } = req;

    // Check permission
    if (!req.user.hasPermission('projects', 'create')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to create projects'
      });
    }

    const project = new Project({
      name,
      description,
      organization: orgId,
      team: teamId || null,
      manager: req.user._id,
      members: [{
        user: req.user._id,
        role: 'manager',
        joinedAt: new Date()
      }],
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      priority: priority || 'medium'
    });

    await project.save();

    // Create default Kanban columns
    const defaultColumns = [
      { title: 'To Do', order: 0, status: 'todo', color: '#6B7280' },
      { title: 'In Progress', order: 1, status: 'in_progress', color: '#3B82F6' },
      { title: 'Review', order: 2, status: 'review', color: '#F59E0B' },
      { title: 'Done', order: 3, status: 'completed', color: '#10B981' }
    ];

    for (const columnData of defaultColumns) {
      const column = new KanbanColumn({
        ...columnData,
        organization: orgId,
        project: project._id,
        isDefault: true
      });
      await column.save();
    }

    await project.populate([
      { path: 'manager', select: 'firstName lastName avatar' },
      { path: 'team', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project }
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get project details
router.get('/:projectId', authenticate, checkOrganization, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { orgId } = req;

    const project = await Project.findOne({
      _id: projectId,
      organization: orgId,
      isArchived: false
    })
    .populate('manager', 'firstName lastName avatar')
    .populate('team', 'name')
    .populate('members.user', 'firstName lastName avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user can access project
    if (!project.canUserAccess(req.user._id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this project'
      });
    }

    res.json({
      success: true,
      data: { project }
    });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update project
router.put('/:projectId', authenticate, checkOrganization, [
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().isLength({ max: 1000 }),
  body('status').optional().isIn(['planning', 'active', 'on_hold', 'completed', 'cancelled']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
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

    const { projectId } = req.params;
    const { orgId } = req;

    const project = await Project.findOne({
      _id: projectId,
      organization: orgId,
      isArchived: false
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user can access project
    if (!project.canUserAccess(req.user._id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this project'
      });
    }

    // Check permission
    if (!req.user.hasPermission('projects', 'update')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to update projects'
      });
    }

    const allowedUpdates = ['name', 'description', 'status', 'priority', 'startDate', 'endDate', 'budget', 'settings'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      updates,
      { new: true, runValidators: true }
    )
    .populate('manager', 'firstName lastName avatar')
    .populate('team', 'name')
    .populate('members.user', 'firstName lastName avatar');

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project: updatedProject }
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Archive project
router.delete('/:projectId', authenticate, checkOrganization, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { orgId } = req;

    const project = await Project.findOne({
      _id: projectId,
      organization: orgId,
      isArchived: false
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user can access project
    if (!project.canUserAccess(req.user._id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this project'
      });
    }

    // Check permission
    if (!req.user.hasPermission('projects', 'delete')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to archive projects'
      });
    }

    project.isArchived = true;
    project.archivedAt = new Date();
    await project.save();

    res.json({
      success: true,
      message: 'Project archived successfully'
    });

  } catch (error) {
    console.error('Archive project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
