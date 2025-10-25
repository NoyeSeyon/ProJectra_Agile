const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { validationResult } = require('express-validator');

/**
 * Team Leader Controller
 * Handles Team Leader specific operations: subtask management, team coordination
 */

// @desc    Get Team Leader dashboard stats
// @route   GET /api/team-leader/dashboard
// @access  Private (Team Leader/Member)
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get projects where user is team leader
    const tlProjects = await Project.find({ teamLeader: userId, isArchived: false })
      .populate('manager', 'firstName lastName')
      .populate('teamLeader', 'firstName lastName')
      .populate('members.user', 'firstName lastName specialization')
      .select('name status progress weight complexity');

    // Get projects where user is a member (not team leader)
    const memberProjects = await Project.find({ 
      'members.user': userId,
      teamLeader: { $ne: userId },
      isArchived: false 
    })
      .populate('manager', 'firstName lastName')
      .populate('teamLeader', 'firstName lastName')
      .populate('members.user', 'firstName lastName specialization')
      .select('name status progress weight complexity');

    // Combine all projects
    const allProjects = [...tlProjects, ...memberProjects];

    // Get all tasks in ALL projects (TL + Member)
    const allProjectIds = allProjects.map(p => p._id);
    const mainTasks = await Task.find({
      project: { $in: allProjectIds },
      type: { $ne: 'subtask' },
      isSubtask: false,
      assignee: userId
    }).populate('assignee', 'firstName lastName');

    // Get subtasks ASSIGNED TO this user (for members and TLs)
    const assignedSubtasks = await Task.find({
      project: { $in: allProjectIds },
      isSubtask: true,
      assignee: userId
    }).populate('assignee', 'firstName lastName');

    // Get subtasks created by this user (if TL)
    const tlProjectIds = tlProjects.map(p => p._id);
    const subtasksCreated = await Task.find({
      project: { $in: tlProjectIds },
      isSubtask: true,
      reporter: userId
    }).populate('assignee', 'firstName lastName');

    // Calculate team size across all TL projects
    const uniqueTeamMembers = new Set();
    tlProjects.forEach(project => {
      project.members.forEach(member => {
        uniqueTeamMembers.add(member.user._id.toString());
      });
    });

    // Get tasks needing breakdown (main tasks not yet split) - TL only
    const tasksNeedingBreakdown = await Task.find({
      project: { $in: tlProjectIds },
      assignee: userId,
      isSubtask: false,
      type: { $ne: 'subtask' },
      status: { $in: ['todo', 'in_progress'] },
      $or: [
        { subtasks: { $size: 0 } },
        { subtasks: { $exists: false } }
      ]
    }).populate('project', 'name');

    // Calculate total active tasks (main tasks + assigned subtasks)
    const totalActiveTasks = mainTasks.length + assignedSubtasks.length;
    
    res.json({
      success: true,
      data: {
        stats: {
          projectsAsTeamLeader: tlProjects.length,
          totalProjects: allProjects.length,
          mainTasks: mainTasks.length,
          assignedSubtasks: assignedSubtasks.length,
          totalActiveTasks: totalActiveTasks, // New field for dashboard
          subtasksCreated: subtasksCreated.length,
          teamSize: uniqueTeamMembers.size,
          tasksNeedingBreakdown: tasksNeedingBreakdown.length
        },
        projects: allProjects,
        tasksNeedingBreakdown,
        recentSubtasks: subtasksCreated.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Team Leader dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get projects where user is team leader or member
// @route   GET /api/team-leader/projects
// @access  Private (Team Leader/Member)
exports.getProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get projects where user is team leader OR a member
    const projects = await Project.find({ 
      $or: [
        { teamLeader: userId },
        { 'members.user': userId }
      ],
      isArchived: false 
    })
      .populate('manager', 'firstName lastName email')
      .populate('client', 'firstName lastName email')
      .populate('members.user', 'firstName lastName specialization avatar')
      .populate('teamLeader', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { projects }
    });
  } catch (error) {
    console.error('Get TL projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get main tasks for a project (to break down into subtasks)
// @route   GET /api/team-leader/tasks/:projectId
// @access  Private (Team Leader)
exports.getMainTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Verify user is team leader of this project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.teamLeader.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as team leader for this project'
      });
    }

    // Get main tasks (non-subtasks)
    const tasks = await Task.find({
      project: projectId,
      isSubtask: false,
      type: { $ne: 'subtask' }
    })
      .populate('assignee', 'firstName lastName avatar specialization')
      .populate('reporter', 'firstName lastName')
      .populate({
        path: 'subtasks',
        populate: {
          path: 'assignee',
          select: 'firstName lastName email specialization'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    console.error('Get main tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all tasks assigned to current user (main tasks and subtasks)
// @route   GET /api/team-leader/my-tasks
// @access  Private (Team Leader/Member)
exports.getMyTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const orgId = req.user.organization;

    console.log('🔍 Fetching tasks for user:', userId);

    // Get all tasks (main tasks and subtasks) assigned to this user
    const tasks = await Task.find({
      organization: orgId,
      assignee: userId
    })
      .populate('assignee', 'firstName lastName email specialization')
      .populate('reporter', 'firstName lastName')
      .populate('project', 'name teamLeader settings')  // Include teamLeader and settings for permission check
      .populate('mainTask', 'title')
      .populate({
        path: 'subtasks',
        populate: {
          path: 'assignee',
          select: 'firstName lastName email specialization'
        }
      })
      .populate('dependencies', 'title status')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${tasks.length} tasks assigned to user`);

    res.json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    console.error('❌ Get my tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all subtasks created by Team Leader
exports.getCreatedSubtasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const orgId = req.user.organization;

    console.log('🔍 Fetching subtasks created by TL:', userId);

    // Get all subtasks where user is the reporter (creator)
    const subtasks = await Task.find({
      organization: orgId,
      reporter: userId,
      isSubtask: true
    })
      .populate('assignee', 'firstName lastName email specialization')
      .populate('reporter', 'firstName lastName')
      .populate('project', 'name teamLeader settings')
      .populate('mainTask', 'title')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${subtasks.length} subtasks created by TL`);

    res.json({
      success: true,
      data: { subtasks }
    });
  } catch (error) {
    console.error('❌ Get created subtasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create subtasks from a main task
// @route   POST /api/team-leader/subtasks
// @access  Private (Team Leader)
exports.createSubtasks = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { mainTaskId, subtasks } = req.body;
    const userId = req.user.id;

    // Get main task
    const mainTask = await Task.findById(mainTaskId).populate('project');
    if (!mainTask) {
      return res.status(404).json({
        success: false,
        message: 'Main task not found'
      });
    }

    // Verify user is team leader of the project
    if (mainTask.project.teamLeader.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as team leader for this project'
      });
    }

    // Check if Team Leader subtask creation is enabled by PM
    if (mainTask.project.settings && mainTask.project.settings.allowTeamLeaderSubtasks === false) {
      return res.status(403).json({
        success: false,
        message: 'Subtask creation is disabled by Project Manager',
        code: 'SUBTASK_CREATION_DISABLED'
      });
    }

    // Create subtasks
    const createdSubtasks = [];
    for (const subtaskData of subtasks) {
      const subtask = new Task({
        title: subtaskData.title,
        description: subtaskData.description || '',
        organization: mainTask.organization,
        project: mainTask.project._id,
        assignee: subtaskData.assignee || null,
        reporter: userId,
        status: 'todo',
        priority: subtaskData.priority || mainTask.priority,
        type: 'subtask',
        isSubtask: true,
        mainTask: mainTaskId,
        parentTask: mainTaskId,
        storyPoints: subtaskData.storyPoints || 0,
        estimatedHours: subtaskData.estimatedHours || 0,
        requiredSpecialization: subtaskData.requiredSpecialization || 'any',
        timeTracking: {
          estimatedHours: subtaskData.estimatedHours || 0,
          loggedHours: 0,
          logs: []
        }
      });

      await subtask.save();
      createdSubtasks.push(subtask);

      // Add to main task's subtasks array
      mainTask.subtasks.push(subtask._id);

      // Send notification to assignee if assigned
      if (subtask.assignee) {
        // TODO: Send notification
      }
    }

    // Update main task
    await mainTask.save();

    // Populate created subtasks
    await Task.populate(createdSubtasks, {
      path: 'assignee',
      select: 'firstName lastName avatar specialization'
    });

    res.status(201).json({
      success: true,
      message: `${createdSubtasks.length} subtasks created successfully`,
      data: {
        mainTask,
        subtasks: createdSubtasks
      }
    });
  } catch (error) {
    console.error('Create subtasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update subtask
// @route   PUT /api/team-leader/subtasks/:subtaskId
// @access  Private (Team Leader)
exports.updateSubtask = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const subtask = await Task.findById(subtaskId).populate('project');
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found'
      });
    }

    // Verify user is team leader of the project
    if (subtask.project.teamLeader.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as team leader for this project'
      });
    }

    // Update allowed fields
    const allowedFields = ['title', 'description', 'assignee', 'status', 'priority', 'storyPoints', 'estimatedHours', 'dueDate'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        subtask[field] = updateData[field];
      }
    });

    await subtask.save();

    await subtask.populate('assignee', 'firstName lastName avatar specialization');

    res.json({
      success: true,
      message: 'Subtask updated successfully',
      data: { subtask }
    });
  } catch (error) {
    console.error('Update subtask error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Assign subtask to team member
// @route   POST /api/team-leader/assign-subtask
// @access  Private (Team Leader)
exports.assignSubtask = async (req, res) => {
  try {
    const { subtaskId, userId: assigneeId } = req.body;
    const userId = req.user.id;

    const subtask = await Task.findById(subtaskId).populate('project');
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found'
      });
    }

    // Verify user is team leader
    if (subtask.project.teamLeader.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as team leader for this project'
      });
    }

    // Verify assignee is team member
    const isMember = subtask.project.members.some(
      m => m.user.toString() === assigneeId.toString()
    );

    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: 'User is not a member of this project'
      });
    }

    subtask.assignee = assigneeId;
    await subtask.save();

    await subtask.populate('assignee', 'firstName lastName avatar specialization');

    // TODO: Send notification to assignee

    res.json({
      success: true,
      message: 'Subtask assigned successfully',
      data: { subtask }
    });
  } catch (error) {
    console.error('Assign subtask error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get team performance metrics
// @route   GET /api/team-leader/team-performance
// @access  Private (Team Leader)
exports.getTeamPerformance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId } = req.query;

    let projectFilter = { teamLeader: userId, isArchived: false };
    if (projectId) {
      projectFilter._id = projectId;
    }

    const projects = await Project.find(projectFilter)
      .populate('members.user', 'firstName lastName specialization avatar');

    const teamMembers = [];
    const memberIds = new Set();

    projects.forEach(project => {
      project.members.forEach(member => {
        const memberId = member.user._id.toString();
        if (!memberIds.has(memberId)) {
          memberIds.add(memberId);
          teamMembers.push(member.user);
        }
      });
    });

    // Get task statistics for each member
    const memberStats = await Promise.all(
      Array.from(memberIds).map(async (memberId) => {
        const projectIds = projects.map(p => p._id);
        
        const tasks = await Task.find({
          project: { $in: projectIds },
          assignee: memberId
        });

        const completedTasks = tasks.filter(t => t.status === 'completed');
        const totalHours = tasks.reduce((sum, t) => sum + (t.timeTracking?.loggedHours || 0), 0);

        return {
          user: teamMembers.find(u => u._id.toString() === memberId),
          totalTasks: tasks.length,
          completedTasks: completedTasks.length,
          inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
          totalHours,
          completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length * 100).toFixed(1) : 0
        };
      })
    );

    res.json({
      success: true,
      data: {
        projects,
        teamSize: memberIds.size,
        memberStats
      }
    });
  } catch (error) {
    console.error('Team performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get project members (read-only for TL)
// @route   GET /api/team-leader/projects/:projectId/members
// @access  Private (Team Leader/Member)
exports.getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log(`📋 Team Leader ${userId} fetching members for project ${projectId}`);

    // Get project and verify user is team leader or member
    const project = await Project.findById(projectId)
      .populate('teamLeader', 'firstName lastName email specialization')
      .populate('members.user', 'firstName lastName email specialization')
      .populate('manager', 'firstName lastName email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Verify user has access (is TL or member of this project)
    const isTeamLeader = project.teamLeader && project.teamLeader._id.toString() === userId.toString();
    const isMember = project.members.some(m => m.user._id.toString() === userId.toString());

    if (!isTeamLeader && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this project'
      });
    }

    // Get task counts for each member
    const membersWithStats = await Promise.all(
      project.members.map(async (member) => {
        const taskCount = await Task.countDocuments({
          project: projectId,
          assignee: member.user._id
        });

        const completedTasks = await Task.countDocuments({
          project: projectId,
          assignee: member.user._id,
          status: 'completed'
        });

        return {
          ...member.user.toObject(),
          role: member.role,
          joinedAt: member.joinedAt,
          taskStats: {
            total: taskCount,
            completed: completedTasks,
            completion: taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0
          }
        };
      })
    );

    // Include team leader in the response
    let teamLeaderStats = null;
    if (project.teamLeader) {
      const tlTaskCount = await Task.countDocuments({
        project: projectId,
        assignee: project.teamLeader._id
      });

      const tlCompletedTasks = await Task.countDocuments({
        project: projectId,
        assignee: project.teamLeader._id,
        status: 'completed'
      });

      teamLeaderStats = {
        ...project.teamLeader.toObject(),
        role: 'Team Leader',
        taskStats: {
          total: tlTaskCount,
          completed: tlCompletedTasks,
          completion: tlTaskCount > 0 ? Math.round((tlCompletedTasks / tlTaskCount) * 100) : 0
        }
      };
    }

    res.json({
      success: true,
      data: {
        projectName: project.name,
        projectManager: project.manager,
        teamLeader: teamLeaderStats,
        members: membersWithStats,
        stats: {
          totalMembers: project.members.length + (project.teamLeader ? 1 : 0),
          regularMembers: project.members.length
        }
      }
    });

  } catch (error) {
    console.error('Get project members error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = exports;

