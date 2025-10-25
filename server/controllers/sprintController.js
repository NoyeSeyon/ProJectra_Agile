const Sprint = require('../models/Sprint');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { validationResult } = require('express-validator');

/**
 * Sprint Controller
 * Handles Agile sprint management, planning, and tracking
 */

// @desc    Create new sprint
// @route   POST /api/sprints
// @access  Private (PM, Team Leader)
exports.createSprint = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, goal, projectId, startDate, endDate, plannedStoryPoints, capacity } = req.body;
    const userId = req.user.id;

    // Verify project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const isManager = project.manager.toString() === userId.toString();
    const isTeamLeader = project.teamLeader && project.teamLeader.toString() === userId.toString();

    if (!isManager && !isTeamLeader) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create sprint'
      });
    }

    const sprint = new Sprint({
      name,
      goal,
      organization: project.organization,
      project: projectId,
      startDate,
      endDate,
      plannedStoryPoints: plannedStoryPoints || 0,
      capacity: capacity || { totalHours: 0, allocatedHours: 0, remainingHours: 0 },
      status: 'planning'
    });

    await sprint.save();

    res.status(201).json({
      success: true,
      message: 'Sprint created successfully',
      data: { sprint }
    });
  } catch (error) {
    console.error('Create sprint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get project sprints
// @route   GET /api/sprints/project/:projectId
// @access  Private
exports.getProjectSprints = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.query;

    let query = { project: projectId };
    if (status) {
      query.status = status;
    }

    const sprints = await Sprint.find(query)
      .populate('tasks')
      .sort({ startDate: -1 });

    res.json({
      success: true,
      data: { sprints }
    });
  } catch (error) {
    console.error('Get project sprints error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get sprint details
// @route   GET /api/sprints/:sprintId
// @access  Private
exports.getSprint = async (req, res) => {
  try {
    const { sprintId } = req.params;

    const sprint = await Sprint.findById(sprintId)
      .populate({
        path: 'tasks',
        populate: {
          path: 'assignee',
          select: 'firstName lastName avatar specialization'
        }
      })
      .populate('project', 'name manager teamLeader')
      .populate('retrospective.actionItems.assignee', 'firstName lastName');

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }

    // Get sprint health
    const health = sprint.getSprintHealth();

    res.json({
      success: true,
      data: {
        sprint,
        health,
        duration: sprint.duration,
        daysRemaining: sprint.daysRemaining
      }
    });
  } catch (error) {
    console.error('Get sprint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update sprint
// @route   PUT /api/sprints/:sprintId
// @access  Private (PM, Team Leader)
exports.updateSprint = async (req, res) => {
  try {
    const { sprintId } = req.params;
    const updates = req.body;
    const userId = req.user.id;

    const sprint = await Sprint.findById(sprintId).populate('project');
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }

    const isManager = sprint.project.manager.toString() === userId.toString();
    const isTeamLeader = sprint.project.teamLeader && sprint.project.teamLeader.toString() === userId.toString();

    if (!isManager && !isTeamLeader) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update sprint'
      });
    }

    // Update allowed fields
    const allowedFields = ['name', 'goal', 'startDate', 'endDate', 'plannedStoryPoints', 'capacity'];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        sprint[field] = updates[field];
      }
    });

    await sprint.save();

    res.json({
      success: true,
      message: 'Sprint updated successfully',
      data: { sprint }
    });
  } catch (error) {
    console.error('Update sprint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Start sprint
// @route   POST /api/sprints/:sprintId/start
// @access  Private (PM, Team Leader)
exports.startSprint = async (req, res) => {
  try {
    const { sprintId } = req.params;
    const userId = req.user.id;

    const sprint = await Sprint.findById(sprintId).populate('project');
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }

    const isManager = sprint.project.manager.toString() === userId.toString();
    const isTeamLeader = sprint.project.teamLeader && sprint.project.teamLeader.toString() === userId.toString();

    if (!isManager && !isTeamLeader) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to start sprint'
      });
    }

    if (sprint.status !== 'planning') {
      return res.status(400).json({
        success: false,
        message: 'Sprint can only be started from planning status'
      });
    }

    sprint.status = 'active';
    
    // Initialize burndown with first data point
    await sprint.updateBurndown(sprint.plannedStoryPoints, sprint.startDate);
    
    await sprint.save();

    res.json({
      success: true,
      message: 'Sprint started successfully',
      data: { sprint }
    });
  } catch (error) {
    console.error('Start sprint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Complete sprint
// @route   POST /api/sprints/:sprintId/complete
// @access  Private (PM, Team Leader)
exports.completeSprint = async (req, res) => {
  try {
    const { sprintId } = req.params;
    const userId = req.user.id;

    const sprint = await Sprint.findById(sprintId).populate('project').populate('tasks');
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }

    const isManager = sprint.project.manager.toString() === userId.toString();
    const isTeamLeader = sprint.project.teamLeader && sprint.project.teamLeader.toString() === userId.toString();

    if (!isManager && !isTeamLeader) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete sprint'
      });
    }

    // Calculate completed story points
    const completedTasks = sprint.tasks.filter(t => t.status === 'completed');
    sprint.completedStoryPoints = completedTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    
    // Calculate velocity
    sprint.calculateVelocity();
    
    sprint.status = 'completed';
    sprint.completedAt = new Date();

    await sprint.save();

    res.json({
      success: true,
      message: 'Sprint completed successfully',
      data: {
        sprint,
        metrics: {
          plannedStoryPoints: sprint.plannedStoryPoints,
          completedStoryPoints: sprint.completedStoryPoints,
          completionRate: sprint.plannedStoryPoints > 0 
            ? ((sprint.completedStoryPoints / sprint.plannedStoryPoints) * 100).toFixed(1)
            : 0,
          velocity: sprint.velocity
        }
      }
    });
  } catch (error) {
    console.error('Complete sprint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get sprint burndown data
// @route   GET /api/sprints/:sprintId/burndown
// @access  Private
exports.getSprintBurndown = async (req, res) => {
  try {
    const { sprintId } = req.params;

    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }

    const burndownData = sprint.getBurndownData();

    res.json({
      success: true,
      data: {
        sprintId: sprint._id,
        sprintName: sprint.name,
        burndownData,
        summary: {
          plannedStoryPoints: sprint.plannedStoryPoints,
          completedStoryPoints: sprint.completedStoryPoints,
          duration: sprint.duration,
          daysRemaining: sprint.daysRemaining
        }
      }
    });
  } catch (error) {
    console.error('Get burndown error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add tasks to sprint
// @route   POST /api/sprints/:sprintId/tasks
// @access  Private (PM, Team Leader)
exports.addTasksToSprint = async (req, res) => {
  try {
    const { sprintId } = req.params;
    const { taskIds } = req.body;
    const userId = req.user.id;

    const sprint = await Sprint.findById(sprintId).populate('project');
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }

    const isManager = sprint.project.manager.toString() === userId.toString();
    const isTeamLeader = sprint.project.teamLeader && sprint.project.teamLeader.toString() === userId.toString();

    if (!isManager && !isTeamLeader) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add tasks to sprint'
      });
    }

    // Update tasks to belong to this sprint
    await Task.updateMany(
      { _id: { $in: taskIds } },
      { sprint: sprintId }
    );

    // Add tasks to sprint
    taskIds.forEach(taskId => {
      if (!sprint.tasks.includes(taskId)) {
        sprint.tasks.push(taskId);
      }
    });

    await sprint.save();

    const updatedSprint = await Sprint.findById(sprintId).populate('tasks');

    res.json({
      success: true,
      message: `${taskIds.length} tasks added to sprint`,
      data: { sprint: updatedSprint }
    });
  } catch (error) {
    console.error('Add tasks to sprint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = exports;

