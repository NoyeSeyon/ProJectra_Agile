const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate, checkRole } = require('../middleware/auth');

const router = express.Router();

// Get all users in organization (admin only)
router.get('/', authenticate, checkRole(['admin', 'projectra_admin']), async (req, res) => {
  try {
    const { page = 1, limit = 50, search, role, specialization } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { organization: req.user.organization };
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      filter.role = role;
    }
    
    if (specialization) {
      filter.specialization = specialization;
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('organization', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      organization: req.user.organization
    }).select('-password').populate('organization', 'name slug');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update user role (admin only)
router.put('/:id/role', authenticate, checkRole(['admin', 'projectra_admin']), [
  body('role').isIn(['member', 'team_leader', 'project_manager', 'admin']).withMessage('Invalid role')
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

    const { role } = req.body;
    const userId = req.params.id;

    // Prevent users from changing their own role
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    const user = await User.findOneAndUpdate(
      { 
        _id: userId, 
        organization: req.user.organization 
      },
      { role },
      { new: true, runValidators: true }
    ).select('-password').populate('organization', 'name slug');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update user profile (admin or self)
router.put('/:id', authenticate, [
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('First name must be 1-50 characters'),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Last name must be 1-50 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim().isLength({ max: 20 }).withMessage('Phone must be less than 20 characters'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('specialization').optional().isIn(['ui_ux_designer', 'software_engineer', 'qa_engineer', 'devops_engineer', 'product_manager', 'business_analyst', 'data_analyst', 'marketing_specialist', 'general']).withMessage('Invalid specialization'),
  body('capacity.maxProjects').optional().isInt({ min: 1, max: 4 }).withMessage('Max projects must be between 1 and 4'),
  body('capacity.weeklyHours').optional().isInt({ min: 1, max: 80 }).withMessage('Weekly hours must be between 1 and 80')
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

    const userId = req.params.id;
    const isAdmin = ['admin', 'projectra_admin'].includes(req.user.role);
    const isSelf = userId === req.user._id.toString();

    // Check permissions
    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { firstName, lastName, email, phone, bio, specialization, capacity } = req.body;
    const updateData = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (specialization !== undefined) updateData.specialization = specialization;
    if (capacity !== undefined) updateData.capacity = capacity;

    const user = await User.findOneAndUpdate(
      { 
        _id: userId, 
        organization: req.user.organization 
      },
      updateData,
      { new: true, runValidators: true }
    ).select('-password').populate('organization', 'name slug');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticate, checkRole(['admin', 'projectra_admin']), async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent users from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findOneAndDelete({
      _id: userId,
      organization: req.user.organization
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;