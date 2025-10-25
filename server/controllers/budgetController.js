const Project = require('../models/Project');
const { validationResult } = require('express-validator');

/**
 * Budget Controller
 * Handles project budget tracking, expenses, and alerts
 */

// @desc    Get project budget status
// @route   GET /api/budget/project/:projectId
// @access  Private (PM, Admin, Team Leader)
exports.getProjectBudget = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const project = await Project.findById(projectId)
      .populate('manager', 'firstName lastName')
      .populate('teamLeader', 'firstName lastName');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check authorization
    const isManager = project.manager._id.toString() === userId.toString();
    const isTeamLeader = project.teamLeader && project.teamLeader._id.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

    if (!isManager && !isTeamLeader && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view budget'
      });
    }

    // Get budget status
    const budgetStatus = project.getBudgetStatus();

    res.json({
      success: true,
      data: {
        project: {
          _id: project._id,
          name: project.name
        },
        budget: project.budget,
        status: budgetStatus
      }
    });
  } catch (error) {
    console.error('Get project budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update project budget
// @route   PUT /api/budget/project/:projectId
// @access  Private (PM, Admin)
exports.updateProjectBudget = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { projectId } = req.params;
    const { planned, spent, currency, alertThreshold } = req.body;
    const userId = req.user.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check authorization (PM or Admin only)
    const isManager = project.manager.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

    if (!isManager && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update budget'
      });
    }

    // Update budget fields
    if (planned !== undefined) project.budget.planned = planned;
    if (spent !== undefined) project.budget.spent = spent;
    if (currency !== undefined) project.budget.currency = currency;
    if (alertThreshold !== undefined) project.budget.alertThreshold = alertThreshold;

    await project.save();

    const budgetStatus = project.getBudgetStatus();

    res.json({
      success: true,
      message: 'Budget updated successfully',
      data: {
        budget: project.budget,
        status: budgetStatus
      }
    });
  } catch (error) {
    console.error('Update project budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Log an expense to project budget
// @route   POST /api/budget/expense
// @access  Private (PM, Admin, Team Leader)
exports.logExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { projectId, amount, description } = req.body;
    const userId = req.user.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check authorization
    const isManager = project.manager.toString() === userId.toString();
    const isTeamLeader = project.teamLeader && project.teamLeader.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

    if (!isManager && !isTeamLeader && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to log expenses'
      });
    }

    // Add to spent amount
    project.budget.spent += parseFloat(amount);
    await project.save();

    const budgetStatus = project.getBudgetStatus();

    // Check if we crossed alert threshold
    const wasAlerted = budgetStatus.isAlert;

    res.json({
      success: true,
      message: 'Expense logged successfully',
      data: {
        budget: project.budget,
        status: budgetStatus,
        alert: wasAlerted ? {
          message: `Budget alert: ${budgetStatus.percentage}% of budget spent`,
          level: budgetStatus.status
        } : null
      }
    });
  } catch (error) {
    console.error('Log expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get budget alerts for user's projects
// @route   GET /api/budget/alerts
// @access  Private
exports.getBudgetAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let projectQuery = { isArchived: false };

    // Filter based on role
    if (userRole === 'project_manager') {
      projectQuery.manager = userId;
    } else if (userRole === 'team_leader' || userRole === 'member') {
      projectQuery.$or = [
        { manager: userId },
        { teamLeader: userId },
        { 'members.user': userId }
      ];
    }
    // Admin/Super Admin can see all

    const projects = await Project.find(projectQuery)
      .select('name budget weight complexity')
      .populate('manager', 'firstName lastName');

    // Get projects with budget alerts
    const alerts = [];
    projects.forEach(project => {
      const budgetStatus = project.getBudgetStatus();
      
      if (budgetStatus.isAlert) {
        alerts.push({
          project: {
            _id: project._id,
            name: project.name,
            manager: project.manager
          },
          budget: {
            planned: budgetStatus.planned,
            spent: budgetStatus.spent,
            remaining: budgetStatus.remaining,
            percentage: budgetStatus.percentage
          },
          alert: {
            status: budgetStatus.status,
            threshold: budgetStatus.alertThreshold,
            message: `${budgetStatus.percentage}% of budget spent`
          }
        });
      }
    });

    // Sort by severity (critical first)
    const severityOrder = { critical: 0, warning: 1, caution: 2 };
    alerts.sort((a, b) => {
      return severityOrder[a.alert.status] - severityOrder[b.alert.status];
    });

    res.json({
      success: true,
      data: {
        alerts,
        summary: {
          total: alerts.length,
          critical: alerts.filter(a => a.alert.status === 'critical').length,
          warning: alerts.filter(a => a.alert.status === 'warning').length,
          caution: alerts.filter(a => a.alert.status === 'caution').length
        }
      }
    });
  } catch (error) {
    console.error('Get budget alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = exports;

