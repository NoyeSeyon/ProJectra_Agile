const express = require('express');
const { body } = require('express-validator');
const { authenticate, checkOrganization, authorize } = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');

const router = express.Router();

// All routes require authentication
router.use(authenticate);
router.use(checkOrganization);

/**
 * Settings Routes
 * All routes are prefixed with /api/settings
 */

// GET /api/settings/profile - Get user profile
router.get('/profile', settingsController.getProfile);

// PUT /api/settings/profile - Update user profile
router.put('/profile', [
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
  body('phoneNumber').optional().trim(),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('specialization').optional().trim(),
  body('skills').optional().isArray(),
  body('experience').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']),
  body('timezone').optional().trim(),
  body('language').optional().trim()
], settingsController.updateProfile);

// POST /api/settings/change-password - Change password
router.post('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], settingsController.changePassword);

// POST /api/settings/avatar - Upload avatar
router.post('/avatar', [
  body('avatarUrl').notEmpty().withMessage('Avatar URL is required')
], settingsController.uploadAvatar);

// GET /api/settings/notifications - Get notification preferences
router.get('/notifications', settingsController.getProfile); // Uses same endpoint

// PUT /api/settings/notifications - Update notification preferences
router.put('/notifications', [
  body('preferences').isObject()
], settingsController.updateNotificationPreferences);

// Organization settings (admin only)
// GET /api/settings/organization - Get organization settings
router.get('/organization', authorize('admin'), settingsController.getOrganizationSettings);

// PUT /api/settings/organization - Update organization settings
router.put('/organization', authorize('admin'), [
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim(),
  body('website').optional().trim().isURL().withMessage('Invalid URL'),
  body('industry').optional().trim(),
  body('size').optional().isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']),
  body('timezone').optional().trim(),
  body('language').optional().trim()
], settingsController.updateOrganizationSettings);

module.exports = router;
