const User = require('../models/User');
const Organization = require('../models/Organization');
const bcrypt = require('bcryptjs');

/**
 * Settings Controller
 * Handles user profile, password, and organization settings
 */

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('organization', 'name slug code')
      .select('-password');

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
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      bio,
      specialization,
      skills,
      experience,
      timezone,
      language
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (bio !== undefined) user.bio = bio;
    if (specialization !== undefined) user.specialization = specialization;
    if (skills) user.skills = skills;
    if (experience) user.experience = experience;
    if (timezone) user.timezone = timezone;
    if (language) user.language = language;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: user.toJSON() }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

// Get organization settings (admin only)
exports.getOrganizationSettings = async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.organization);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.json({
      success: true,
      data: { organization }
    });

  } catch (error) {
    console.error('Get organization settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organization settings',
      error: error.message
    });
  }
};

// Update organization settings (admin only)
exports.updateOrganizationSettings = async (req, res) => {
  try {
    const {
      name,
      description,
      website,
      industry,
      size,
      timezone,
      language,
      settings
    } = req.body;

    const organization = await Organization.findById(req.user.organization);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Update fields
    if (name) organization.name = name;
    if (description !== undefined) organization.description = description;
    if (website !== undefined) organization.website = website;
    if (industry) organization.industry = industry;
    if (size) organization.size = size;
    if (timezone) organization.timezone = timezone;
    if (language) organization.language = language;
    if (settings) {
      organization.settings = {
        ...organization.settings,
        ...settings
      };
    }

    await organization.save();

    res.json({
      success: true,
      message: 'Organization settings updated successfully',
      data: { organization }
    });

  } catch (error) {
    console.error('Update organization settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update organization settings',
      error: error.message
    });
  }
};

// Update notification preferences
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const { preferences } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update notification preferences
    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...preferences
    };

    await user.save();

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: { preferences: user.notificationPreferences }
    });

  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: error.message
    });
  }
};

// Upload avatar (placeholder - requires multer middleware)
exports.uploadAvatar = async (req, res) => {
  try {
    // This is a placeholder - in production, use multer + cloud storage (AWS S3, Cloudinary)
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({
        success: false,
        message: 'Avatar URL is required'
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.avatar = avatarUrl;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: { avatarUrl: user.avatar }
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: error.message
    });
  }
};

