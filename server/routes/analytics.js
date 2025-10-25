const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Sprint = require('../models/Sprint');
const Activity = require('../models/Activity');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get analytics data
router.get('/', authenticate, async (req, res) => {
  try {
    const { dateRange, project, team } = req.query;
    const orgId = req.user.organization;

    // Calculate date range
    const getDateRange = (range) => {
      const now = new Date();
      switch (range) {
        case '7d':
          return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case '30d':
          return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case '90d':
          return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        case '1y':
          return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        default:
          return new Date(0);
      }
    };

    const startDate = getDateRange(dateRange || '30d');
    const endDate = new Date();

    // Build filters
    const projectFilter = { organization: orgId };
    const taskFilter = { organization: orgId };
    const userFilter = { organization: orgId };

    if (project) {
      projectFilter._id = project;
      taskFilter.project = project;
    }

    if (team) {
      taskFilter.assignee = team;
    }

    // Get basic data
    const [projects, tasks, users, activities] = await Promise.all([
      Project.find(projectFilter).populate('teamLeader', 'firstName lastName').populate('client', 'firstName lastName'),
      Task.find(taskFilter).populate('assignee', 'firstName lastName').populate('project', 'name'),
      User.find(userFilter).select('-password'),
      Activity.find({ organization: orgId, createdAt: { $gte: startDate, $lte: endDate } })
    ]);

    // Calculate summary stats
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const teamMembers = users.length;
    
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget?.amount || 0), 0);
    const spentBudget = projects.reduce((sum, p) => sum + (p.budget?.spent || 0), 0);
    
    // Calculate average velocity
    const sprints = await Sprint.find({ 
      organization: orgId,
      createdAt: { $gte: startDate, $lte: endDate }
    });
    const averageVelocity = sprints.length > 0 
      ? sprints.reduce((sum, s) => sum + (s.velocity || 0), 0) / sprints.length 
      : 0;

    // Generate chart data
    const charts = await generateChartData(projects, tasks, users, activities, startDate, endDate);

    res.json({
      success: true,
      data: {
        projects,
        tasks,
        users,
        timeEntries: [], // TODO: Implement time tracking
        budgets: projects.map(p => ({
          project: p.name,
          budget: p.budget?.amount || 0,
          spent: p.budget?.spent || 0
        })),
        activities
      },
      summary: {
        totalProjects,
        activeProjects,
        completedTasks,
        totalTasks,
        teamMembers,
        totalBudget,
        spentBudget,
        averageVelocity
      },
      charts
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Export analytics data
router.get('/export', authenticate, async (req, res) => {
  try {
    const { format, dateRange, project, team } = req.query;
    const orgId = req.user.organization;

    // Get analytics data (reuse the main analytics logic)
    const analyticsResponse = await getAnalyticsData(orgId, { dateRange, project, team });
    
    if (format === 'pdf') {
      // TODO: Implement PDF generation
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics-report.pdf"');
      res.send('PDF export not yet implemented');
    } else if (format === 'excel') {
      // TODO: Implement Excel generation
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics-report.xlsx"');
      res.send('Excel export not yet implemented');
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid export format'
      });
    }

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Helper function to generate chart data
async function generateChartData(projects, tasks, users, activities, startDate, endDate) {
  // Project Progress Chart
  const projectProgress = {
    series: [
      {
        name: 'Progress',
        data: projects.map(p => p.progress || 0)
      }
    ],
    categories: projects.map(p => p.name)
  };

  // Task Status Distribution
  const taskStatusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const taskStatus = {
    series: Object.values(taskStatusCounts),
    categories: Object.keys(taskStatusCounts).map(status => 
      status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    )
  };

  // Team Performance (tasks completed per user)
  const teamPerformance = users.map(user => {
    const userTasks = tasks.filter(t => t.assignee?._id.toString() === user._id.toString());
    const completedTasks = userTasks.filter(t => t.status === 'completed');
    
    return {
      name: `${user.firstName} ${user.lastName}`,
      data: [completedTasks.length]
    };
  });

  // Budget Utilization
  const budgetUtilization = {
    series: [
      {
        name: 'Budget',
        data: projects.map(p => p.budget?.amount || 0)
      },
      {
        name: 'Spent',
        data: projects.map(p => p.budget?.spent || 0)
      }
    ],
    categories: projects.map(p => p.name)
  };

  // Time Tracking (placeholder - would need actual time tracking data)
  const timeTracking = {
    series: [
      {
        name: 'Hours Logged',
        data: [8, 7, 6, 8, 7, 9, 8] // Placeholder data
      }
    ],
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };

  // Sprint Velocity
  const velocityChart = {
    series: [
      {
        name: 'Velocity',
        data: [20, 25, 22, 28, 30, 27, 32] // Placeholder data
      }
    ],
    categories: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5', 'Sprint 6', 'Sprint 7']
  };

  return {
    projectProgress,
    taskStatus,
    teamPerformance,
    budgetUtilization,
    timeTracking,
    velocityChart
  };
}

// Helper function to get analytics data (reused for export)
async function getAnalyticsData(orgId, filters) {
  // This would contain the same logic as the main analytics endpoint
  // For now, return a simplified version
  return {
    projects: [],
    tasks: [],
    users: [],
    activities: []
  };
}

module.exports = router;