const Task = require('../models/Task');
const Project = require('../models/Project');
const { validationResult } = require('express-validator');

/**
 * Time Tracking Controller
 * Handles time logging, tracking, and reporting
 */

// @desc    Log time to a task
// @route   POST /api/time-tracking/log
// @access  Private
exports.logTime = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { taskId, hours, description, date, billable } = req.body;
    const userId = req.user.id;

    // Get task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify user has access to this task (assignee or project member)
    if (task.assignee && task.assignee.toString() !== userId.toString()) {
      // Check if user is project member
      const project = await Project.findById(task.project);
      const isMember = project.members.some(m => m.user.toString() === userId.toString());
      const isManager = project.manager.toString() === userId.toString();
      const isTeamLeader = project.teamLeader && project.teamLeader.toString() === userId.toString();

      if (!isMember && !isManager && !isTeamLeader) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to log time to this task'
        });
      }
    }

    // Add time log
    const timeLog = {
      user: userId,
      hours: parseFloat(hours),
      date: date ? new Date(date) : new Date(),
      description: description || '',
      billable: billable !== undefined ? billable : true
    };

    if (!task.timeTracking) {
      task.timeTracking = {
        estimatedHours: 0,
        loggedHours: 0,
        logs: []
      };
    }

    task.timeTracking.logs.push(timeLog);
    task.timeTracking.loggedHours += parseFloat(hours);

    await task.save();

    // Populate the newly added log
    await task.populate('timeTracking.logs.user', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Time logged successfully',
      data: {
        task: {
          _id: task._id,
          title: task.title,
          timeTracking: task.timeTracking
        },
        log: task.timeTracking.logs[task.timeTracking.logs.length - 1]
      }
    });
  } catch (error) {
    console.error('Log time error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get time logs for a task
// @route   GET /api/time-tracking/task/:taskId
// @access  Private
exports.getTaskTimeLogs = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
      .select('title timeTracking estimatedHours')
      .populate('timeTracking.logs.user', 'firstName lastName avatar specialization');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: {
        task: {
          _id: task._id,
          title: task.title,
          estimatedHours: task.estimatedHours,
          timeTracking: task.timeTracking || {
            estimatedHours: task.estimatedHours || 0,
            loggedHours: 0,
            logs: []
          }
        }
      }
    });
  } catch (error) {
    console.error('Get task time logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get time logs for a project
// @route   GET /api/time-tracking/project/:projectId
// @access  Private
exports.getProjectTimeLogs = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { startDate, endDate, userId } = req.query;

    // Build query
    let query = { project: projectId };
    
    const tasks = await Task.find(query)
      .select('title timeTracking assignee status')
      .populate('timeTracking.logs.user', 'firstName lastName avatar')
      .populate('assignee', 'firstName lastName');

    // Filter logs by date range and user if provided
    let allLogs = [];
    tasks.forEach(task => {
      if (task.timeTracking && task.timeTracking.logs) {
        task.timeTracking.logs.forEach(log => {
          let includeLog = true;

          // Filter by date range
          if (startDate && new Date(log.date) < new Date(startDate)) {
            includeLog = false;
          }
          if (endDate && new Date(log.date) > new Date(endDate)) {
            includeLog = false;
          }

          // Filter by user
          if (userId && log.user._id.toString() !== userId) {
            includeLog = false;
          }

          if (includeLog) {
            allLogs.push({
              ...log.toObject(),
              task: {
                _id: task._id,
                title: task.title,
                status: task.status
              }
            });
          }
        });
      }
    });

    // Calculate totals
    const totalHours = allLogs.reduce((sum, log) => sum + log.hours, 0);
    const billableHours = allLogs.filter(log => log.billable).reduce((sum, log) => sum + log.hours, 0);

    // Sort by date descending
    allLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        logs: allLogs,
        summary: {
          totalHours: Math.round(totalHours * 10) / 10,
          billableHours: Math.round(billableHours * 10) / 10,
          nonBillableHours: Math.round((totalHours - billableHours) * 10) / 10,
          logCount: allLogs.length
        }
      }
    });
  } catch (error) {
    console.error('Get project time logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get time logs for a user
// @route   GET /api/time-tracking/user/:userId
// @access  Private
exports.getUserTimeLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, projectId } = req.query;
    const requesterId = req.user.id;

    // Users can only view their own logs unless admin/PM
    if (userId !== requesterId && req.user.role !== 'admin' && req.user.role !== 'project_manager') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view other users\' time logs'
      });
    }

    // Build query
    let query = {};
    if (projectId) {
      query.project = projectId;
    }

    const tasks = await Task.find(query)
      .select('title project timeTracking status')
      .populate('project', 'name')
      .populate('timeTracking.logs.user', 'firstName lastName avatar');

    // Filter logs for this user
    let userLogs = [];
    tasks.forEach(task => {
      if (task.timeTracking && task.timeTracking.logs) {
        task.timeTracking.logs.forEach(log => {
          if (log.user._id.toString() === userId) {
            let includeLog = true;

            // Filter by date range
            if (startDate && new Date(log.date) < new Date(startDate)) {
              includeLog = false;
            }
            if (endDate && new Date(log.date) > new Date(endDate)) {
              includeLog = false;
            }

            if (includeLog) {
              userLogs.push({
                ...log.toObject(),
                task: {
                  _id: task._id,
                  title: task.title,
                  status: task.status,
                  project: task.project
                }
              });
            }
          }
        });
      }
    });

    // Calculate totals
    const totalHours = userLogs.reduce((sum, log) => sum + log.hours, 0);
    const billableHours = userLogs.filter(log => log.billable).reduce((sum, log) => sum + log.hours, 0);

    // Group by date for daily breakdown
    const dailyBreakdown = {};
    userLogs.forEach(log => {
      const dateKey = new Date(log.date).toISOString().split('T')[0];
      if (!dailyBreakdown[dateKey]) {
        dailyBreakdown[dateKey] = { hours: 0, logs: 0 };
      }
      dailyBreakdown[dateKey].hours += log.hours;
      dailyBreakdown[dateKey].logs += 1;
    });

    // Sort by date descending
    userLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        logs: userLogs,
        summary: {
          totalHours: Math.round(totalHours * 10) / 10,
          billableHours: Math.round(billableHours * 10) / 10,
          nonBillableHours: Math.round((totalHours - billableHours) * 10) / 10,
          logCount: userLogs.length,
          averageHoursPerDay: Object.keys(dailyBreakdown).length > 0 
            ? Math.round((totalHours / Object.keys(dailyBreakdown).length) * 10) / 10
            : 0
        },
        dailyBreakdown
      }
    });
  } catch (error) {
    console.error('Get user time logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update time log
// @route   PUT /api/time-tracking/log/:logId
// @access  Private
exports.updateTimeLog = async (req, res) => {
  try {
    const { taskId, logId } = req.params;
    const { hours, description, billable } = req.body;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Find the log
    const log = task.timeTracking.logs.id(logId);
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Time log not found'
      });
    }

    // Only the user who created the log can update it
    if (log.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this time log'
      });
    }

    // Calculate the difference in hours
    const oldHours = log.hours;
    const newHours = hours !== undefined ? parseFloat(hours) : log.hours;
    const hoursDifference = newHours - oldHours;

    // Update log
    if (hours !== undefined) log.hours = newHours;
    if (description !== undefined) log.description = description;
    if (billable !== undefined) log.billable = billable;

    // Update total logged hours
    task.timeTracking.loggedHours += hoursDifference;

    await task.save();

    res.json({
      success: true,
      message: 'Time log updated successfully',
      data: { log }
    });
  } catch (error) {
    console.error('Update time log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete time log
// @route   DELETE /api/time-tracking/log/:taskId/:logId
// @access  Private
exports.deleteTimeLog = async (req, res) => {
  try {
    const { taskId, logId } = req.params;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Find the log
    const log = task.timeTracking.logs.id(logId);
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Time log not found'
      });
    }

    // Only the user who created the log can delete it
    if (log.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this time log'
      });
    }

    // Subtract hours from total
    task.timeTracking.loggedHours -= log.hours;

    // Remove log
    log.remove();

    await task.save();

    res.json({
      success: true,
      message: 'Time log deleted successfully'
    });
  } catch (error) {
    console.error('Delete time log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = exports;

