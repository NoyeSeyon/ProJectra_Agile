const User = require('../models/User');
const Organization = require('../models/Organization');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');

// Get system-wide analytics
exports.getSystemAnalytics = async (req, res) => {
  try {
    const [
      totalOrganizations,
      activeOrganizations,
      totalUsers,
      totalProjects,
      totalTasks
    ] = await Promise.all([
      Organization.countDocuments(),
      Organization.countDocuments({ isActive: true }),
      User.countDocuments({ role: { $ne: 'super_admin' } }),
      Project.countDocuments(),
      Task.countDocuments()
    ]);

    // Get organization growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const organizationGrowth = await Organization.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalOrganizations,
          activeOrganizations,
          inactiveOrganizations: totalOrganizations - activeOrganizations,
          totalUsers,
          totalProjects,
          totalTasks
        },
        growth: organizationGrowth
      }
    });
  } catch (error) {
    console.error('Get system analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system analytics',
      error: error.message
    });
  }
};

// Get all organizations
exports.getAllOrganizations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { domain: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== 'all') {
      query.isActive = status === 'active';
    }

    const organizations = await Organization.find(query)
      .populate('admin', 'firstName lastName email')
      .populate('owner', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Organization.countDocuments(query);

    // Get member count for each organization
    const orgsWithStats = await Promise.all(
      organizations.map(async (org) => {
        const memberCount = await User.countDocuments({ organization: org._id });
        const projectCount = await Project.countDocuments({ organization: org._id });
        
        return {
          ...org.toObject(),
          stats: {
            members: memberCount,
            projects: projectCount
          }
        };
      })
    );

    res.json({
      success: true,
      data: {
        organizations: orgsWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all organizations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organizations',
      error: error.message
    });
  }
};

// Get single organization details
exports.getOrganizationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findById(id)
      .populate('admin', 'firstName lastName email role')
      .populate('owner', 'firstName lastName email role')
      .populate('createdBy', 'firstName lastName email');

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Get detailed stats
    const [members, projects, tasks] = await Promise.all([
      User.find({ organization: id }).select('firstName lastName email role isActive'),
      Project.countDocuments({ organization: id }),
      Task.countDocuments({ organization: id })
    ]);

    res.json({
      success: true,
      data: {
        organization,
        stats: {
          members: members.length,
          activeMembers: members.filter(m => m.isActive).length,
          projects,
          tasks
        },
        members
      }
    });
  } catch (error) {
    console.error('Get organization details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organization details',
      error: error.message
    });
  }
};

// Create new organization
exports.createOrganization = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      domain,
      plan = 'free',
      maxUsers = 50,
      maxProjects = 100
    } = req.body;

    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Organization name and slug are required'
      });
    }

    // Check if slug already exists
    const existingOrg = await Organization.findOne({ slug });
    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message: 'Organization slug already exists'
      });
    }

    // Create organization
    const organization = await Organization.create({
      name,
      slug,
      description,
      domain,
      subscription: {
        plan,
        startedAt: new Date()
      },
      maxUsers,
      maxProjects,
      createdBy: req.user._id,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: organization
    });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create organization',
      error: error.message
    });
  }
};

// Update organization
exports.updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating certain fields
    delete updates.createdBy;
    delete updates.createdAt;

    const organization = await Organization.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: organization
    });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update organization',
      error: error.message
    });
  }
};

// Delete organization
exports.deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if organization has users
    const userCount = await User.countDocuments({ organization: id });
    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete organization with ${userCount} users. Please transfer or remove users first.`
      });
    }

    await organization.deleteOne();

    res.json({
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    console.error('Delete organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete organization',
      error: error.message
    });
  }
};

// Get all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const query = { role: 'admin' };
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const admins = await User.find(query)
      .populate('organization', 'name slug')
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    // Get project counts for each admin
    const adminsWithStats = await Promise.all(
      admins.map(async (admin) => {
        const projectCount = await Project.countDocuments({ organization: admin.organization });
        const memberCount = await User.countDocuments({ organization: admin.organization });
        
        return {
          ...admin.toObject(),
          stats: {
            projects: projectCount,
            members: memberCount
          }
        };
      })
    );

    res.json({
      success: true,
      data: {
        admins: adminsWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admins',
      error: error.message
    });
  }
};

// Create admin for organization
exports.createAdmin = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      organizationId
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !organizationId) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create admin user
    const admin = await User.create({
      firstName,
      lastName,
      email,
      password,
      organization: organizationId,
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    });

    // Update organization with admin
    organization.admin = admin._id;
    organization.owner = admin._id;
    await organization.save();

    // Send notification to admin
    await Notification.create({
      user: admin._id,
      type: 'role_assignment',
      title: 'Admin Role Assigned',
      message: `You have been assigned as administrator for ${organization.name}`
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        admin: admin.toJSON(),
        organization
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin',
      error: error.message
    });
  }
};

// Update admin
exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating certain fields through this endpoint
    delete updates.password;
    delete updates.role;
    delete updates.organization;

    const admin = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: admin
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin',
      error: error.message
    });
  }
};

// Delete/Deactivate admin
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (admin.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'User is not an admin'
      });
    }

    // Deactivate instead of delete
    admin.isActive = false;
    await admin.save();

    res.json({
      success: true,
      message: 'Admin deactivated successfully'
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete admin',
      error: error.message
    });
  }
};

// Assign admin to organization
exports.assignAdminToOrganization = async (req, res) => {
  try {
    const { userId, organizationId } = req.body;

    if (!userId || !organizationId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Organization ID are required'
      });
    }

    const [user, organization] = await Promise.all([
      User.findById(userId),
      Organization.findById(organizationId)
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Update user role and organization
    user.role = 'admin';
    user.organization = organizationId;
    await user.save();

    // Update organization
    organization.admin = userId;
    organization.owner = userId;
    await organization.save();

    // Send notification
    await Notification.create({
      user: userId,
      type: 'role_assignment',
      title: 'Admin Role Assigned',
      message: `You have been assigned as administrator for ${organization.name}`
    });

    res.json({
      success: true,
      message: 'Admin assigned to organization successfully',
      data: {
        user: user.toJSON(),
        organization
      }
    });
  } catch (error) {
    console.error('Assign admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign admin',
      error: error.message
    });
  }
};

