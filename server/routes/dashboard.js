const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { authenticate, checkOrganization } = require('../middleware/auth');

const router = express.Router();

// Get dashboard data for user
router.get('/', authenticate, checkOrganization, async (req, res) => {
  try {
    const { orgId, user } = req;
    const userId = user._id;
    const userRole = user.role;

    // Get user's projects
    let projects = [];
    if (userRole === 'admin' || userRole === 'project_manager') {
      projects = await Project.find({ organization: orgId })
        .populate('manager', 'firstName lastName email')
        .populate('teamLeader', 'firstName lastName email')
        .populate('client', 'firstName lastName email')
        .populate('members.user', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .limit(10);
    } else if (userRole === 'team_leader') {
      projects = await Project.find({ 
        organization: orgId,
        $or: [
          { teamLeader: userId },
          { 'members.user': userId }
        ]
      })
        .populate('manager', 'firstName lastName email')
        .populate('teamLeader', 'firstName lastName email')
        .populate('members.user', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .limit(10);
    } else if (userRole === 'member') {
      projects = await Project.find({ 
        organization: orgId,
        'members.user': userId
      })
        .populate('manager', 'firstName lastName email')
        .populate('teamLeader', 'firstName lastName email')
        .populate('members.user', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .limit(10);
    } else if (userRole === 'client') {
      projects = await Project.find({ 
        organization: orgId,
        client: userId
      })
        .populate('manager', 'firstName lastName email')
        .populate('teamLeader', 'firstName lastName email')
        .populate('members.user', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .limit(10);
    }

    // Get user's tasks
    let tasks = [];
    if (userRole === 'admin' || userRole === 'project_manager') {
      tasks = await Task.find({ organization: orgId })
        .populate('assignee', 'firstName lastName email')
        .populate('reporter', 'firstName lastName email')
        .populate('project', 'name')
        .sort({ createdAt: -1 })
        .limit(10);
    } else {
      tasks = await Task.find({ 
        organization: orgId,
        $or: [
          { assignee: userId },
          { reporter: userId },
          { 'watchers': userId }
        ]
      })
        .populate('assignee', 'firstName lastName email')
        .populate('reporter', 'firstName lastName email')
        .populate('project', 'name')
        .sort({ createdAt: -1 })
        .limit(10);
    }

    // Get recent activities
    const activities = await Activity.find({ 
      organization: orgId,
      visibility: { $in: ['organization', 'public'] }
    })
      .populate('actor', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    // Get statistics based on role
    let stats = {};
    
    if (userRole === 'admin' || userRole === 'project_manager') {
      const totalProjects = await Project.countDocuments({ organization: orgId });
      const activeProjects = await Project.countDocuments({ 
        organization: orgId, 
        status: 'active' 
      });
      const completedProjects = await Project.countDocuments({ 
        organization: orgId, 
        status: 'completed' 
      });
      const totalTasks = await Task.countDocuments({ organization: orgId });
      const completedTasks = await Task.countDocuments({ 
        organization: orgId, 
        status: 'completed' 
      });
      const totalMembers = await User.countDocuments({ organization: orgId });

      stats = {
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        completedTasks,
        totalMembers,
        projectCompletionRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0,
        taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      };
    } else if (userRole === 'team_leader') {
      const myProjects = await Project.find({ 
        organization: orgId,
        teamLeader: userId
      });
      const myTasks = await Task.find({ 
        organization: orgId,
        $or: [
          { assignee: userId },
          { reporter: userId }
        ]
      });

      stats = {
        myProjects: myProjects.length,
        myTasks: myTasks.length,
        completedTasks: myTasks.filter(task => task.status === 'completed').length,
        inProgressTasks: myTasks.filter(task => task.status === 'in_progress').length
      };
    } else if (userRole === 'member') {
      const myTasks = await Task.find({ 
        organization: orgId,
        assignee: userId
      });

      stats = {
        myTasks: myTasks.length,
        completedTasks: myTasks.filter(task => task.status === 'completed').length,
        inProgressTasks: myTasks.filter(task => task.status === 'in_progress').length,
        overdueTasks: myTasks.filter(task => 
          task.dueDate && task.dueDate < new Date() && task.status !== 'completed'
        ).length
      };
    } else if (userRole === 'client') {
      const myProjects = await Project.find({ 
        organization: orgId,
        client: userId
      });

      stats = {
        myProjects: myProjects.length,
        activeProjects: myProjects.filter(project => project.status === 'active').length,
        completedProjects: myProjects.filter(project => project.status === 'completed').length
      };
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          specialization: user.specialization,
          avatar: user.avatar
        },
        projects,
        tasks,
        activities,
        stats
      }
    });

  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get dashboard analytics
router.get('/analytics', authenticate, checkOrganization, async (req, res) => {
  try {
    const { orgId, user } = req;
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get project analytics
    const projects = await Project.find({ 
      organization: orgId,
      createdAt: { $gte: startDate }
    });

    const projectStats = {
      total: projects.length,
      byStatus: {
        planning: projects.filter(p => p.status === 'planning').length,
        active: projects.filter(p => p.status === 'active').length,
        completed: projects.filter(p => p.status === 'completed').length,
        onHold: projects.filter(p => p.status === 'on_hold').length,
        cancelled: projects.filter(p => p.status === 'cancelled').length
      },
      byPriority: {
        low: projects.filter(p => p.priority === 'low').length,
        medium: projects.filter(p => p.priority === 'medium').length,
        high: projects.filter(p => p.priority === 'high').length,
        urgent: projects.filter(p => p.priority === 'urgent').length
      }
    };

    // Get task analytics
    const tasks = await Task.find({ 
      organization: orgId,
      createdAt: { $gte: startDate }
    });

    const taskStats = {
      total: tasks.length,
      byStatus: {
        todo: tasks.filter(t => t.status === 'todo').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        review: tasks.filter(t => t.status === 'review').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        cancelled: tasks.filter(t => t.status === 'cancelled').length
      },
      byType: {
        task: tasks.filter(t => t.type === 'task').length,
        bug: tasks.filter(t => t.type === 'bug').length,
        feature: tasks.filter(t => t.type === 'feature').length,
        epic: tasks.filter(t => t.type === 'epic').length,
        story: tasks.filter(t => t.type === 'story').length
      }
    };

    // Get activity analytics
    const activities = await Activity.find({ 
      organization: orgId,
      createdAt: { $gte: startDate }
    });

    const activityStats = {
      total: activities.length,
      byType: {
        user: activities.filter(a => a.type === 'user').length,
        project: activities.filter(a => a.type === 'project').length,
        task: activities.filter(a => a.type === 'task').length,
        sprint: activities.filter(a => a.type === 'sprint').length,
        team: activities.filter(a => a.type === 'team').length
      }
    };

    res.json({
      success: true,
      data: {
        period,
        startDate,
        endDate: now,
        projects: projectStats,
        tasks: taskStats,
        activities: activityStats
      }
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;

