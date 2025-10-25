const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Client Controller
 * Handles client dashboard, project viewing, and communication
 */

// @desc    Get client dashboard data
// @route   GET /api/client/dashboard
// @access  Private (Client)
exports.getClientDashboard = async (req, res) => {
  try {
    const clientId = req.user._id;
    const orgId = req.user.organization;

    // Get all projects where user is assigned as client
    const projects = await Project.find({
      client: clientId,
      organization: orgId,
      isArchived: false
    })
      .populate('manager', 'firstName lastName email avatar')
      .populate('teamLeader', 'firstName lastName')
      .select('name description status priority startDate endDate progress budget')
      .sort({ createdAt: -1 });

    // Calculate aggregate stats
    const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      onHoldProjects: projects.filter(p => p.status === 'on_hold').length
    };

    // Get recent activity (last 10 project updates)
    const recentActivity = [];
    for (const project of projects.slice(0, 5)) {
      const tasks = await Task.find({ project: project._id })
        .sort({ updatedAt: -1 })
        .limit(2)
        .populate('assignee', 'firstName lastName');

      tasks.forEach(task => {
        recentActivity.push({
          type: 'task_update',
          project: {
            _id: project._id,
            name: project.name
          },
          task: {
            _id: task._id,
            title: task.title,
            status: task.status
          },
          assignee: task.assignee,
          timestamp: task.updatedAt
        });
      });
    }

    // Sort by most recent
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Get unread notifications
    const notifications = await Notification.find({
      recipient: clientId,
      isRead: false
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        client: {
          name: `${req.user.firstName} ${req.user.lastName}`,
          email: req.user.email,
          company: req.user.organization?.name || 'N/A'
        },
        stats,
        projects,
        recentActivity: recentActivity.slice(0, 10),
        notifications
      }
    });
  } catch (error) {
    console.error('Client dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get client's projects
// @route   GET /api/client/projects
// @access  Private (Client)
exports.getClientProjects = async (req, res) => {
  try {
    const clientId = req.user._id;
    const { status, search } = req.query;

    // Build query
    const query = {
      client: clientId,
      organization: req.user.organization,
      isArchived: false
    };

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(query)
      .populate('manager', 'firstName lastName email avatar')
      .populate('teamLeader', 'firstName lastName avatar')
      .populate({
        path: 'members.user',
        select: 'firstName lastName avatar specialization'
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { projects }
    });
  } catch (error) {
    console.error('Get client projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get project progress details
// @route   GET /api/client/project/:projectId/progress
// @access  Private (Client)
exports.getProjectProgress = async (req, res) => {
  try {
    const { projectId } = req.params;
    const clientId = req.user._id;

    // Verify client has access to this project
    const project = await Project.findOne({
      _id: projectId,
      client: clientId
    })
      .populate('manager', 'firstName lastName email avatar phone')
      .populate('teamLeader', 'firstName lastName avatar')
      .populate({
        path: 'members.user',
        select: 'firstName lastName avatar specialization'
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    // Get task statistics
    const tasks = await Task.find({ project: projectId });
    const taskStats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      review: tasks.filter(t => t.status === 'review').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      completionRate: tasks.length > 0 
        ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
        : 0
    };

    // Get milestone progress (if any)
    const milestones = project.milestones || [];
    const completedMilestones = milestones.filter(m => m.completed).length;

    // Calculate budget status
    const budgetStatus = {
      planned: project.budget?.planned || 0,
      spent: project.budget?.spent || 0,
      remaining: (project.budget?.planned || 0) - (project.budget?.spent || 0),
      percentageUsed: project.budget?.planned > 0
        ? Math.round(((project.budget?.spent || 0) / project.budget.planned) * 100)
        : 0,
      currency: project.budget?.currency || 'USD'
    };

    // Get recent activity for this project
    const recentTasks = await Task.find({ project: projectId })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('assignee', 'firstName lastName avatar')
      .select('title status priority updatedAt');

    // Calculate timeline progress
    let timelineProgress = 0;
    if (project.startDate && project.endDate) {
      const start = new Date(project.startDate);
      const end = new Date(project.endDate);
      const now = new Date();
      
      const totalDuration = end - start;
      const elapsed = now - start;
      
      timelineProgress = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
    }

    res.json({
      success: true,
      data: {
        project,
        taskStats,
        milestones: {
          total: milestones.length,
          completed: completedMilestones,
          list: milestones
        },
        budgetStatus,
        timelineProgress,
        recentActivity: recentTasks
      }
    });
  } catch (error) {
    console.error('Get project progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Submit client feedback
// @route   POST /api/client/feedback
// @access  Private (Client)
exports.submitFeedback = async (req, res) => {
  try {
    const { projectId, subject, message, rating } = req.body;
    const clientId = req.user._id;

    // Verify client has access to this project
    const project = await Project.findOne({
      _id: projectId,
      client: clientId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    // Create notification for project manager
    await Notification.createNotification({
      recipient: project.manager,
      organization: project.organization,
      type: 'client_feedback',
      title: 'New Client Feedback',
      message: `${req.user.firstName} ${req.user.lastName} submitted feedback for ${project.name}`,
      data: {
        projectId: project._id,
        subject,
        message,
        rating,
        clientId
      }
    });

    // TODO: Store feedback in a separate Feedback model (future enhancement)

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get project reports
// @route   GET /api/client/reports
// @access  Private (Client)
exports.getReports = async (req, res) => {
  try {
    const clientId = req.user._id;
    const { projectId } = req.query;

    const query = {
      client: clientId,
      organization: req.user.organization
    };

    if (projectId) query._id = projectId;

    const projects = await Project.find(query)
      .populate('manager', 'firstName lastName email')
      .select('name status progress budget startDate endDate');

    const reports = [];

    for (const project of projects) {
      const tasks = await Task.find({ project: project._id });
      
      reports.push({
        project: {
          _id: project._id,
          name: project.name,
          status: project.status,
          progress: project.progress,
          manager: project.manager
        },
        summary: {
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t => t.status === 'completed').length,
          budgetPlanned: project.budget?.planned || 0,
          budgetSpent: project.budget?.spent || 0,
          startDate: project.startDate,
          endDate: project.endDate,
          generatedAt: new Date()
        }
      });
    }

    res.json({
      success: true,
      data: { reports }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get project timeline
// @route   GET /api/client/project/:projectId/timeline
// @access  Private (Client)
exports.getProjectTimeline = async (req, res) => {
  try {
    const { projectId } = req.params;
    const clientId = req.user._id;

    // Verify access
    const project = await Project.findOne({
      _id: projectId,
      client: clientId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    // Get major task milestones
    const tasks = await Task.find({
      project: projectId,
      priority: { $in: ['high', 'urgent'] }
    })
      .sort({ dueDate: 1 })
      .select('title status priority dueDate completedAt')
      .limit(20);

    // Build timeline events
    const timeline = [
      {
        type: 'project_start',
        title: 'Project Started',
        date: project.startDate,
        status: 'completed'
      }
    ];

    // Add task events
    tasks.forEach(task => {
      timeline.push({
        type: 'task',
        title: task.title,
        date: task.dueDate || task.completedAt,
        status: task.status,
        priority: task.priority
      });
    });

    // Add milestones
    if (project.milestones) {
      project.milestones.forEach(milestone => {
        timeline.push({
          type: 'milestone',
          title: milestone.title,
          date: milestone.dueDate,
          status: milestone.completed ? 'completed' : 'pending',
          description: milestone.description
        });
      });
    }

    // Add project end
    if (project.endDate) {
      timeline.push({
        type: 'project_end',
        title: 'Project End Date',
        date: project.endDate,
        status: project.status === 'completed' ? 'completed' : 'pending'
      });
    }

    // Sort by date
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      data: { timeline }
    });
  } catch (error) {
    console.error('Get project timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

