const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const mongoose = require('mongoose');

/**
 * PM Controller
 * Handles all Project Manager specific operations
 */

// Get PM Dashboard Overview
exports.getPMDashboard = async (req, res) => {
  try {
    const pmId = req.user._id;
    const orgId = req.user.organization;

    // Get PM's projects with detailed info
    const projects = await Project.find({
      manager: pmId,
      organization: orgId
    })
      .populate('client', 'firstName lastName email')
      .populate('teamLeader', 'firstName lastName')
      .populate('members.user', 'firstName lastName email')
      .sort({ updatedAt: -1 })
      .limit(10);

    // Calculate project statistics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => 
      ['planning', 'in-progress'].includes(p.status)
    ).length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;

    // Get tasks requiring PM attention
    const projectIds = projects.map(p => p._id);
    const criticalTasks = await Task.find({
      project: { $in: projectIds },
      organization: orgId,
      $or: [
        { status: 'blocked' },
        { priority: 'urgent' },
        { dueDate: { $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) } } // Due in 3 days
      ]
    })
      .populate('assignee', 'firstName lastName')
      .populate('project', 'name')
      .limit(10)
      .sort({ priority: -1, dueDate: 1 });

    // Get team members across all PM's projects
    const teamMemberIds = new Set();
    projects.forEach(project => {
      if (project.teamLeader) teamMemberIds.add(project.teamLeader._id.toString());
      project.members?.forEach(member => {
        if (member.user) teamMemberIds.add(member.user._id.toString());
      });
    });

    const teamSize = teamMemberIds.size;

    // Get PM capacity info
    const pmUser = await User.findById(pmId).select('capacity firstName lastName');
    const capacityUsage = (activeProjects / (pmUser.capacity?.maxProjects || 10)) * 100;

    // Calculate budget summary
    let totalBudget = 0;
    let spentBudget = 0;
    projects.forEach(project => {
      totalBudget += project.budget?.estimated || 0;
      spentBudget += project.budget?.spent || 0;
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalProjects,
          activeProjects,
          completedProjects,
          teamSize,
          capacityUsage: Math.round(capacityUsage),
          maxProjects: pmUser.capacity?.maxProjects || 10
        },
        recentProjects: projects.slice(0, 6),
        criticalTasks,
        budget: {
          total: totalBudget,
          spent: spentBudget,
          remaining: totalBudget - spentBudget,
          percentageUsed: totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0
        },
        pm: {
          name: `${pmUser.firstName} ${pmUser.lastName}`,
          capacity: pmUser.capacity
        }
      }
    });

  } catch (error) {
    console.error('Get PM dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch PM dashboard',
      error: error.message
    });
  }
};

// Get PM's Projects
exports.getPMProjects = async (req, res) => {
  try {
    const pmId = req.user._id;
    const orgId = req.user.organization;
    const { status, priority, search, page = 1, limit = 20 } = req.query;

    console.log('🔍 PM Projects Query:', { pmId: pmId.toString(), orgId: orgId.toString() });

    // Build query
    let query = {
      manager: pmId,
      organization: orgId
    };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get projects with pagination
    const projects = await Project.find(query)
      .populate('client', 'firstName lastName email')
      .populate('teamLeader', 'firstName lastName email')
      .populate('members.user', 'firstName lastName email role')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    console.log('✅ Found projects:', projects.length);
    
    // DEBUG: Check all projects in DB for this org
    const allOrgProjects = await Project.find({ organization: orgId }).select('_id name manager');
    console.log('📊 All org projects:', allOrgProjects.map(p => ({
      id: p._id.toString(),
      name: p.name,
      manager: p.manager.toString()
    })));

    const total = await Project.countDocuments(query);

    // Get task counts for each project
    const projectsWithTasks = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ project: project._id });
        const completedTasks = await Task.countDocuments({ 
          project: project._id, 
          status: 'completed' 
        });

        return {
          ...project.toObject(),
          taskStats: {
            total: taskCount,
            completed: completedTasks,
            completion: taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0
          }
        };
      })
    );

    res.json({
      success: true,
      data: {
        projects: projectsWithTasks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get PM projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch PM projects',
      error: error.message
    });
  }
};

// Get PM's Team Members
exports.getPMTeam = async (req, res) => {
  try {
    const pmId = req.user._id;
    const orgId = req.user.organization;

    // Get all PM's projects
    const projects = await Project.find({
      manager: pmId,
      organization: orgId
    }).select('_id name members teamLeader');

    // Collect unique team member IDs
    const teamMemberIds = new Set();
    const memberProjects = new Map(); // Track which projects each member is on

    projects.forEach(project => {
      // Add team leader
      if (project.teamLeader) {
        const tlId = project.teamLeader.toString();
        teamMemberIds.add(tlId);
        if (!memberProjects.has(tlId)) {
          memberProjects.set(tlId, []);
        }
        memberProjects.get(tlId).push({
          _id: project._id,
          name: project.name
        });
      }

      // Add team members
      project.members?.forEach(member => {
        if (member.user) {
          const memberId = member.user.toString();
          teamMemberIds.add(memberId);
          if (!memberProjects.has(memberId)) {
            memberProjects.set(memberId, []);
          }
          memberProjects.get(memberId).push({
            _id: project._id,
            name: project.name
          });
        }
      });
    });

    // Get detailed user information
    const teamMembers = await User.find({
      _id: { $in: Array.from(teamMemberIds) }
    }).select('firstName lastName email role skills capacity isActive');

    // Enhance team members with project info
    const enhancedTeamMembers = teamMembers.map(member => {
      const memberProj = memberProjects.get(member._id.toString()) || [];
      return {
        ...member.toObject(),
        projects: memberProj,
        projectCount: memberProj.length,
        workloadPercentage: Math.round((memberProj.length / (member.capacity?.maxProjects || 4)) * 100)
      };
    });

    // Sort by project count (descending)
    enhancedTeamMembers.sort((a, b) => b.projectCount - a.projectCount);

    res.json({
      success: true,
      data: {
        teamMembers: enhancedTeamMembers,
        stats: {
          totalMembers: enhancedTeamMembers.length,
          activeMembers: enhancedTeamMembers.filter(m => m.isActive).length,
          totalProjects: projects.length,
          averageWorkload: enhancedTeamMembers.length > 0
            ? Math.round(enhancedTeamMembers.reduce((sum, m) => sum + m.workloadPercentage, 0) / enhancedTeamMembers.length)
            : 0
        }
      }
    });

  } catch (error) {
    console.error('Get PM team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch PM team',
      error: error.message
    });
  }
};

// Get PM Analytics
exports.getPMAnalytics = async (req, res) => {
  try {
    const pmId = req.user._id;
    const orgId = req.user.organization;
    const { timeRange = '30' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    // Get all PM's projects
    const projects = await Project.find({
      manager: pmId,
      organization: orgId
    });

    const projectIds = projects.map(p => p._id);

    // Project completion rate over time
    const completedProjects = await Project.aggregate([
      {
        $match: {
          manager: mongoose.Types.ObjectId(pmId),
          status: 'completed',
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Budget vs Actual analysis
    const budgetAnalysis = projects.map(project => ({
      projectName: project.name,
      estimated: project.budget?.estimated || 0,
      spent: project.budget?.spent || 0,
      variance: (project.budget?.estimated || 0) - (project.budget?.spent || 0)
    }));

    // Task completion metrics
    const taskMetrics = await Task.aggregate([
      {
        $match: {
          project: { $in: projectIds },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Team velocity (tasks completed per week)
    const weeklyVelocity = await Task.aggregate([
      {
        $match: {
          project: { $in: projectIds },
          status: 'completed',
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $week: '$completedAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        projectCompletion: completedProjects,
        budgetAnalysis,
        taskMetrics,
        weeklyVelocity,
        summary: {
          totalProjects: projects.length,
          completedProjects: projects.filter(p => p.status === 'completed').length,
          activeProjects: projects.filter(p => ['planning', 'in-progress'].includes(p.status)).length,
          totalBudget: budgetAnalysis.reduce((sum, p) => sum + p.estimated, 0),
          totalSpent: budgetAnalysis.reduce((sum, p) => sum + p.spent, 0),
          averageCompletion: projects.length > 0
            ? Math.round((projects.filter(p => p.status === 'completed').length / projects.length) * 100)
            : 0
        }
      }
    });

  } catch (error) {
    console.error('Get PM analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch PM analytics',
      error: error.message
    });
  }
};

// Check PM Capacity
exports.checkPMCapacity = async (req, res) => {
  try {
    const pmId = req.user._id;
    const orgId = req.user.organization;

    const pm = await User.findById(pmId).select('capacity firstName lastName');
    const activeProjectsCount = await Project.countDocuments({
      manager: pmId,
      organization: orgId,
      status: { $in: ['planning', 'in-progress'] }
    });

    const maxProjects = pm.capacity?.maxProjects || 10;
    const availableSlots = maxProjects - activeProjectsCount;
    const canTakeMore = availableSlots > 0;

    res.json({
      success: true,
      data: {
        pm: {
          name: `${pm.firstName} ${pm.lastName}`,
          maxProjects,
          activeProjects: activeProjectsCount,
          availableSlots,
          canTakeMore,
          utilizationPercentage: Math.round((activeProjectsCount / maxProjects) * 100)
        }
      }
    });

  } catch (error) {
    console.error('Check PM capacity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check PM capacity',
      error: error.message
    });
  }
};

// Get available team leaders
exports.getAvailableTeamLeaders = async (req, res) => {
  try {
    const orgId = req.user.organization;

    console.log('🔍 Fetching team leaders for org:', orgId);

    // Find users with member or team_leader role who have capacity
    // Removed status check - accept all statuses
    const users = await User.find({
      organization: orgId,
      role: { $in: ['member', 'team_leader'] },
      _id: { $ne: req.user._id } // Exclude current PM
    })
      .select('firstName lastName email specialization role status')
      .lean();

    console.log(`📊 Found ${users.length} users with member/team_leader role:`);
    users.forEach(u => {
      console.log(`   - ${u.firstName} ${u.lastName}: role="${u.role}", status="${u.status}"`);
    });

    // Count current projects for each user
    const usersWithCapacity = await Promise.all(
      users.map(async (user) => {
        const projectCount = await Project.countDocuments({
          $or: [
            { teamLeader: user._id },
            { 'members.user': user._id }
          ],
          status: { $in: ['planning', 'in-progress', 'on-hold'] }
        });

        const teamLeaderCount = await Project.countDocuments({
          teamLeader: user._id,
          status: { $in: ['planning', 'in-progress', 'on-hold'] }
        });

        return {
          ...user,
          currentProjects: projectCount,
          currentTeamLeaderProjects: teamLeaderCount,
          hasTeamLeaderCapacity: teamLeaderCount < 1
        };
      })
    );

    // Filter users who can be team leaders (haven't reached team leader limit)
    const availableTeamLeaders = usersWithCapacity.filter(
      user => user.hasTeamLeaderCapacity && user.currentProjects < 5
    );

    console.log(`✅ After filtering: ${availableTeamLeaders.length} available team leaders`);

    res.json({
      success: true,
      users: availableTeamLeaders
    });

  } catch (error) {
    console.error('❌ Get available team leaders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available team leaders',
      error: error.message
    });
  }
};

// Get available members
exports.getAvailableMembers = async (req, res) => {
  try {
    const orgId = req.user.organization;

    console.log('🔍 Fetching members for org:', orgId);

    // Find all members and team leaders
    // Removed status check - accept all statuses
    const users = await User.find({
      organization: orgId,
      role: { $in: ['member', 'team_leader'] },
      _id: { $ne: req.user._id } // Exclude current PM
    })
      .select('firstName lastName email specialization role status')
      .lean();

    console.log(`📊 Found ${users.length} members with member/team_leader role:`);
    users.forEach(u => {
      console.log(`   - ${u.firstName} ${u.lastName}: role="${u.role}", status="${u.status}"`);
    });

    // Count current projects for each user
    const usersWithProjectCount = await Promise.all(
      users.map(async (user) => {
        const projectCount = await Project.countDocuments({
          $or: [
            { teamLeader: user._id },
            { 'members.user': user._id }
          ],
          status: { $in: ['planning', 'in-progress', 'on-hold'] }
        });

        return {
          ...user,
          currentProjects: projectCount
        };
      })
    );

    console.log(`✅ Returning ${usersWithProjectCount.length} members with project counts`);

    // Format response with capacity info
    const formattedUsers = usersWithProjectCount.map(user => ({
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      specialization: user.specialization || 'general',
      role: user.role,
      status: user.status,
      capacity: {
        currentProjects: user.currentProjects,
        maxProjects: user.role === 'team_leader' ? 5 : 5,
        maxTeamLeaderProjects: 1
      }
    }));

    res.json({
      success: true,
      data: formattedUsers
    });

  } catch (error) {
    console.error('❌ Get available members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available members',
      error: error.message
    });
  }
};

// Create new project
exports.createProject = async (req, res) => {
  try {
    const pmId = req.user._id;
    const orgId = req.user.organization;
    const {
      name,
      description,
      startDate,
      endDate,
      status,
      priority,
      weight,
      budget,
      teamLeader,
      teamMembers
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    // Calculate complexity based on weight
    let complexity = 'medium';
    if (weight <= 3) complexity = 'light';
    else if (weight <= 7) complexity = 'medium';
    else complexity = 'heavy';

    // Prepare members array
    const members = teamMembers ? teamMembers.map(memberId => ({
      user: memberId,
      role: 'member',
      joinedAt: new Date()
    })) : [];

    // Create project
    const project = new Project({
      name,
      description,
      manager: pmId,
      organization: orgId,
      startDate,
      endDate,
      status: status || 'planning',
      priority: priority || 'medium',
      weight: weight || 5,
      complexity,
      budget: {
        planned: budget?.planned || 0,
        spent: 0,
        currency: budget?.currency || 'USD',
        alertThreshold: budget?.alertThreshold || 80
      },
      teamLeader: teamLeader || null,
      members
    });

    await project.save();

    // Populate for response
    await project.populate([
      { path: 'manager', select: 'firstName lastName email' },
      { path: 'teamLeader', select: 'firstName lastName email specialization' },
      { path: 'members.user', select: 'firstName lastName email specialization' }
    ]);

    // Emit socket event for real-time updates
    const io = req.app.locals.io;
    if (io) {
      // Emit to organization room
      io.to(`org-${orgId}`).emit('project:created', {
        project: project.toObject(),
        createdBy: {
          id: pmId,
          name: `${req.user.firstName} ${req.user.lastName}`
        },
        timestamp: new Date()
      });

      console.log(`📡 Socket event emitted: project:created for project ${project.name} to org-${orgId}`);
    }

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
};

// Get project by ID
exports.getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const pmId = req.user._id;

    const project = await Project.findOne({
      _id: projectId,
      manager: pmId
    })
      .populate('manager', 'firstName lastName email')
      .populate('teamLeader', 'firstName lastName email specialization')
      .populate('members.user', 'firstName lastName email specialization')
      .populate('client', 'firstName lastName email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      project
    });

  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message
    });
  }
};

// Get project tasks
exports.getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const pmId = req.user._id;

    // Verify PM owns this project
    const project = await Project.findOne({
      _id: projectId,
      manager: pmId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get all tasks for the project
    const tasks = await Task.find({
      project: projectId
    })
      .populate('assignee', 'firstName lastName email specialization')
      .populate('mainTask', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tasks
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

// Delete project
// Update project
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const pmId = req.user._id;
    const updates = req.body;

    // Find the project and verify PM owns it
    const project = await Project.findOne({
      _id: projectId,
      manager: pmId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to update it'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'name',
      'description',
      'startDate',
      'endDate',
      'status',
      'priority',
      'weight',
      'budget'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'budget' && typeof updates.budget === 'object') {
          // Merge budget fields
          project.budget = {
            ...project.budget,
            ...updates.budget
          };
        } else {
          project[field] = updates[field];
        }
      }
    });

    // Calculate complexity based on weight if weight was updated
    if (updates.weight !== undefined) {
      if (updates.weight <= 3) {
        project.complexity = 'light';
      } else if (updates.weight <= 7) {
        project.complexity = 'medium';
      } else {
        project.complexity = 'heavy';
      }
    }

    await project.save();

    console.log(`✅ Project updated: ${project.name} (${projectId})`);

    // Emit socket event for real-time updates
    if (req.app.locals.io) {
      req.app.locals.io.to(`org:${project.organization}`).emit('project:updated', {
        projectId: project._id,
        project: project,
        organizationId: project.organization
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    console.error('❌ Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const pmId = req.user._id;

    // Find the project and verify PM owns it
    const project = await Project.findOne({
      _id: projectId,
      manager: pmId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to delete it'
      });
    }

    // Store project details before deletion
    const projectName = project.name;
    const orgId = project.organization;

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: projectId });

    // Delete the project
    await Project.findByIdAndDelete(projectId);

    console.log(`✅ Project deleted: ${projectName} (${projectId})`);

    // Emit socket event for real-time updates
    const io = req.app.locals.io;
    if (io) {
      // Emit to organization room
      io.to(`org-${orgId}`).emit('project:deleted', {
        projectId,
        projectName,
        deletedBy: {
          id: pmId,
          name: `${req.user.firstName} ${req.user.lastName}`
        },
        timestamp: new Date()
      });

      console.log(`📡 Socket event emitted: project:deleted for project ${projectName} to org-${orgId}`);
    }

    res.json({
      success: true,
      message: 'Project and all associated tasks deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
};

// Debug endpoint - Get all users in organization to diagnose issues
exports.debugUsers = async (req, res) => {
  try {
    const orgId = req.user.organization;

    console.log('🔍 DEBUG: Fetching ALL users for organization:', orgId);
    console.log('🔍 DEBUG: Current PM:', { id: req.user._id, role: req.user.role });

    // Get ALL users in the organization
    const allUsers = await User.find({
      organization: orgId
    })
      .select('firstName lastName email role status specialization')
      .lean();

    console.log('📊 DEBUG: Total users in organization:', allUsers.length);
    console.log('📊 DEBUG: Users breakdown:');
    allUsers.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName}: role="${user.role}", status="${user.status}"`);
    });

    // Filter by role
    const teamLeaders = allUsers.filter(u => u.role === 'team_leader');
    const members = allUsers.filter(u => u.role === 'member');
    const activeTeamLeaders = allUsers.filter(u => u.role === 'team_leader' && u.status === 'active');
    const activeMembers = allUsers.filter(u => u.role === 'member' && u.status === 'active');

    console.log('📊 DEBUG: Team Leaders (all):', teamLeaders.length);
    console.log('📊 DEBUG: Members (all):', members.length);
    console.log('📊 DEBUG: Active Team Leaders:', activeTeamLeaders.length);
    console.log('📊 DEBUG: Active Members:', activeMembers.length);

    res.json({
      success: true,
      debug: {
        currentPM: { id: req.user._id, role: req.user.role },
        organizationId: orgId,
        totalUsers: allUsers.length,
        breakdown: {
          teamLeaders: teamLeaders.length,
          members: members.length,
          activeTeamLeaders: activeTeamLeaders.length,
          activeMembers: activeMembers.length
        },
        allUsers: allUsers.map(u => ({
          id: u._id,
          name: `${u.firstName} ${u.lastName}`,
          role: u.role,
          status: u.status,
          specialization: u.specialization
        }))
      }
    });

  } catch (error) {
    console.error('❌ Debug users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch debug info',
      error: error.message
    });
  }
};

// ============================================
// MEMBER MANAGEMENT ROUTES
// ============================================

// Add member to project
exports.addMemberToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, specialization } = req.body;
    const pmId = req.user._id;
    const orgId = req.user.organization;

    console.log(`📝 Adding member ${userId} to project ${projectId}`);

    // Validate project ownership
    const project = await Project.findOne({
      _id: projectId,
      manager: pmId,
      organization: orgId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to modify it'
      });
    }

    // Check if user exists and is in same organization
    const user = await User.findOne({
      _id: userId,
      organization: orgId,
      role: { $in: ['member', 'team_leader'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found or is not a valid team member'
      });
    }

    // Check if user is already in project
    const alreadyMember = project.members.some(
      m => m.user.toString() === userId.toString()
    );
    const isTeamLeader = project.teamLeader && project.teamLeader.toString() === userId.toString();

    if (alreadyMember || isTeamLeader) {
      return res.status(400).json({
        success: false,
        message: 'User is already part of this project'
      });
    }

    // Check user capacity (max 5 projects)
    const userProjectCount = await Project.countDocuments({
      $or: [
        { teamLeader: userId },
        { 'members.user': userId }
      ],
      status: { $in: ['planning', 'active', 'on_hold'] }
    });

    if (userProjectCount >= 5) {
      return res.status(400).json({
        success: false,
        message: 'User has reached maximum project capacity (5 projects)'
      });
    }

    // Add member to project
    project.members.push({
      user: userId,
      role: 'member',
      joinedAt: new Date()
    });

    // Update user's specialization if provided
    if (specialization && specialization !== 'general') {
      user.specialization = specialization;
      await user.save();
    }

    await project.save();

    // Populate the project for response
    await project.populate([
      { path: 'teamLeader', select: 'firstName lastName email specialization' },
      { path: 'members.user', select: 'firstName lastName email specialization' }
    ]);

    // Emit socket event
    const io = req.app.locals.io;
    if (io) {
      io.to(`org-${orgId}`).emit('member:added', {
        projectId,
        projectName: project.name,
        member: {
          id: userId,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          specialization: user.specialization
        },
        addedBy: {
          id: pmId,
          name: `${req.user.firstName} ${req.user.lastName}`
        },
        timestamp: new Date()
      });

      console.log(`📡 Socket event emitted: member:added to org-${orgId}`);
    }

    res.json({
      success: true,
      message: 'Member added to project successfully',
      project
    });

  } catch (error) {
    console.error('Add member to project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add member to project',
      error: error.message
    });
  }
};

// Remove member from project
exports.removeMemberFromProject = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const pmId = req.user._id;
    const orgId = req.user.organization;

    console.log(`🗑️ Removing member ${userId} from project ${projectId}`);

    // Validate project ownership
    const project = await Project.findOne({
      _id: projectId,
      manager: pmId,
      organization: orgId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to modify it'
      });
    }

    // Check if user is a member of this project
    const memberIndex = project.members.findIndex(
      m => m.user.toString() === userId.toString()
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User is not a member of this project'
      });
    }

    // Get user details for response
    const user = await User.findById(userId).select('firstName lastName email');

    // Remove member from project
    project.members.splice(memberIndex, 1);
    await project.save();

    // Reassign all tasks assigned to this user in this project to PM
    const tasksToReassign = await Task.find({
      project: projectId,
      assignee: userId
    });

    if (tasksToReassign.length > 0) {
      await Task.updateMany(
        { project: projectId, assignee: userId },
        { $set: { assignee: pmId } }
      );

      console.log(`✅ Reassigned ${tasksToReassign.length} tasks to PM`);
    }

    // Populate for response
    await project.populate([
      { path: 'teamLeader', select: 'firstName lastName email specialization' },
      { path: 'members.user', select: 'firstName lastName email specialization' }
    ]);

    // Emit socket event
    const io = req.app.locals.io;
    if (io) {
      io.to(`org-${orgId}`).emit('member:removed', {
        projectId,
        projectName: project.name,
        member: {
          id: userId,
          name: user ? `${user.firstName} ${user.lastName}` : 'Unknown'
        },
        tasksReassigned: tasksToReassign.length,
        removedBy: {
          id: pmId,
          name: `${req.user.firstName} ${req.user.lastName}`
        },
        timestamp: new Date()
      });

      console.log(`📡 Socket event emitted: member:removed to org-${orgId}`);
    }

    res.json({
      success: true,
      message: `Member removed successfully. ${tasksToReassign.length} tasks reassigned to you.`,
      project,
      tasksReassigned: tasksToReassign.length
    });

  } catch (error) {
    console.error('Remove member from project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove member from project',
      error: error.message
    });
  }
};

// Update Team Leader
exports.updateTeamLeader = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { teamLeaderId } = req.body;
    const pmId = req.user._id;
    const orgId = req.user.organization;

    console.log(`👤 Updating team leader for project ${projectId} to ${teamLeaderId}`);

    // Validate project ownership
    const project = await Project.findOne({
      _id: projectId,
      manager: pmId,
      organization: orgId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to modify it'
      });
    }

    // If removing team leader (set to null)
    if (!teamLeaderId) {
      const oldTeamLeader = project.teamLeader;
      project.teamLeader = null;
      await project.save();

      await project.populate([
        { path: 'teamLeader', select: 'firstName lastName email specialization' },
        { path: 'members.user', select: 'firstName lastName email specialization' }
      ]);

      // Emit socket event
      const io = req.app.locals.io;
      if (io) {
        io.to(`org-${orgId}`).emit('teamLeader:changed', {
          projectId,
          projectName: project.name,
          oldTeamLeader: oldTeamLeader ? oldTeamLeader.toString() : null,
          newTeamLeader: null,
          changedBy: {
            id: pmId,
            name: `${req.user.firstName} ${req.user.lastName}`
          },
          timestamp: new Date()
        });
      }

      return res.json({
        success: true,
        message: 'Team leader removed from project',
        project
      });
    }

    // Validate new team leader
    const newTeamLeader = await User.findOne({
      _id: teamLeaderId,
      organization: orgId,
      role: { $in: ['member', 'team_leader'] }
    });

    if (!newTeamLeader) {
      return res.status(404).json({
        success: false,
        message: 'Team leader not found or is not a valid team member'
      });
    }

    // Check TL capacity (max 1 team leader project)
    const currentTLProjects = await Project.countDocuments({
      teamLeader: teamLeaderId,
      status: { $in: ['planning', 'active', 'on_hold'] },
      _id: { $ne: projectId } // Exclude current project
    });

    if (currentTLProjects >= 1) {
      return res.status(400).json({
        success: false,
        message: 'User is already a team leader in another project (max 1)'
      });
    }

    // Check total project capacity (max 5 projects)
    const totalProjects = await Project.countDocuments({
      $or: [
        { teamLeader: teamLeaderId },
        { 'members.user': teamLeaderId }
      ],
      status: { $in: ['planning', 'active', 'on_hold'] },
      _id: { $ne: projectId }
    });

    if (totalProjects >= 5) {
      return res.status(400).json({
        success: false,
        message: 'User has reached maximum project capacity (5 projects)'
      });
    }

    // Remove from members if they're currently a member
    project.members = project.members.filter(
      m => m.user.toString() !== teamLeaderId.toString()
    );

    const oldTeamLeader = project.teamLeader;
    project.teamLeader = teamLeaderId;
    await project.save();

    await project.populate([
      { path: 'teamLeader', select: 'firstName lastName email specialization' },
      { path: 'members.user', select: 'firstName lastName email specialization' }
    ]);

    // Emit socket event
    const io = req.app.locals.io;
    if (io) {
      io.to(`org-${orgId}`).emit('teamLeader:changed', {
        projectId,
        projectName: project.name,
        oldTeamLeader: oldTeamLeader ? oldTeamLeader.toString() : null,
        newTeamLeader: {
          id: teamLeaderId,
          name: `${newTeamLeader.firstName} ${newTeamLeader.lastName}`,
          email: newTeamLeader.email
        },
        changedBy: {
          id: pmId,
          name: `${req.user.firstName} ${req.user.lastName}`
        },
        timestamp: new Date()
      });

      console.log(`📡 Socket event emitted: teamLeader:changed to org-${orgId}`);
    }

    res.json({
      success: true,
      message: 'Team leader updated successfully',
      project
    });

  } catch (error) {
    console.error('Update team leader error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update team leader',
      error: error.message
    });
  }
};

// Update member specialization
exports.updateMemberSpecialization = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { specialization } = req.body;
    const pmId = req.user._id;
    const orgId = req.user.organization;

    console.log(`🎨 Updating specialization for user ${userId} in project ${projectId}`);

    // Validate project ownership
    const project = await Project.findOne({
      _id: projectId,
      manager: pmId,
      organization: orgId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to modify it'
      });
    }

    // Update user's global specialization
    const user = await User.findOne({
      _id: userId,
      organization: orgId
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.specialization = specialization || 'general';
    await user.save();

    // Populate for response
    await project.populate([
      { path: 'teamLeader', select: 'firstName lastName email specialization' },
      { path: 'members.user', select: 'firstName lastName email specialization' }
    ]);

    // Emit socket event
    const io = req.app.locals.io;
    if (io) {
      io.to(`org-${orgId}`).emit('member:specializationUpdated', {
        projectId,
        userId,
        specialization,
        updatedBy: {
          id: pmId,
          name: `${req.user.firstName} ${req.user.lastName}`
        },
        timestamp: new Date()
      });

      console.log(`📡 Socket event emitted: member:specializationUpdated to org-${orgId}`);
    }

    res.json({
      success: true,
      message: 'Member specialization updated successfully',
      project
    });

  } catch (error) {
    console.error('Update member specialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update member specialization',
      error: error.message
    });
  }
};

// Get all members across PM's projects
exports.getAllProjectMembers = async (req, res) => {
  try {
    const pmId = req.user._id;
    const orgId = req.user.organization;

    console.log(`📊 Fetching all members for PM ${pmId}`);

    // Get all PM's projects
    const projects = await Project.find({
      manager: pmId,
      organization: orgId
    })
      .populate('teamLeader', 'firstName lastName email specialization')
      .populate('members.user', 'firstName lastName email specialization')
      .select('_id name status teamLeader members');

    // Create a map of unique members
    const membersMap = new Map();

    projects.forEach(project => {
      // Add team leader
      if (project.teamLeader) {
        const tlId = project.teamLeader._id.toString();
        if (!membersMap.has(tlId)) {
          membersMap.set(tlId, {
            ...project.teamLeader.toObject(),
            projects: [],
            projectCount: 0,
            isTeamLeaderIn: []
          });
        }
        membersMap.get(tlId).projects.push({
          _id: project._id,
          name: project.name,
          status: project.status,
          role: 'Team Leader'
        });
        membersMap.get(tlId).isTeamLeaderIn.push(project._id);
        membersMap.get(tlId).projectCount++;
      }

      // Add members
      project.members.forEach(member => {
        if (member.user) {
          const memberId = member.user._id.toString();
          if (!membersMap.has(memberId)) {
            membersMap.set(memberId, {
              ...member.user.toObject(),
              projects: [],
              projectCount: 0,
              isTeamLeaderIn: []
            });
          }
          membersMap.get(memberId).projects.push({
            _id: project._id,
            name: project.name,
            status: project.status,
            role: 'Member'
          });
          membersMap.get(memberId).projectCount++;
        }
      });
    });

    // Convert map to array and add capacity info
    const members = Array.from(membersMap.values()).map(member => ({
      ...member,
      capacity: {
        current: member.projectCount,
        max: 5,
        percentage: Math.round((member.projectCount / 5) * 100)
      },
      teamLeaderProjectCount: member.isTeamLeaderIn.length
    }));

    // Sort by project count (descending)
    members.sort((a, b) => b.projectCount - a.projectCount);

    res.json({
      success: true,
      data: {
        members,
        stats: {
          totalMembers: members.length,
          totalProjects: projects.length,
          averageProjectsPerMember: members.length > 0
            ? (members.reduce((sum, m) => sum + m.projectCount, 0) / members.length).toFixed(1)
            : 0
        }
      }
    });

  } catch (error) {
    console.error('Get all project members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project members',
      error: error.message
    });
  }
};

// ============================================
// TASK MANAGEMENT METHODS
// ============================================

/**
 * Create Task - PM creates main tasks for a project
 * POST /api/pm/projects/:projectId/tasks
 */
exports.createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { 
      title, 
      description, 
      assignee, 
      priority = 'medium', 
      storyPoints = 0,
      estimatedHours = 0,
      dependencies = [],
      dueDate,
      requiredSpecialization = 'any'
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    // Verify project exists and PM owns it
    const project = await Project.findOne({
      _id: projectId,
      manager: req.user._id,
      organization: req.user.organization
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission'
      });
    }

    // If assignee provided, verify they're in the project
    if (assignee) {
      const isTeamLeader = project.teamLeader && project.teamLeader.toString() === assignee;
      const isMember = project.members.some(m => m.user.toString() === assignee);
      
      if (!isTeamLeader && !isMember) {
        return res.status(400).json({
          success: false,
          message: 'Assignee must be a team member or team leader of this project'
        });
      }
    }

    // Validate dependencies exist in the same project
    if (dependencies && dependencies.length > 0) {
      const dependencyTasks = await Task.find({
        _id: { $in: dependencies },
        project: projectId
      });

      if (dependencyTasks.length !== dependencies.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more dependency tasks not found in this project'
        });
      }
    }

    // Determine initial blocking status
    let blockingStatus = 'not_blocked';
    if (dependencies && dependencies.length > 0) {
      const incompleteDeps = await Task.countDocuments({
        _id: { $in: dependencies },
        status: { $nin: ['completed', 'cancelled'] }
      });
      
      if (incompleteDeps > 0) {
        blockingStatus = 'blocked';
      }
    }

    // Create task
    const task = new Task({
      title,
      description: description || '',
      organization: req.user.organization,
      project: projectId,
      assignee: assignee || null,
      reporter: req.user._id,
      status: 'todo',
      priority,
      storyPoints,
      isSubtask: false,
      dependencies: dependencies || [],
      blockingStatus,
      dueDate: dueDate || null,
      requiredSpecialization,
      timeTracking: {
        estimatedHours,
        loggedHours: 0
      }
    });

    await task.save();

    // Update blockedBy arrays for dependency tasks
    if (dependencies && dependencies.length > 0) {
      await Task.updateMany(
        { _id: { $in: dependencies } },
        { $addToSet: { blockedBy: task._id } }
      );
    }

    // Populate task data
    await task.populate([
      { path: 'assignee', select: 'firstName lastName email' },
      { path: 'reporter', select: 'firstName lastName email' },
      { path: 'project', select: 'name' }
    ]);

    // Emit socket event
    const io = req.app.locals.io;
    if (io) {
      io.to(`org:${req.user.organization}`).emit('task:created', {
        task,
        projectId,
        organizationId: req.user.organization
      });
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });

  } catch (error) {
    console.error('❌ Create task error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Request body:', req.body);
    console.error('❌ Project ID:', req.params.projectId);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message,
      details: error.toString()
    });
  }
};

/**
 * Update Task - PM can update any task in their projects
 * PUT /api/pm/tasks/:taskId
 */
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;

    // Find task and verify PM owns the project
    const task = await Task.findById(taskId).populate('project');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify PM owns the project
    if (task.project.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this task'
      });
    }

    // Allowed update fields
    const allowedUpdates = [
      'title', 'description', 'status', 'priority', 'assignee', 
      'storyPoints', 'dueDate', 'requiredSpecialization'
    ];

    // Apply updates
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        task[field] = updates[field];
      }
    });

    // Update estimated hours if provided
    if (updates.estimatedHours !== undefined) {
      task.timeTracking.estimatedHours = updates.estimatedHours;
    }

    // Recalculate blocking status based on dependencies
    if (task.dependencies && task.dependencies.length > 0) {
      const incompleteDeps = await Task.countDocuments({
        _id: { $in: task.dependencies },
        status: { $nin: ['completed', 'cancelled'] }
      });
      
      task.blockingStatus = incompleteDeps > 0 ? 'blocked' : 'not_blocked';
    }

    // If task is completed, update blockedBy tasks
    if (updates.status === 'completed' && task.blockedBy && task.blockedBy.length > 0) {
      // Check if all dependencies are complete for blocked tasks
      for (const blockedTaskId of task.blockedBy) {
        const blockedTask = await Task.findById(blockedTaskId);
        if (blockedTask && blockedTask.dependencies) {
          const incompleteDeps = await Task.countDocuments({
            _id: { $in: blockedTask.dependencies },
            status: { $nin: ['completed', 'cancelled'] }
          });
          
          blockedTask.blockingStatus = incompleteDeps > 0 ? 'waiting' : 'not_blocked';
          await blockedTask.save();
        }
      }
    }

    await task.save();

    // Populate for response
    await task.populate([
      { path: 'assignee', select: 'firstName lastName email avatar' },
      { path: 'reporter', select: 'firstName lastName email' },
      { path: 'project', select: 'name' }
    ]);

    // Emit socket event
    const io = req.app.locals.io;
    if (io) {
      io.to(`org-${req.user.organization}`).emit('task:updated', {
        task,
        projectId: task.project._id
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

/**
 * Delete Task - PM can delete any task (cascade deletes subtasks)
 * DELETE /api/pm/tasks/:taskId
 */
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Find task and verify PM owns the project
    const task = await Task.findById(taskId).populate('project');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Verify PM owns the project
    if (task.project.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this task'
      });
    }

    const projectId = task.project._id;

    // If this is a main task with subtasks, delete all subtasks
    if (!task.isSubtask && task.subtasks && task.subtasks.length > 0) {
      await Task.deleteMany({ _id: { $in: task.subtasks } });
    }

    // If this is a subtask, remove from parent's subtasks array
    if (task.isSubtask && task.mainTask) {
      await Task.findByIdAndUpdate(task.mainTask, {
        $pull: { subtasks: taskId }
      });
    }

    // Remove from blockedBy arrays of tasks that this task depends on
    if (task.dependencies && task.dependencies.length > 0) {
      await Task.updateMany(
        { _id: { $in: task.dependencies } },
        { $pull: { blockedBy: taskId } }
      );
    }

    // Update tasks that were blocked by this task
    if (task.blockedBy && task.blockedBy.length > 0) {
      for (const blockedTaskId of task.blockedBy) {
        const blockedTask = await Task.findById(blockedTaskId);
        if (blockedTask) {
          // Remove from dependencies
          blockedTask.dependencies = blockedTask.dependencies.filter(
            dep => dep.toString() !== taskId.toString()
          );
          
          // Recalculate blocking status
          if (blockedTask.dependencies.length === 0) {
            blockedTask.blockingStatus = 'not_blocked';
          } else {
            const incompleteDeps = await Task.countDocuments({
              _id: { $in: blockedTask.dependencies },
              status: { $nin: ['completed', 'cancelled'] }
            });
            blockedTask.blockingStatus = incompleteDeps > 0 ? 'blocked' : 'not_blocked';
          }
          
          await blockedTask.save();
        }
      }
    }

    // Delete the task
    await Task.findByIdAndDelete(taskId);

    // Emit socket event
    const io = req.app.locals.io;
    if (io) {
      io.to(`org-${req.user.organization}`).emit('task:deleted', {
        taskId,
        projectId
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
      data: { taskId }
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

/**
 * Update Project Settings - PM toggles Team Leader subtask permissions
 * PUT /api/pm/projects/:projectId/settings
 */
exports.updateProjectSettings = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { allowTeamLeaderSubtasks } = req.body;

    // Find project and verify PM owns it
    const project = await Project.findOne({
      _id: projectId,
      manager: req.user._id,
      organization: req.user.organization
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission'
      });
    }

    // Update settings
    if (allowTeamLeaderSubtasks !== undefined) {
      project.settings.allowTeamLeaderSubtasks = allowTeamLeaderSubtasks;
    }

    await project.save();

    // Emit socket event
    const io = req.app.locals.io;
    if (io) {
      io.to(`org:${req.user.organization}`).emit('project:settingsUpdated', {
        projectId,
        settings: project.settings,
        organizationId: req.user.organization
      });
      io.to(`project:${projectId}`).emit('project:settingsUpdated', {
        projectId,
        settings: project.settings,
        organizationId: req.user.organization
      });
    }

    res.json({
      success: true,
      message: 'Project settings updated successfully',
      data: {
        projectId,
        settings: project.settings
      }
    });

  } catch (error) {
    console.error('Update project settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project settings',
      error: error.message
    });
  }
};

/**
 * Add Task Dependency - PM adds dependency between tasks
 * POST /api/pm/tasks/:taskId/dependencies
 */
exports.addTaskDependency = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { dependencyId } = req.body;

    if (!dependencyId) {
      return res.status(400).json({
        success: false,
        message: 'Dependency task ID is required'
      });
    }

    // Find both tasks
    const task = await Task.findById(taskId).populate('project');
    const dependencyTask = await Task.findById(dependencyId).populate('project');

    if (!task || !dependencyTask) {
      return res.status(404).json({
        success: false,
        message: 'One or both tasks not found'
      });
    }

    // Verify PM owns both projects
    if (task.project.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission for this task'
      });
    }

    // Verify both tasks are in the same project
    if (task.project._id.toString() !== dependencyTask.project._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Tasks must be in the same project'
      });
    }

    // Prevent self-dependency
    if (taskId === dependencyId) {
      return res.status(400).json({
        success: false,
        message: 'Task cannot depend on itself'
      });
    }

    // Check if dependency already exists
    if (task.dependencies.includes(dependencyId)) {
      return res.status(400).json({
        success: false,
        message: 'Dependency already exists'
      });
    }

    // Add dependency
    task.dependencies.push(dependencyId);
    dependencyTask.blockedBy.push(taskId);

    // Calculate blocking status
    if (dependencyTask.status !== 'completed' && dependencyTask.status !== 'cancelled') {
      task.blockingStatus = 'blocked';
    }

    await task.save();
    await dependencyTask.save();

    // Populate for response
    await task.populate([
      { path: 'dependencies', select: 'title status' },
      { path: 'assignee', select: 'firstName lastName' }
    ]);

    // Emit socket event
    const io = req.app.locals.io;
    if (io) {
      io.to(`org:${req.user.organization}`).emit('task:dependencyAdded', {
        taskId,
        dependencyId,
        projectId: task.project._id,
        organizationId: req.user.organization
      });
      io.to(`project:${task.project._id}`).emit('task:dependencyAdded', {
        taskId,
        dependencyId,
        projectId: task.project._id,
        organizationId: req.user.organization
      });
    }

    res.json({
      success: true,
      message: 'Dependency added successfully',
      data: { task }
    });

  } catch (error) {
    console.error('Add task dependency error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add task dependency',
      error: error.message
    });
  }
};

/**
 * Remove Task Dependency - PM removes dependency between tasks
 * DELETE /api/pm/tasks/:taskId/dependencies/:dependencyId
 */
exports.removeTaskDependency = async (req, res) => {
  try {
    const { taskId, dependencyId } = req.params;

    // Find both tasks
    const task = await Task.findById(taskId).populate('project');
    const dependencyTask = await Task.findById(dependencyId);

    if (!task || !dependencyTask) {
      return res.status(404).json({
        success: false,
        message: 'One or both tasks not found'
      });
    }

    // Verify PM owns the project
    if (task.project.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission for this task'
      });
    }

    // Remove dependency
    task.dependencies = task.dependencies.filter(
      dep => dep.toString() !== dependencyId.toString()
    );
    dependencyTask.blockedBy = dependencyTask.blockedBy.filter(
      blocked => blocked.toString() !== taskId.toString()
    );

    // Recalculate blocking status
    if (task.dependencies.length === 0) {
      task.blockingStatus = 'not_blocked';
    } else {
      const incompleteDeps = await Task.countDocuments({
        _id: { $in: task.dependencies },
        status: { $nin: ['completed', 'cancelled'] }
      });
      task.blockingStatus = incompleteDeps > 0 ? 'blocked' : 'not_blocked';
    }

    await task.save();
    await dependencyTask.save();

    // Populate for response
    await task.populate([
      { path: 'dependencies', select: 'title status' },
      { path: 'assignee', select: 'firstName lastName' }
    ]);

    // Emit socket event
    const io = req.app.locals.io;
    if (io) {
      io.to(`org:${req.user.organization}`).emit('task:dependencyRemoved', {
        taskId,
        dependencyId,
        projectId: task.project._id,
        organizationId: req.user.organization
      });
      io.to(`project:${task.project._id}`).emit('task:dependencyRemoved', {
        taskId,
        dependencyId,
        projectId: task.project._id,
        organizationId: req.user.organization
      });
    }

    res.json({
      success: true,
      message: 'Dependency removed successfully',
      data: { task }
    });

  } catch (error) {
    console.error('Remove task dependency error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove task dependency',
      error: error.message
    });
  }
};

