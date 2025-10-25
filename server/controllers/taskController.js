const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

/**
 * Task Controller
 * Handles all task CRUD operations
 */

// Get all tasks with filters
exports.getTasks = async (req, res) => {
  try {
    const { 
      project, 
      assignee, 
      status, 
      priority, 
      search,
      page = 1,
      limit = 50
    } = req.query;

    // Build query
    const query = { organization: req.orgId };

    if (project) query.project = project;
    if (assignee) query.assignee = assignee;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignee', 'firstName lastName email avatar')
      .populate('reporter', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      data: {
        tasks,
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
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
};

// Get single task by ID
exports.getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findOne({
      _id: taskId,
      organization: req.orgId
    })
      .populate('project', 'name')
      .populate('assignee', 'firstName lastName email avatar')
      .populate('reporter', 'firstName lastName email avatar')
      .populate('subtasks')
      .populate('parentTask', 'title');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
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
      message: 'Failed to fetch task',
      error: error.message
    });
  }
};

// Create new task
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignee,
      status = 'todo',
      priority = 'medium',
      type = 'task',
      dueDate,
      estimatedHours,
      storyPoints,
      tags
    } = req.body;

    // Verify project exists and user has access
    const projectDoc = await Project.findOne({
      _id: project,
      organization: req.orgId
    });

    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Create task
    const task = new Task({
      title,
      description,
      organization: req.orgId,
      project,
      assignee: assignee || null,
      reporter: req.user._id,
      status,
      priority,
      type,
      dueDate,
      estimatedHours,
      storyPoints,
      tags: tags || []
    });

    await task.save();

    // Populate fields for response
    await task.populate([
      { path: 'project', select: 'name' },
      { path: 'assignee', select: 'firstName lastName email avatar' },
      { path: 'reporter', select: 'firstName lastName email' }
    ]);

    // Create notification for assignee if assigned
    if (assignee && assignee !== req.user._id.toString()) {
      await Notification.createNotification({
        recipient: assignee,
        organization: req.orgId,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned to task: ${title}`,
        data: {
          taskId: task._id,
          projectId: project
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;

    // Find task
    const task = await Task.findOne({
      _id: taskId,
      organization: req.orgId
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Track if assignee changed for notification
    const oldAssignee = task.assignee?.toString();
    const newAssignee = updates.assignee;

    // Update fields
    const allowedUpdates = [
      'title', 'description', 'assignee', 'status', 'priority',
      'type', 'dueDate', 'startDate', 'estimatedHours', 'actualHours',
      'progress', 'storyPoints', 'tags', 'labels'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        task[field] = updates[field];
      }
    });

    // Auto-set completedAt when status changes to completed
    if (updates.status === 'completed' && task.status !== 'completed') {
      task.completedAt = new Date();
      task.progress = 100;
    }

    await task.save();

    // Populate for response
    await task.populate([
      { path: 'project', select: 'name' },
      { path: 'assignee', select: 'firstName lastName email avatar' },
      { path: 'reporter', select: 'firstName lastName email' }
    ]);

    // Send notification if assignee changed
    if (newAssignee && newAssignee !== oldAssignee && newAssignee !== req.user._id.toString()) {
      await Notification.createNotification({
        recipient: newAssignee,
        organization: req.orgId,
        type: 'task_assigned',
        title: 'Task Assigned to You',
        message: `You have been assigned to task: ${task.title}`,
        data: {
          taskId: task._id,
          projectId: task.project
        }
      });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findOne({
      _id: taskId,
      organization: req.orgId
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Delete task and all subtasks
    await Task.deleteMany({
      $or: [
        { _id: taskId },
        { parentTask: taskId }
      ]
    });

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
};

// Get tasks by project
exports.getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.query;

    const query = {
      project: projectId,
      organization: req.orgId
    };

    if (status) query.status = status;

    const tasks = await Task.find(query)
      .populate('assignee', 'firstName lastName email avatar')
      .populate('reporter', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { tasks }
    });

  } catch (error) {
    console.error('Get project tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project tasks',
      error: error.message
    });
  }
};

// Get my assigned tasks
exports.getMyTasks = async (req, res) => {
  try {
    const { status, priority } = req.query;

    const query = {
      assignee: req.user._id,
      organization: req.orgId
    };

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('reporter', 'firstName lastName email')
      .sort({ dueDate: 1, priority: -1 });

    res.json({
      success: true,
      data: { tasks }
    });

  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your tasks',
      error: error.message
    });
  }
};

// Update task status (for Kanban drag-and-drop)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await Task.findOne({
      _id: taskId,
      organization: req.orgId
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.status = status;

    // Auto-set completedAt
    if (status === 'completed') {
      task.completedAt = new Date();
      task.progress = 100;
    }

    await task.save();

    await task.populate([
      { path: 'assignee', select: 'firstName lastName email avatar' }
    ]);

    res.json({
      success: true,
      message: 'Task status updated',
      data: { task }
    });

  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task status',
      error: error.message
    });
  }
};

// Get task statistics
exports.getTaskStats = async (req, res) => {
  try {
    const { projectId } = req.query;

    const query = { organization: req.orgId };
    if (projectId) query.project = projectId;

    const [
      total,
      todo,
      inProgress,
      review,
      completed,
      byPriority,
      overdue
    ] = await Promise.all([
      Task.countDocuments(query),
      Task.countDocuments({ ...query, status: 'todo' }),
      Task.countDocuments({ ...query, status: 'in_progress' }),
      Task.countDocuments({ ...query, status: 'review' }),
      Task.countDocuments({ ...query, status: 'completed' }),
      Task.aggregate([
        { $match: query },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Task.countDocuments({
        ...query,
        dueDate: { $lt: new Date() },
        status: { $nin: ['completed', 'cancelled'] }
      })
    ]);

    res.json({
      success: true,
      data: {
        total,
        byStatus: {
          todo,
          in_progress: inProgress,
          review,
          completed
        },
        byPriority: byPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        overdue
      }
    });

  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task statistics',
      error: error.message
    });
  }
};

