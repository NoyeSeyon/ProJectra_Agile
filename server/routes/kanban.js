const express = require('express');
const { body, validationResult } = require('express-validator');
const KanbanColumn = require('../models/KanbanColumn');
const KanbanCard = require('../models/KanbanCard');
const Project = require('../models/Project');
const { authenticate, checkOrganization, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Get Kanban board for a project
router.get('/projects/:projectId/board', authenticate, checkOrganization, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { orgId } = req;

    // Verify project belongs to organization
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

    // Check if user can access project
    if (!project.canUserAccess(req.user._id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this project'
      });
    }

    // Get columns with cards
    const columns = await KanbanColumn.find({
      organization: orgId,
      project: projectId,
      isArchived: false
    }).sort({ order: 1 });

    const columnsWithCards = await Promise.all(
      columns.map(async (column) => {
        const cards = await KanbanCard.find({
          organization: orgId,
          project: projectId,
          column: column._id,
          isArchived: false
        })
        .populate('assignees', 'firstName lastName avatar')
        .populate('reporter', 'firstName lastName avatar')
        .sort({ order: 1 });

        return {
          ...column.toObject(),
          cards
        };
      })
    );

    res.json({
      success: true,
      data: {
        project: {
          id: project._id,
          name: project.name,
          description: project.description
        },
        columns: columnsWithCards
      }
    });

  } catch (error) {
    console.error('Get Kanban board error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create new column
router.post('/columns', authenticate, checkOrganization, [
  body('title').trim().isLength({ min: 1, max: 50 }).withMessage('Column title is required'),
  body('projectId').isMongoId().withMessage('Valid project ID is required'),
  body('order').isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex color')
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

    const { title, projectId, order, color, status } = req.body;
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
    if (!req.user.hasPermission('projects', 'update')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to create columns'
      });
    }

    const column = new KanbanColumn({
      title,
      organization: orgId,
      project: projectId,
      order,
      color: color || '#6B7280',
      status
    });

    await column.save();

    res.status(201).json({
      success: true,
      message: 'Column created successfully',
      data: { column }
    });

  } catch (error) {
    console.error('Create column error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update column
router.put('/columns/:columnId', authenticate, checkOrganization, [
  body('title').optional().trim().isLength({ min: 1, max: 50 }),
  body('order').optional().isInt({ min: 0 }),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i)
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

    const { columnId } = req.params;
    const { orgId } = req;

    const column = await KanbanColumn.findOne({
      _id: columnId,
      organization: orgId,
      isArchived: false
    });

    if (!column) {
      return res.status(404).json({
        success: false,
        message: 'Column not found'
      });
    }

    // Check permission
    if (!req.user.hasPermission('projects', 'update')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to update columns'
      });
    }

    const allowedUpdates = ['title', 'order', 'color', 'status', 'settings'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedColumn = await KanbanColumn.findByIdAndUpdate(
      columnId,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Column updated successfully',
      data: { column: updatedColumn }
    });

  } catch (error) {
    console.error('Update column error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete column
router.delete('/columns/:columnId', authenticate, checkOrganization, async (req, res) => {
  try {
    const { columnId } = req.params;
    const { orgId } = req;

    const column = await KanbanColumn.findOne({
      _id: columnId,
      organization: orgId,
      isArchived: false
    });

    if (!column) {
      return res.status(404).json({
        success: false,
        message: 'Column not found'
      });
    }

    // Check permission
    if (!req.user.hasPermission('projects', 'delete')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to delete columns'
      });
    }

    // Archive column instead of hard delete
    await column.archive();

    res.json({
      success: true,
      message: 'Column archived successfully'
    });

  } catch (error) {
    console.error('Delete column error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create new card
router.post('/cards', authenticate, checkOrganization, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Card title is required'),
  body('projectId').isMongoId().withMessage('Valid project ID is required'),
  body('columnId').isMongoId().withMessage('Valid column ID is required'),
  body('order').isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  body('description').optional().isLength({ max: 2000 }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('dueDate').optional().isISO8601()
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

    const { title, description, projectId, columnId, order, priority, dueDate, assignees } = req.body;
    const { orgId } = req;

    // Verify project and column belong to organization
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

    const column = await KanbanColumn.findOne({
      _id: columnId,
      organization: orgId,
      project: projectId,
      isArchived: false
    });

    if (!column) {
      return res.status(404).json({
        success: false,
        message: 'Column not found'
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
    if (!req.user.hasPermission('tasks', 'create')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to create cards'
      });
    }

    const card = new KanbanCard({
      title,
      description,
      organization: orgId,
      project: projectId,
      column: columnId,
      order,
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      assignees: assignees || [],
      reporter: req.user._id
    });

    await card.save();

    // Populate the card for response
    await card.populate([
      { path: 'assignees', select: 'firstName lastName avatar' },
      { path: 'reporter', select: 'firstName lastName avatar' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Card created successfully',
      data: { card }
    });

  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Move card between columns
router.patch('/cards/:cardId/move', authenticate, checkOrganization, [
  body('columnId').isMongoId().withMessage('Valid column ID is required'),
  body('order').isInt({ min: 0 }).withMessage('Order must be a non-negative integer')
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

    const { cardId } = req.params;
    const { columnId, order } = req.body;
    const { orgId } = req;

    const card = await KanbanCard.findOne({
      _id: cardId,
      organization: orgId,
      isArchived: false
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Check if user can access card
    if (!card.canUserAccess(req.user._id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this card'
      });
    }

    // Verify new column exists and belongs to same project
    const newColumn = await KanbanColumn.findOne({
      _id: columnId,
      organization: orgId,
      project: card.project,
      isArchived: false
    });

    if (!newColumn) {
      return res.status(404).json({
        success: false,
        message: 'Target column not found'
      });
    }

    // Update card position
    await card.moveToColumn(columnId, order);

    // Emit socket event for real-time updates
    req.app.get('io').to(`org:${orgId}:project:${card.project}`).emit('card:moved', {
      cardId: card._id,
      fromColumn: card.column,
      toColumn: columnId,
      order,
      orgId,
      projectId: card.project
    });

    res.json({
      success: true,
      message: 'Card moved successfully',
      data: { card }
    });

  } catch (error) {
    console.error('Move card error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update card
router.put('/cards/:cardId', authenticate, checkOrganization, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().isLength({ max: 2000 }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('dueDate').optional().isISO8601()
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

    const { cardId } = req.params;
    const { orgId } = req;

    const card = await KanbanCard.findOne({
      _id: cardId,
      organization: orgId,
      isArchived: false
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Check if user can access card
    if (!card.canUserAccess(req.user._id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this card'
      });
    }

    // Check permission
    if (!req.user.hasPermission('tasks', 'update')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to update cards'
      });
    }

    const allowedUpdates = ['title', 'description', 'priority', 'dueDate', 'assignees', 'labels', 'checklist'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedCard = await KanbanCard.findByIdAndUpdate(
      cardId,
      updates,
      { new: true, runValidators: true }
    ).populate([
      { path: 'assignees', select: 'firstName lastName avatar' },
      { path: 'reporter', select: 'firstName lastName avatar' }
    ]);

    res.json({
      success: true,
      message: 'Card updated successfully',
      data: { card: updatedCard }
    });

  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete card
router.delete('/cards/:cardId', authenticate, checkOrganization, async (req, res) => {
  try {
    const { cardId } = req.params;
    const { orgId } = req;

    const card = await KanbanCard.findOne({
      _id: cardId,
      organization: orgId,
      isArchived: false
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Check if user can access card
    if (!card.canUserAccess(req.user._id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this card'
      });
    }

    // Check permission
    if (!req.user.hasPermission('tasks', 'delete')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to delete cards'
      });
    }

    // Archive card instead of hard delete
    await card.archive();

    res.json({
      success: true,
      message: 'Card archived successfully'
    });

  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
