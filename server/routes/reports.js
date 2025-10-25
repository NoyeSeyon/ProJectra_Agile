const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Activity = require('../models/Activity');
const File = require('../models/File');

const router = express.Router();

// Generate project report
router.post('/project', authenticate, [
  body('projectId').isMongoId().withMessage('Invalid project ID'),
  body('format').isIn(['pdf', 'excel']).withMessage('Format must be PDF or Excel'),
  body('includeTasks').optional().isBoolean().withMessage('includeTasks must be a boolean'),
  body('includeTeam').optional().isBoolean().withMessage('includeTeam must be a boolean'),
  body('includeBudget').optional().isBoolean().withMessage('includeBudget must be a boolean'),
  body('includeTimeline').optional().isBoolean().withMessage('includeTimeline must be a boolean')
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

    const {
      projectId,
      format,
      includeTasks = true,
      includeTeam = true,
      includeBudget = true,
      includeTimeline = true
    } = req.body;

    const orgId = req.user.organization;

    // Get project data
    const project = await Project.findOne({
      _id: projectId,
      organization: orgId
    }).populate('projectManager', 'firstName lastName email')
      .populate('teamLeader', 'firstName lastName email')
      .populate('client', 'firstName lastName email')
      .populate('members', 'firstName lastName email specialization');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get additional data based on options
    let tasks = [];
    let activities = [];
    let teamMembers = [];

    if (includeTasks) {
      tasks = await Task.find({
        project: projectId,
        organization: orgId
      }).populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 });
    }

    if (includeTeam) {
      teamMembers = await User.find({
        _id: { $in: project.members },
        organization: orgId
      }).select('firstName lastName email specialization skills capacity');
    }

    if (includeTimeline) {
      activities = await Activity.find({
        organization: orgId,
        'resource.type': 'project',
        'resource.id': projectId
      }).populate('actor', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(50);
    }

    // Generate report data
    const reportData = {
      project: {
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        startDate: project.startDate,
        endDate: project.endDate,
        progress: project.progress,
        projectManager: project.projectManager,
        teamLeader: project.teamLeader,
        client: project.client,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      },
      budget: includeBudget ? {
        amount: project.budget.amount,
        currency: project.budget.currency,
        spent: project.budget.spent,
        estimated: project.budget.estimated,
        remaining: project.budget.amount - project.budget.spent
      } : null,
      tasks: includeTasks ? tasks.map(task => ({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        type: task.type,
        progress: task.progress,
        assignedTo: task.assignedTo,
        createdBy: task.createdBy,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        completedAt: task.completedAt
      })) : [],
      team: includeTeam ? teamMembers.map(member => ({
        name: `${member.firstName} ${member.lastName}`,
        email: member.email,
        specialization: member.specialization,
        skills: member.skills,
        capacity: member.capacity
      })) : [],
      activities: includeTimeline ? activities.map(activity => ({
        type: activity.type,
        action: activity.action,
        actor: activity.actor,
        message: activity.message,
        createdAt: activity.createdAt
      })) : [],
      generatedAt: new Date(),
      generatedBy: {
        name: `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email
      }
    };

    // Generate file based on format
    if (format === 'pdf') {
      // TODO: Generate PDF using a library like puppeteer or jsPDF
      const pdfBuffer = await generatePDFReport(reportData);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="project-${project.name}-report.pdf"`);
      res.send(pdfBuffer);
    } else if (format === 'excel') {
      // TODO: Generate Excel using a library like exceljs
      const excelBuffer = await generateExcelReport(reportData);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="project-${project.name}-report.xlsx"`);
      res.send(excelBuffer);
    }

  } catch (error) {
    console.error('Generate project report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Generate team performance report
router.post('/team-performance', authenticate, [
  body('teamId').optional().isMongoId().withMessage('Invalid team ID'),
  body('format').isIn(['pdf', 'excel']).withMessage('Format must be PDF or Excel'),
  body('startDate').optional().isISO8601().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  body('includeTasks').optional().isBoolean().withMessage('includeTasks must be a boolean'),
  body('includeProjects').optional().isBoolean().withMessage('includeProjects must be a boolean')
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

    const {
      teamId,
      format,
      startDate,
      endDate,
      includeTasks = true,
      includeProjects = true
    } = req.body;

    const orgId = req.user.organization;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Get team members
    let teamMembers;
    if (teamId) {
      // Get specific team members
      teamMembers = await User.find({
        _id: { $in: teamId },
        organization: orgId
      }).select('firstName lastName email specialization skills capacity');
    } else {
      // Get all organization members
      teamMembers = await User.find({
        organization: orgId,
        role: { $in: ['member', 'team_leader', 'project_manager'] }
      }).select('firstName lastName email specialization skills capacity');
    }

    // Get performance data for each member
    const performanceData = await Promise.all(
      teamMembers.map(async (member) => {
        const memberData = {
          id: member._id,
          name: `${member.firstName} ${member.lastName}`,
          email: member.email,
          specialization: member.specialization,
          skills: member.skills,
          capacity: member.capacity
        };

        if (includeTasks) {
          // Get task statistics
          const taskStats = await Task.aggregate([
            {
              $match: {
                assignedTo: member._id,
                organization: orgId,
                ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {})
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                completed: {
                  $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                },
                inProgress: {
                  $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
                },
                overdue: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $ne: ['$status', 'completed'] },
                          { $lt: ['$dueDate', new Date()] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ]);

          memberData.taskStats = taskStats[0] || {
            total: 0,
            completed: 0,
            inProgress: 0,
            overdue: 0
          };
        }

        if (includeProjects) {
          // Get project statistics
          const projectStats = await Project.aggregate([
            {
              $match: {
                members: member._id,
                organization: orgId,
                ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {})
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                active: {
                  $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                },
                completed: {
                  $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                }
              }
            }
          ]);

          memberData.projectStats = projectStats[0] || {
            total: 0,
            active: 0,
            completed: 0
          };
        }

        return memberData;
      })
    );

    // Generate report data
    const reportData = {
      team: performanceData,
      period: {
        startDate: startDate || null,
        endDate: endDate || null
      },
      generatedAt: new Date(),
      generatedBy: {
        name: `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email
      }
    };

    // Generate file based on format
    if (format === 'pdf') {
      const pdfBuffer = await generateTeamPerformancePDF(reportData);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="team-performance-report.pdf"`);
      res.send(pdfBuffer);
    } else if (format === 'excel') {
      const excelBuffer = await generateTeamPerformanceExcel(reportData);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="team-performance-report.xlsx"`);
      res.send(excelBuffer);
    }

  } catch (error) {
    console.error('Generate team performance report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Generate organization analytics report
router.post('/analytics', authenticate, [
  body('format').isIn(['pdf', 'excel']).withMessage('Format must be PDF or Excel'),
  body('startDate').optional().isISO8601().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  body('includeProjects').optional().isBoolean().withMessage('includeProjects must be a boolean'),
  body('includeTasks').optional().isBoolean().withMessage('includeTasks must be a boolean'),
  body('includeTeam').optional().isBoolean().withMessage('includeTeam must be a boolean'),
  body('includeBudget').optional().isBoolean().withMessage('includeBudget must be a boolean')
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

    const {
      format,
      startDate,
      endDate,
      includeProjects = true,
      includeTasks = true,
      includeTeam = true,
      includeBudget = true
    } = req.body;

    const orgId = req.user.organization;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Get organization analytics
    const analytics = {};

    if (includeProjects) {
      const projectStats = await Project.aggregate([
        {
          $match: {
            organization: orgId,
            ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {})
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            onHold: { $sum: { $cond: [{ $eq: ['$status', 'on_hold'] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
            averageProgress: { $avg: '$progress' }
          }
        }
      ]);

      analytics.projects = projectStats[0] || {
        total: 0,
        active: 0,
        completed: 0,
        onHold: 0,
        cancelled: 0,
        averageProgress: 0
      };
    }

    if (includeTasks) {
      const taskStats = await Task.aggregate([
        {
          $match: {
            organization: orgId,
            ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {})
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
            toDo: { $sum: { $cond: [{ $eq: ['$status', 'to_do'] }, 1, 0] } },
            overdue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ne: ['$status', 'completed'] },
                      { $lt: ['$dueDate', new Date()] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      analytics.tasks = taskStats[0] || {
        total: 0,
        completed: 0,
        inProgress: 0,
        toDo: 0,
        overdue: 0
      };
    }

    if (includeTeam) {
      const teamStats = await User.aggregate([
        {
          $match: {
            organization: orgId,
            role: { $in: ['member', 'team_leader', 'project_manager'] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            bySpecialization: {
              $push: {
                specialization: '$specialization',
                skills: '$skills'
              }
            }
          }
        }
      ]);

      analytics.team = teamStats[0] || {
        total: 0,
        bySpecialization: []
      };
    }

    if (includeBudget) {
      const budgetStats = await Project.aggregate([
        {
          $match: {
            organization: orgId,
            ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {})
          }
        },
        {
          $group: {
            _id: null,
            totalBudget: { $sum: '$budget.amount' },
            totalSpent: { $sum: '$budget.spent' },
            totalEstimated: { $sum: '$budget.estimated' },
            averageBudget: { $avg: '$budget.amount' }
          }
        }
      ]);

      analytics.budget = budgetStats[0] || {
        totalBudget: 0,
        totalSpent: 0,
        totalEstimated: 0,
        averageBudget: 0
      };
    }

    // Generate report data
    const reportData = {
      analytics,
      period: {
        startDate: startDate || null,
        endDate: endDate || null
      },
      generatedAt: new Date(),
      generatedBy: {
        name: `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email
      }
    };

    // Generate file based on format
    if (format === 'pdf') {
      const pdfBuffer = await generateAnalyticsPDF(reportData);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-report.pdf"`);
      res.send(pdfBuffer);
    } else if (format === 'excel') {
      const excelBuffer = await generateAnalyticsExcel(reportData);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-report.xlsx"`);
      res.send(excelBuffer);
    }

  } catch (error) {
    console.error('Generate analytics report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Helper functions for report generation
async function generatePDFReport(data) {
  // TODO: Implement PDF generation using puppeteer or jsPDF
  // This is a placeholder implementation
  const pdfContent = `
    Project Report: ${data.project.name}
    Generated: ${data.generatedAt}
    Generated by: ${data.generatedBy.name}
    
    Project Details:
    - Status: ${data.project.status}
    - Progress: ${data.project.progress}%
    - Project Manager: ${data.project.projectManager?.firstName} ${data.project.projectManager?.lastName}
    
    Tasks: ${data.tasks.length}
    Team Members: ${data.team.length}
  `;
  
  return Buffer.from(pdfContent, 'utf8');
}

async function generateExcelReport(data) {
  // TODO: Implement Excel generation using exceljs
  // This is a placeholder implementation
  const excelContent = `
    Project Report: ${data.project.name}
    Generated: ${data.generatedAt}
    Generated by: ${data.generatedBy.name}
    
    Project Details:
    - Status: ${data.project.status}
    - Progress: ${data.project.progress}%
    - Project Manager: ${data.project.projectManager?.firstName} ${data.project.projectManager?.lastName}
    
    Tasks: ${data.tasks.length}
    Team Members: ${data.team.length}
  `;
  
  return Buffer.from(excelContent, 'utf8');
}

async function generateTeamPerformancePDF(data) {
  // TODO: Implement PDF generation for team performance
  const pdfContent = `
    Team Performance Report
    Generated: ${data.generatedAt}
    Generated by: ${data.generatedBy.name}
    
    Team Members: ${data.team.length}
  `;
  
  return Buffer.from(pdfContent, 'utf8');
}

async function generateTeamPerformanceExcel(data) {
  // TODO: Implement Excel generation for team performance
  const excelContent = `
    Team Performance Report
    Generated: ${data.generatedAt}
    Generated by: ${data.generatedBy.name}
    
    Team Members: ${data.team.length}
  `;
  
  return Buffer.from(excelContent, 'utf8');
}

async function generateAnalyticsPDF(data) {
  // TODO: Implement PDF generation for analytics
  const pdfContent = `
    Analytics Report
    Generated: ${data.generatedAt}
    Generated by: ${data.generatedBy.name}
    
    Projects: ${data.analytics.projects?.total || 0}
    Tasks: ${data.analytics.tasks?.total || 0}
    Team: ${data.analytics.team?.total || 0}
  `;
  
  return Buffer.from(pdfContent, 'utf8');
}

async function generateAnalyticsExcel(data) {
  // TODO: Implement Excel generation for analytics
  const excelContent = `
    Analytics Report
    Generated: ${data.generatedAt}
    Generated by: ${data.generatedBy.name}
    
    Projects: ${data.analytics.projects?.total || 0}
    Tasks: ${data.analytics.tasks?.total || 0}
    Team: ${data.analytics.team?.total || 0}
  `;
  
  return Buffer.from(excelContent, 'utf8');
}

module.exports = router;

