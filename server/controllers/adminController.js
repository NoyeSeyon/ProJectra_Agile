const User = require('../models/User');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const Organization = require('../models/Organization');

// Get organization users
exports.getOrganizationUsers = async (req, res) => {
  try {
    const { role, search, isActive } = req.query;
    const query = { 
      organization: req.user.organization,
      role: { $ne: 'super_admin' } // Exclude super admins
    };

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get organization users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organization users',
      error: error.message
    });
  }
};

// Assign user as Project Manager
exports.assignPM = async (req, res) => {
  try {
    const { userId, maxProjects = 10 } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check user exists and belongs to same organization
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({
        success: false,
        message: 'User does not belong to your organization'
      });
    }

    // Check if user is already a PM
    if (user.role === 'project_manager') {
      return res.status(400).json({
        success: false,
        message: 'User is already a Project Manager'
      });
    }

    // Update user role to PM
    user.role = 'project_manager';
    user.capacity.maxProjects = maxProjects;
    await user.save();

    // Create notification for the user
    await Notification.create({
      recipient: userId,
      organization: req.user.organization,
      type: 'team_invitation', // Using existing enum value
      title: 'Role Assignment',
      message: `You have been assigned as Project Manager by ${req.user.firstName} ${req.user.lastName}. You can now manage up to ${maxProjects} projects.`,
      data: {
        resource: {
          type: 'user',
          id: req.user._id,
          name: `${req.user.firstName} ${req.user.lastName}`
        },
        action: 'role_assignment',
        metadata: {
          newRole: 'project_manager',
          maxProjects: maxProjects
        }
      },
      priority: 'high'
    });

    res.json({
      success: true,
      message: 'User successfully assigned as Project Manager',
      data: user
    });
  } catch (error) {
    console.error('Assign PM error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign Project Manager',
      error: error.message
    });
  }
};

// Unassign PM role
exports.unassignPM = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({
        success: false,
        message: 'User does not belong to your organization'
      });
    }

    if (user.role !== 'project_manager') {
      return res.status(400).json({
        success: false,
        message: 'User is not a Project Manager'
      });
    }

    // Check if PM has active projects
    const activeProjectsCount = await Project.countDocuments({
      projectManager: userId,
      status: { $in: ['planning', 'in-progress'] }
    });

    if (activeProjectsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot remove PM role. User has ${activeProjectsCount} active project(s). Please reassign these projects first.`
      });
    }

    // Update user role back to member
    user.role = 'member';
    user.capacity.maxProjects = 4; // Reset to default
    await user.save();

    // Create notification
    await Notification.create({
      recipient: userId,
      organization: req.user.organization,
      type: 'team_left',
      title: 'Role Change',
      message: `Your Project Manager role has been removed by ${req.user.firstName} ${req.user.lastName}. You are now a team member.`,
      data: {
        resource: {
          type: 'user',
          id: req.user._id,
          name: `${req.user.firstName} ${req.user.lastName}`
        },
        action: 'role_removed',
        metadata: {
          previousRole: 'project_manager',
          newRole: 'member'
        }
      },
      priority: 'medium'
    });

    res.json({
      success: true,
      message: 'PM role removed successfully',
      data: user
    });
  } catch (error) {
    console.error('Unassign PM error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove PM role',
      error: error.message
    });
  }
};

// Get all Project Managers in organization
exports.getPMs = async (req, res) => {
  try {
    const pms = await User.find({
      organization: req.user.organization,
      role: 'project_manager',
      isActive: true
    }).select('-password');

    // Get project counts for each PM
    const pmsWithProjects = await Promise.all(
      pms.map(async (pm) => {
        const projectsCount = await Project.countDocuments({
          projectManager: pm._id
        });
        
        const activeProjectsCount = await Project.countDocuments({
          projectManager: pm._id,
          status: { $in: ['planning', 'in-progress'] }
        });

        return {
          ...pm.toObject(),
          projectsCount,
          activeProjectsCount,
          capacityUsage: (activeProjectsCount / pm.capacity.maxProjects) * 100
        };
      })
    );

    res.json({
      success: true,
      count: pmsWithProjects.length,
      data: pmsWithProjects
    });
  } catch (error) {
    console.error('Get PMs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Project Managers',
      error: error.message
    });
  }
};

// Update PM capacity
exports.updatePMCapacity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { maxProjects } = req.body;

    if (!maxProjects || maxProjects < 1 || maxProjects > 20) {
      return res.status(400).json({
        success: false,
        message: 'Max projects must be between 1 and 20'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({
        success: false,
        message: 'User does not belong to your organization'
      });
    }

    if (user.role !== 'project_manager') {
      return res.status(400).json({
        success: false,
        message: 'User is not a Project Manager'
      });
    }

    // Check if new capacity is less than current active projects
    const activeProjectsCount = await Project.countDocuments({
      projectManager: userId,
      status: { $in: ['planning', 'in-progress'] }
    });

    if (maxProjects < activeProjectsCount) {
      return res.status(400).json({
        success: false,
        message: `Cannot set capacity to ${maxProjects}. PM has ${activeProjectsCount} active projects.`
      });
    }

    user.capacity.maxProjects = maxProjects;
    await user.save();

    // Create notification
    await Notification.create({
      recipient: userId,
      organization: req.user.organization,
      type: 'system_update',
      title: 'Capacity Updated',
      message: `Your project capacity has been updated to ${maxProjects} projects by ${req.user.firstName} ${req.user.lastName}.`,
      data: {
        resource: {
          type: 'user',
          id: req.user._id,
          name: `${req.user.firstName} ${req.user.lastName}`
        },
        action: 'capacity_updated',
        metadata: {
          newMaxProjects: maxProjects
        }
      },
      priority: 'low'
    });

    res.json({
      success: true,
      message: 'PM capacity updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update PM capacity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update PM capacity',
      error: error.message
    });
  }
};

// Get PM's projects
exports.getPMProjects = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({
        success: false,
        message: 'User does not belong to your organization'
      });
    }

    const projects = await Project.find({ projectManager: userId })
      .populate('team.members', 'firstName lastName email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      data: projects
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

// Change user role
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ['member', 'team_leader', 'project_manager', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Valid roles: member, team_leader, project_manager, admin'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({
        success: false,
        message: 'User does not belong to your organization'
      });
    }

    // Prevent changing super_admin role
    if (user.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot change Super Admin role'
      });
    }

    const oldRole = user.role;
    user.role = role;
    
    // Set default capacity based on role
    if (role === 'project_manager') {
      user.capacity.maxProjects = user.capacity.maxProjects || 10;
    } else {
      user.capacity.maxProjects = 4;
    }

    await user.save();

    // Create notification
    await Notification.create({
      recipient: userId,
      organization: req.user.organization,
      type: 'team_invitation',
      title: 'Role Changed',
      message: `Your role has been changed from ${oldRole} to ${role} by ${req.user.firstName} ${req.user.lastName}.`,
      data: {
        resource: {
          type: 'user',
          id: req.user._id,
          name: `${req.user.firstName} ${req.user.lastName}`
        },
        action: 'role_changed',
        metadata: {
          oldRole,
          newRole: role
        }
      },
      priority: 'high'
    });

    res.json({
      success: true,
      message: 'User role changed successfully',
      data: user
    });
  } catch (error) {
    console.error('Change user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change user role',
      error: error.message
    });
  }
};

// Invite new user to organization
exports.inviteUser = async (req, res) => {
  try {
    const { email, firstName, lastName, role = 'member' } = req.body;

    if (!email || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, first name, and last name are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Get organization
    const organization = await Organization.findById(req.user.organization);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Create temporary password (in production, send via email)
    const tempPassword = 'TempPass123!';

    // Create new user
    const newUser = await User.create({
      email: email.toLowerCase(),
      firstName,
      lastName,
      password: tempPassword,
      organization: req.user.organization,
      role,
      isActive: true,
      isEmailVerified: false
    });

    // Create notification for new user
    await Notification.create({
      recipient: newUser._id,
      organization: req.user.organization,
      type: 'team_invitation',
      title: 'Welcome to the Organization',
      message: `You have been invited to join ${organization.name} by ${req.user.firstName} ${req.user.lastName}. Your temporary password is: ${tempPassword}`,
      data: {
        resource: {
          type: 'user',
          id: req.user._id,
          name: `${req.user.firstName} ${req.user.lastName}`
        },
        action: 'user_invited',
        metadata: {
          organizationName: organization.name,
          role
        }
      },
      priority: 'high'
    });

    res.status(201).json({
      success: true,
      message: 'User invited successfully',
      data: {
        user: newUser,
        tempPassword // In production, this should be sent via email only
      }
    });
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to invite user',
      error: error.message
    });
  }
};

// Get organization analytics
exports.getOrganizationAnalytics = async (req, res) => {
  try {
    const orgId = req.user.organization;

    // Get user statistics
    const totalUsers = await User.countDocuments({ organization: orgId, isActive: true });
    const pmCount = await User.countDocuments({ organization: orgId, role: 'project_manager', isActive: true });
    const memberCount = await User.countDocuments({ organization: orgId, role: 'member', isActive: true });

    // Get project statistics
    const totalProjects = await Project.countDocuments({ organization: orgId });
    const activeProjects = await Project.countDocuments({ 
      organization: orgId, 
      status: { $in: ['planning', 'in-progress'] } 
    });
    const completedProjects = await Project.countDocuments({ 
      organization: orgId, 
      status: 'completed' 
    });

    // Get recent activities
    const recentUsers = await User.find({ organization: orgId, isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email role createdAt');

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          projectManagers: pmCount,
          members: memberCount
        },
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects
        },
        recentUsers
      }
    });
  } catch (error) {
    console.error('Get organization analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organization analytics',
      error: error.message
    });
  }
};

// Deactivate/Reactivate user
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({
        success: false,
        message: 'User does not belong to your organization'
      });
    }

    if (user.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot deactivate Super Admin'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    // Create notification
    await Notification.create({
      recipient: userId,
      organization: req.user.organization,
      type: 'security_alert',
      title: user.isActive ? 'Account Activated' : 'Account Deactivated',
      message: `Your account has been ${user.isActive ? 'activated' : 'deactivated'} by ${req.user.firstName} ${req.user.lastName}.`,
      data: {
        resource: {
          type: 'user',
          id: req.user._id,
          name: `${req.user.firstName} ${req.user.lastName}`
        },
        action: user.isActive ? 'account_activated' : 'account_deactivated'
      },
      priority: 'high'
    });

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status',
      error: error.message
    });
  }
};

